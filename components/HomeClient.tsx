"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { Course, CourseFilters } from "@/types/course";
import type { MapFocusTarget } from "@/types/map";
import { EMPTY_FILTERS } from "@/types/course";
import { filterCourses, countActiveFilters } from "@/lib/filterCourses";
import {
  createMapFocusTarget,
  debugFocusCourse,
  isValidCourseCoordinates,
} from "@/lib/focusCourse";
import { sortCoursesByName } from "@/lib/courseListUtils";
import { getSearchSuggestions } from "@/lib/searchSuggestions";
import DesktopHero from "@/components/DesktopHero";
import FilterBar from "@/components/FilterBar";
import CourseList from "@/components/CourseList";
import CourseMap from "@/components/maps/CourseMap";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import MobileTopBar from "@/components/MobileTopBar";
import MobileBottomSheet, {
  type MobileSheetSnap,
} from "@/components/MobileBottomSheet";
import {
  CourseCollectionsProvider,
  useFavorites,
  useVisited,
} from "@/contexts/CourseCollectionsContext";
import { useHomeReset } from "@/contexts/HomeResetContext";
import {
  applyHomeResetState,
  consumeHomeResetPending,
  clearHomeUrlState,
} from "@/lib/homeResetState";
import {
  filterCoursesByRegion,
  getRegionLandingBySlug,
  getRegionMapFilterRegion,
} from "@/lib/regionLanding";
import {
  getListCountLabel,
  getListCountSublabel,
} from "@/lib/listCountLabels";
import QuickFindLinks from "@/components/QuickFindLinks";

type ListMode = "cluster" | "allFiltered" | "visible" | "fallback";

function ListHeader({
  mode,
  count,
  total,
  isFiltered,
  isShowingAllFilteredResults,
  visibleReady,
  onClearCluster,
  onShowMapBased,
  onShowAllFiltered,
  onFitResults,
  onResetFilters,
  favoriteOnly,
  favoriteCount,
  onToggleFavoriteOnly,
  visitedOnly,
  visitedCount,
  onToggleVisitedOnly,
  isSearchActive = false,
  selectedClusterCount = 0,
}: {
  mode: ListMode;
  count: number;
  total: number;
  isFiltered: boolean;
  isShowingAllFilteredResults: boolean;
  visibleReady: boolean;
  onClearCluster: () => void;
  onShowMapBased: () => void;
  onShowAllFiltered: () => void;
  onFitResults: () => void;
  onResetFilters?: () => void;
  favoriteOnly: boolean;
  favoriteCount: number;
  onToggleFavoriteOnly: () => void;
  visitedOnly: boolean;
  visitedCount: number;
  onToggleVisitedOnly: () => void;
  isSearchActive?: boolean;
  selectedClusterCount?: number;
}) {
  let title: React.ReactNode;

  if (isSearchActive && !favoriteOnly && !visitedOnly) {
    title = (
      <>
        검색 결과 <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (favoriteOnly) {
    title = (
      <>
        즐겨찾기한 골프장{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (visitedOnly) {
    title = (
      <>
        가본 골프장 <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (mode === "cluster") {
    title = (
      <>
        {selectedClusterCount > 1 ? "선택한 묶음들의 골프장" : "선택한 묶음의 골프장"}{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (mode === "allFiltered") {
    title = (
      <>
        {isFiltered ? "필터 결과" : "전체 결과"}{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (mode === "visible") {
    title = isFiltered ? (
      <>
        현재 지도 영역의 검색 결과{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    ) : (
      <>
        현재 지도에 보이는 골프장{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (isFiltered) {
    title = (
      <>
        검색 결과 <span className="text-brand-600">{count}</span>곳
        <span className="ml-1 text-xs font-normal text-gray-400">
          (전체 {total}곳)
        </span>
      </>
    );
  } else {
    title = (
      <>
        전체 골프장 <span className="text-brand-600">{total}</span>곳
      </>
    );
  }

  const showViewToggle =
    !isSearchActive && mode !== "cluster" && visibleReady;

  return (
    <div className="mb-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-base font-bold text-stone-800">{title}</h2>
        <div className="flex shrink-0 items-center gap-2">
          {mode === "cluster" && (
            <button
              type="button"
              onClick={onClearCluster}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              선택 해제
            </button>
          )}
          {isFiltered && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {showViewToggle && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onShowMapBased}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              !isShowingAllFilteredResults
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            지도 영역 보기
          </button>
          <button
            type="button"
            onClick={onShowAllFiltered}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isShowingAllFilteredResults
                ? "bg-brand-800 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            전체 결과 보기
          </button>
          {mode === "visible" && isFiltered && (
            <button
              type="button"
              onClick={onFitResults}
              className="ml-auto text-xs font-semibold text-brand-700 hover:text-brand-800"
            >
              결과 위치로 이동
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleFavoriteOnly}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            favoriteOnly
              ? "bg-brand-600 text-white shadow-sm"
              : "bg-emerald-50 text-brand-800 ring-1 ring-inset ring-brand-200 hover:bg-emerald-100"
          }`}
        >
          {favoriteOnly
            ? `♥ 즐겨찾기 ${favoriteCount}`
            : favoriteCount > 0
              ? `♡ 즐겨찾기 ${favoriteCount}`
              : "♡ 즐겨찾기"}
        </button>
        <button
          type="button"
          onClick={onToggleVisitedOnly}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            visitedOnly
              ? "bg-brand-800 text-white shadow-sm"
              : "bg-stone-100 text-stone-700 ring-1 ring-inset ring-stone-200 hover:bg-stone-200"
          }`}
        >
          {visitedOnly
            ? `✓ 가본 골프장 ${visitedCount}`
            : visitedCount > 0
              ? `○ 가본 골프장 ${visitedCount}`
              : "○ 가본 골프장"}
        </button>
      </div>
    </div>
  );
}

export default function HomeClient({
  courses,
  initialRegionSlug,
}: {
  courses: Course[];
  initialRegionSlug?: string;
}) {
  return (
    <CourseCollectionsProvider>
      <HomeClientInner
        courses={courses}
        initialRegionSlug={initialRegionSlug}
      />
    </CourseCollectionsProvider>
  );
}

function HomeClientInner({
  courses,
  initialRegionSlug,
}: {
  courses: Course[];
  initialRegionSlug?: string;
}) {
  const { registerHomeReset } = useHomeReset();
  const { favoriteCourseIds, favoriteCount } = useFavorites();
  const { visitedCourseIds, visitedCount } = useVisited();
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [visitedOnly, setVisitedOnly] = useState(false);
  const [collectionFitIds, setCollectionFitIds] = useState<string[]>([]);
  const [collectionFitSignal, setCollectionFitSignal] = useState(0);
  const [filters, setFilters] = useState<CourseFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCourseIds, setVisibleCourseIds] = useState<string[] | null>(
    null,
  );
  const [selectedClusters, setSelectedClusters] = useState<
    Record<string, string[]>
  >({});
  const [isShowingAllFilteredResults, setIsShowingAllFilteredResults] =
    useState(false);
  const [landingRegionSlug, setLandingRegionSlug] = useState<string | null>(
    null,
  );
  const [center, setCenter] = useState<MapFocusTarget | null>(null);
  const [mapViewResetSignal, setMapViewResetSignal] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileSheetSnap, setMobileSheetSnap] =
    useState<MobileSheetSnap>("half");
  const [searchFitSignal, setSearchFitSignal] = useState(0);

  const selectedClusterKeys = useMemo(
    () => Object.keys(selectedClusters),
    [selectedClusters],
  );

  const selectedClusterCourseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const courseIds of Object.values(selectedClusters)) {
      for (const id of courseIds) ids.add(id);
    }
    return ids.size > 0 ? [...ids] : null;
  }, [selectedClusters]);

  const searchQuery = filters.query.trim();
  const isSearchActive = searchQuery.length > 0;

  const sourceCourses = useMemo(() => {
    if (!landingRegionSlug) return courses;
    const config = getRegionLandingBySlug(landingRegionSlug);
    return config ? filterCoursesByRegion(courses, config) : courses;
  }, [courses, landingRegionSlug]);

  const searchFiltered = useMemo(
    () => filterCourses(sourceCourses, filters),
    [sourceCourses, filters],
  );
  const activeCount = countActiveFilters(filters);
  const isFiltered = activeCount > 0 || filters.query.trim().length > 0;
  const isClusterScopeActive = Boolean(
    selectedClusterCourseIds && selectedClusterCourseIds.length > 0,
  );
  const visibleReady = visibleCourseIds !== null;

  const listMode: ListMode = isClusterScopeActive
    ? "cluster"
    : isShowingAllFilteredResults
      ? "allFiltered"
      : visibleReady
        ? "visible"
        : "fallback";

  const collectionCourses = useMemo(() => {
    if (favoriteOnly) {
      const idSet = new Set(favoriteCourseIds);
      return sortCoursesByName(
        filterCourses(
          courses.filter((c) => idSet.has(c.id)),
          filters,
        ),
      );
    }
    if (visitedOnly) {
      const idSet = new Set(visitedCourseIds);
      return sortCoursesByName(
        filterCourses(
          courses.filter((c) => idSet.has(c.id)),
          filters,
        ),
      );
    }
    return null;
  }, [
    favoriteOnly,
    visitedOnly,
    favoriteCourseIds,
    visitedCourseIds,
    courses,
    filters,
  ]);

  const baseDisplayCourses = useMemo(() => {
    if (collectionCourses) return collectionCourses;

    if (isClusterScopeActive && selectedClusterCourseIds) {
      const idSet = new Set(selectedClusterCourseIds);
      return sortCoursesByName(
        searchFiltered.filter((c) => idSet.has(c.id)),
      );
    }

    if (isSearchActive || isShowingAllFilteredResults) {
      return sortCoursesByName(searchFiltered);
    }

    if (visibleReady) {
      const idSet = new Set(visibleCourseIds ?? []);
      return sortCoursesByName(
        searchFiltered.filter((c) => idSet.has(c.id)),
      );
    }

    return sortCoursesByName(searchFiltered);
  }, [
    searchFiltered,
    visibleCourseIds,
    visibleReady,
    selectedClusterCourseIds,
    isClusterScopeActive,
    isShowingAllFilteredResults,
    isSearchActive,
    collectionCourses,
  ]);

  const displayCourses = baseDisplayCourses;

  const mapCourses = useMemo(() => {
    if (collectionCourses) return collectionCourses;
    return searchFiltered;
  }, [collectionCourses, searchFiltered]);

  const isMapBoundsEmpty =
    !isSearchActive &&
    visibleReady &&
    !isClusterScopeActive &&
    !isShowingAllFilteredResults &&
    (visibleCourseIds?.length ?? 0) === 0 &&
    searchFiltered.length > 0;

  const isSearchEmpty = isSearchActive && searchFiltered.length === 0;
  const isNoFilterResults = !isSearchActive && searchFiltered.length === 0;

  const isFavoritesEmpty = favoriteOnly && favoriteCount === 0;
  const isFavoritesFilterEmpty =
    favoriteOnly && favoriteCount > 0 && displayCourses.length === 0;
  const isVisitedEmpty = visitedOnly && visitedCount === 0;
  const isVisitedFilterEmpty =
    visitedOnly && visitedCount > 0 && displayCourses.length === 0;

  const handleToggleFavoriteOnly = useCallback(() => {
    setFavoriteOnly((prev) => {
      const next = !prev;
      if (next) {
        setVisitedOnly(false);
        setCollectionFitIds(favoriteCourseIds);
        setCollectionFitSignal((n) => n + 1);
      }
      return next;
    });
  }, [favoriteCourseIds]);

  const handleToggleVisitedOnly = useCallback(() => {
    setVisitedOnly((prev) => {
      const next = !prev;
      if (next) {
        setFavoriteOnly(false);
        setCollectionFitIds(visitedCourseIds);
        setCollectionFitSignal((n) => n + 1);
      }
      return next;
    });
  }, [visitedCourseIds]);

  const handleClearFavoriteOnly = useCallback(() => {
    setFavoriteOnly(false);
  }, []);

  const handleClearVisitedOnly = useCallback(() => {
    setVisitedOnly(false);
  }, []);

  const selectedCourse = useMemo(() => {
    if (!selectedId) return null;
    return (
      searchFiltered.find((c) => c.id === selectedId) ??
      courses.find((c) => c.id === selectedId) ??
      null
    );
  }, [selectedId, searchFiltered, courses]);

  const listHeaderCount =
    favoriteOnly || visitedOnly
      ? displayCourses.length
      : listMode === "fallback" && !isFiltered
        ? courses.length
        : listMode === "fallback" && isFiltered
          ? searchFiltered.length
          : displayCourses.length;

  const listCountLabel = useMemo(
    () =>
      getListCountLabel({
        mode: listMode,
        count: listHeaderCount,
        total: courses.length,
        isFiltered,
        favoriteOnly,
        visitedOnly,
        isSearchActive,
        searchQuery: isSearchActive ? searchQuery : "",
        selectedClusterCount: selectedClusterKeys.length,
      }),
    [
      listMode,
      listHeaderCount,
      courses.length,
      isFiltered,
      favoriteOnly,
      visitedOnly,
      isSearchActive,
      searchQuery,
      selectedClusterKeys.length,
    ],
  );

  const listCountSublabel = useMemo(
    () =>
      getListCountSublabel({
        mode: listMode,
        count: listHeaderCount,
        total: courses.length,
        isFiltered,
        isShowingAllFilteredResults,
      }),
    [
      listMode,
      listHeaderCount,
      courses.length,
      isFiltered,
      isShowingAllFilteredResults,
    ],
  );

  const searchSuggestions = useMemo(
    () => getSearchSuggestions(courses, filters.query),
    [courses, filters.query],
  );

  const mobileSheetTitle = useMemo(() => {
    if (favoriteOnly) return `즐겨찾기한 골프장 ${listHeaderCount}곳`;
    if (visitedOnly) return `가본 골프장 ${listHeaderCount}곳`;
    return listCountLabel;
  }, [
    favoriteOnly,
    visitedOnly,
    listHeaderCount,
    listCountLabel,
  ]);

  const mapFitToCourseIds = useMemo(() => {
    const fitSource = collectionCourses ?? searchFiltered;
    if (isSearchActive && fitSource.length > 1) {
      return fitSource.map((c) => c.id);
    }
    return collectionFitIds;
  }, [isSearchActive, searchFiltered, collectionCourses, collectionFitIds]);

  const mapFitToCourseIdsSignal = useMemo(() => {
    const fitSource = collectionCourses ?? searchFiltered;
    if (isSearchActive && fitSource.length > 1) return searchFitSignal;
    return collectionFitSignal;
  }, [
    isSearchActive,
    searchFiltered,
    collectionCourses,
    searchFitSignal,
    collectionFitSignal,
  ]);

  const updateFilters = useCallback((patch: Partial<CourseFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const resetHomeState = useCallback(() => {
    applyHomeResetState({
      setFilters,
      setFavoriteOnly,
      setVisitedOnly,
      setCollectionFitIds,
      setCollectionFitSignal,
      setSelectedId,
      setHoveredId,
      setVisibleCourseIds,
      setSelectedClusters,
      setIsShowingAllFilteredResults,
      setCenter,
      bumpMapViewResetSignal: () => setMapViewResetSignal((value) => value + 1),
      setSheetOpen,
      setMobileSheetSnap,
      setSearchFitSignal,
    });
    setLandingRegionSlug(null);
    clearHomeUrlState();
  }, []);

  useEffect(() => {
    if (!initialRegionSlug) return;
    const config = getRegionLandingBySlug(initialRegionSlug);
    if (!config) return;

    const filterRegion = getRegionMapFilterRegion(initialRegionSlug);
    if (filterRegion) {
      setFilters({ ...EMPTY_FILTERS, regions: [filterRegion] });
    } else {
      setLandingRegionSlug(initialRegionSlug);
    }
    setIsShowingAllFilteredResults(true);
  }, [initialRegionSlug]);

  useEffect(() => {
    const unregister = registerHomeReset(resetHomeState);
    if (consumeHomeResetPending()) {
      resetHomeState();
    }
    return unregister;
  }, [registerHomeReset, resetHomeState]);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  const clearClusterScope = useCallback(() => {
    setSelectedClusters({});
    setSelectedId(null);
  }, []);

  const handleShowMapBased = useCallback(() => {
    setIsShowingAllFilteredResults(false);
  }, []);

  const handleShowAllFiltered = useCallback(() => {
    setIsShowingAllFilteredResults(true);
    setSelectedClusters({});
  }, []);

  const handleFitResults = useCallback(() => {
    setSelectedClusters({});
    setIsShowingAllFilteredResults(false);
    setMapViewResetSignal((n) => n + 1);
  }, []);

  const focusCourseOnList = useCallback(
    (
      course: Course,
      options?: { collapseSheet?: boolean },
    ) => {
      if (!isValidCourseCoordinates(course)) {
        debugFocusCourse(course, null);
        return;
      }

      setSelectedId(course.id);

      const target = createMapFocusTarget(course);
      debugFocusCourse(course, target);
      if (target) {
        setCenter(target);
      }

      if (options?.collapseSheet) {
        setMobileSheetSnap("collapsed");
      }
    },
    [],
  );

  const handleSelect = useCallback(
    (course: Course) => {
      focusCourseOnList(course);
    },
    [focusCourseOnList],
  );

  const handleMobileSelect = useCallback(
    (course: Course) => {
      focusCourseOnList(course, { collapseSheet: true });
    },
    [focusCourseOnList],
  );

  const handleDesktopMapSelect = useCallback(
    (course: Course) => {
      focusCourseOnList(course);
    },
    [focusCourseOnList],
  );

  const handleMobileMapSelect = useCallback(
    (course: Course) => {
      focusCourseOnList(course, { collapseSheet: true });
    },
    [focusCourseOnList],
  );

  const handleMapPopupSelect = useCallback((course: Course) => {
    setSelectedId(course.id);
  }, []);

  const handleVisibleCoursesChange = useCallback((ids: string[]) => {
    setVisibleCourseIds(ids);
  }, []);

  const handleClusterSelect = useCallback(
    ({
      clusterKey,
      courseIds,
    }: {
      clusterKey: string;
      courseIds: string[];
    }) => {
      setSelectedClusters((prev) => {
        if (prev[clusterKey]) return prev;
        return { ...prev, [clusterKey]: courseIds };
      });
      setIsShowingAllFilteredResults(false);
    },
    [],
  );

  const handleHoverCourseId = useCallback((courseId: string | null) => {
    setHoveredId(courseId);
  }, []);

  const handleHover = useCallback((course: Course | null) => {
    setHoveredId(course?.id ?? null);
  }, []);

  const handleSuggestionSelect = useCallback(
    (course: Course) => {
      setSelectedClusters({});
      updateFilters({ query: course.name });
      setSelectedId(course.id);
      if (isValidCourseCoordinates(course)) {
        const target = createMapFocusTarget(course);
        if (target) setCenter(target);
      }
      setMobileSheetSnap("half");
    },
    [updateFilters],
  );

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const searchResultsKey = useMemo(
    () => searchFiltered.map((c) => c.id).join(","),
    [searchFiltered],
  );

  useEffect(() => {
    setSelectedClusters({});
    if (!filters.query.trim()) {
      setIsShowingAllFilteredResults(false);
    }
    setSelectedId((prev) => {
      if (!prev) return null;
      return searchFiltered.some((c) => c.id === prev) ? prev : null;
    });
  }, [filtersKey, searchFiltered]);

  useEffect(() => {
    if (!isSearchActive) return;

    const results = collectionCourses ?? searchFiltered;

    if (results.length === 1) {
      const course = results[0];
      setSelectedId(course.id);
      if (isValidCourseCoordinates(course)) {
        const target = createMapFocusTarget(course);
        if (target) setCenter(target);
      }
      return;
    }

    if (results.length > 1) {
      setSearchFitSignal((n) => n + 1);
      return;
    }

    setSelectedId(null);
  }, [isSearchActive, searchQuery, searchResultsKey, searchFiltered, collectionCourses]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sheetOpen) {
        setSheetOpen(false);
        return;
      }
      if (mobileSheetSnap === "expanded") {
        setMobileSheetSnap("half");
        return;
      }
      if (mobileSheetSnap === "half") {
        setMobileSheetSnap("collapsed");
        return;
      }
      if (isClusterScopeActive) {
        clearClusterScope();
        return;
      }
      if (selectedId) {
        clearSelection();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    selectedId,
    sheetOpen,
    mobileSheetSnap,
    clearSelection,
    isClusterScopeActive,
    clearClusterScope,
  ]);

  const mapProps = {
    courses: mapCourses,
    selectedId,
    center,
    onClearSelection: clearSelection,
    onVisibleCoursesChange: handleVisibleCoursesChange,
    onClusterSelect: handleClusterSelect,
    onHoverCourseChange: handleHoverCourseId,
    hoveredCourseId: hoveredId,
    mapViewResetSignal,
    initialViewportCourses: courses,
    searchKeyword: filters.query,
    favoriteOnly,
    visitedOnly,
    clusterScopeCourseIds: selectedClusterCourseIds,
    selectedClusterKeys,
    favoriteCourseIds,
    visitedCourseIds,
    fitToCourseIds: mapFitToCourseIds,
    fitToCourseIdsSignal: mapFitToCourseIdsSignal,
  };

  const listEmptyProps = isSearchEmpty
    ? {
        emptyTitle: "검색 결과가 없습니다.",
        emptyDescription: "다른 골프장명이나 지역으로 검색해보세요.",
        onReset: resetFilters,
      }
    : isFavoritesEmpty
    ? {
        emptyTitle: "아직 즐겨찾기한 골프장이 없습니다.",
        emptyDescription:
          "카드의 하트를 눌러 자주 찾는 골프장을 저장해보세요.",
        onClearFavoriteOnly: handleClearFavoriteOnly,
      }
    : isVisitedEmpty
      ? {
          emptyTitle: "아직 가본 골프장이 없습니다.",
          emptyDescription:
            "카드의 체크 아이콘을 눌러 방문한 골프장을 기록해보세요.",
          onClearFavoriteOnly: handleClearVisitedOnly,
        }
      : isFavoritesFilterEmpty
        ? {
            emptyTitle: "현재 조건에 맞는 즐겨찾기가 없습니다.",
            emptyDescription:
              "검색·필터를 조정하거나 즐겨찾기 보기를 해제해 보세요.",
            onClearFavoriteOnly: handleClearFavoriteOnly,
            onReset: resetFilters,
          }
        : isVisitedFilterEmpty
          ? {
              emptyTitle: "현재 조건에 맞는 가본 골프장이 없습니다.",
              emptyDescription:
                "검색·필터를 조정하거나 가본 골프장 보기를 해제해 보세요.",
              onClearFavoriteOnly: handleClearVisitedOnly,
              onReset: resetFilters,
            }
          : isMapBoundsEmpty
    ? {
        emptyTitle: "현재 지도 영역에 조건에 맞는 골프장이 없습니다.",
        emptyDescription: "지도를 이동하거나 필터를 조정해보세요.",
        onFitResults: handleFitResults,
        onShowAllFiltered: handleShowAllFiltered,
      }
    : isNoFilterResults
      ? {
          emptyTitle: "검색 결과가 없습니다.",
          emptyDescription: "필터 조건을 변경하거나 초기화해 보세요.",
        }
      : undefined;

  const listProps = {
    courses: displayCourses,
    selectedId,
    hoveredId,
    onSelect: handleSelect,
    onHover: handleHover,
    onReset: resetFilters,
    ...listEmptyProps,
  };

  const showMobileViewToggle =
    !isSearchActive && listMode !== "cluster" && visibleReady;

  const headerProps = {
    mode: listMode,
    count: listHeaderCount,
    total: courses.length,
    isFiltered,
    isShowingAllFilteredResults,
    visibleReady,
    onClearCluster: clearClusterScope,
    onShowMapBased: handleShowMapBased,
    onShowAllFiltered: handleShowAllFiltered,
    onFitResults: handleFitResults,
    favoriteOnly,
    favoriteCount,
    onToggleFavoriteOnly: handleToggleFavoriteOnly,
    visitedOnly,
    visitedCount,
    onToggleVisitedOnly: handleToggleVisitedOnly,
    isSearchActive,
    selectedClusterCount: selectedClusterKeys.length,
  };

  return (
    <>
      {/* ── 데스크탑 ── */}
      <div className="hidden md:flex md:h-[calc(100vh-3.5rem)] md:flex-col md:overflow-hidden md:bg-stone-50">
        <DesktopHero
          totalCourses={courses.length}
          query={filters.query}
          onQueryChange={(query) => updateFilters({ query })}
        />

        <section className="shrink-0 border-b border-stone-200 bg-white px-6 py-3.5">
          <div className="mx-auto max-w-[1600px]">
            <QuickFindLinks variant="desktop" className="mb-3" />
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <FilterBar
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                  activeCount={activeCount}
                />
              </div>
              <div className="shrink-0 pt-1 text-right">
                <p className="text-sm font-semibold text-stone-700">
                  {listCountLabel}
                </p>
                {listMode === "visible" &&
                listHeaderCount !== courses.length &&
                !favoriteOnly &&
                !visitedOnly ? (
                  <p className="mt-0.5 text-xs text-stone-400">
                    전체 골프장 {courses.length.toLocaleString()}곳
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-5 px-6 py-4">
          <div className="flex w-[440px] shrink-0 flex-col lg:w-[460px] xl:w-[480px]">
            <ListHeader {...headerProps} onResetFilters={resetFilters} />
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <CourseList {...listProps} />
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-1.5 shadow-sm min-h-[480px]">
            <CourseMap
              {...mapProps}
              mapLayout="desktop"
              onSelect={handleDesktopMapSelect}
              onSelectPopupOnly={handleMapPopupSelect}
              maxVisibleMarkers={50}
              className="h-full !rounded-xl !border-0"
            />
          </div>
        </div>
      </div>

      {/* ── 모바일 ── */}
      <div className="mobile-app fixed inset-x-0 bottom-0 top-11 z-0 flex flex-col overflow-hidden bg-[#F3F2EA] md:hidden">
        <MobileTopBar
          query={filters.query}
          onQueryChange={(query) => updateFilters({ query })}
          onFilterOpen={() => setSheetOpen(true)}
          activeFilterCount={activeCount}
          suggestions={searchSuggestions}
          onSuggestionSelect={handleSuggestionSelect}
        />

        <div className="shrink-0 px-3 pb-2 md:hidden">
          <QuickFindLinks variant="mobile" />
        </div>

        <section
          aria-label="지도"
          className="mobile-map-area relative flex-1 overflow-hidden px-3 pb-1"
        >
          <div className="h-full overflow-hidden rounded-2xl border border-stone-200/40 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.02]">
            <CourseMap
              {...mapProps}
              mapLayout="mobile"
              onSelect={handleMobileMapSelect}
              onSelectPopupOnly={handleMapPopupSelect}
              maxVisibleMarkers={30}
              className="h-full w-full !rounded-2xl !border-0"
            />
          </div>
        </section>

        <MobileBottomSheet
          snap={mobileSheetSnap}
          onSnapChange={setMobileSheetSnap}
          title={mobileSheetTitle}
          count={listHeaderCount}
          countSublabel={listCountSublabel}
          selectedCourse={selectedCourse}
          selectedId={selectedId}
          onClearSelection={clearSelection}
          courses={displayCourses}
          onReset={resetFilters}
          onFitResults={handleFitResults}
          onShowAllFilteredEmpty={handleShowAllFiltered}
          showViewToggle={showMobileViewToggle}
          isShowingAllFilteredResults={isShowingAllFilteredResults}
          onShowMapBased={handleShowMapBased}
          onShowAllFilteredToggle={handleShowAllFiltered}
          favoriteOnly={favoriteOnly}
          visitedOnly={visitedOnly}
          favoriteCount={favoriteCount}
          visitedCount={visitedCount}
          onToggleFavoriteOnly={handleToggleFavoriteOnly}
          onToggleVisitedOnly={handleToggleVisitedOnly}
          isClusterMode={isClusterScopeActive}
          onClearCluster={clearClusterScope}
          {...listEmptyProps}
        />
      </div>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        activeCount={activeCount}
        resultCount={displayCourses.length}
        favoriteOnly={favoriteOnly}
        onToggleFavoriteOnly={handleToggleFavoriteOnly}
        visitedOnly={visitedOnly}
        onToggleVisitedOnly={handleToggleVisitedOnly}
      />
    </>
  );
}
