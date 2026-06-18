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
  count: number;
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
  count,
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

  const listHeader = (
    <div className="flex shrink-0 items-center justify-between gap-2 px-1 pb-2 pt-1">
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">골프장 {count}곳</p>
        <p className="truncate text-[11px] text-stone-500">{title}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-xs text-stone-400">이름순</span>
        {expanded ? (
          <button
            type="button"
            onClick={onCollapse}
            className="flex min-h-[36px] items-center gap-1 rounded-full border border-stone-200 bg-white px-2.5 text-[11px] font-semibold text-stone-600"
          >
            <Map className="h-3.5 w-3.5" />
            지도 크게
          </button>
        ) : (
          <button
            type="button"
            onClick={onExpand}
            className="flex min-h-[36px] items-center gap-1 rounded-full bg-brand-700 px-2.5 text-[11px] font-bold text-white"
          >
            <ChevronUp className="h-3.5 w-3.5" />
            목록 보기
          </button>
        )}
      </div>
    </div>
  );

  const listBody = (
    <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-1 pb-2 [-webkit-overflow-scrolling:touch]">
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
  );

  if (expanded) {
    return (
      <>
        <button
          type="button"
          aria-label="바텀시트 닫기"
          className="fixed inset-0 z-20 bg-black/25 md:hidden"
          onClick={onCollapse}
        />
        <div
          className="fixed bottom-14 left-0 right-0 z-30 flex h-[min(72dvh,560px)] max-h-[75dvh] flex-col overflow-hidden rounded-t-3xl border border-stone-200/80 bg-white shadow-sheet md:hidden"
          onTouchStart={stopTouchPropagation}
          onTouchMove={stopTouchPropagation}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="flex shrink-0 items-center justify-center pt-2.5">
            <div className="h-1 w-10 rounded-full bg-stone-300" />
          </div>
          <div className="shrink-0 px-3">{listHeader}</div>
          {showViewToggle && onShowMapBased && onShowAllFilteredToggle && (
            <div className="flex shrink-0 items-center gap-1.5 px-4 pb-2">
              <button
                type="button"
                onClick={onShowMapBased}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  !isShowingAllFilteredResults
                    ? "bg-brand-700 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                지도 기준
              </button>
              <button
                type="button"
                onClick={onShowAllFilteredToggle}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isShowingAllFilteredResults
                    ? "bg-brand-700 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                전체 결과
              </button>
            </div>
          )}
          <div className="flex min-h-0 flex-1 flex-col px-3">{listBody}</div>
        </div>
      </>
    );
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-3xl border border-stone-200/60 bg-white shadow-sheet"
      onTouchStart={stopTouchPropagation}
      onTouchMove={stopTouchPropagation}
    >
      <div className="flex shrink-0 items-center justify-center pt-2">
        <div className="h-1 w-8 rounded-full bg-stone-200" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3">
        {listHeader}

        {!selectedCourse && listBody}

        {selectedCourse && (
          <>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[11px] font-semibold text-brand-700">
                선택한 골프장
              </span>
              <button
                type="button"
                onClick={onClearSelection}
                className="rounded-full p-1 text-stone-400"
                aria-label="선택 해제"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="shrink-0 px-1 pb-2">
              <MobileCourseCard
                course={selectedCourse}
                selected
                onSelect={onSelect}
                compact
                showDetailLink
              />
            </div>
            <div className="min-h-0 flex-1 border-t border-stone-100 pt-2">
              {listBody}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
