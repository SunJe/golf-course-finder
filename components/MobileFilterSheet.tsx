"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
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
}

export default function MobileFilterSheet({
  open,
  onClose,
  filters,
  onChange,
  onReset,
  activeCount,
  resultCount,
}: MobileFilterSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-sheet animate-slide-up">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <h2 className="text-base font-bold text-gray-900">
            필터
            {activeCount > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                {activeCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <FilterBar
            filters={filters}
            onChange={onChange}
            onReset={onReset}
            activeCount={activeCount}
            variant="sheet"
          />
        </div>

        <div className="flex gap-2 border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            결과 {resultCount}곳 보기
          </button>
        </div>
      </div>
    </div>
  );
}
