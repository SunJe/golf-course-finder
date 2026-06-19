"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { Course, CourseFilters } from "@/types/course";
import type { MapFocusTarget } from "@/types/map";
import { EMPTY_FILTERS } from "@/types/course";
import { filterCourses, countActiveFilters } from "@/lib/filterCourses";
import { MOBILE_SELECTED_MAP_LEVEL } from "@/lib/constants";
import {
  createMapFocusTarget,
  debugFocusCourse,
  isValidCourseCoordinates,
} from "@/lib/focusCourse";
import { sortCoursesByName } from "@/lib/courseListUtils";
import DesktopHero from "@/components/DesktopHero";
import FilterBar from "@/components/FilterBar";
import CourseList from "@/components/CourseList";
import CourseMap from "@/components/maps/CourseMap";
import MobileFilterSheet from "@/components/MobileFilterSheet";
import MobileTopBar from "@/components/MobileTopBar";
import MobileTabBar from "@/components/MobileTabBar";
import MobileBottomSheet from "@/components/MobileBottomSheet";
import {
  CourseCollectionsProvider,
  useFavorites,
  useVisited,
} from "@/contexts/CourseCollectionsContext";

type ListMode = "cluster" | "allFiltered" | "visible" | "fallback";

function getMobileSheetTitle(
  mode: ListMode,
  count: number,
  total: number,
  isFiltered: boolean,
): string {
  if (mode === "cluster") return `선택한 묶음의 골프장 ${count}곳`;
  if (mode === "allFiltered") {
    return isFiltered ? `필터 결과 전체 ${count}곳` : `전체 결과 ${count}곳`;
  }
  if (mode === "visible") {
    return isFiltered
      ? `이 지역 검색 결과 ${count}곳`
      : `이 지역 골프장 ${count}곳`;
  }
  if (isFiltered) return `검색 결과 ${count}곳`;
  return `전국 골프장 ${total}곳`;
}

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
}) {
  let title: React.ReactNode;

  if (favoriteOnly) {
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
        선택한 묶음의 골프장{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (mode === "allFiltered") {
    title = (
      <>
        {isFiltered ? "필터 결과 전체" : "전체 결과"}{" "}
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
        전국 골프장 <span className="text-brand-600">{total}</span>곳
      </>
    );
  }

  const showViewToggle = mode !== "cluster" && visibleReady;

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
            지도 기준 보기
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

export default function HomeClient({ courses }: { courses: Course[] }) {
  return (
    <CourseCollectionsProvider>
      <HomeClientInner courses={courses} />
    </CourseCollectionsProvider>
  );
}

function HomeClientInner({ courses }: { courses: Course[] }) {
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
  const [selectedClusterCourseIds, setSelectedClusterCourseIds] = useState<
    string[] | null
  >(null);
  const [isShowingAllFilteredResults, setIsShowingAllFilteredResults] =
    useState(false);
  const [center, setCenter] = useState<MapFocusTarget | null>(null);
  const [mapViewResetSignal, setMapViewResetSignal] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);

  const searchFiltered = useMemo(
    () => filterCourses(courses, filters),
    [courses, filters],
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
      return sortCoursesByName(courses.filter((c) => idSet.has(c.id)));
    }
    if (visitedOnly) {
      const idSet = new Set(visitedCourseIds);
      return sortCoursesByName(courses.filter((c) => idSet.has(c.id)));
    }
    return null;
  }, [favoriteOnly, visitedOnly, favoriteCourseIds, visitedCourseIds, courses]);

  const baseDisplayCourses = useMemo(() => {
    if (collectionCourses) return collectionCourses;

    if (isClusterScopeActive && selectedClusterCourseIds) {
      const idSet = new Set(selectedClusterCourseIds);
      return sortCoursesByName(
        searchFiltered.filter((c) => idSet.has(c.id)),
      );
    }

    if (isShowingAllFilteredResults) {
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
  ]);

  const displayCourses = baseDisplayCourses;

  const mapCourses = useMemo(() => {
    if (collectionCourses) return collectionCourses;
    return searchFiltered;
  }, [collectionCourses, searchFiltered]);

  const isMapBoundsEmpty =
    visibleReady &&
    !isClusterScopeActive &&
    !isShowingAllFilteredResults &&
    (visibleCourseIds?.length ?? 0) === 0 &&
    searchFiltered.length > 0;

  const isNoFilterResults = searchFiltered.length === 0;

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

  const mobileSheetTitle = useMemo(() => {
    if (favoriteOnly) return `즐겨찾기한 골프장 ${listHeaderCount}곳`;
    if (visitedOnly) return `가본 골프장 ${listHeaderCount}곳`;
    return getMobileSheetTitle(
      listMode,
      listHeaderCount,
      courses.length,
      isFiltered,
    );
  }, [
    favoriteOnly,
    visitedOnly,
    listMode,
    listHeaderCount,
    courses.length,
    isFiltered,
  ]);

  const updateFilters = useCallback((patch: Partial<CourseFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);

  const clearClusterScope = useCallback(() => {
    setSelectedClusterCourseIds(null);
  }, []);

  const handleShowMapBased = useCallback(() => {
    setIsShowingAllFilteredResults(false);
  }, []);

  const handleShowAllFiltered = useCallback(() => {
    setIsShowingAllFilteredResults(true);
    setSelectedClusterCourseIds(null);
  }, []);

  const handleFitResults = useCallback(() => {
    setSelectedClusterCourseIds(null);
    setIsShowingAllFilteredResults(false);
    setMapViewResetSignal((n) => n + 1);
  }, []);

  const focusCourseOnList = useCallback(
    (
      course: Course,
      options?: { collapseSheet?: boolean; clearCluster?: boolean },
    ) => {
      if (!isValidCourseCoordinates(course)) {
        debugFocusCourse(course, null);
        return;
      }

      if (options?.clearCluster !== false) {
        setSelectedClusterCourseIds(null);
      }

      setSelectedId(course.id);

      const target = createMapFocusTarget(course, MOBILE_SELECTED_MAP_LEVEL);
      debugFocusCourse(course, target);
      if (target) {
        setCenter(target);
      }

      if (options?.collapseSheet) {
        setMobileSheetExpanded(false);
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
    setSelectedClusterCourseIds(null);
    setSelectedId(course.id);
  }, []);

  const handleVisibleCoursesChange = useCallback((ids: string[]) => {
    setVisibleCourseIds(ids);
  }, []);

  const handleClusterSelect = useCallback((ids: string[]) => {
    setSelectedClusterCourseIds(ids);
    setIsShowingAllFilteredResults(false);
  }, []);

  const handleHoverCourseId = useCallback((courseId: string | null) => {
    setHoveredId(courseId);
  }, []);

  const handleHover = useCallback((course: Course | null) => {
    setHoveredId(course?.id ?? null);
  }, []);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    setSelectedClusterCourseIds(null);
    setIsShowingAllFilteredResults(false);
    setSelectedId((prev) => {
      if (!prev) return null;
      return searchFiltered.some((c) => c.id === prev) ? prev : null;
    });
  }, [filtersKey, searchFiltered]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sheetOpen) {
        setSheetOpen(false);
        return;
      }
      if (mobileSheetExpanded) {
        setMobileSheetExpanded(false);
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
    mobileSheetExpanded,
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
    clusterScopeCourseIds: selectedClusterCourseIds,
    favoriteCourseIds,
    visitedCourseIds,
    fitToCourseIds: collectionFitIds,
    fitToCourseIdsSignal: collectionFitSignal,
  };

  const listEmptyProps = isFavoritesEmpty
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
          <div className="mx-auto flex max-w-[1600px] items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <FilterBar
                filters={filters}
                onChange={updateFilters}
                onReset={resetFilters}
                activeCount={activeCount}
              />
            </div>
            <p className="shrink-0 pt-1 text-sm font-semibold text-stone-500">
              {listHeaderCount.toLocaleString()}개 골프장
            </p>
          </div>
        </section>

        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 gap-5 px-6 py-4">
          <div className="flex w-[440px] shrink-0 flex-col lg:w-[460px] xl:w-[480px]">
            <ListHeader {...headerProps} onResetFilters={resetFilters} />
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <CourseList {...listProps} />
            </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-1.5 shadow-sm">
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
      <div className="mobile-app fixed inset-x-0 bottom-0 top-11 z-0 flex flex-col overflow-hidden bg-app-warm md:hidden">
        <MobileTopBar
          query={filters.query}
          onQueryChange={(query) => updateFilters({ query })}
          onFilterOpen={() => setSheetOpen(true)}
          activeFilterCount={activeCount}
        />

        <section
          aria-label="지도"
          className="mobile-map-area relative min-h-0 flex-1 overflow-hidden px-3"
        >
          <div className="h-full overflow-hidden rounded-2xl border border-stone-200/50 shadow-card ring-1 ring-black/[0.03]">
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
          state={mobileSheetExpanded ? "expanded" : "collapsed"}
          onExpand={() => setMobileSheetExpanded(true)}
          onCollapse={() => setMobileSheetExpanded(false)}
          title={mobileSheetTitle}
          count={listHeaderCount}
          selectedCourse={selectedCourse}
          selectedId={selectedId}
          onSelect={handleMobileSelect}
          onClearSelection={clearSelection}
          courses={displayCourses}
          onReset={resetFilters}
          onFitResults={handleFitResults}
          onShowAllFilteredEmpty={handleShowAllFiltered}
          showViewToggle={listMode !== "cluster" && visibleReady}
          isShowingAllFilteredResults={isShowingAllFilteredResults}
          onShowMapBased={handleShowMapBased}
          onShowAllFilteredToggle={handleShowAllFiltered}
          {...listEmptyProps}
        />

        <MobileTabBar
          favoriteOnly={favoriteOnly}
          visitedOnly={visitedOnly}
          onToggleFavoriteOnly={handleToggleFavoriteOnly}
          onToggleVisitedOnly={handleToggleVisitedOnly}
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
