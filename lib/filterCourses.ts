import type { Course, CourseFilters } from "@/types/course";
import { getReservationPriceMin } from "@/lib/coursePrice";
import { courseMatchesSearchQuery } from "@/lib/courseSearch";
import { courseMatchesRegionFilter } from "@/lib/regionUtils";
function matchesHoleCount(course: Course, option: string): boolean {
  if (course.holeCount == null) return false;
  switch (option) {
    case "9홀":
      return course.holeCount <= 9;
    case "18홀":
      return course.holeCount >= 18 && course.holeCount < 27;
    case "27홀 이상":
      return course.holeCount >= 27;
    default:
      return false;
  }
}

/** price_min 기준 (예약가). 필터 미선택 시 가격 없는 골프장도 포함. */
export function matchesPriceRange(priceMin: number, option: string): boolean {
  switch (option) {
    case "10만원 이하":
      return priceMin <= 100_000;
    case "10~15만원":
      return priceMin > 100_000 && priceMin <= 150_000;
    case "15~20만원":
      return priceMin > 150_000 && priceMin <= 200_000;
    case "20만원 이상":
      return priceMin > 200_000;
    default:
      return false;
  }
}

function matchesQuery(course: Course, query: string): boolean {
  return courseMatchesSearchQuery(course, query);
}

/** 모든 필터: 그룹 내 OR, 그룹 간 AND */
export function filterCourses(
  courses: Course[],
  filters: CourseFilters,
): Course[] {
  return courses.filter((course) => {
    if (!matchesQuery(course, filters.query)) return false;

    if (
      filters.regions.length > 0 &&
      !filters.regions.some((filterRegion) =>
        courseMatchesRegionFilter(course, filterRegion),
      )
    ) {
      return false;
    }

    if (
      filters.holeCounts.length > 0 &&
      !filters.holeCounts.some((option) => matchesHoleCount(course, option))
    ) {
      return false;
    }

    if (
      filters.courseTypes.length > 0 &&
      !filters.courseTypes.includes(course.courseType)
    ) {
      return false;
    }

    if (filters.priceRanges.length > 0) {
      const priceMin = getReservationPriceMin(course);
      if (priceMin == null) return false;      if (
        !filters.priceRanges.some((option) =>
          matchesPriceRange(priceMin, option),
        )
      ) {
        return false;
      }
    }

    if (filters.tags.length > 0) {
      if (!filters.tags.some((tag) => course.tags.includes(tag))) {
        return false;
      }
    }

    return true;
  });
}

/** 적용 중인 필터 개수 (초기화 버튼/모바일 배지용) */
export function countActiveFilters(filters: CourseFilters): number {
  return (
    filters.regions.length +
    filters.holeCounts.length +
    filters.courseTypes.length +
    filters.priceRanges.length +
    filters.tags.length
  );
}
