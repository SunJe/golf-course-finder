"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { MapPinned } from "lucide-react";
import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";
import { loadKakaoMaps, isKakaoConfigured } from "@/lib/kakaoLoader";
import { SELECTED_KAKAO_MAP_LEVEL } from "@/lib/constants";
import {
  buildKakaoMarkerHtml,
  fitKakaoMapToCourses,
  type KakaoMapInstance,
  type KakaoMapsApi,
} from "@/lib/kakaoMapUtils";
import { resolveCourseMapBindings } from "@/lib/courseMapBindings";
import MapFallback from "@/components/maps/MapFallback";
import CourseMarkerPopup from "@/components/maps/CourseMarkerPopup";

type MapMode = "loading" | "kakao" | "fallback";

function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

export default function KakaoCourseMap(props: CourseMapBaseProps) {
  const {
    courses,
    center,
    className = "",
    maxVisibleMarkers,
    mapMode = "search",
  } = props;
  const { selectedCourseId, selectCourse, selectCourseById, clearSelection } =
    resolveCourseMapBindings(props);

  const isDetail = mapMode === "detail";
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const mapsApiRef = useRef<KakaoMapsApi | null>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());
  const skipNextBoundsRef = useRef(false);

  const [mode, setMode] = useState<MapMode>(
    isKakaoConfigured ? "loading" : "fallback",
  );

  const selected = courses.find((c) => c.id === selectedCourseId);
  const coursesKey = useMemo(
    () => courses.map((c) => c.id).join(","),
    [courses],
  );

  const getMarkerHtml = useCallback(
    (course: Course, isSel: boolean) => {
      const showLabel = isSel && !isDetail;
      return buildKakaoMarkerHtml(course, {
        selected: isSel,
        showLabel,
        nameOnly: isMobile && isSel,
        isDetail,
      });
    },
    [isDetail, isMobile],
  );

  const applyBounds = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps || courses.length === 0) return;

    const padding = isMobile
      ? { top: 56, right: 32, bottom: 72, left: 32 }
      : { top: 48, right: 64, bottom: 48, left: 48 };

    fitKakaoMapToCourses(map, maps, courses, padding);
    requestAnimationFrame(() => map.relayout?.());
  }, [courses, isMobile]);

  useEffect(() => {
    if (!isKakaoConfigured) {
      setMode("fallback");
      return;
    }
    let cancelled = false;
    loadKakaoMaps()
      .then((kakao) => {
        if (cancelled || !containerRef.current) return;
        const maps = kakao.maps as Record<string, unknown>;
        const MapCtor = maps.Map as new (
          el: HTMLElement,
          opts: Record<string, unknown>,
        ) => KakaoMapInstance;
        const LatLng = maps.LatLng as KakaoMapsApi["LatLng"];
        const LatLngBounds = maps.LatLngBounds as KakaoMapsApi["LatLngBounds"];

        mapsApiRef.current = { LatLng, LatLngBounds };

        const map = new MapCtor(containerRef.current, {
          center: new LatLng(36.5, 127.8),
          level: 13,
        });
        mapRef.current = map;

        requestAnimationFrame(() => {
          map.relayout?.();
          applyBounds();
        });
        setMode("kakao");
      })
      .catch(() => {
        if (!cancelled) setMode("fallback");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !containerRef.current) return;
    const map = mapRef.current;
    const relayout = () => map.relayout?.();
    relayout();
    const observer = new ResizeObserver(relayout);
    observer.observe(containerRef.current);
    window.addEventListener("resize", relayout);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", relayout);
    };
  }, [mode]);

  // 검색/필터 결과 변경 시 bounds 재조정
  useEffect(() => {
    if (mode !== "kakao") return;
    if (skipNextBoundsRef.current) {
      skipNextBoundsRef.current = false;
      return;
    }
    applyBounds();
  }, [mode, coursesKey, applyBounds]);

  // 마커 생성/갱신
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps) return;
    const maps = window.kakao.maps as Record<string, unknown>;
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const eventAdd = (
      maps.event as { addListener: (t: unknown, e: string, fn: () => void) => void }
    ).addListener;

    markersRef.current.forEach((m) =>
      (m as { setMap: (x: null) => void }).setMap(null),
    );
    markersRef.current.clear();

    courses.forEach((course) => {
      const isSel = course.id === selectedCourseId;
      const showLabel = isSel && !isDetail;
      const position = new LatLng(course.latitude, course.longitude);
      const content = getMarkerHtml(course, isSel);

      const CustomOverlay = maps.CustomOverlay as new (
        opts: Record<string, unknown>,
      ) => {
        setMap: (m: unknown) => void;
        setZIndex: (z: number) => void;
        setContent: (html: string) => void;
      };

      const overlay = new CustomOverlay({
        position,
        content,
        yAnchor: showLabel ? 1 : 0.5,
        zIndex: isSel ? 1000 : 1,
      });
      overlay.setMap(mapRef.current);

      if (!isDetail) {
        eventAdd(overlay, "click", () => selectCourse(course));
      }
      markersRef.current.set(course.id, overlay);
    });

    return () => {
      markersRef.current.forEach((m) =>
        (m as { setMap: (x: null) => void }).setMap(null),
      );
      markersRef.current.clear();
    };
  }, [
    mode,
    courses,
    coursesKey,
    selectedCourseId,
    selectCourse,
    getMarkerHtml,
    isDetail,
    isMobile,
  ]);

  // 선택 변경 시 마커 스타일 + 중심 이동
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps) return;
    const maps = window.kakao.maps as Record<string, unknown>;
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const map = mapRef.current;

    markersRef.current.forEach((overlay, id) => {
      const course = courses.find((c) => c.id === id);
      if (!course) return;
      const isSel = id === selectedCourseId;
      const o = overlay as {
        setContent: (html: string) => void;
        setZIndex: (z: number) => void;
      };
      o.setContent(getMarkerHtml(course, isSel));
      o.setZIndex(isSel ? 1000 : 1);
    });

    const sel = courses.find((c) => c.id === selectedCourseId);
    if (sel && !isDetail) {
      skipNextBoundsRef.current = true;
      map.panTo(new LatLng(sel.latitude, sel.longitude));
      if (map.getLevel() > SELECTED_KAKAO_MAP_LEVEL) {
        map.setLevel(SELECTED_KAKAO_MAP_LEVEL);
      }
    }
  }, [mode, selectedCourseId, courses, getMarkerHtml, isDetail]);

  // 리스트 클릭 center 이동
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps || !center)
      return;
    const LatLng = (
      window.kakao.maps as Record<string, unknown>
    ).LatLng as new (lat: number, lng: number) => unknown;
    skipNextBoundsRef.current = true;
    mapRef.current.panTo(new LatLng(center.lat, center.lng));
    if (mapRef.current.getLevel() > SELECTED_KAKAO_MAP_LEVEL) {
      mapRef.current.setLevel(SELECTED_KAKAO_MAP_LEVEL);
    }
  }, [mode, center]);

  if (mode === "fallback") {
    return (
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${className}`}
      >
        <MapFallback
          courses={courses}
          selectedCourseId={selectedCourseId}
          onSelectCourse={selectCourseById}
          provider="kakao"
          maxVisibleMarkers={maxVisibleMarkers}
          onClearSelection={clearSelection}
        />
      </div>
    );
  }

  const showPopup = !isDetail && selected;

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${className}`}
    >
      <div ref={containerRef} className="h-full w-full" />
      {mode === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <MapPinned className="h-8 w-8 animate-pulse" />
            <span className="text-sm">지도를 불러오는 중...</span>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="absolute bottom-3 left-3 z-20 max-w-[16rem] animate-fade-in">
          <CourseMarkerPopup course={selected} onClose={clearSelection} />
        </div>
      )}
    </div>
  );
}
