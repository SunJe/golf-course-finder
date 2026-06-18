"use client";

import { ChevronUp, Map, X } from "lucide-react";
import type { Course } from "@/types/course";
import CourseList from "@/components/CourseList";
import MobileCourseCard from "@/components/MobileCourseCard";

type SheetState = "collapsed" | "expanded";

interface MobileBottomSheetProps {
  state: SheetState;
  onExpand: () => void;
  onCollapse: () => void;
  title: string;
  selectedCourse: Course | null;
  selectedId: string | null;
  onSelect: (course: Course) => void;
  onClearSelection: () => void;
  courses: Course[];
  onReset?: () => void;
  onFitResults?: () => void;
  onShowAllFilteredEmpty?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  showViewToggle?: boolean;
  isShowingAllFilteredResults?: boolean;
  onShowMapBased?: () => void;
  onShowAllFilteredToggle?: () => void;
}

export default function MobileBottomSheet({
  state,
  onExpand,
  onCollapse,
  title,
  selectedCourse,
  selectedId,
  onSelect,
  onClearSelection,
  courses,
  onReset,
  onFitResults,
  onShowAllFilteredEmpty,
  emptyTitle,
  emptyDescription,
  showViewToggle,
  isShowingAllFilteredResults,
  onShowMapBased,
  onShowAllFilteredToggle,
}: MobileBottomSheetProps) {
  const expanded = state === "expanded";

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col ${
        expanded ? "top-[30vh]" : "top-auto"
      }`}
    >
      {expanded && (
        <button
          type="button"
          aria-label="바텀시트 닫기"
          className="pointer-events-auto absolute inset-0 -top-[30vh] bg-black/20"
          onClick={onCollapse}
        />
      )}

      <div
        className={`pointer-events-auto flex flex-col rounded-t-2xl border border-gray-200 bg-white shadow-sheet ${
          expanded ? "h-full" : ""
        }`}
      >
        <div className="flex items-center justify-center pt-2">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-2">
          <p className="min-w-0 flex-1 text-sm font-bold text-gray-800">
            {title}
          </p>
          {expanded ? (
            <button
              type="button"
              onClick={onCollapse}
              className="flex min-h-[44px] items-center gap-1 rounded-full border border-gray-200 px-3 text-xs font-semibold text-gray-600"
            >
              <Map className="h-3.5 w-3.5" />
              지도 크게
            </button>
          ) : (
            <button
              type="button"
              onClick={onExpand}
              className="flex min-h-[44px] items-center gap-1 rounded-full bg-brand-600 px-3 text-xs font-bold text-white"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              목록 보기
            </button>
          )}
        </div>

        {showViewToggle && expanded && onShowMapBased && onShowAllFilteredToggle && (
          <div className="flex items-center gap-1.5 px-4 pb-2">
            <button
              type="button"
              onClick={onShowMapBased}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                !isShowingAllFilteredResults
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              지도 기준
            </button>
            <button
              type="button"
              onClick={onShowAllFilteredToggle}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isShowingAllFilteredResults
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              전체 결과
            </button>
          </div>
        )}

        {!expanded && selectedCourse && (
          <div className="border-t border-gray-100 px-3 pb-3 pt-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-brand-700">
                선택한 골프장
              </span>
              <button
                type="button"
                onClick={onClearSelection}
                className="rounded-full p-1 text-gray-400"
                aria-label="선택 해제"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <MobileCourseCard
              course={selectedCourse}
              selected
              onSelect={onSelect}
              compact
              showDetailLink
            />
          </div>
        )}

        {expanded && (
          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-1">
            {courses.length === 0 ? (
              <CourseList
                courses={[]}
                onReset={onReset}
                onFitResults={onFitResults}
                onShowAllFiltered={onShowAllFilteredEmpty}
                emptyTitle={emptyTitle}
                emptyDescription={emptyDescription}
              />
            ) : (
              <div className="flex flex-col gap-2.5">
                {courses.map((course) => (
                  <MobileCourseCard
                    key={course.id}
                    course={course}
                    selected={course.id === selectedId}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
