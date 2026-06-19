"use client";

import { useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Course } from "@/types/course";
import SearchBar from "@/components/SearchBar";
import SearchSuggestions from "@/components/SearchSuggestions";

interface MobileTopBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFilterOpen: () => void;
  activeFilterCount: number;
  suggestions: Course[];
  onSuggestionSelect: (course: Course) => void;
}

export default function MobileTopBar({
  query,
  onQueryChange,
  onFilterOpen,
  activeFilterCount,
  suggestions,
  onSuggestionSelect,
}: MobileTopBarProps) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSuggestions =
    suggestionsOpen && query.trim().length > 0 && suggestions.length > 0;

  const handleSuggestionPick = (course: Course) => {
    if (blurTimerRef.current) {
      clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
    onSuggestionSelect(course);
    setSuggestionsOpen(false);
  };

  return (
    <div className="mobile-header relative z-[60] shrink-0 bg-[#F3F2EA] px-3 pb-2 pt-1.5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchBar
            value={query}
            onChange={(value) => {
              onQueryChange(value);
              setSuggestionsOpen(true);
            }}
            placeholder="골프장명, 지역, 주소로 검색"
            variant="mobile"
            onFocus={() => {
              if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
              }
              setSuggestionsOpen(true);
            }}
            onBlur={() => {
              blurTimerRef.current = setTimeout(() => {
                setSuggestionsOpen(false);
              }, 180);
            }}
            onClear={() => setSuggestionsOpen(false)}
          />
          {showSuggestions && (
            <SearchSuggestions
              courses={suggestions}
              onSelect={handleSuggestionPick}
              onMouseDown={handleSuggestionPick}
            />
          )}
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
