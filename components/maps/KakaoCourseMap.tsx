"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { MapPinned } from "lucide-react";
import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";
import { loadKakaoMaps, isKakaoConfigured } from "@/lib/kakaoLoader";
import { SELECTED_KAKAO_MAP_LEVEL } from "@/lib/constants";
import {
  buildClusterStyles,
  createDetailMarkerImage,
  createDotMarkerImage,
  createLabelOverlayElement,
  fitKakaoMapToCourses,
  getLabelDisplayMode,
  type KakaoMapInstance,
  type KakaoMapsApi,
} from "@/lib/kakaoMapUtils";
import { resolveCourseMapBindings } from "@/lib/courseMapBindings";
import MapFallback from "@/components/maps/MapFallback";
import CourseMarkerPopup from "@/components/maps/CourseMarkerPopup";

type MapMode = "loading" | "kakao" | "fallback";

interface CourseMarkerEntry {
  marker: {
    setMap: (map: unknown | null) => void;
    setImage: (image: unknown) => void;
    setZIndex: (z: number) => void;
  };
  labelOverlay: {
    setMap: (map: unknown | null) => void;
    setContent: (content: HTMLElement) => void;
    setZIndex: (z: number) => void;
  };
  course: Course;
}

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
  const clustererRef = useRef<{ clear: () => void } | null>(null);
  const entriesRef = useRef<Map<string, CourseMarkerEntry>>(new Map());
  const skipNextBoundsRef = useRef(false);
  const selectedCourseIdRef = useRef(selectedCourseId);
  const isMobileRef = useRef(isMobile);

  const [mode, setMode] = useState<MapMode>(
    isKakaoConfigured ? "loading" : "fallback",
  );

  selectedCourseIdRef.current = selectedCourseId;
  isMobileRef.current = isMobile;

  const selected = courses.find((c) => c.id === selectedCourseId);
  const coursesKey = useMemo(
    () => courses.map((c) => c.id).join(","),
    [courses],
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

  const syncMarkerVisuals = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    const level = map.getLevel();
    const selectedId = selectedCourseIdRef.current;
    const mobile = isMobileRef.current;

    entriesRef.current.forEach((entry, id) => {
      const isSel = id === selectedId;
      entry.marker.setImage(
        createDotMarkerImage(
          window.kakao!.maps as Record<string, unknown>,
          isSel ? "selected" : "default",
        ),
      );
      entry.marker.setZIndex(isSel ? 100 : 1);

      const labelMode = getLabelDisplayMode(level, mobile, isSel);
      if (labelMode.showLabel && !isDetail) {
        entry.labelOverlay.setContent(
          createLabelOverlayElement(entry.course, labelMode),
        );
        entry.labelOverlay.setMap(map);
        entry.labelOverlay.setZIndex(isSel ? 1000 : 100);
      } else {
        entry.labelOverlay.setMap(null);
      }
    });
  }, [isDetail]);

  const cleanupMarkers = useCallback(() => {
    clustererRef.current?.clear();
    clustererRef.current = null;

    entriesRef.current.forEach((entry) => {
      entry.marker.setMap(null);
      entry.labelOverlay.setMap(null);
    });
    entriesRef.current.clear();
  }, []);

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

        const eventAdd = (
          maps.event as {
            addListener: (
              target: unknown,
              type: string,
              handler: (...args: unknown[]) => void,
            ) => void;
          }
        ).addListener;

        eventAdd(map, "zoom_changed", () => syncMarkerVisuals());

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

  useEffect(() => {
    if (mode !== "kakao") return;
    if (skipNextBoundsRef.current) {
      skipNextBoundsRef.current = false;
      return;
    }
    applyBounds();
  }, [mode, coursesKey, applyBounds]);

  // 마커 + 클러스터 생성
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps) return;

    const maps = window.kakao.maps as Record<string, unknown>;
    const map = mapRef.current;
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const Marker = maps.Marker as new (opts: Record<string, unknown>) => {
      setMap: (m: unknown | null) => void;
      setImage: (image: unknown) => void;
      setZIndex: (z: number) => void;
    };
    const CustomOverlay = maps.CustomOverlay as new (
      opts: Record<string, unknown>,
    ) => {
      setMap: (m: unknown | null) => void;
      setContent: (content: HTMLElement) => void;
      setZIndex: (z: number) => void;
    };
    const eventAdd = (
      maps.event as {
        addListener: (
          target: unknown,
          type: string,
          handler: (...args: unknown[]) => void,
        ) => void;
      }
    ).addListener;

    cleanupMarkers();

    const markerList: InstanceType<typeof Marker>[] = [];

    courses.forEach((course) => {
      const position = new LatLng(course.latitude, course.longitude);
      const isSel = course.id === selectedCourseId;

      const marker = new Marker({
        position,
        image: createDotMarkerImage(
          maps,
          isSel ? "selected" : "default",
        ),
        clickable: true,
        zIndex: isSel ? 100 : 1,
      });

      if (!isDetail) {
        eventAdd(marker, "click", () => {
          selectCourse(course);
        });
      }

      const labelOverlay = new CustomOverlay({
        position,
        yAnchor: 1,
        zIndex: isSel ? 1000 : 100,
      });

      entriesRef.current.set(course.id, { marker, labelOverlay, course });
      markerList.push(marker);
    });

    if (isDetail) {
      if (markerList[0]) {
        markerList[0].setImage(createDetailMarkerImage(maps));
        markerList[0].setMap(map);
      }
    } else {
      const MarkerClusterer = maps.MarkerClusterer as new (opts: Record<
        string,
        unknown
      >) => {
        clear: () => void;
        addMarkers: (markers: unknown[]) => void;
      };

      const clusterer = new MarkerClusterer({
        map,
        markers: markerList,
        averageCenter: true,
        gridSize: 56,
        minLevel: 6,
        styles: buildClusterStyles(),
      });

      eventAdd(clusterer, "clusterclick", (cluster: unknown) => {
        const c = cluster as {
          getCenter: () => unknown;
        };
        skipNextBoundsRef.current = true;
        const currentLevel = map.getLevel();
        map.setCenter(c.getCenter());
        map.setLevel(Math.max(1, currentLevel - 2));
      });

      clustererRef.current = clusterer;
    }

    syncMarkerVisuals();

    return () => {
      cleanupMarkers();
    };
  }, [
    mode,
    coursesKey,
    isDetail,
    selectCourse,
    cleanupMarkers,
    syncMarkerVisuals,
  ]);

  // 선택 변경: 마커 스타일 + panTo (bounds 재조정 없음)
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps) return;

    syncMarkerVisuals();

    const sel = courses.find((c) => c.id === selectedCourseId);
    if (sel && !isDetail) {
      skipNextBoundsRef.current = true;
      const LatLng = (
        window.kakao.maps as Record<string, unknown>
      ).LatLng as new (lat: number, lng: number) => unknown;
      mapRef.current.panTo(new LatLng(sel.latitude, sel.longitude));
      if (mapRef.current.getLevel() > SELECTED_KAKAO_MAP_LEVEL) {
        mapRef.current.setLevel(SELECTED_KAKAO_MAP_LEVEL);
      }
    }
  }, [mode, selectedCourseId, courses, isDetail, syncMarkerVisuals]);

  // 리스트 카드 클릭 center 이동
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
        <div className="pointer-events-auto absolute bottom-3 left-3 z-20 max-w-[16rem] animate-fade-in">
          <CourseMarkerPopup course={selected} onClose={clearSelection} />
        </div>
      )}
    </div>
  );
}
