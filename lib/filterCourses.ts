import type { Course, CourseFilters } from "@/types/course";
import { PRICE_RANGES } from "@/lib/constants";

function matchesHoleCount(course: Course, option: string): boolean {
  if (option === "전체") return true;
  if (course.holeCount == null) return false;
  switch (option) {
    case "9홀":
      return course.holeCount <= 9;
    case "18홀":
      return course.holeCount >= 18 && course.holeCount < 27;
    case "27홀 이상":
      return course.holeCount >= 27;
    default:
      return true;
  }
}

function matchesPrice(course: Course, option: string): boolean {
  if (option === "전체") return true;
  if (course.weekdayGreenFeeMin == null) return false;
  const range = PRICE_RANGES.find((r) => r.label === option);
  if (!range) return true;
  return (
    course.weekdayGreenFeeMin >= range.min &&
    course.weekdayGreenFeeMin < range.max
  );
}

function matchesQuery(course: Course, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [course.name, course.address, course.region, course.city]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

/** 모든 필터를 AND 조건으로 적용한다. */
export function filterCourses(
  courses: Course[],
  filters: CourseFilters,
): Course[] {
  return courses.filter((course) => {
    if (!matchesQuery(course, filters.query)) return false;
    if (filters.region !== "전체" && course.region !== filters.region)
      return false;
    if (!matchesHoleCount(course, filters.holeCount)) return false;
    if (filters.courseType !== "전체" && course.courseType !== filters.courseType)
      return false;
    if (!matchesPrice(course, filters.priceRange)) return false;
    if (filters.tags.length > 0) {
      const hasAll = filters.tags.every((t) => course.tags.includes(t));
      if (!hasAll) return false;
    }
    return true;
  });
}

/** 적용 중인 필터 개수 (초기화 버튼/모바일 배지용) */
export function countActiveFilters(filters: CourseFilters): number {
  let count = 0;
  if (filters.region !== "전체") count++;
  if (filters.holeCount !== "전체") count++;
  if (filters.courseType !== "전체") count++;
  if (filters.priceRange !== "전체") count++;
  count += filters.tags.length;
  return count;
}
