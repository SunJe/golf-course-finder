"use client";

import { useMemo, useState, useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Course, CourseFilters } from "@/types/course";
import { EMPTY_FILTERS } from "@/types/course";
import { filterCourses, countActiveFilters } from "@/lib/filterCourses";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import CourseList from "@/components/CourseList";
import CourseMap from "@/components/maps/CourseMap";
import MobileFilterSheet from "@/components/MobileFilterSheet";

function ResultCount({
  total,
  filtered,
  isFiltered,
}: {
  total: number;
  filtered: number;
  isFiltered: boolean;
}) {
  return (
    <h2 className="text-sm font-bold text-gray-800">
      {isFiltered ? (
        <>
          검색 결과{" "}
          <span className="text-brand-600">{filtered}</span>곳
          <span className="ml-1 text-xs font-normal text-gray-400">
            (전체 {total}곳)
          </span>
        </>
      ) : (
        <>
          전국 골프장 <span className="text-brand-600">{total}</span>곳
        </>
      )}
    </h2>
  );
}

export default function HomeClient({ courses }: { courses: Course[] }) {
  const [filters, setFilters] = useState<CourseFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCourses(courses, filters),
    [courses, filters],
  );
  const activeCount = countActiveFilters(filters);
  const isFiltered = activeCount > 0 || filters.query.trim().length > 0;

  const updateFilters = useCallback((patch: Partial<CourseFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const handleSelect = useCallback((course: Course) => {
    setSelectedId((prev) => (prev === course.id ? null : course.id));
    setCenter({ lat: course.latitude, lng: course.longitude });
  }, []);

  return (
    <>
      {/* 컴팩트 Hero + 데스크탑 검색 */}
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

      {/* 데스크탑 필터 */}
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

      {/* 모바일 검색 + 필터 */}
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
          <ResultCount
            total={courses.length}
            filtered={filtered.length}
            isFiltered={isFiltered}
          />
        </div>
      </section>

      {/* 데스크탑: 리스트 + 지도 */}
      <div className="mx-auto hidden h-[calc(100vh-9.5rem)] max-w-[1600px] gap-4 px-6 py-3 md:flex">
        <div className="flex w-[400px] flex-shrink-0 flex-col lg:w-[420px]">
          <div className="mb-2 flex items-center justify-between">
            <ResultCount
              total={courses.length}
              filtered={filtered.length}
              isFiltered={isFiltered}
            />
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                필터 초기화
              </button>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1.5">
            <CourseList
              courses={filtered}
              selectedId={selectedId}
              onSelect={handleSelect}
              onReset={resetFilters}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <CourseMap
            courses={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
            center={center}
            className="h-full"
          />
        </div>
      </div>

      {/* 모바일: 지도 → 리스트 */}
      <div className="md:hidden">
        <div className="h-[38vh] w-full px-4 pt-3">
          <CourseMap
            courses={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
            center={center}
            className="h-full"
          />
        </div>
        <div className="px-4 py-3">
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="mb-2 text-xs font-medium text-brand-600"
            >
              필터 초기화
            </button>
          )}
          <CourseList
            courses={filtered}
            selectedId={selectedId}
            onSelect={handleSelect}
            onReset={resetFilters}
          />
        </div>
      </div>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        activeCount={activeCount}
        resultCount={filtered.length}
      />
    </>
  );
}
