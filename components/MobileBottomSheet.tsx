"use client";

import type { TouchEvent } from "react";
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

function stopTouchPropagation(e: TouchEvent) {
  e.stopPropagation();
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
    <>
      {expanded && (
        <button
          type="button"
          aria-label="바텀시트 닫기"
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={onCollapse}
        />
      )}

      <div
        className={`fixed bottom-0 left-0 right-0 z-30 flex flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-white shadow-sheet md:hidden ${
          expanded ? "h-[70vh] max-h-[75vh]" : ""
        }`}
        onTouchStart={stopTouchPropagation}
        onTouchMove={stopTouchPropagation}
      >
        <div className="shrink-0">
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
        </div>

        {showViewToggle && expanded && onShowMapBased && onShowAllFilteredToggle && (
          <div className="flex shrink-0 items-center gap-1.5 px-4 pb-2">
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
          <div className="shrink-0 border-t border-gray-100 px-3 pb-3 pt-2">
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
          <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-3 pb-6 pt-1 [-webkit-overflow-scrolling:touch]">
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
    </>
  );
}
