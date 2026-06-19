import type { Course } from "@/types/course";

/** 리스트 우선 노출 대상 — normalize 후 name.includes(keyword) 로 매칭 */
export const PRIORITY_COURSE_KEYWORDS = ["인천그랜드"] as const;

const PRIORITY_COURSE_SCORE = 100;

/** 골프장명 비교용 — 공백·기호·CC/컨트리클럽 접미어 제거 */
export function normalizeCourseName(name: string): string {
  return name
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[·.\-_()（）[\]]/g, "")
    .replace(/컨트리클럽|countryclub/gi, "")
    .replace(/씨\.?씨\.?|c\.?c\.?/gi, "")
    .toLowerCase();
}

export function getCoursePriority(course: Course): number {
  const normalizedName = normalizeCourseName(course.name);
  return PRIORITY_COURSE_KEYWORDS.some((keyword) =>
    normalizedName.includes(normalizeCourseName(keyword)),
  )
    ? PRIORITY_COURSE_SCORE
    : 0;
}

/** 리스트 표시용 정렬: priority → 이름순(가나다) */
export function sortCoursesForList(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const byPriority = getCoursePriority(b) - getCoursePriority(a);
    if (byPriority !== 0) return byPriority;
    return a.name.localeCompare(b.name, "ko");
  });
}
