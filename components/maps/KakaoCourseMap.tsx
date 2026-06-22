"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";
import { loadKakaoMaps, isKakaoConfigured } from "@/lib/kakaoLoader";
import { DEFAULT_MAP_CENTER, DESKTOP_INITIAL_MAP_PADDING, DETAIL_KAKAO_MAP_LEVEL, INITIAL_KAKAO_MAP_LEVEL, MOBILE_INITIAL_MAP_PADDING } from "@/lib/constants";
import {
  getCourseIdsInKakaoBounds,
  isCourseInKakaoBounds,
  isValidKakaoBounds,
  type KakaoLatLngBounds,
} from "@/lib/courseListUtils";
import {
  applyMobileNationwideFallback,
  createSplitMarkerDom,
  fitKakaoMapToCourses,
  fitMapToAllCourses,
  focusCourseOnMap,
  panToCourseWithoutZoom,
  setInitialKakaoMapView,
  shouldShowLabel,
  shouldShowPin,
  splitMarkerVisualKey,
  updatePinOverlayElement,
  updateSplitMarkerVisuals,
  createFavoriteHeartOverlayRoot,
  createVisitedOverlayRoot,
  FAVORITE_HEART_OVERLAY_Z_INDEX,
  VISITED_OVERLAY_Z_INDEX,
  type KakaoMapInstance,
  type KakaoMapsApi,
  type MarkerDisplayContext,
  type SplitMarkerDom,
} from "@/lib/kakaoMapUtils";
import {
  clusterGroupKey,
  createClusterBadgeElement,
  resolveClusterDisplay,
  resolveInitialMapLevel,
  updateClusterBadgeElement,
  type ClusterGroup,
} from "@/lib/kakaoClusterUtils";
import { resolveCourseMapBindings } from "@/lib/courseMapBindings";
import { isValidCourseCoordinates } from "@/lib/focusCourse";
import MapFallback from "@/components/maps/MapFallback";
import MapSkeleton from "@/components/maps/MapSkeleton";

type MapMode = "loading" | "kakao" | "fallback";

interface PinEventHandlers {
  click: (e: Event) => void;
  enter: () => void;
  leave: () => void;
}

type MarkerOverlay = {
  setMap: (map: unknown | null) => void;
  setContent?: (content: HTMLElement) => void;
  setPosition?: (pos: unknown) => void;
  setZIndex: (z: number) => void;
};

interface CourseMarkerEntry {
  pinOverlay: MarkerOverlay;
  labelOverlay: MarkerOverlay;
  popupOverlay: MarkerOverlay;
  dom: SplitMarkerDom;
  course: Course;
  pinHandlers: PinEventHandlers;
  lastVisualKey?: string;
}

interface ClusterOverlayEntry {
  overlay: {
    setMap: (map: unknown | null) => void;
    setPosition: (pos: unknown) => void;
    setZIndex: (z: number) => void;
  };
  badgeEl: HTMLButtonElement;
  courseIds: string[];
  clickHandler: (e: Event) => void;
}

interface FavoriteHeartOverlayEntry {
  overlay: MarkerOverlay;
  root: HTMLDivElement;
  course: Course;
}

interface VisitedOverlayEntry {
  overlay: MarkerOverlay;
  root: HTMLDivElement;
  course: Course;
}

function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

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
    onMapViewportReady,
    onHoverCourseChange,
    hoveredCourseId,
    mapViewResetSignal = 0,
    nationwideFitSignal = 0,
    initialViewportCourses = [],
    searchKeyword = "",
    favoriteOnly = false,
    visitedOnly = false,
    clusterScopeCourseIds = null,
    selectedClusterKeys = [],
    favoriteCourseIds = [],
    visitedCourseIds = [],
    fitToCourseIds = [],
    fitToCourseIdsSignal = 0,
    mapLayout,
    detailPrimaryCourseId = null,
    deferInitialViewUntilVisible = false,
    mapSectionInView = true,
  } = props;
  const { selectedCourseId, selectCourse, selectCourseById, clearSelection } =
    resolveCourseMapBindings(props);
  const onSelectPopupOnly = props.onSelectPopupOnly;

  const isDetail = mapMode === "detail";
  const isMobile = useIsMobile();
  const isActiveLayout =
    isDetail || !mapLayout
      ? true
      : mapLayout === "mobile"
        ? isMobile
        : !isMobile;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const mapsApiRef = useRef<KakaoMapsApi | null>(null);
  const clusterOverlaysRef = useRef<Map<string, ClusterOverlayEntry>>(new Map());
  const favoriteHeartOverlaysRef = useRef<Map<string, FavoriteHeartOverlayEntry>>(
    new Map(),
  );
  const visitedOverlaysRef = useRef<Map<string, VisitedOverlayEntry>>(
    new Map(),
  );
  const entriesRef = useRef<Map<string, CourseMarkerEntry>>(new Map());
  const mapReadyRef = useRef(false);
  const initialViewAppliedRef = useRef(false);
  const userViewportTouchedRef = useRef(false);
  const isApplyingInitialViewRef = useRef(false);
  const selectedCourseIdRef = useRef(selectedCourseId);
  const hoveredCourseIdRef = useRef(hoveredCourseId);
  const isMobileRef = useRef(isMobile);
  const isActiveLayoutRef = useRef(isActiveLayout);
  const deferInitialViewRef = useRef(deferInitialViewUntilVisible);
  const mapSectionInViewRef = useRef(mapSectionInView);
  const coursesRef = useRef(courses);
  const initialViewportCoursesRef = useRef(initialViewportCourses);
  const searchKeywordRef = useRef(searchKeyword);
  const favoriteOnlyRef = useRef(favoriteOnly);
  const visitedOnlyRef = useRef(visitedOnly);
  const initialMapLevelRef = useRef(
    resolveInitialMapLevel(isMobile),
  );
  const clusterScopeRef = useRef(clusterScopeCourseIds);
  const selectedClusterKeysRef = useRef(selectedClusterKeys);
  const favoriteCourseIdsRef = useRef(favoriteCourseIds);
  const visitedCourseIdsRef = useRef(visitedCourseIds);
  const onSelectPopupOnlyRef = useRef(onSelectPopupOnly);
  const detailPrimaryCourseIdRef = useRef(detailPrimaryCourseId);
  const onVisibleRef = useRef(onVisibleCoursesChange);
  const onClusterRef = useRef(onClusterSelect);
  const onViewportChangeRef = useRef(onMapViewportChange);
  const onMapViewportReadyRef = useRef(onMapViewportReady);
  const onHoverRef = useRef(onHoverCourseChange);
  const selectCourseRef = useRef(selectCourse);
  const reportVisibleRef = useRef<() => void>(() => {});
  const syncMarkerVisualsRef = useRef<() => void>(() => {});
  const syncFavoriteHeartOverlaysRef = useRef<() => void>(() => {});
  const hoverClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nationwideFitPendingRef = useRef(false);

  const HOVER_CLEAR_DELAY_MS = 120;

  const cancelHoverClear = useCallback(() => {
    if (hoverClearTimerRef.current) {
      clearTimeout(hoverClearTimerRef.current);
      hoverClearTimerRef.current = null;
    }
  }, []);

  const scheduleHoverClear = useCallback(
    (courseId: string) => {
      cancelHoverClear();
      hoverClearTimerRef.current = setTimeout(() => {
        if (
          hoveredCourseIdRef.current === courseId &&
          selectedCourseIdRef.current !== courseId
        ) {
          onHoverRef.current?.(null);
        }
        hoverClearTimerRef.current = null;
      }, HOVER_CLEAR_DELAY_MS);
    },
    [cancelHoverClear],
  );

  const [mode, setMode] = useState<MapMode>(
    isKakaoConfigured ? "loading" : "fallback",
  );
  const [mapDisplayCount, setMapDisplayCount] = useState<number | null>(null);

  selectedCourseIdRef.current = selectedCourseId;
  hoveredCourseIdRef.current = hoveredCourseId;
  isMobileRef.current = isMobile;
  isActiveLayoutRef.current = isActiveLayout;
  deferInitialViewRef.current = deferInitialViewUntilVisible;
  mapSectionInViewRef.current = mapSectionInView;
  coursesRef.current = courses;
  initialViewportCoursesRef.current = initialViewportCourses;
  searchKeywordRef.current = searchKeyword;
  favoriteOnlyRef.current = favoriteOnly;
  visitedOnlyRef.current = visitedOnly;
  clusterScopeRef.current = clusterScopeCourseIds;
  selectedClusterKeysRef.current = selectedClusterKeys;
  favoriteCourseIdsRef.current = favoriteCourseIds;
  visitedCourseIdsRef.current = visitedCourseIds;
  onSelectPopupOnlyRef.current = onSelectPopupOnly;
  detailPrimaryCourseIdRef.current = detailPrimaryCourseId;
  onVisibleRef.current = onVisibleCoursesChange;
  onClusterRef.current = onClusterSelect;
  onViewportChangeRef.current = onMapViewportChange;
  onMapViewportReadyRef.current = onMapViewportReady;
  onHoverRef.current = onHoverCourseChange;
  selectCourseRef.current = selectCourse;

  const coursesKey = useMemo(
    () => courses.map((c) => c.id).join(","),
    [courses],
  );

  /** overlay popup용 — 필터 밖 selected course도 marker entry 보장 */
  const markerCourses = useMemo(() => {
    const list = [...courses];
    const selId = selectedCourseId;
    if (selId && !list.some((c) => c.id === selId)) {
      const extra = initialViewportCourses.find((c) => c.id === selId);
      if (extra) list.push(extra);
    }
    return list;
  }, [courses, selectedCourseId, initialViewportCourses]);

  const markerCoursesKey = useMemo(
    () => markerCourses.map((c) => c.id).join(","),
    [markerCourses],
  );

  const notifyViewportChange = useCallback(() => {
    if (mapReadyRef.current) {
      onViewportChangeRef.current?.();
    }
  }, []);

  const updateSelectedInBounds = useCallback((bounds: KakaoLatLngBounds) => {
    const selId = selectedCourseIdRef.current;
    if (!selId) return;
    const sel = coursesRef.current.find((c) => c.id === selId);
    if (!sel || !mapsApiRef.current) return;
    isCourseInKakaoBounds(sel, bounds, mapsApiRef.current.LatLng);
  }, []);

  const reportVisibleCourses = useCallback(() => {
    if (!isActiveLayoutRef.current) return;
    if (!onVisibleRef.current) return;

    if (
      !isDetail &&
      !initialViewAppliedRef.current &&
      !userViewportTouchedRef.current
    ) {
      return;
    }

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

    if (
      !userViewportTouchedRef.current &&
      ids.length === 0 &&
      coursesRef.current.length > 0
    ) {
      if (process.env.NODE_ENV === "development") {
        console.debug("[KakaoCourseMap] skip empty visible count before viewport settles", {
          courseCount: coursesRef.current.length,
          layout: isMobileRef.current ? "mobile" : "desktop",
        });
      }
      return;
    }

    mapReadyRef.current = true;
    updateSelectedInBounds(bounds);
    onVisibleRef.current(ids);
  }, [isDetail, updateSelectedInBounds]);

  reportVisibleRef.current = reportVisibleCourses;

  const captureInitialMapLevel = useCallback(() => {
    const map = mapRef.current;
    if (!map || isDetail) return;
    const level = map.getLevel();
    if (typeof level === "number" && Number.isFinite(level) && level > 0) {
      initialMapLevelRef.current = level;
    }
  }, [isDetail]);

  const fitToCourses = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps || coursesRef.current.length === 0) return;

    const padding = isMobileRef.current
      ? { ...MOBILE_INITIAL_MAP_PADDING }
      : { ...DESKTOP_INITIAL_MAP_PADDING };

    isApplyingInitialViewRef.current = true;

    if (isMobileRef.current) {
      const allCourses = initialViewportCoursesRef.current;
      fitMapToAllCourses(
        map,
        maps,
        allCourses.length > 0 ? allCourses : coursesRef.current,
        { ...MOBILE_INITIAL_MAP_PADDING },
        { mobile: true },
      );
    } else {
      fitKakaoMapToCourses(map, maps, coursesRef.current, padding);
    }
    requestAnimationFrame(() => {
      map.relayout?.();
      setTimeout(() => {
        map.relayout?.();
        isApplyingInitialViewRef.current = false;
      }, 80);
    });
  }, []);

  const runWhenMapContainerReady = useCallback((run: () => void) => {
    const el = containerRef.current;
    if (!el) return;

    const MIN_HEIGHT = 200;
    let attempts = 0;
    const tick = () => {
      if (el.offsetWidth > 0 && el.offsetHeight >= MIN_HEIGHT) {
        run();
        return;
      }
      if (attempts < 72) {
        attempts += 1;
        requestAnimationFrame(tick);
      } else {
        run();
      }
    };
    tick();
  }, []);

  const countCoursesInMapBounds = useCallback(
    (sourceCourses: Course[]) => {
      const map = mapRef.current;
      const maps = mapsApiRef.current;
      const bounds = map?.getBounds?.();
      if (!bounds || !maps) return 0;
      return (
        getCourseIdsInKakaoBounds(sourceCourses, bounds, maps.LatLng)?.length ??
        0
      );
    },
    [],
  );

  const notifyMapViewportReady = useCallback(
    (sourceCourses: Course[]) => {
      const visibleCount = countCoursesInMapBounds(sourceCourses);
      onMapViewportReadyRef.current?.({
        visibleCount,
        totalCourses: initialViewportCoursesRef.current.length,
      });
    },
    [countCoursesInMapBounds],
  );

  const finalizeInitialMapView = useCallback(
    (sourceCourses: Course[] = initialViewportCoursesRef.current) => {
      const map = mapRef.current;
      if (!map) return;

      map.relayout?.();
      captureInitialMapLevel();
      initialViewAppliedRef.current = true;
      isApplyingInitialViewRef.current = false;
      reportVisibleRef.current();
      syncMarkerVisualsRef.current();
      notifyMapViewportReady(sourceCourses);

      if (process.env.NODE_ENV === "development") {
        const visibleCount = countCoursesInMapBounds(sourceCourses);
        console.debug("[KakaoCourseMap] initial viewport ready", {
          layout: isMobileRef.current ? "mobile" : "desktop",
          totalCourses: sourceCourses.length,
          visibleCount,
          level: map.getLevel(),
        });
      }
    },
    [captureInitialMapLevel, countCoursesInMapBounds, notifyMapViewportReady],
  );

  const applyInitialMapView = useCallback(() => {
    if (!isActiveLayoutRef.current) return;
    if (nationwideFitPendingRef.current) return;
    if (deferInitialViewRef.current && isMobileRef.current) return;
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps || isDetail) return;

    const allCourses = initialViewportCoursesRef.current;

    runWhenMapContainerReady(() => {
      isApplyingInitialViewRef.current = true;

      if (isMobileRef.current) {
        fitMapToAllCourses(
          map,
          maps,
          allCourses,
          { ...MOBILE_INITIAL_MAP_PADDING },
          { mobile: true, nationwideAllCourses: true },
        );
      } else {
        setInitialKakaoMapView(map, maps);
      }

      requestAnimationFrame(() => {
        map.relayout?.();
        setTimeout(() => {
          map.relayout?.();
          const visibleCount = countCoursesInMapBounds(allCourses);

          if (
            isMobileRef.current &&
            allCourses.length > 0 &&
            visibleCount <= 5
          ) {
            applyMobileNationwideFallback(map, maps);
            requestAnimationFrame(() => {
              map.relayout?.();
              setTimeout(() => finalizeInitialMapView(allCourses), 120);
            });
            return;
          }

          finalizeInitialMapView(allCourses);
        }, 100);
      });
    });
  }, [
    isDetail,
    finalizeInitialMapView,
    runWhenMapContainerReady,
    countCoursesInMapBounds,
  ]);

  const syncClusterOverlays = useCallback(
    (
      map: KakaoMapInstance,
      groups: ClusterGroup[],
      LatLng: new (lat: number, lng: number) => unknown,
      CustomOverlay: new (opts: Record<string, unknown>) => ClusterOverlayEntry["overlay"],
    ) => {
      const nextKeys = new Set<string>();

      for (const group of groups) {
        if (group.courseIds.length < 2) continue;

        const key = clusterGroupKey(group.courseIds);
        nextKeys.add(key);
        const isSelected = selectedClusterKeysRef.current.includes(key);

        let entry = clusterOverlaysRef.current.get(key);
        if (!entry) {
          const courseIds = [...group.courseIds];
          const badgeEl = createClusterBadgeElement(courseIds.length, isSelected);
          const clickHandler = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            onClusterRef.current?.({ clusterKey: key, courseIds });
          };
          badgeEl.addEventListener("click", clickHandler);

          const overlay = new CustomOverlay({
            position: new LatLng(group.lat, group.lng),
            content: badgeEl,
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex: isSelected ? 120 : 80,
            clickable: true,
          });

          entry = { overlay, badgeEl, courseIds, clickHandler };
          clusterOverlaysRef.current.set(key, entry);
        } else {
          updateClusterBadgeElement(entry.badgeEl, group.courseIds.length, isSelected);
          entry.overlay.setPosition(new LatLng(group.lat, group.lng));
        }

        entry.overlay.setZIndex(isSelected ? 120 : 80);
        entry.overlay.setMap(map);
      }

      clusterOverlaysRef.current.forEach((entry, key) => {
        if (!nextKeys.has(key)) {
          entry.badgeEl.removeEventListener("click", entry.clickHandler);
          entry.overlay.setMap(null);
          clusterOverlaysRef.current.delete(key);
        }
      });
    },
    [],
  );

  /** collection overlay 클릭 — popup만, 지도 이동 없음 */
  const selectCoursePopupOnly = useCallback(
    (course: Course) => {
      cancelHoverClear();
      onSelectPopupOnlyRef.current?.(course);
    },
    [cancelHoverClear],
  );

  const syncCollectionOverlays = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps || !window.kakao?.maps || isDetail) return;

    if (!isActiveLayoutRef.current) {
      favoriteHeartOverlaysRef.current.forEach((entry) => {
        entry.overlay.setMap(null);
      });
      visitedOverlaysRef.current.forEach((entry) => {
        entry.overlay.setMap(null);
      });
      return;
    }

    const LatLng = maps.LatLng;
    const CustomOverlay = (
      window.kakao.maps as Record<string, unknown>
    ).CustomOverlay as new (opts: Record<string, unknown>) => MarkerOverlay;

    const courseById = new Map(
      initialViewportCoursesRef.current.map((course) => [course.id, course]),
    );
    const selectedId = selectedCourseIdRef.current;

    const syncOneLayer = (
      ids: string[],
      store: Map<
        string,
        { overlay: MarkerOverlay; root: HTMLDivElement; course: Course }
      >,
      createRoot: (onClick: (e: Event) => void) => HTMLDivElement,
      baseZIndex: number,
    ) => {
      const nextIds = new Set<string>();

      for (const id of ids) {
        const course = courseById.get(id);
        if (!course || !isValidCourseCoordinates(course)) continue;

        nextIds.add(id);
        let entry = store.get(id);

        if (!entry) {
          const clickHandler = () => selectCoursePopupOnly(course);
          const root = createRoot(clickHandler);
          const overlay = new CustomOverlay({
            position: new LatLng(course.latitude, course.longitude),
            content: root,
            xAnchor: 0.5,
            yAnchor: 0.5,
            zIndex: baseZIndex,
            clickable: true,
          });
          entry = { overlay, root, course };
          store.set(id, entry);
        }

        entry.overlay.setZIndex(
          id === selectedId ? 2400 : baseZIndex,
        );
        entry.overlay.setMap(map);
      }

      store.forEach((entry, id) => {
        if (!nextIds.has(id)) {
          entry.overlay.setMap(null);
          store.delete(id);
        }
      });
    };

    syncOneLayer(
      favoriteCourseIdsRef.current,
      favoriteHeartOverlaysRef.current,
      createFavoriteHeartOverlayRoot,
      FAVORITE_HEART_OVERLAY_Z_INDEX,
    );
    syncOneLayer(
      visitedCourseIdsRef.current,
      visitedOverlaysRef.current,
      createVisitedOverlayRoot,
      VISITED_OVERLAY_Z_INDEX,
    );
  }, [isDetail, selectCoursePopupOnly]);

  syncFavoriteHeartOverlaysRef.current = syncCollectionOverlays;

  const syncMarkerVisuals = useCallback(() => {
    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !window.kakao?.maps || !maps) return;

    if (isDetail) {
      clusterOverlaysRef.current.forEach((entry) => entry.overlay.setMap(null));
      const primaryId =
        detailPrimaryCourseIdRef.current ?? coursesRef.current[0]?.id ?? null;
      const hoveredId = hoveredCourseIdRef.current;

      entriesRef.current.forEach((entry, id) => {
        const isPrimary = id === primaryId;
        const isHov = id === hoveredId && !isPrimary;
        const variant = isPrimary
          ? "selected"
          : isHov
            ? "hovered"
            : "default";

        updatePinOverlayElement(entry.dom.pinEl, variant);

        if (isPrimary || isHov) {
          updateSplitMarkerVisuals(entry.dom, entry.course, {
            variant: isPrimary ? "selected" : "hovered",
            showHoverLabel: true,
            showSelectedPopup: false,
            labelVariant: isPrimary ? "selected" : "normal",
          });
          entry.labelOverlay.setZIndex(isHov ? 1900 : 500);
          entry.labelOverlay.setMap(map);
        } else {
          entry.labelOverlay.setMap(null);
        }

        entry.popupOverlay.setMap(null);
        entry.pinOverlay.setZIndex(isPrimary ? 2500 : isHov ? 1800 : 100);
        entry.pinOverlay.setMap(map);
      });
      syncFavoriteHeartOverlaysRef.current();
      return;
    }

    const bounds = map.getBounds?.();
    if (!bounds) return;

    const LatLng = maps.LatLng;
    const CustomOverlay = (
      window.kakao.maps as Record<string, unknown>
    ).CustomOverlay as new (opts: Record<string, unknown>) => ClusterOverlayEntry["overlay"];

    const hasSearch = Boolean(searchKeywordRef.current.trim());
    const mapDisplayCourses = hasSearch
      ? coursesRef.current
      : coursesRef.current.filter((course) =>
          isCourseInKakaoBounds(course, bounds, LatLng),
        );
    const level = map.getLevel();
    const initialLevel = resolveInitialMapLevel(
      isMobileRef.current,
      initialMapLevelRef.current,
    );
    const visibleIdSet = new Set(mapDisplayCourses.map((c) => c.id));
    const forceIndividualIds = clusterScopeRef.current?.length
      ? new Set(clusterScopeRef.current)
      : undefined;
    const displayOptions = {
      level,
      initialLevel,
      isMobile: isMobileRef.current,
      displayedCount: coursesRef.current.length,
      hasSearchKeyword: hasSearch,
      favoriteOnly: favoriteOnlyRef.current,
      visitedOnly: visitedOnlyRef.current,
      forceIndividualIds,
    };
    const { clusters, pinGroupSizeMap, clusteringEnabled } = resolveClusterDisplay(
      mapDisplayCourses,
      displayOptions,
    );

    syncClusterOverlays(map, clusters, LatLng, CustomOverlay);
    if (initialViewAppliedRef.current || userViewportTouchedRef.current) {
      setMapDisplayCount(
        hasSearch ? coursesRef.current.length : mapDisplayCourses.length,
      );
    }

    const selectedId = selectedCourseIdRef.current;
    const hoveredId = hoveredCourseIdRef.current;
    const mobile = isMobileRef.current;

    entriesRef.current.forEach((entry, id) => {
      const isSel = id === selectedId;
      const isHov = id === hoveredId && !isSel;
      const variant = markerVariant(id, selectedId, hoveredId);

      if (!visibleIdSet.has(id)) {
        entry.pinOverlay.setMap(null);
        entry.labelOverlay.setMap(null);
        entry.popupOverlay.setMap(null);
        return;
      }

      let effectiveGroupSize = pinGroupSizeMap.get(id) ?? 1;
      if (isSel || isHov) {
        effectiveGroupSize = 1;
      }

      const displayCtx: MarkerDisplayContext = {
        level,
        isMobile: mobile,
        isSelected: isSel,
        isHovered: isHov,
        effectiveGroupSize,
        clusteringEnabled,
        displayedCount: coursesRef.current.length,
        hasSearchKeyword: Boolean(searchKeywordRef.current.trim()),
      };

      const showPin = shouldShowPin(displayCtx);
      const showLabel = shouldShowLabel(displayCtx);
      const showSelectedPopup = isSel && !mobile;
      const showHoverLabel = showLabel && !showSelectedPopup;

      const visualUpdate = {
        variant,
        showHoverLabel,
        showSelectedPopup,
        labelVariant: isSel ? ("selected" as const) : ("normal" as const),
      };
      const visualKey = splitMarkerVisualKey(id, visualUpdate);

      if (!showPin) {
        entry.pinOverlay.setMap(null);
        entry.labelOverlay.setMap(null);
        entry.popupOverlay.setMap(null);
        entry.lastVisualKey = undefined;
        return;
      }

      if (entry.lastVisualKey !== visualKey) {
        updateSplitMarkerVisuals(entry.dom, entry.course, visualUpdate);
        entry.lastVisualKey = visualKey;
      }

      entry.pinOverlay.setZIndex(isSel ? 2500 : isHov ? 1800 : 100);
      entry.pinOverlay.setMap(map);

      if (showHoverLabel) {
        entry.labelOverlay.setZIndex(isHov ? 1900 : 500);
        entry.labelOverlay.setMap(map);
      } else {
        entry.labelOverlay.setMap(null);
      }

      if (showSelectedPopup) {
        entry.popupOverlay.setZIndex(2600);
        entry.popupOverlay.setMap(map);
      } else {
        entry.popupOverlay.setMap(null);
      }
    });

    syncFavoriteHeartOverlaysRef.current();
  }, [isDetail, syncClusterOverlays]);

  syncMarkerVisualsRef.current = syncMarkerVisuals;

  const cleanupMarkers = useCallback(() => {
    clusterOverlaysRef.current.forEach((entry) => {
      entry.badgeEl.removeEventListener("click", entry.clickHandler);
      entry.overlay.setMap(null);
    });
    clusterOverlaysRef.current.clear();

    favoriteHeartOverlaysRef.current.forEach((entry) => {
      entry.overlay.setMap(null);
    });
    favoriteHeartOverlaysRef.current.clear();

    visitedOverlaysRef.current.forEach((entry) => {
      entry.overlay.setMap(null);
    });
    visitedOverlaysRef.current.clear();

    entriesRef.current.forEach((entry) => {
      entry.dom.pinEl.removeEventListener("pointerenter", entry.pinHandlers.enter);
      entry.dom.pinEl.removeEventListener("pointerleave", entry.pinHandlers.leave);
      entry.dom.pinEl.removeEventListener("click", entry.pinHandlers.click);
      entry.dom.pinEl.removeEventListener("touchend", entry.pinHandlers.click);
      entry.pinOverlay.setMap(null);
      entry.labelOverlay.setMap(null);
      entry.popupOverlay.setMap(null);
    });
    entriesRef.current.clear();
    cancelHoverClear();
  }, [cancelHoverClear]);

  useEffect(() => {
    if (!isKakaoConfigured) {
      setMode("fallback");
      return;
    }
    if (
      deferInitialViewUntilVisible &&
      isMobile &&
      !mapSectionInView
    ) {
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
          level: isDetail ? DETAIL_KAKAO_MAP_LEVEL : INITIAL_KAKAO_MAP_LEVEL,
        });
        mapRef.current = map;

        if (isDetail && coursesRef.current.length > 0) {
          if (coursesRef.current.length === 1) {
            const detailCourse = coursesRef.current[0];
            map.setCenter(
              new LatLng(detailCourse.latitude, detailCourse.longitude),
            );
            map.setLevel(DETAIL_KAKAO_MAP_LEVEL);
          } else {
            fitKakaoMapToCourses(
              map,
              mapsApiRef.current!,
              coursesRef.current,
              {
                top: 48,
                right: 48,
                bottom: 48,
                left: 48,
              },
            );
          }
        }

        const eventAdd = (
          maps.event as {
            addListener: (
              target: unknown,
              type: string,
              handler: (...args: unknown[]) => void,
            ) => void;
          }
        ).addListener;

        eventAdd(map, "dragstart", () => {
          userViewportTouchedRef.current = true;
          notifyViewportChange();
        });
        eventAdd(map, "dragend", () => {
          notifyViewportChange();
          reportVisibleRef.current();
          syncMarkerVisualsRef.current();
        });
        eventAdd(map, "zoom_changed", () => {
          if (!isApplyingInitialViewRef.current) {
            userViewportTouchedRef.current = true;
          }
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
  }, [deferInitialViewUntilVisible, isMobile, mapSectionInView]);

  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !containerRef.current) return;
    const map = mapRef.current;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const relayout = () => {
      map.relayout?.();
      if (
        isActiveLayoutRef.current &&
        isMobileRef.current &&
        !isDetail &&
        !userViewportTouchedRef.current &&
        !deferInitialViewRef.current
      ) {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => applyInitialMapView(), 100);
      }
    };
    relayout();
    const observer = new ResizeObserver(relayout);
    observer.observe(containerRef.current);
    window.addEventListener("resize", relayout);
    window.addEventListener("orientationchange", relayout);
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
      window.removeEventListener("resize", relayout);
      window.removeEventListener("orientationchange", relayout);
    };
  }, [mode, isDetail, isActiveLayout, applyInitialMapView]);

  /** 모바일/데스크탑 초기 카메라 분리 — breakpoint·최초 로딩 시 fit */
  useEffect(() => {
    if (mode !== "kakao" || isDetail || userViewportTouchedRef.current) return;
    if (!isActiveLayout) return;
    if (deferInitialViewUntilVisible && isMobile) return;
    if (
      deferInitialViewUntilVisible &&
      !mapSectionInView
    ) {
      return;
    }

    initialMapLevelRef.current = resolveInitialMapLevel(isMobile);

    const timer = setTimeout(() => {
      applyInitialMapView();
    }, isMobile ? 150 : 100);

    return () => clearTimeout(timer);
  }, [
    mode,
    isMobile,
    isDetail,
    isActiveLayout,
    deferInitialViewUntilVisible,
    mapSectionInView,
    applyInitialMapView,
    initialViewportCourses.length,
  ]);

  /** "결과 위치로 이동" 버튼 — 이때만 fitBounds */
  useEffect(() => {
    if (mode !== "kakao" || mapViewResetSignal === 0) return;
    if (!isActiveLayoutRef.current) return;
    fitToCourses();
  }, [mode, mapViewResetSignal, fitToCourses]);

  /** 모바일 "전체 골프장 지도 보기" — 전국 fit + visible 재보고 */
  useEffect(() => {
    if (mode !== "kakao" || nationwideFitSignal === 0) return;
    if (!isActiveLayoutRef.current || isDetail) return;
    if (deferInitialViewRef.current && !mapSectionInViewRef.current) return;

    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps) return;

    const allCourses = initialViewportCoursesRef.current;
    if (allCourses.length === 0) return;

    nationwideFitPendingRef.current = true;
    userViewportTouchedRef.current = false;
    initialViewAppliedRef.current = false;
    isApplyingInitialViewRef.current = true;

    const padding = { ...MOBILE_INITIAL_MAP_PADDING };
    const nationwideOptions = {
      mobile: isMobileRef.current,
      nationwideAllCourses: true,
    } as const;

    const applyAllCourseBounds = () =>
      fitMapToAllCourses(map, maps, allCourses, padding, nationwideOptions);

    const logMobileInit = (
      result: ReturnType<typeof fitMapToAllCourses>,
      visibleCount: number,
    ) => {
      if (process.env.NODE_ENV !== "development" || !isMobileRef.current) {
        return;
      }
      const bounds = map.getBounds?.();
      let center: { lat: number; lng: number } | null = null;
      if (bounds) {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        center = {
          lat: (sw.getLat() + ne.getLat()) / 2,
          lng: (sw.getLng() + ne.getLng()) / 2,
        };
      }
      console.log("[mobile map init]", {
        totalCourses: allCourses.length,
        validCoordCount: result.validCoordCount,
        fitBoundsSource: "allCourses",
        usedFallback: result.usedFallback,
        visibleCount,
        center,
        level: map.getLevel(),
      });
    };

    const finishFit = (result: ReturnType<typeof fitMapToAllCourses>) => {
      let visibleCount = countCoursesInMapBounds(allCourses);

      if (allCourses.length > 100 && visibleCount <= 5) {
        applyMobileNationwideFallback(map, maps);
        map.relayout?.();
        visibleCount = countCoursesInMapBounds(allCourses);
        logMobileInit(
          { ...result, fitted: false, usedFallback: true },
          visibleCount,
        );
        nationwideFitPendingRef.current = false;
        finalizeInitialMapView(allCourses);
        return;
      }

      logMobileInit(result, visibleCount);
      nationwideFitPendingRef.current = false;
      finalizeInitialMapView(allCourses);
    };

    const runNationwideFit = () => {
      runWhenMapContainerReady(() => {
        const result = applyAllCourseBounds();

        requestAnimationFrame(() => {
          map.relayout?.();
          applyAllCourseBounds();
          setTimeout(() => {
            map.relayout?.();
            const retryResult = applyAllCourseBounds();
            finishFit(retryResult);
          }, 120);
        });
      });
    };

    const scrollSettleTimer = window.setTimeout(runNationwideFit, 420);
    return () => {
      window.clearTimeout(scrollSettleTimer);
    };
  }, [
    mode,
    nationwideFitSignal,
    isDetail,
    mapSectionInView,
    finalizeInitialMapView,
    runWhenMapContainerReady,
    countCoursesInMapBounds,
  ]);

  /** 필터 변경 시 마커만 갱신, 지도 center/level 유지 */
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current) return;
    if (!initialViewAppliedRef.current && !userViewportTouchedRef.current) {
      return;
    }
    reportVisibleRef.current();
    const timer = setTimeout(() => reportVisibleRef.current(), 300);
    return () => clearTimeout(timer);
  }, [mode, coursesKey]);

  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !window.kakao?.maps) return;

    const maps = window.kakao.maps as Record<string, unknown>;
    const map = mapRef.current;
    const LatLng = maps.LatLng as new (lat: number, lng: number) => unknown;
    const CustomOverlay = maps.CustomOverlay as new (
      opts: Record<string, unknown>,
    ) => {
      setMap: (m: unknown | null) => void;
      setContent: (content: HTMLElement) => void;
      setZIndex: (z: number) => void;
    };

    cleanupMarkers();

    markerCourses.forEach((course) => {
      const position = new LatLng(course.latitude, course.longitude);
      const dom = createSplitMarkerDom();
      const primaryId =
        detailPrimaryCourseIdRef.current ?? markerCourses[0]?.id ?? null;
      const pinHandlers: PinEventHandlers = {
        click: (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          cancelHoverClear();
          selectCourseRef.current(course);
        },
        enter: () => {
          cancelHoverClear();
          if (selectedCourseIdRef.current !== course.id) {
            onHoverRef.current?.(course.id);
          }
        },
        leave: () => {
          if (selectedCourseIdRef.current === course.id) return;
          scheduleHoverClear(course.id);
        },
      };

      dom.pinEl.addEventListener("pointerenter", pinHandlers.enter);
      dom.pinEl.addEventListener("pointerleave", pinHandlers.leave);
      if (!isDetail || course.id !== primaryId) {
        dom.pinEl.addEventListener("click", pinHandlers.click);
        dom.pinEl.addEventListener("touchend", pinHandlers.click);
      }

      const pinOverlay = new CustomOverlay({
        position,
        content: dom.pinEl,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 1,
        clickable: true,
      });

      const labelOverlay = new CustomOverlay({
        position,
        content: dom.labelRoot,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 500,
        clickable: false,
      });

      const popupOverlay = new CustomOverlay({
        position,
        content: dom.popupRoot,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 2600,
        clickable: true,
      });

      const entry: CourseMarkerEntry = {
        pinOverlay,
        labelOverlay,
        popupOverlay,
        dom,
        course,
        pinHandlers,
      };

      if (isDetail) {
        const primaryId =
          detailPrimaryCourseIdRef.current ?? markerCourses[0]?.id ?? null;
        updatePinOverlayElement(
          dom.pinEl,
          course.id === primaryId ? "selected" : "default",
        );
      }

      entriesRef.current.set(course.id, entry);
    });

    syncMarkerVisuals();

    requestAnimationFrame(() => {
      reportVisibleRef.current();
    });

    return () => {
      cleanupMarkers();
    };
  }, [
    mode,
    markerCoursesKey,
    markerCourses,
    isDetail,
    cleanupMarkers,
    syncMarkerVisuals,
    cancelHoverClear,
    scheduleHoverClear,
  ]);

  useEffect(() => {
    if (mode !== "kakao") return;
    syncMarkerVisuals();
  }, [mode, searchKeyword, favoriteOnly, visitedOnly, clusterScopeCourseIds, selectedClusterKeys, syncMarkerVisuals]);

  useEffect(() => {
    if (mode !== "kakao") return;
    syncMarkerVisuals();
  }, [mode, selectedCourseId, hoveredCourseId, syncMarkerVisuals]);

  const favoriteCourseIdsKey = useMemo(
    () => favoriteCourseIds.join(","),
    [favoriteCourseIds],
  );

  useEffect(() => {
    if (mode !== "kakao") return;
    syncMarkerVisuals();
    syncFavoriteHeartOverlaysRef.current();
  }, [mode, favoriteCourseIdsKey, syncMarkerVisuals]);

  const visitedCourseIdsKey = useMemo(
    () => visitedCourseIds.join(","),
    [visitedCourseIds],
  );

  useEffect(() => {
    if (mode !== "kakao") return;
    syncFavoriteHeartOverlaysRef.current();
  }, [mode, visitedCourseIdsKey]);

  const fitToCourseIdsKey = useMemo(
    () => `${fitToCourseIdsSignal}:${fitToCourseIds.join(",")}`,
    [fitToCourseIdsSignal, fitToCourseIds],
  );

  useEffect(() => {
    if (mode !== "kakao" || fitToCourseIdsSignal === 0) return;
    if (!isActiveLayoutRef.current) return;
    if (fitToCourseIds.length === 0) return;

    const map = mapRef.current;
    const maps = mapsApiRef.current;
    if (!map || !maps) return;

    const idSet = new Set(fitToCourseIds);
    const toFit = initialViewportCoursesRef.current.filter(
      (course) => idSet.has(course.id) && isValidCourseCoordinates(course),
    );
    if (toFit.length === 0) return;

    const padding = isMobileRef.current
      ? { ...MOBILE_INITIAL_MAP_PADDING }
      : { ...DESKTOP_INITIAL_MAP_PADDING };

    isApplyingInitialViewRef.current = true;
    fitKakaoMapToCourses(map, maps, toFit, padding);
    requestAnimationFrame(() => {
      map.relayout?.();
      setTimeout(() => {
        map.relayout?.();
        reportVisibleRef.current();
        syncMarkerVisualsRef.current();
        isApplyingInitialViewRef.current = false;
      }, 80);
    });
  }, [mode, fitToCourseIdsKey, fitToCourseIds, fitToCourseIdsSignal]);

  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !mapsApiRef.current || !center)
      return;
    if (!isActiveLayoutRef.current) return;

    userViewportTouchedRef.current = true;

    if (process.env.NODE_ENV === "development" && center.courseId) {
      console.debug("[focusCourseOnMap]", {
        courseId: center.courseId,
        lat: center.lat,
        lng: center.lng,
        level: center.level,
      });
    }

    if (center.level != null) {
      focusCourseOnMap(mapRef.current, mapsApiRef.current, center, {
        level: center.level,
      });
    } else {
      panToCourseWithoutZoom(mapRef.current, mapsApiRef.current, center);
    }
    syncMarkerVisuals();
  }, [mode, center, syncMarkerVisuals]);

  /** 상세 페이지: 단일 또는 근처 포함 fitBounds */
  useEffect(() => {
    if (mode !== "kakao" || !mapRef.current || !isDetail || courses.length === 0) {
      return;
    }
    const maps = mapsApiRef.current;
    if (!maps) return;
    const map = mapRef.current;
    const LatLng = maps.LatLng;

    if (courses.length === 1) {
      const course = courses[0];
      map.setCenter(new LatLng(course.latitude, course.longitude));
      map.setLevel(DETAIL_KAKAO_MAP_LEVEL);
    } else {
      fitKakaoMapToCourses(map, maps, courses, {
        top: 48,
        right: 48,
        bottom: 48,
        left: 48,
      });
    }
    syncMarkerVisuals();
  }, [mode, isDetail, coursesKey, courses, syncMarkerVisuals]);

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
          detailPrimaryCourseId={detailPrimaryCourseId}
          hoveredCourseId={hoveredCourseId}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 ${className}`}
    >
      <div ref={containerRef} className="h-full w-full" />
      {mode === "loading" && (
        <MapSkeleton className="absolute inset-0 z-10 !rounded-none !border-0" />
      )}
      {mode === "kakao" && !isDetail && mapDisplayCount !== null && (
        <div className="pointer-events-none absolute right-3.5 top-3.5 z-10 rounded-full border border-stone-200/70 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-[0_1px_6px_rgba(0,0,0,0.08)] backdrop-blur-sm md:right-4 md:top-4">
          {mapDisplayCount.toLocaleString()}곳
        </div>
      )}
    </div>
  );
}
