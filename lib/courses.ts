import type { Course } from "@/types/course";
import { MOCK_COURSES } from "@/lib/mock";

/**
 * Mock 골프장 데이터.
 * 추후 Supabase 테이블(`courses`)로 교체할 수 있도록
 * 조회는 lib/data.ts 의 getCourses() / getCourseById() 를 통해 수행한다.
 */
export const COURSES: Course[] = MOCK_COURSES;
