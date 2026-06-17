import type { Course } from "@/types/course";
import { COURSES } from "@/lib/courses";

/**
 * 데이터 접근 레이어.
 *
 * 지금은 mock data(COURSES)를 반환하지만, 추후 Supabase로 교체할 때는
 * 이 파일의 구현만 바꾸면 된다. 예시:
 *
 *   import { supabase } from "@/lib/supabase";
 *   export async function getCourses() {
 *     const { data } = await supabase.from("courses").select("*");
 *     return data ?? [];
 *   }
 *
 * 호출부(page.tsx 등)는 async 시그니처를 그대로 사용하므로 변경이 없다.
 */
export async function getCourses(): Promise<Course[]> {
  return COURSES;
}

export async function getCourseById(id: string): Promise<Course | null> {
  return COURSES.find((c) => c.id === id) ?? null;
}

export async function getAllCourseIds(): Promise<string[]> {
  return COURSES.map((c) => c.id);
}
