import type { Course } from "@/types/course";
import type { CourseMapBaseProps } from "@/types/map";

/** props 정규화 — 신규/레거시 API 모두 지원 */
export function resolveCourseMapBindings(props: CourseMapBaseProps) {
  const selectedCourseId =
    props.selectedCourseId ?? props.selectedId ?? null;

  const selectCourse = (course: Course) => {
    props.onSelectCourse?.(course.id);
    props.onSelect?.(course);
  };

  const selectCourseById = (courseId: string) => {
    const course = props.courses.find((c) => c.id === courseId);
    if (course) selectCourse(course);
  };

  return { selectedCourseId, selectCourse, selectCourseById };
}
