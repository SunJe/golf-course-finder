import type { Course } from "@/types/course";

/** 검색어·텍스트 비교용 정규화 (공백·기호·대소문자) */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[·.\-_()（）[\]]/g, "");
}

export function courseSearchHaystack(course: Course): string {
  return normalizeSearchText(
    [course.name, course.address, course.region, course.city].join(" "),
  );
}

function nameMatchScore(course: Course, normalizedQuery: string): number {
  const name = normalizeSearchText(course.name);
  if (name === normalizedQuery) return 100;
  if (name.startsWith(normalizedQuery)) return 80;
  if (name.includes(normalizedQuery)) return 60;
  return 0;
}

function fieldMatchScore(course: Course, normalizedQuery: string): number {
  const region = normalizeSearchText(course.region);
  const city = normalizeSearchText(course.city);
  const address = normalizeSearchText(course.address);
  if (region.includes(normalizedQuery) || city.includes(normalizedQuery)) return 40;
  if (address.includes(normalizedQuery)) return 20;
  return 0;
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
      const nameScore = nameMatchScore(course, normalizedQuery);
      const fieldScore = nameScore > 0 ? 0 : fieldMatchScore(course, normalizedQuery);
      const score = Math.max(nameScore, fieldScore);
      return { course, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.course.name.localeCompare(b.course.name, "ko");
    });

  return scored.slice(0, limit).map((item) => item.course);
}
