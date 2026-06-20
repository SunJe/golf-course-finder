"use client";

import { useEffect, useRef, useState } from "react";
import { MapPinned } from "lucide-react";
import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";
import { loadNaverMaps, isNaverConfigured } from "@/lib/naverLoader";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
} from "@/lib/constants";
import { formatGreenFeeShort } from "@/lib/format";
import { resolveCourseMapBindings } from "@/lib/courseMapBindings";
import MapFallback from "@/components/maps/MapFallback";
import CourseMarkerPopup from "@/components/maps/CourseMarkerPopup";

type MapMode = "loading" | "naver" | "fallback";

function naverMarkerHtml(course: Course, selected: boolean): string {
  const bg = selected ? "#15803d" : "#22c55e";
  const padding = selected ? "5px 11px" : "3px 8px";
  const fontSize = selected ? "12px" : "11px";
  const scale = selected ? "scale(1.08)" : "scale(1)";
  return `
    <div style="position:relative;transform:translate(-50%,-100%) ${scale};transition:transform .1s;cursor:pointer;">
      <div style="display:flex;align-items:center;gap:3px;background:${bg};color:#fff;font-weight:700;padding:${padding};font-size:${fontSize};border:2px solid #fff;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.25);white-space:nowrap;font-family:inherit;">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M4 22V4M4 4h12l-2 4 2 4H4"/></svg>
        ${formatGreenFeeShort(course.weekdayGreenFeeMin)}
      </div>
      <div style="width:8px;height:8px;background:${bg};border-right:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(45deg);margin:-4px auto 0;"></div>
    </div>`;
}

export default function NaverCourseMap(props: CourseMapBaseProps) {
  const { courses, center, className = "", maxVisibleMarkers } = props;
  const { selectedCourseId, selectCourse, selectCourseById, clearSelection } =
    resolveCourseMapBindings(props);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markersRef = useRef<Map<string, unknown>>(new Map());
  const [mode, setMode] = useState<MapMode>(
    isNaverConfigured ? "loading" : "fallback",
  );

  const selected = courses.find((c) => c.id === selectedCourseId);

  useEffect(() => {
    if (!isNaverConfigured) {
      setMode("fallback");
      return;
    }
    let cancelled = false;
    loadNaverMaps()
      .then((naver) => {
        if (cancelled || !containerRef.current) return;
        const maps = naver.maps as Record<string, unknown>;
        const MapCtor = maps.Map as new (
          el: HTMLElement,
          opts: Record<string, unknown>,
        ) => {
          panTo: (pos: unknown) => void;
          setZoom: (z: number) => void;
          getZoom: () => number;
        };
        const LatLng = maps.LatLng as new (
          lat: number,
          lng: number,
        ) => unknown;
        const Position = maps.Position as Record<string, unknown>;

        const map = new MapCtor(containerRef.current, {
          center: new LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng),
          zoom: DEFAULT_MAP_ZOOM,
          logoControl: true,
          mapDataControl: false,
          scaleControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: Position.TOP_RIGHT,
          },
        });
        mapRef.current = map;
        setMode("naver");
      })
      .catch(() => {
        if (!cancelled) setMode("fallback");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "naver" || !mapRef.current || !window.naver?.maps) return;
    const naver = window.naver;
    const maps = naver.maps as Record<string, unknown>;
    const Marker = maps.Marker as new (opts: Record<string, unknown>) => {
      setMap: (m: unknown) => void;
      setIcon: (icon: Record<string, unknown>) => void;
      setZIndex: (z: number) => void;
    };
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const Point = maps.Point as new (x: number, y: number) => unknown;
    const eventAdd = (
      maps.Event as { addListener: (t: unknown, e: string, fn: () => void) => void }
    ).addListener;

    markersRef.current.forEach((m) =>
      (m as { setMap: (x: null) => void }).setMap(null),
    );
    markersRef.current.clear();

    courses.forEach((course) => {
      const isSel = course.id === selectedCourseId;
      const marker = new Marker({
        position: new LatLng(course.latitude, course.longitude),
        map: mapRef.current,
        title: course.name,
        icon: {
          content: naverMarkerHtml(course, isSel),
          anchor: new Point(0, 0),
        },
        zIndex: isSel ? 1000 : 1,
      });
      eventAdd(marker, "click", () => selectCourse(course));
      markersRef.current.set(course.id, marker);
    });

    return () => {
      markersRef.current.forEach((m) =>
        (m as { setMap: (x: null) => void }).setMap(null),
      );
      markersRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, courses, selectCourse]);

  useEffect(() => {
    if (mode !== "naver" || !mapRef.current || !window.naver?.maps) return;
    const maps = window.naver.maps as Record<string, unknown>;
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const Point = maps.Point as new (x: number, y: number) => unknown;
    const map = mapRef.current as {
      panTo: (p: unknown) => void;
      setZoom: (z: number) => void;
      getZoom: () => number;
    };

    markersRef.current.forEach((marker, id) => {
      const course = courses.find((c) => c.id === id);
      if (!course) return;
      const isSel = id === selectedCourseId;
      (marker as { setIcon: (i: Record<string, unknown>) => void }).setIcon({
        content: naverMarkerHtml(course, isSel),
        anchor: new Point(0, 0),
      });
      (marker as { setZIndex: (z: number) => void }).setZIndex(
        isSel ? 1000 : 1,
      );
    });

    const sel = courses.find((c) => c.id === selectedCourseId);
    if (sel) {
      map.panTo(new LatLng(sel.latitude, sel.longitude));
    }
  }, [mode, selectedCourseId, courses]);

  useEffect(() => {
    if (mode !== "naver" || !mapRef.current || !window.naver?.maps || !center)
      return;
    const LatLng = (
      window.naver.maps as Record<string, unknown>
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
          provider="naver"
          maxVisibleMarkers={maxVisibleMarkers}
          onClearSelection={clearSelection}
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
        className={`h-full w-full ${mode === "naver" ? "block" : "hidden"}`}
      />
      {mode === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <MapPinned className="h-8 w-8 animate-pulse" />
            <span className="text-sm">지도를 불러오는 중...</span>
          </div>
        </div>
      )}
      {selected && mode === "naver" && (
        <div className="absolute bottom-3 left-3 z-20 max-w-[16rem] animate-fade-in">
          <CourseMarkerPopup
            course={selected}
            onClose={clearSelection}
          />
        </div>
      )}
    </div>
  );
}
