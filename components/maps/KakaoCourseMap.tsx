"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { MapPinned } from "lucide-react";
import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";
import { loadKakaoMaps, isKakaoConfigured } from "@/lib/kakaoLoader";
import { CARD_PAN_MAX_LEVEL, DEFAULT_MAP_CENTER, DEFAULT_KAKAO_MAP_LEVEL } from "@/lib/constants";
import {
  getCourseIdsInKakaoBounds,
  isCourseInKakaoBounds,
  type KakaoLatLngBounds,
} from "@/lib/courseListUtils";
import {
  buildClusterStyles,
  createClusterHitMarkerImage,
  createDetailMarkerImage,
  createLabelOverlayElement,
  createPinOverlayElement,
  fitInitialNationwideView,
  fitKakaoMapToCourses,
  getLabelDisplayMode,
  shouldShowLabel,
  shouldShowPin,
  updatePinOverlayElement,
  type KakaoMapInstance,
  type KakaoMapsApi,
} from "@/lib/kakaoMapUtils";
import { resolveCourseMapBindings } from "@/lib/courseMapBindings";
import MapFallback from "@/components/maps/MapFallback";
import CourseMarkerPopup from "@/components/maps/CourseMarkerPopup";

type MapMode = "loading" | "kakao" | "fallback";

interface PinEventHandlers {
  click: (e: Event) => void;
  enter: () => void;
  leave: () => void;
}

interface CourseMarkerEntry {
  clusterMarker: {
    setMap: (map: unknown | null) => void;
    setImage?: (image: unknown) => void;
    setOpacity?: (opacity: number) => void;
  };
  pinOverlay: {
    setMap: (map: unknown | null) => void;
    setContent: (content: HTMLElement) => void;
    setZIndex: (z: number) => void;
  };
  pinEl: HTMLButtonElement;
  labelOverlay: {
    setMap: (map: unknown | null) => void;
    setContent: (content: HTMLElement) => void;
    setZIndex: (z: number) => void;
  };
  course: Course;
  pinHandlers: PinEventHandlers;
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
    onMapViewportChange,
    onHoverCourseChange,
    hoveredCourseId,
    mapViewResetSignal = 0,
    initialViewportCourses = [],
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
  const mapReadyRef = useRef(false);
  const initialViewAppliedRef = useRef(false);
  const selectedCourseIdRef = useRef(selectedCourseId);
  const hoveredCourseIdRef = useRef(hoveredCourseId);
  const isMobileRef = useRef(isMobile);
  const coursesRef = useRef(courses);
  const onVisibleRef = useRef(onVisibleCoursesChange);
  const onClusterRef = useRef(onClusterSelect);
  const onViewportChangeRef = useRef(onMapViewportChange);
  const onHoverRef = useRef(onHoverCourseChange);
  const selectCourseRef = useRef(selectCourse);
  const reportVisibleRef = useRef<() => void>(() => {});
  const syncMarkerVisualsRef = useRef<() => void>(() => {});

  const [mode, setMode] = useState<MapMode>(
    isKakaoConfigured ? "loading" : "fallback",
  );
  const [selectedInBounds, setSelectedInBounds] = useState(true);

  selectedCourseIdRef.current = selectedCourseId;
  hoveredCourseIdRef.current = hoveredCourseId;
  isMobileRef.current = isMobile;
  coursesRef.current = courses;
  onVisibleRef.current = onVisibleCoursesChange;
  onClusterRef.current = onClusterSelect;
  onViewportChangeRef.current = onMapViewportChange;
  onHoverRef.current = onHoverCourseChange;
  selectCourseRef.current = selectCourse;

  const selected = courses.find((c) => c.id === selectedCourseId);
  const coursesKey = useMemo(
    () => courses.map((c) => c.id).join(","),
    [courses],
  );

  const notifyViewportChange = useCallback(() => {
    if (mapReadyRef.current) {
      onViewportChangeRef.current?.();
    }
  }, []);

  const updateSelectedInBounds = useCallback((bounds: KakaoLatLngBounds) => {
    const selId = selectedCourseIdRef.current;
    if (!selId) {
      setSelectedInBounds(false);
      return;
    }
    const sel = coursesRef.current.find((c) => c.id === selId);
    if (!sel || !mapsApiRef.current) {
      setSelectedInBounds(false);
      return;
    }
    setSelectedInBounds(
      isCourseInKakaoBounds(sel, bounds, mapsApiRef.current.LatLng),
    );
  }, []);

  const reportVisibleCourses = useCallback(() => {
    if (!onVisibleRef.current) return;

    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map?.getBounds || !maps) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const ids = getCourseIdsInKakaoBounds(
      coursesRef.current,
      bounds,
      maps.LatLng,
    );

    if (ids === null) return;

    mapReadyRef.current = true;
    updateSelectedInBounds(bounds);
    onVisibleRef.current(ids);
  }, [updateSelectedInBounds]);

  reportVisibleRef.current = reportVisibleCourses;

  const fitToCourses = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps || coursesRef.current.length === 0) return;

    const padding = isMobileRef.current
      ? { top: 56, right: 32, bottom: 72, left: 32 }
      : { top: 48, right: 64, bottom: 48, left: 48 };

    fitKakaoMapToCourses(map, maps, coursesRef.current, padding);
    requestAnimationFrame(() => map.relayout?.());
  }, []);

  const syncMarkerVisuals = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;

    if (isDetail) {
      entriesRef.current.forEach((entry) => {
        entry.clusterMarker.setMap(map);
        entry.pinOverlay.setMap(null);
        entry.labelOverlay.setMap(null);
      });
      return;
    }

    const level = map.getLevel();
    const selectedId = selectedCourseIdRef.current;
    const hoveredId = hoveredCourseIdRef.current;
    const mobile = isMobileRef.current;

    entriesRef.current.forEach((entry, id) => {
      const isSel = id === selectedId;
      const isHov = id === hoveredId && !isSel;
      const variant = markerVariant(id, selectedId, hoveredId);
      const showPin = shouldShowPin(level, isSel, isHov);
      const showLabel = shouldShowLabel(level, mobile, isSel, isHov);

      updatePinOverlayElement(entry.pinEl, variant);

      if (showPin) {
        entry.pinEl.style.display = "block";
        entry.pinEl.style.visibility = "visible";
        entry.pinEl.style.opacity = "1";
        entry.pinOverlay.setZIndex(isSel ? 2000 : isHov ? 1500 : 100);
        entry.pinOverlay.setMap(map);
      } else {
        entry.pinOverlay.setMap(null);
      }

      if (showLabel) {
        const labelMode = getLabelDisplayMode(level, mobile, isSel, isHov);
        entry.labelOverlay.setContent(
          createLabelOverlayElement(entry.course, labelMode),
        );
        entry.labelOverlay.setMap(map);
        entry.labelOverlay.setZIndex(isSel ? 2100 : isHov ? 1600 : 500);
      } else {
        entry.labelOverlay.setMap(null);
      }
    });
  }, [isDetail]);

  syncMarkerVisualsRef.current = syncMarkerVisuals;

  const cleanupMarkers = useCallback(() => {
    clustererRef.current?.clear();
    clustererRef.current = null;

    entriesRef.current.forEach((entry) => {
      entry.pinEl.removeEventListener("click", entry.pinHandlers.click);
      entry.pinEl.removeEventListener("mouseenter", entry.pinHandlers.enter);
      entry.pinEl.removeEventListener("mouseleave", entry.pinHandlers.leave);
      entry.pinEl.removeEventListener("touchend", entry.pinHandlers.click);
      entry.clusterMarker.setMap(null);
      entry.pinOverlay.setMap(null);
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
          center: new LatLng(DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng),
          level: DEFAULT_KAKAO_MAP_LEVEL,
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

        eventAdd(map, "dragstart", () => notifyViewportChange());
        eventAdd(map, "dragend", () => {
          notifyViewportChange();
          reportVisibleRef.current();
        });
        eventAdd(map, "zoom_changed", () => {
          notifyViewportChange();
          syncMarkerVisualsRef.current();
        });

        let idleTimer: ReturnType<typeof setTimeout> | null = null;
        eventAdd(map, "idle", () => {
          if (idleTimer) clearTimeout(idleTimer);
          idleTimer = setTimeout(() => {
            reportVisibleRef.current();
            syncMarkerVisualsRef.current();
          }, 100);
        });

        requestAnimationFrame(() => {
          map.relayout?.();
          if (!initialViewAppliedRef.current && !isDetail) {
            const fitCourses =
              initialViewportCourses.length > 0
                ? initialViewportCourses
                : coursesRef.current;
            fitInitialNationwideView(map, mapsApiRef.current!, fitCourses);
            initialViewAppliedRef.current = true;
          }
        });
        setMode("kakao");
      })
      .catch(() => {
        if (!cancelled) setMode("fallback");
      });
    return () => {
      cancelled = true;
      mapReadyRef.current = false;
      initialViewAppliedRef.current = false;
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

  /** "결과 위치로 이동" 버튼 — 이때만 fitBounds */
  useEffect(() => {
    if (mode !== "kakao" || mapViewResetSignal === 0) return;
    fitToCourses();
  }, [mode, mapViewResetSignal, fitToCourses]);

  /** 필터 변경 시 마커만 갱신, 지도 center/level 유지 */
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current) return;
    reportVisibleRef.current();
    const timer = setTimeout(() => reportVisibleRef.current(), 300);
    return () => clearTimeout(timer);
  }, [mode, coursesKey]);

  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps) return;

    const maps = window.kakao.maps as Record<string, unknown>;
    const map = mapRef.current;
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const Marker = maps.Marker as new (opts: Record<string, unknown>) => {
      setMap: (m: unknown | null) => void;
      setImage?: (image: unknown) => void;
      setOpacity?: (opacity: number) => void;
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

    const clusterMarkerList: unknown[] = [];
    const hitMarkerImage = createClusterHitMarkerImage(maps);

    courses.forEach((course) => {
      const position = new LatLng(course.latitude, course.longitude);
      const variant = markerVariant(
        course.id,
        selectedCourseId,
        hoveredCourseId,
      );

      const pinEl = createPinOverlayElement(variant);
      const pinHandlers: PinEventHandlers = {
        click: (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          selectCourseRef.current(course);
        },
        enter: () => {
          onHoverRef.current?.(course.id);
        },
        leave: () => {
          if (hoveredCourseIdRef.current === course.id) {
            onHoverRef.current?.(null);
          }
        },
      };

      if (!isDetail) {
        pinEl.addEventListener("click", pinHandlers.click);
        pinEl.addEventListener("mouseenter", pinHandlers.enter);
        pinEl.addEventListener("mouseleave", pinHandlers.leave);
        pinEl.addEventListener("touchend", pinHandlers.click);
      }

      const pinOverlay = new CustomOverlay({
        position,
        content: pinEl,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: variant === "selected" ? 300 : 1,
        clickable: true,
      });

      const labelOverlay = new CustomOverlay({
        position,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: variant === "selected" ? 1000 : 500,
        clickable: false,
      });

      const clusterMarker = new Marker({
        position,
        image: hitMarkerImage,
        clickable: false,
        opacity: 0,
        zIndex: 0,
      });

      markerToCourseIdRef.current.set(clusterMarker, course.id);
      entriesRef.current.set(course.id, {
        clusterMarker,
        pinOverlay,
        pinEl,
        labelOverlay,
        course,
        pinHandlers,
      });
      clusterMarkerList.push(clusterMarker);
    });

    if (isDetail) {
      const first = entriesRef.current.values().next().value as
        | CourseMarkerEntry
        | undefined;
      if (first) {
        first.clusterMarker.setImage?.(createDetailMarkerImage(maps));
        first.clusterMarker.setOpacity?.(1);
        first.clusterMarker.setMap(map);
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
        markers: clusterMarkerList,
        averageCenter: true,
        gridSize: 52,
        minLevel: 9,
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

    requestAnimationFrame(() => {
      reportVisibleRef.current();
    });

    return () => {
      cleanupMarkers();
    };
  }, [
    mode,
    coursesKey,
    isDetail,
    cleanupMarkers,
    syncMarkerVisuals,
  ]);

  useEffect(() => {
    if (mode !== "kakao") return;
    syncMarkerVisuals();
    if (selectedCourseId) {
      setSelectedInBounds(true);
    }
  }, [mode, selectedCourseId, hoveredCourseId, syncMarkerVisuals]);

  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps || !center)
      return;
    const LatLng = (
      window.kakao.maps as Record<string, unknown>
    ).LatLng as new (lat: number, lng: number) => unknown;
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

  const showPopup = !isDetail && selected && selectedInBounds;

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
        <div className="pointer-events-auto absolute bottom-3 left-3 z-20 max-w-[14rem] animate-fade-in">
          <CourseMarkerPopup course={selected} onClose={clearSelection} />
        </div>
      )}
    </div>
  );
}
