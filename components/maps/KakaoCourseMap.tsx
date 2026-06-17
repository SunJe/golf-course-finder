"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { MapPinned } from "lucide-react";
import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";
import { loadKakaoMaps, isKakaoConfigured } from "@/lib/kakaoLoader";
import { CARD_PAN_MAX_LEVEL } from "@/lib/constants";
import {
  getCourseIdsInBounds,
  parseKakaoBounds,
} from "@/lib/courseListUtils";
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

function markerVariant(
  courseId: string,
  selectedId: string | null | undefined,
  hoveredId: string | null | undefined,
): "default" | "selected" | "hovered" {
  if (courseId === selectedId) return "selected";
  if (courseId === hoveredId) return "hovered";
  return "default";
}

export default function KakaoCourseMap(props: CourseMapBaseProps) {
  const {
    courses,
    center,
    className = "",
    maxVisibleMarkers,
    mapMode = "search",
    onVisibleCoursesChange,
    onClusterSelect,
    hoveredCourseId,
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
  const markerToCourseIdRef = useRef<Map<unknown, string>>(new Map());
  const skipNextBoundsRef = useRef(false);
  const selectedCourseIdRef = useRef(selectedCourseId);
  const hoveredCourseIdRef = useRef(hoveredCourseId);
  const isMobileRef = useRef(isMobile);
  const coursesRef = useRef(courses);
  const onVisibleRef = useRef(onVisibleCoursesChange);
  const onClusterRef = useRef(onClusterSelect);

  const [mode, setMode] = useState<MapMode>(
    isKakaoConfigured ? "loading" : "fallback",
  );

  selectedCourseIdRef.current = selectedCourseId;
  hoveredCourseIdRef.current = hoveredCourseId;
  isMobileRef.current = isMobile;
  coursesRef.current = courses;
  onVisibleRef.current = onVisibleCoursesChange;
  onClusterRef.current = onClusterSelect;

  const selected = courses.find((c) => c.id === selectedCourseId);
  const coursesKey = useMemo(
    () => courses.map((c) => c.id).join(","),
    [courses],
  );

  const reportVisibleCourses = useCallback(() => {
    const map = mapRef.current as KakaoMapInstance & {
      getBounds?: () => {
        getSouthWest: () => { getLat: () => number; getLng: () => number };
        getNorthEast: () => { getLat: () => number; getLng: () => number };
      };
    };
    if (!map?.getBounds || !onVisibleRef.current) return;
    const bounds = map.getBounds();
    if (!bounds) return;
    const parsed = parseKakaoBounds(bounds);
    const ids = getCourseIdsInBounds(coursesRef.current, parsed);
    onVisibleRef.current(ids);
  }, []);

  const applyBounds = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps || courses.length === 0) return;

    const padding = isMobile
      ? { top: 56, right: 32, bottom: 72, left: 32 }
      : { top: 48, right: 64, bottom: 48, left: 48 };

    fitKakaoMapToCourses(map, maps, courses, padding);
    requestAnimationFrame(() => {
      map.relayout?.();
      reportVisibleCourses();
    });
  }, [courses, isMobile, reportVisibleCourses]);

  const syncMarkerVisuals = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    const level = map.getLevel();
    const selectedId = selectedCourseIdRef.current;
    const hoveredId = hoveredCourseIdRef.current;
    const mobile = isMobileRef.current;
    const maps = window.kakao.maps as Record<string, unknown>;

    entriesRef.current.forEach((entry, id) => {
      const isSel = id === selectedId;
      const isHov = id === hoveredId && !isSel;
      const variant = markerVariant(id, selectedId, hoveredId);

      entry.marker.setImage(createDotMarkerImage(maps, variant));
      entry.marker.setZIndex(isSel ? 200 : isHov ? 150 : 1);

      const labelMode = getLabelDisplayMode(
        level,
        mobile,
        isSel,
        isHov && !mobile,
      );
      if (labelMode.showLabel && !isDetail) {
        entry.labelOverlay.setContent(
          createLabelOverlayElement(entry.course, labelMode),
        );
        entry.labelOverlay.setMap(map);
        entry.labelOverlay.setZIndex(isSel ? 1000 : 500);
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
    markerToCourseIdRef.current.clear();
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

        let idleTimer: ReturnType<typeof setTimeout> | null = null;
        eventAdd(map, "idle", () => {
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            reportVisibleCourses();
            syncMarkerVisuals();
          }, 120);
        });

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

    const markerList: unknown[] = [];

    courses.forEach((course) => {
      const position = new LatLng(course.latitude, course.longitude);
      const isSel = course.id === selectedCourseId;
      const variant = markerVariant(
        course.id,
        selectedCourseId,
        hoveredCourseId,
      );

      const marker = new Marker({
        position,
        image: createDotMarkerImage(maps, variant),
        clickable: true,
        zIndex: isSel ? 200 : 1,
      });

      if (!isDetail) {
        eventAdd(marker, "click", () => {
          selectCourse(course);
        });
      }

      const labelOverlay = new CustomOverlay({
        position,
        yAnchor: 1,
        zIndex: isSel ? 1000 : 500,
      });

      markerToCourseIdRef.current.set(marker, course.id);
      entriesRef.current.set(course.id, { marker, labelOverlay, course });
      markerList.push(marker);
    });

    if (isDetail) {
      const first = entriesRef.current.values().next().value as
        | CourseMarkerEntry
        | undefined;
      if (first) {
        first.marker.setImage(createDetailMarkerImage(maps));
        first.marker.setMap(map);
      }
    } else {
      const MarkerClusterer = maps.MarkerClusterer as new (opts: Record<
        string,
        unknown
      >) => {
        clear: () => void;
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
        const c = cluster as { getMarkers: () => unknown[] };
        const ids = c
          .getMarkers()
          .map((m) => markerToCourseIdRef.current.get(m))
          .filter((id): id is string => Boolean(id));
        if (ids.length > 0) {
          onClusterRef.current?.(ids);
        }
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

  useEffect(() => {
    if (mode !== "kakao") return;
    syncMarkerVisuals();
  }, [mode, selectedCourseId, hoveredCourseId, syncMarkerVisuals]);

  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps || !center)
      return;
    const LatLng = (
      window.kakao.maps as Record<string, unknown>
    ).LatLng as new (lat: number, lng: number) => unknown;
    skipNextBoundsRef.current = true;
    mapRef.current.panTo(new LatLng(center.lat, center.lng));
    if (mapRef.current.getLevel() > CARD_PAN_MAX_LEVEL) {
      mapRef.current.setLevel(CARD_PAN_MAX_LEVEL);
    }
    syncMarkerVisuals();
  }, [mode, center, syncMarkerVisuals]);

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
