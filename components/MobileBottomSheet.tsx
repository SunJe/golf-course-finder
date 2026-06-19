"use client";

import type { TouchEvent, WheelEvent } from "react";
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
  onClearFavoriteOnly?: () => void;
  showViewToggle?: boolean;
  isShowingAllFilteredResults?: boolean;
  onShowMapBased?: () => void;
  onShowAllFilteredToggle?: () => void;
}

function stopSheetListBubble(e: TouchEvent | WheelEvent) {
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
  onClearFavoriteOnly,
  showViewToggle,
  isShowingAllFilteredResults,
  onShowMapBased,
  onShowAllFilteredToggle,
}: MobileBottomSheetProps) {
  const expanded = state === "expanded";
  const sheetHeight = expanded
    ? "h-[min(70dvh,560px)] max-h-[min(70dvh,560px)]"
    : "h-[45dvh] max-h-[45dvh]";

  const listContent =
    courses.length === 0 ? (
      <CourseList
        courses={[]}
        onReset={onReset}
        onFitResults={onFitResults}
        onShowAllFiltered={onShowAllFilteredEmpty}
        onClearFavoriteOnly={onClearFavoriteOnly}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    ) : (
      <div className="flex flex-col gap-2 pb-1">
        {courses.map((course) => (
          <MobileCourseCard
            key={course.id}
            course={course}
            selected={course.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    );

  return (
    <>
      {expanded && (
        <button
          type="button"
          aria-label="바텀시트 닫기"
          className="fixed inset-x-0 top-11 bottom-14 z-40 bg-stone-900/20 md:hidden"
          onClick={onCollapse}
        />
      )}

      <section
        aria-label="골프장 목록"
        data-state={state}
        className={`mobile-bottom-sheet pointer-events-auto fixed bottom-14 left-0 right-0 z-50 flex flex-col overflow-hidden rounded-t-[24px] border border-stone-200/60 bg-white shadow-sheet md:hidden ${sheetHeight}`}
      >
        <div className="sheet-handle flex shrink-0 items-center justify-center pt-2 pb-1">
          <div className="h-1 w-9 rounded-full bg-stone-300/90" />
        </div>

        <div className="sheet-header shrink-0 border-b border-stone-100/80 px-4 pb-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-stone-900">
                {title}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-500">
                {count.toLocaleString()}곳 · 이름순
              </p>
            </div>
            {expanded ? (
              <button
                type="button"
                onClick={onCollapse}
                className="flex min-h-[36px] shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-3 text-[11px] font-semibold text-stone-700"
              >
                <Map className="h-3.5 w-3.5" />
                지도 크게
              </button>
            ) : (
              <button
                type="button"
                onClick={onExpand}
                className="flex min-h-[36px] shrink-0 items-center gap-1 rounded-full bg-brand-800 px-3 text-[11px] font-bold text-white shadow-sm"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                목록 보기
              </button>
            )}
          </div>

          {showViewToggle && onShowMapBased && onShowAllFilteredToggle && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onShowMapBased}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  !isShowingAllFilteredResults
                    ? "bg-brand-800 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                지도 기준
              </button>
              <button
                type="button"
                onClick={onShowAllFilteredToggle}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  isShowingAllFilteredResults
                    ? "bg-brand-800 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                전체 결과
              </button>
            </div>
          )}
        </div>

        {!expanded && selectedCourse && (
          <div className="shrink-0 border-b border-stone-100 bg-stone-50/50 px-4 py-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-brand-800">
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
            <MobileCourseCard
              course={selectedCourse}
              selected
              onSelect={onSelect}
              compact
              showDetailLink
            />
          </div>
        )}

        <div
          className="sheet-list min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 [-webkit-overflow-scrolling:touch]"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
          }}
          onTouchStart={stopSheetListBubble}
          onTouchMove={stopSheetListBubble}
          onWheel={stopSheetListBubble}
        >
          {listContent}
        </div>
      </section>
    </>
  );
}
