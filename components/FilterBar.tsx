"use client";

import { useState } from "react";
import { RotateCcw, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { CourseFilters } from "@/types/course";
import {
  REGIONS,
  HOLE_OPTIONS,
  COURSE_TYPE_OPTIONS,
  TAG_OPTIONS,
  PRICE_FILTER_GROUP_LABEL,
  PRICE_FILTER_GROUP_LABEL_MOBILE,
} from "@/lib/constants";
import { FILTER_PRICE_OPTIONS } from "@/lib/filterChips";
import { toggleFilterOption } from "@/lib/filterToggle";

interface FilterBarProps {
  filters: CourseFilters;
  onChange: (patch: Partial<CourseFilters>) => void;
  onReset: () => void;
  activeCount: number;
  /** 모바일 시트 내부에서는 라벨/여백을 조금 다르게 */
  variant?: "bar" | "sheet";
}

function Pill({
  active,
  onClick,
  compact = false,
  children,
}: {
  active: boolean;
  onClick: () => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border font-medium transition ${
        compact ? "px-3 py-1 text-[13px]" : "px-3.5 py-1.5 text-sm"
      } ${
        active
          ? "border-brand-700 bg-brand-700 text-white shadow-sm"
          : "border-stone-200 bg-white text-stone-600 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-800"
      }`}
    >
      {children}
    </button>
  );
}

function InlineGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-stone-400">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

function StackGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function MultiSelectGroup({
  label,
  options,
  selected,
  onToggle,
  compact = false,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
  compact?: boolean;
}) {
  return (
    <>
      {options.map((option) => (
        <Pill
          key={option}
          compact={compact}
          active={option === "전체" ? selected.length === 0 : selected.includes(option)}
          onClick={() => onToggle(option)}
        >
          {option}
        </Pill>
      ))}
    </>
  );
}

export default function FilterBar({
  filters,
  onChange,
  onReset,
  activeCount,
  variant = "bar",
}: FilterBarProps) {
  const [showMore, setShowMore] = useState(false);

  const toggleRegion = (option: string) =>
    onChange({ regions: toggleFilterOption(filters.regions, option) });
  const toggleHole = (option: string) =>
    onChange({ holeCounts: toggleFilterOption(filters.holeCounts, option) });
  const toggleType = (option: string) =>
    onChange({ courseTypes: toggleFilterOption(filters.courseTypes, option) });
  const togglePrice = (option: string) =>
    onChange({ priceRanges: toggleFilterOption(filters.priceRanges, option) });
  const toggleTag = (option: string) =>
    onChange({ tags: toggleFilterOption(filters.tags, option) });

  if (variant === "sheet") {
    return (
      <div className="flex flex-col gap-5 pb-2">
        <StackGroup label="지역">
          <MultiSelectGroup
            label="지역"
            options={REGIONS}
            selected={filters.regions}
            onToggle={toggleRegion}
          />
        </StackGroup>
        <StackGroup label="홀수">
          <MultiSelectGroup
            label="홀수"
            options={HOLE_OPTIONS}
            selected={filters.holeCounts}
            onToggle={toggleHole}
          />
        </StackGroup>
        <StackGroup label="운영 방식">
          <MultiSelectGroup
            label="운영"
            options={COURSE_TYPE_OPTIONS}
            selected={filters.courseTypes}
            onToggle={toggleType}
          />
        </StackGroup>
        <StackGroup label={PRICE_FILTER_GROUP_LABEL_MOBILE}>
          <MultiSelectGroup
            label="가격"
            options={["전체", ...FILTER_PRICE_OPTIONS]}
            selected={filters.priceRanges}
            onToggle={togglePrice}
          />
        </StackGroup>
        <StackGroup label="태그">
          {TAG_OPTIONS.map((tag) => (
            <Pill
              key={tag}
              active={filters.tags.includes(tag)}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Pill>
          ))}
        </StackGroup>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-4">
        <InlineGroup label="지역">
          <MultiSelectGroup
            label="지역"
            options={REGIONS}
            selected={filters.regions}
            onToggle={toggleRegion}
            compact
          />
        </InlineGroup>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1 text-[13px] font-medium text-stone-500 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화 {activeCount}
          </button>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <InlineGroup label="홀수">
            <MultiSelectGroup
              label="홀수"
              options={HOLE_OPTIONS}
              selected={filters.holeCounts}
              onToggle={toggleHole}
              compact
            />
          </InlineGroup>
          <span className="hidden h-4 w-px bg-gray-200 lg:block" />
          <InlineGroup label="운영">
            <MultiSelectGroup
              label="운영"
              options={COURSE_TYPE_OPTIONS}
              selected={filters.courseTypes}
              onToggle={toggleType}
              compact
            />
          </InlineGroup>
          <span className="hidden h-4 w-px bg-gray-200 lg:block" />
          <InlineGroup label={PRICE_FILTER_GROUP_LABEL}>
            <MultiSelectGroup
              label="가격"
              options={["전체", ...FILTER_PRICE_OPTIONS]}
              selected={filters.priceRanges}
              onToggle={togglePrice}
              compact
            />
          </InlineGroup>
        </div>

        <button
          type="button"
          onClick={() => setShowMore((value) => !value)}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition ${
            showMore || filters.tags.length > 0
              ? "border-brand-300 bg-brand-50 text-brand-800"
              : "border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          태그 필터
          {filters.tags.length > 0 && (
            <span className="rounded-full bg-brand-700 px-1.5 text-[11px] font-bold text-white">
              {filters.tags.length}
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {showMore && (
        <div className="animate-fade-in">
          <InlineGroup label="태그">
            {TAG_OPTIONS.map((tag) => (
              <Pill
                key={tag}
                compact
                active={filters.tags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Pill>
            ))}
          </InlineGroup>
        </div>
      )}
    </div>
  );
}
