import type { Course } from "@/types/course";
import {
  matchCourseSearch,
  normalizeSearchText,
} from "@/lib/courseSearch";

export { normalizeSearchText } from "@/lib/courseSearch";

/** @deprecated 필드 경계 오매칭 유발 — courseMatchesSearchQuery 사용 */
export function courseSearchHaystack(course: Course): string {
  return normalizeSearchText(
    [course.name, course.address, course.region, course.city].join(" "),
  );
}

/** 검색창 추천 목록 (전체 courses 기준, 최대 5개) */
export function getSearchSuggestions(
  courses: Course[],
  query: string,
): Course[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const normalizedQuery = normalizeSearchText(trimmed);
  if (!normalizedQuery) return [];

  const limit = trimmed.length <= 1 ? 3 : 5;

  const scored = courses
    .map((course) => {
      const result = matchCourseSearch(course, trimmed);
      return { course, score: result.score, matched: result.matched };
    })
    .filter((item) => item.matched && item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.course.name.localeCompare(b.course.name, "ko");
    });

  return scored.slice(0, limit).map((item) => item.course);
}
