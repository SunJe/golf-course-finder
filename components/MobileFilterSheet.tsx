"use client";

import { useEffect } from "react";
import { Heart, Flag, X } from "lucide-react";
import type { CourseFilters } from "@/types/course";
import FilterBar from "@/components/FilterBar";

interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: CourseFilters;
  onChange: (patch: Partial<CourseFilters>) => void;
  onReset: () => void;
  activeCount: number;
  resultCount: number;
  favoriteOnly?: boolean;
  onToggleFavoriteOnly?: () => void;
  visitedOnly?: boolean;
  onToggleVisitedOnly?: () => void;
}

export default function MobileFilterSheet({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  activeCount,
  resultCount,
  favoriteOnly = false,
  onToggleFavoriteOnly,
  visitedOnly = false,
  onToggleVisitedOnly,
}: MobileFilterSheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="필터">
      <div
        className="absolute inset-0 bg-stone-900/30 animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-[24px] bg-white shadow-sheet animate-slide-up">
        <div className="flex shrink-0 items-center justify-center pt-2.5">
          <div className="h-1 w-9 rounded-full bg-stone-300/90" />
        </div>

        <div className="flex shrink-0 items-center justify-between border-b border-stone-100 px-4 py-3">
          <h2 className="text-base font-bold text-stone-900">
            필터
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-800">
                {activeCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {onToggleFavoriteOnly && (
            <div className="mb-4 rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    즐겨찾기만 보기
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    하트를 누른 골프장만 표시합니다
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={favoriteOnly}
                  onClick={onToggleFavoriteOnly}
                  className={`flex h-10 min-w-[44px] items-center justify-center rounded-full px-3 text-xs font-bold transition ${
                    favoriteOnly
                      ? "bg-brand-800 text-white"
                      : "border border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  <Heart
                    className={`mr-1 h-3.5 w-3.5 ${favoriteOnly ? "fill-white" : ""}`}
                  />
                  {favoriteOnly ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          )}

          {onToggleVisitedOnly && (
            <div className="mb-5 rounded-2xl border border-stone-200/80 bg-stone-50/60 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    가본 골프장만 보기
                  </p>
                  <p className="mt-0.5 text-xs text-stone-500">
                    방문한 골프장만 표시합니다
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={visitedOnly}
                  onClick={onToggleVisitedOnly}
                  className={`flex h-10 min-w-[44px] items-center justify-center rounded-full px-3 text-xs font-bold transition ${
                    visitedOnly
                      ? "bg-brand-800 text-white"
                      : "border border-stone-200 bg-white text-stone-600"
                  }`}
                >
                  <Flag
                    className={`mr-1 h-3.5 w-3.5 ${visitedOnly ? "fill-white" : ""}`}
                  />
                  {visitedOnly ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          )}

          <FilterBar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            activeCount={activeCount}
            variant="sheet"
          />
        </div>

        <div
          className="flex shrink-0 gap-2 border-t border-stone-100 p-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
        >
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-50"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-brand-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-900"
          >
            {resultCount.toLocaleString()}곳 보기
          </button>
        </div>
      </div>
    </div>
  );
}
