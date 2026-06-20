import type { Course } from "@/types/course";
import { getDistanceKm } from "@/lib/geoUtils";
import { isValidCourseCoordinates } from "@/lib/focusCourse";

export const NEARBY_COURSES_LIMIT = 6;
export const NEARBY_COURSES_PREFERRED_RADIUS_KM = 50;

export interface NearbyCourseEntry {
  course: Course;
  distanceKm: number;
}

/**
 * 현재 골프장 기준 Haversine 직선거리순 근처 골프장.
 * 50km 이내 우선, 6개 미만이면 거리순으로 보충.
 */
export function getNearbyCoursesWithDistance(
  courses: Course[],
  current: Course,
  limit = NEARBY_COURSES_LIMIT,
  preferredRadiusKm = NEARBY_COURSES_PREFERRED_RADIUS_KM,
): NearbyCourseEntry[] {
  if (!isValidCourseCoordinates(current)) return [];

  const ranked = courses
    .filter((c) => c.id !== current.id && isValidCourseCoordinates(c))
    .map((candidate) => {
      const distanceKm = getDistanceKm(current, candidate);
      if (distanceKm == null) return null;
      return { course: candidate, distanceKm };
    })
    .filter((entry): entry is NearbyCourseEntry => entry != null)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const withinRadius = ranked.filter(
    (entry) => entry.distanceKm <= preferredRadiusKm,
  );

  if (withinRadius.length >= limit) {
    return withinRadius.slice(0, limit);
  }

  return ranked.slice(0, limit);
}

/** 거리순 근처 골프장 course 배열 (상세 리스트·지도 marker 공용) */
export function getNearbyCourses(
  courses: Course[],
  current: Course,
  limit = NEARBY_COURSES_LIMIT,
): Course[] {
  return getNearbyCoursesWithDistance(courses, current, limit).map(
    (entry) => entry.course,
  );
}
