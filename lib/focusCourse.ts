import type { Course } from "@/types/course";
import type { MapFocusTarget } from "@/types/map";

export function isValidCourseCoordinates(
  course: Pick<Course, "latitude" | "longitude">,
): boolean {
  return (
    Number.isFinite(course.latitude) &&
    Number.isFinite(course.longitude) &&
    Math.abs(course.latitude) <= 90 &&
    Math.abs(course.longitude) <= 180
  );
}

export function createMapFocusTarget(
  course: Pick<Course, "id" | "latitude" | "longitude" | "name">,
  level?: number,
): MapFocusTarget | null {
  if (!isValidCourseCoordinates(course)) return null;

  return {
    lat: course.latitude,
    lng: course.longitude,
    ...(level != null ? { level } : {}),
    courseId: course.id,
    focusToken: Date.now(),
  };
}

export function debugFocusCourse(
  course: Pick<Course, "id" | "name" | "latitude" | "longitude">,
  target: MapFocusTarget | null,
): void {
  if (process.env.NODE_ENV !== "development") return;

  console.debug("[focusCourse]", {
    courseId: course.id,
    courseName: course.name,
    latitude: course.latitude,
    longitude: course.longitude,
    targetLat: target?.lat,
    targetLng: target?.lng,
    targetLevel: target?.level,
    selectedCourseId: target?.courseId,
  });
}
