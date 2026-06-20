import type { CourseFilters } from "@/types/course";
import { PRICE_RANGES } from "@/lib/constants";

export interface FilterChip {
  key: string;
  label: string;
}

/** 모바일 상단에 표시할 활성 필터 chip 목록 */
export function getActiveFilterChips(filters: CourseFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  for (const region of filters.regions) {
    chips.push({ key: `region-${region}`, label: region });
  }
  for (const holeCount of filters.holeCounts) {
    chips.push({ key: `hole-${holeCount}`, label: holeCount });
  }
  for (const courseType of filters.courseTypes) {
    chips.push({ key: `type-${courseType}`, label: courseType });
  }
  for (const priceRange of filters.priceRanges) {
    chips.push({ key: `price-${priceRange}`, label: priceRange });
  }
  for (const tag of filters.tags) {
    chips.push({ key: `tag-${tag}`, label: tag });
  }

  return chips;
}

/** 가격대 필터 옵션 (`전체` 제외) */
export const FILTER_PRICE_OPTIONS = PRICE_RANGES.filter(
  (range) => range.label !== "전체",
).map((range) => range.label);
