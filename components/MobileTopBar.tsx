"use client";

import { SlidersHorizontal } from "lucide-react";
import SearchBar from "@/components/SearchBar";

interface MobileTopBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFilterOpen: () => void;
  activeFilterCount: number;
}

export default function MobileTopBar({
  query,
  onQueryChange,
  onFilterOpen,
  activeFilterCount,
}: MobileTopBarProps) {
  return (
    <div className="shrink-0 px-3 pb-2 pt-2">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={query}
            onChange={onQueryChange}
            placeholder="골프장, 지역 검색"
          />
        </div>
        <button
          type="button"
          onClick={onFilterOpen}
          aria-label="필터 열기"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-200/80 bg-white text-stone-600 shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[9px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
