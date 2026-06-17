import type { Course } from "@/types/course";
import { MOCK_COURSES } from "@/lib/mock";

/**
 * Mock 골프장 데이터.
 * 조회는 lib/courseRepository.ts 의 getCourses() / getCourseById() 를 통해 수행한다.
 */
export const COURSES: Course[] = MOCK_COURSES;
