import type { Course } from "@/types/course";
import { mapGolfCourseRowToCourse } from "@/lib/courseMapper";
import { MOCK_COURSES } from "@/lib/mock";

/**
 * 골프장 데이터 repository.
 *
 * 현재는 mock data를 반환한다. Supabase 연결 시 이 파일의 구현만 교체하면 된다.
 *
 * TODO: Replace mockCourses with Supabase query from golf_courses table.
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = createClient();
 *   const { data, error } = await supabase.from("golf_courses").select("*");
 *   if (error) throw error;
 *   return (data ?? []).map(mapGolfCourseRowToCourse);
 */
function getMockCourses(): Course[] {
  return MOCK_COURSES;
}

export async function getCourses(): Promise<Course[]> {
  return getMockCourses();
}

export async function getCourseById(id: string): Promise<Course | undefined> {
  return getMockCourses().find((course) => course.id === id);
}

export async function getAllCourseIds(): Promise<string[]> {
  return getMockCourses().map((course) => course.id);
}

/** Supabase row 배열을 Course[]로 변환할 때 사용 (향후 import/seed용) */
export function mapRowsToCourses(
  rows: Parameters<typeof mapGolfCourseRowToCourse>[0][],
): Course[] {
  return rows.map(mapGolfCourseRowToCourse);
}
