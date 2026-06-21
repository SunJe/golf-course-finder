"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Flag, Heart, Map, X } from "lucide-react";
import type { Course } from "@/types/course";
import CourseList from "@/components/CourseList";
import MobileCourseCard from "@/components/MobileCourseCard";

export type MobileSheetSnap = "collapsed" | "half" | "expanded";

const COLLAPSED_HEIGHT_PX = 80;
const HALF_VH_RATIO = 0.42;
const EXPANDED_VH_RATIO = 0.74;
const EXPANDED_MAX_PX = 580;

function getViewportHeight(): number {
  if (typeof window === "undefined") return 700;
  return window.visualViewport?.height ?? window.innerHeight;
}

export function getMobileSheetHeight(snap: MobileSheetSnap, vh = getViewportHeight()): number {
  switch (snap) {
    case "collapsed":
      return COLLAPSED_HEIGHT_PX;
    case "half":
      return Math.round(vh * HALF_VH_RATIO);
    case "expanded":
      return Math.min(Math.round(vh * EXPANDED_VH_RATIO), EXPANDED_MAX_PX);
  }
}

function nearestSnap(height: number, vh: number): MobileSheetSnap {
  const snaps: MobileSheetSnap[] = ["collapsed", "half", "expanded"];
  let best: MobileSheetSnap = "half";
  let bestDist = Infinity;
  for (const snap of snaps) {
    const dist = Math.abs(height - getMobileSheetHeight(snap, vh));
    if (dist < bestDist) {
      bestDist = dist;
      best = snap;
    }
  }
  return best;
}

interface MobileBottomSheetProps {
  snap: MobileSheetSnap;
  onSnapChange: (snap: MobileSheetSnap) => void;
  title: string;
  count: number;
  selectedCourse: Course | null;
  selectedId: string | null;
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
  favoriteOnly?: boolean;
  visitedOnly?: boolean;
  favoriteCount?: number;
  visitedCount?: number;
  onToggleFavoriteOnly?: () => void;
  onToggleVisitedOnly?: () => void;
  isClusterMode?: boolean;
  onClearCluster?: () => void;
}

export default function MobileBottomSheet({
  snap,
  onSnapChange,
  title,
  count,
  selectedCourse,
  selectedId,
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
  favoriteOnly = false,
  visitedOnly = false,
  favoriteCount = 0,
  visitedCount = 0,
  onToggleFavoriteOnly,
  onToggleVisitedOnly,
  isClusterMode = false,
  onClearCluster,
}: MobileBottomSheetProps) {
  const [viewportHeight, setViewportHeight] = useState(getViewportHeight);
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ y: number; height: number } | null>(null);

  useEffect(() => {
    const sync = () => setViewportHeight(getViewportHeight());
    sync();
    window.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);

  const snappedHeight = getMobileSheetHeight(snap, viewportHeight);
  const sheetHeight = dragHeight ?? snappedHeight;
  const expanded = snap === "expanded";
  const collapsed = snap === "collapsed";
  const minHeight = getMobileSheetHeight("collapsed", viewportHeight);
  const maxHeight = getMobileSheetHeight("expanded", viewportHeight);

  const finishDrag = useCallback(
    (height: number) => {
      dragStartRef.current = null;
      setIsDragging(false);
      setDragHeight(null);
      onSnapChange(nearestSnap(height, viewportHeight));
    },
    [onSnapChange, viewportHeight],
  );

  const handleHandlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { y: e.clientY, height: sheetHeight };
    setIsDragging(true);
  };

  const handleHandlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current || !isDragging) return;
    const delta = dragStartRef.current.y - e.clientY;
    const next = Math.min(
      maxHeight,
      Math.max(minHeight, dragStartRef.current.height + delta),
    );
    setDragHeight(next);
  };

  const handleHandlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const finalHeight = dragHeight ?? sheetHeight;
    const moved = Math.abs(finalHeight - dragStartRef.current.height);
    if (moved < 8 && snap === "collapsed") {
      dragStartRef.current = null;
      setIsDragging(false);
      setDragHeight(null);
      onSnapChange("half");
      return;
    }
    finishDrag(finalHeight);
  };

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
      <div className="flex flex-col gap-1.5">
        {courses.map((course) => (
          <MobileCourseCard
            key={course.id}
            course={course}
            selected={course.id === selectedId}
          />
        ))}
      </div>
    );

  return (
    <>
      {expanded && (
        <button
          type="button"
          aria-label="바텀시트 접기"
          className="fixed inset-x-0 top-11 bottom-0 z-40 bg-stone-900/25 md:hidden"
          onClick={() => onSnapChange("half")}
        />
      )}

      <section
        aria-label="골프장 목록"
        data-state={snap}
        className="mobile-bottom-sheet pointer-events-auto fixed bottom-0 left-0 right-0 z-50 flex flex-col overflow-hidden rounded-t-[20px] border border-stone-200/50 bg-white shadow-[0_-8px_32px_-12px_rgba(0,0,0,0.18)] md:hidden"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: sheetHeight,
          maxHeight: sheetHeight,
          transition: isDragging ? "none" : "height 280ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div
          className="sheet-handle shrink-0 touch-none select-none cursor-grab active:cursor-grabbing"
          onPointerDown={handleHandlePointerDown}
          onPointerMove={handleHandlePointerMove}
          onPointerUp={handleHandlePointerUp}
          onPointerCancel={handleHandlePointerUp}
        >
          <div className="flex items-center justify-center pt-2.5 pb-1.5">
            <div className="h-1 w-10 rounded-full bg-stone-300/90" />
          </div>
        </div>

        <div className="sheet-header shrink-0 border-b border-stone-100/80 px-4 pb-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold leading-tight text-stone-900">
                {title}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-500">
                {count.toLocaleString()}곳 · 이름순
              </p>
            </div>
            {!collapsed && (
              <div className="flex shrink-0 items-center gap-1.5">
                {isClusterMode && onClearCluster && (
                  <button
                    type="button"
                    onClick={onClearCluster}
                    className="flex min-h-[34px] shrink-0 items-center rounded-full border border-brand-200 bg-brand-50 px-2.5 text-[11px] font-semibold text-brand-800"
                  >
                    선택 해제
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSnapChange(expanded ? "half" : "collapsed")}
                  className="flex min-h-[34px] shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-stone-50 px-2.5 text-[11px] font-semibold text-stone-700"
                >
                  <Map className="h-3.5 w-3.5" />
                  {expanded ? "접기" : "지도"}
                </button>
              </div>
            )}
          </div>

          {(onToggleFavoriteOnly || onToggleVisitedOnly) && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {onToggleFavoriteOnly && (
                <button
                  type="button"
                  onClick={onToggleFavoriteOnly}
                  className={`inline-flex min-h-[28px] items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition ${
                    favoriteOnly
                      ? "bg-rose-500 text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  <Heart
                    className={`h-3 w-3 ${favoriteOnly ? "fill-white" : ""}`}
                  />
                  즐겨찾기
                  {favoriteCount > 0 && (
                    <span className="opacity-90">{favoriteCount}</span>
                  )}
                </button>
              )}
              {onToggleVisitedOnly && (
                <button
                  type="button"
                  onClick={onToggleVisitedOnly}
                  className={`inline-flex min-h-[28px] items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition ${
                    visitedOnly
                      ? "bg-green-600 text-white"
                      : "bg-stone-100 text-stone-600"
                  }`}
                >
                  <Flag
                    className={`h-3 w-3 ${visitedOnly ? "fill-white" : ""}`}
                  />
                  가본
                  {visitedCount > 0 && (
                    <span className="opacity-90">{visitedCount}</span>
                  )}
                </button>
              )}
            </div>
          )}

          {showViewToggle && onShowMapBased && onShowAllFilteredToggle && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
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

        {!collapsed && snap === "half" && selectedCourse && (
          <div className="shrink-0 border-b border-stone-100 bg-stone-50/60 px-4 py-1.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-brand-800">
                선택한 골프장
              </span>
              <button
                type="button"
                onClick={onClearSelection}
                className="rounded-full p-1 text-stone-400"
                aria-label="선택 해제"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <MobileCourseCard course={selectedCourse} selected />
          </div>
        )}

        {!collapsed && (
          <div
            className="sheet-list min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-4 [-webkit-overflow-scrolling:touch]"
            style={{ paddingBottom: "0.75rem" }}
          >
            {listContent}
          </div>
        )}
      </section>
    </>
  );
}
