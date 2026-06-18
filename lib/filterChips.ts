import type { CourseFilters } from "@/types/course";

export interface FilterChip {
  key: string;
  label: string;
}

/** 모바일 상단에 표시할 활성 필터 chip 목록 */
export function getActiveFilterChips(filters: CourseFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.region !== "전체") {
    chips.push({ key: "region", label: filters.region });
  }
  if (filters.holeCount !== "전체") {
    chips.push({ key: "holeCount", label: filters.holeCount });
  }
  if (filters.courseType !== "전체") {
    chips.push({ key: "courseType", label: filters.courseType });
  }
  if (filters.priceRange !== "전체") {
    chips.push({ key: "priceRange", label: filters.priceRange });
  }
  for (const tag of filters.tags) {
    chips.push({ key: `tag-${tag}`, label: tag });
  }

  return chips;
}
