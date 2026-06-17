"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Course, CourseFilters } from "@/types/course";
import { EMPTY_FILTERS } from "@/types/course";
import { filterCourses, countActiveFilters } from "@/lib/filterCourses";
import { sortCoursesByName } from "@/lib/courseListUtils";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import CourseList from "@/components/CourseList";
import CourseMap from "@/components/maps/CourseMap";
import MobileFilterSheet from "@/components/MobileFilterSheet";

type ListScope = "cluster" | "visible" | "filtered" | "all";

function ListHeader({
  scope,
  count,
  total,
  searchFilteredCount,
  isFiltered,
  clusterActive,
  onClearCluster,
  onResetFilters,
}: {
  scope: ListScope;
  count: number;
  total: number;
  searchFilteredCount: number;
  isFiltered: boolean;
  clusterActive: boolean;
  onClearCluster: () => void;
  onResetFilters?: () => void;
}) {
  let title: React.ReactNode;

  if (clusterActive) {
    title = (
      <>
        선택한 묶음의 골프장{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (scope === "visible") {
    title = (
      <>
        현재 지도에 보이는 골프장{" "}
        <span className="text-brand-600">{count}</span>곳
      </>
    );
  } else if (isFiltered) {
    title = (
      <>
        검색 결과 <span className="text-brand-600">{searchFilteredCount}</span>
        곳
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

  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="min-w-0 text-sm font-bold text-gray-800">{title}</h2>
      <div className="flex flex-shrink-0 items-center gap-2">
        {clusterActive && (
          <button
            type="button"
            onClick={onClearCluster}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            전체 지도 결과 보기
          </button>
        )}
        {isFiltered && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}

export default function HomeClient({ courses }: { courses: Course[] }) {
  const [filters, setFilters] = useState<CourseFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [visibleCourseIds, setVisibleCourseIds] = useState<string[] | null>(
    null,
  );
  const [selectedClusterCourseIds, setSelectedClusterCourseIds] = useState<
    string[] | null
  >(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const searchFiltered = useMemo(
    () => filterCourses(courses, filters),
    [courses, filters],
  );
  const activeCount = countActiveFilters(filters);
  const isFiltered = activeCount > 0 || filters.query.trim().length > 0;
  const isClusterScopeActive = Boolean(
    selectedClusterCourseIds && selectedClusterCourseIds.length > 0,
  );

  const listScope: ListScope = isClusterScopeActive
    ? "cluster"
    : visibleCourseIds !== null
      ? "visible"
      : isFiltered
        ? "filtered"
        : "all";

  const displayCourses = useMemo(() => {
    let source: Course[];

    if (isClusterScopeActive && selectedClusterCourseIds) {
      const idSet = new Set(selectedClusterCourseIds);
      source = searchFiltered.filter((c) => idSet.has(c.id));
    } else if (visibleCourseIds !== null) {
      const idSet = new Set(visibleCourseIds);
      source = searchFiltered.filter((c) => idSet.has(c.id));
    } else {
      source = searchFiltered;
    }

    return sortCoursesByName(source);
  }, [
    searchFiltered,
    visibleCourseIds,
    selectedClusterCourseIds,
    isClusterScopeActive,
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

  const handleSelect = useCallback((course: Course) => {
    setSelectedId((prev) => (prev === course.id ? null : course.id));
    setCenter({ lat: course.latitude, lng: course.longitude });
  }, []);

  const handleMapSelect = useCallback((course: Course) => {
    setSelectedId(course.id);
    setCenter({ lat: course.latitude, lng: course.longitude });
  }, []);

  const handleVisibleCoursesChange = useCallback((ids: string[]) => {
    setVisibleCourseIds(ids);
  }, []);

  const handleClusterSelect = useCallback((ids: string[]) => {
    setSelectedClusterCourseIds(ids);
  }, []);

  const handleHover = useCallback((course: Course | null) => {
    setHoveredId(course?.id ?? null);
  }, []);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  useEffect(() => {
    setSelectedClusterCourseIds(null);
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
    clearSelection,
    isClusterScopeActive,
    clearClusterScope,
  ]);

  const mapProps = {
    courses: searchFiltered,
    selectedId,
    onSelect: handleMapSelect,
    center,
    onClearSelection: clearSelection,
    onVisibleCoursesChange: handleVisibleCoursesChange,
    onClusterSelect: handleClusterSelect,
    hoveredCourseId: hoveredId,
  };

  const listProps = {
    courses: displayCourses,
    selectedId,
    hoveredId,
    onSelect: handleSelect,
    onHover: handleHover,
    onReset: resetFilters,
  };

  return (
    <>
      <section className="border-b border-gray-200 bg-gradient-to-b from-brand-50/60 to-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900 sm:text-xl">
              전국 골프장을 한눈에 찾아보세요
            </h1>
            <p className="text-xs text-gray-500 sm:text-sm">
              지역·가격·홀수·노캐디·야간 라운드까지 쉽게 비교하세요
            </p>
          </div>
          <div className="hidden w-full max-w-md md:block">
            <SearchBar
              value={filters.query}
              onChange={(query) => updateFilters({ query })}
              placeholder="골프장명, 지역, 주소로 검색"
            />
          </div>
        </div>
      </section>

      <section className="hidden border-b border-gray-200 bg-white md:block">
        <div className="mx-auto max-w-[1600px] px-6 py-2.5">
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
            activeCount={activeCount}
          />
        </div>
      </section>

      <section className="sticky top-16 z-20 border-b border-gray-200 bg-white/95 px-4 py-2.5 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <SearchBar
              value={filters.query}
              onChange={(query) => updateFilters({ query })}
            />
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="relative flex h-11 min-w-[44px] items-center justify-center rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="ml-1">필터</span>
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
        <div className="mt-2">
          <ListHeader
            scope={listScope}
            count={displayCourses.length}
            total={courses.length}
            searchFilteredCount={searchFiltered.length}
            isFiltered={isFiltered}
            clusterActive={isClusterScopeActive}
            onClearCluster={clearClusterScope}
          />
        </div>
      </section>

      <div className="mx-auto hidden h-[calc(100vh-9.5rem)] max-w-[1600px] gap-4 px-6 py-3 md:flex">
        <div className="flex w-[460px] flex-shrink-0 flex-col lg:w-[500px] xl:w-[520px]">
          <ListHeader
            scope={listScope}
            count={displayCourses.length}
            total={courses.length}
            searchFilteredCount={searchFiltered.length}
            isFiltered={isFiltered}
            clusterActive={isClusterScopeActive}
            onClearCluster={clearClusterScope}
            onResetFilters={resetFilters}
          />
          <div className="min-h-0 flex-1 overflow-y-auto pr-1.5">
            <CourseList {...listProps} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <CourseMap {...mapProps} maxVisibleMarkers={50} className="h-full" />
        </div>
      </div>

      <div className="md:hidden">
        <div className="h-[38vh] w-full px-4 pt-3">
          <CourseMap
            {...mapProps}
            maxVisibleMarkers={20}
            className="h-full"
          />
        </div>
        <div className="px-4 py-3">
          <CourseList {...listProps} />
        </div>
      </div>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        activeCount={activeCount}
        resultCount={displayCourses.length}
      />
    </>
  );
}
