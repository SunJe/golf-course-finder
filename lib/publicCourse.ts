import type { Course } from "@/types/course";

/** 클라이언트 컴포넌트 전달용 — 내부 통계 필드 제외 */
export type PublicCourse = Omit<Course, "difficulty">;

export function toPublicCourse(course: Course): PublicCourse {
  const { difficulty: _difficulty, ...rest } = course;
  return rest;
}

export function toPublicCourses(courses: Course[]): PublicCourse[] {
  return courses.map(toPublicCourse);
}
