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
    <div className="mobile-header shrink-0 bg-[#F3F2EA] px-3 pb-2 pt-1.5">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={query}
            onChange={onQueryChange}
            placeholder="골프장명, 지역, 주소로 검색"
            variant="mobile"
          />
        </div>
        <button
          type="button"
          onClick={onFilterOpen}
          aria-label="필터 열기"
          className="relative flex h-12 shrink-0 items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-3.5 text-xs font-semibold text-stone-700 shadow-card"
        >
          <SlidersHorizontal className="h-4 w-4 text-stone-500" />
          필터
          {activeFilterCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
