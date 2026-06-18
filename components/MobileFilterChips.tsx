"use client";

import type { FilterChip } from "@/lib/filterChips";

interface MobileFilterChipsProps {
  chips: FilterChip[];
}

export default function MobileFilterChips({ chips }: MobileFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="flex-shrink-0 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}
