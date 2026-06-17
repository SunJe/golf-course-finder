"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinned } from "lucide-react";
import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";
import { loadKakaoMaps, isKakaoConfigured } from "@/lib/kakaoLoader";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_KAKAO_MAP_LEVEL,
  SELECTED_KAKAO_MAP_LEVEL,
} from "@/lib/constants";
import { formatGreenFeeShort } from "@/lib/format";
import { resolveCourseMapBindings } from "@/lib/courseMapBindings";
import MapFallback from "@/components/maps/MapFallback";
import CourseMarkerPopup from "@/components/maps/CourseMarkerPopup";

type MapMode = "loading" | "kakao" | "fallback";

function kakaoMarkerHtml(course: Course, selected: boolean): string {
  const bg = selected ? "#15803d" : "#22c55e";
  const padding = selected ? "5px 11px" : "3px 8px";
  const fontSize = selected ? "12px" : "11px";
  const scale = selected ? "scale(1.1)" : "scale(1)";
  return `
    <div style="position:relative;transform:translate(-50%,-100%) ${scale};cursor:pointer;">
      <div style="display:flex;align-items:center;gap:3px;background:${bg};color:#fff;font-weight:700;padding:${padding};font-size:${fontSize};border:2px solid #fff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.25);white-space:nowrap;font-family:inherit;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M4 22V4M4 4h12l-2 4 2 4H4"/></svg>
        ${formatGreenFeeShort(course.weekdayGreenFeeMin)}
      </div>
      <div style="width:8px;height:8px;background:${bg};border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg);margin:-4px auto 0;"></div>
    </div>`;
}

export default function KakaoCourseMap(props: CourseMapBaseProps) {
  const { courses, center, className = "" } = props;
  const { selectedCourseId, selectCourse, selectCourseById } =
    resolveCourseMapBindings(props);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());
  const [mode, setMode] = useState<MapMode>(
    isKakaoConfigured ? "loading" : "fallback",
  );

  const selected = courses.find((c) => c.id === selectedCourseId);

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
        ) => {
          panTo: (pos: unknown) => void;
          setLevel: (level: number) => void;
          getLevel: () => number;
        };
        const LatLng = maps.LatLng as new (
          lat: number,
          lng: number,
        ) => unknown;

        const map = new MapCtor(containerRef.current, {
          center: new LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng),
          level: DEFAULT_KAKAO_MAP_LEVEL,
        });
        mapRef.current = map;
        setMode("kakao");
      })
      .catch(() => {
        if (!cancelled) setMode("fallback");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
      const position = new LatLng(course.latitude, course.longitude);
      const content = kakaoMarkerHtml(course, isSel);

      const CustomOverlay = maps.CustomOverlay as new (
        opts: Record<string, unknown>,
      ) => { setMap: (m: unknown) => void; setZIndex: (z: number) => void };

      const overlay = new CustomOverlay({
        position,
        content,
        yAnchor: 1,
        zIndex: isSel ? 1000 : 1,
      });
      overlay.setMap(mapRef.current);

      eventAdd(overlay, "click", () => selectCourse(course));
      markersRef.current.set(course.id, overlay);
    });

    return () => {
      markersRef.current.forEach((m) =>
        (m as { setMap: (x: null) => void }).setMap(null),
      );
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, courses, selectCourse]);

  // 선택 강조 + 중심 이동
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps) return;
    const kakao = window.kakao;
    const maps = kakao.maps as Record<string, unknown>;
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const map = mapRef.current as {
      panTo: (p: unknown) => void;
      setLevel: (l: number) => void;
      getLevel: () => number;
    };

    markersRef.current.forEach((overlay, id) => {
      const course = courses.find((c) => c.id === id);
      if (!course) return;
      const isSel = id === selectedCourseId;
      const o = overlay as {
        setContent: (html: string) => void;
        setZIndex: (z: number) => void;
      };
      o.setContent(kakaoMarkerHtml(course, isSel));
      o.setZIndex(isSel ? 1000 : 1);
    });

    const sel = courses.find((c) => c.id === selectedCourseId);
    if (sel) {
      map.panTo(new LatLng(sel.latitude, sel.longitude));
      if (map.getLevel() > SELECTED_KAKAO_MAP_LEVEL) {
        map.setLevel(SELECTED_KAKAO_MAP_LEVEL);
      }
    }
  }, [mode, selectedCourseId, courses]);

  // 리스트 클릭 center 이동
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps || !center)
      return;
    const LatLng = (
      window.kakao.maps as Record<string, unknown>
    ).LatLng as new (lat: number, lng: number) => unknown;
    (mapRef.current as { panTo: (p: unknown) => void }).panTo(
      new LatLng(center.lat, center.lng),
    );
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
        />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${className}`}
    >
      <div
        ref={containerRef}
        className={`h-full w-full ${mode === "kakao" ? "block" : "hidden"}`}
      />
      {mode === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <MapPinned className="h-8 w-8 animate-pulse" />
            <span className="text-sm">지도를 불러오는 중...</span>
          </div>
        </div>
      )}
      {selected && mode === "kakao" && (
        <div className="absolute bottom-3 left-3 z-20 max-w-[16rem] animate-fade-in">
          <CourseMarkerPopup
            course={selected}
            onClose={() => selectCourseById(selected.id)}
          />
        </div>
      )}
    </div>
  );
}
