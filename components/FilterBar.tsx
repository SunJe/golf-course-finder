"use client";

import { useState } from "react";
import { RotateCcw, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { CourseFilters } from "@/types/course";
import {
  REGIONS,
  HOLE_OPTIONS,
  COURSE_TYPE_OPTIONS,
  PRICE_RANGES,
  TAG_OPTIONS,
} from "@/lib/constants";

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
          ? "border-brand-600 bg-brand-600 text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}

/** 라벨이 칩 앞에 붙는 가로형 그룹 (데스크탑 bar) */
function InlineGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex-shrink-0 text-xs font-semibold text-gray-400">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  );
}

/** 세로형 그룹 (모바일 시트) */
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

export default function FilterBar({
  filters,
  onChange,
  onReset,
  activeCount,
  variant = "bar",
}: FilterBarProps) {
  const [showMore, setShowMore] = useState(false);

  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onChange({ tags: next });
  };

  // ── 모바일 바텀시트: 세로 전체 표시 ──────────────────────────────
  if (variant === "sheet") {
    return (
      <div className="flex flex-col gap-5 pb-2">
        <StackGroup label="지역">
          {REGIONS.map((r) => (
            <Pill key={r} active={filters.region === r} onClick={() => onChange({ region: r })}>
              {r}
            </Pill>
          ))}
        </StackGroup>
        <StackGroup label="홀수">
          {HOLE_OPTIONS.map((h) => (
            <Pill key={h} active={filters.holeCount === h} onClick={() => onChange({ holeCount: h })}>
              {h}
            </Pill>
          ))}
        </StackGroup>
        <StackGroup label="운영 방식">
          {COURSE_TYPE_OPTIONS.map((c) => (
            <Pill key={c} active={filters.courseType === c} onClick={() => onChange({ courseType: c })}>
              {c}
            </Pill>
          ))}
        </StackGroup>
        <StackGroup label="가격대 (주중 그린피)">
          {PRICE_RANGES.map((p) => (
            <Pill key={p.label} active={filters.priceRange === p.label} onClick={() => onChange({ priceRange: p.label })}>
              {p.label}
            </Pill>
          ))}
        </StackGroup>
        <StackGroup label="태그">
          {TAG_OPTIONS.map((t) => (
            <Pill key={t} active={filters.tags.includes(t)} onClick={() => toggleTag(t)}>
              {t}
            </Pill>
          ))}
        </StackGroup>
      </div>
    );
  }

  // ── 데스크탑 바: 컴팩트 가로형 ─────────────────────────────────
  return (
    <div className="flex flex-col gap-2.5">
      {/* 1행: 지역 + 초기화 */}
      <div className="flex items-start justify-between gap-4">
        <InlineGroup label="지역">
          {REGIONS.map((r) => (
            <Pill key={r} compact active={filters.region === r} onClick={() => onChange({ region: r })}>
              {r}
            </Pill>
          ))}
        </InlineGroup>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-[13px] font-medium text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화 {activeCount}
          </button>
        )}
      </div>

      {/* 2행: 홀수 · 운영 · 가격대 + 더보기 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <InlineGroup label="홀수">
            {HOLE_OPTIONS.map((h) => (
              <Pill key={h} compact active={filters.holeCount === h} onClick={() => onChange({ holeCount: h })}>
                {h}
              </Pill>
            ))}
          </InlineGroup>
          <span className="hidden h-4 w-px bg-gray-200 lg:block" />
          <InlineGroup label="운영">
            {COURSE_TYPE_OPTIONS.map((c) => (
              <Pill key={c} compact active={filters.courseType === c} onClick={() => onChange({ courseType: c })}>
                {c}
              </Pill>
            ))}
          </InlineGroup>
          <span className="hidden h-4 w-px bg-gray-200 lg:block" />
          <InlineGroup label="가격대">
            {PRICE_RANGES.map((p) => (
              <Pill key={p.label} compact active={filters.priceRange === p.label} onClick={() => onChange({ priceRange: p.label })}>
                {p.label}
              </Pill>
            ))}
          </InlineGroup>
        </div>

        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className={`flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] font-medium transition ${
            showMore || filters.tags.length > 0
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          태그 필터
          {filters.tags.length > 0 && (
            <span className="rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
              {filters.tags.length}
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* 3행(펼침): 태그 */}
      {showMore && (
        <div className="animate-fade-in">
          <InlineGroup label="태그">
            {TAG_OPTIONS.map((t) => (
              <Pill key={t} compact active={filters.tags.includes(t)} onClick={() => toggleTag(t)}>
                {t}
              </Pill>
            ))}
          </InlineGroup>
        </div>
      )}
    </div>
  );
}
