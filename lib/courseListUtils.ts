import type { Course } from "@/types/course";

/** 왼쪽 리스트용 가나다순 정렬 */
export function sortCoursesByName(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

/** Kakao map bounds 안에 포함되는 course id 목록 */
export function getCourseIdsInBounds(
  courses: Course[],
  bounds: {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
  },
): string[] {
  return courses
    .filter(
      (c) =>
        c.latitude >= bounds.swLat &&
        c.latitude <= bounds.neLat &&
        c.longitude >= bounds.swLng &&
        c.longitude <= bounds.neLng,
    )
    .map((c) => c.id);
}

/** Kakao LatLngBounds → plain bounds */
export function parseKakaoBounds(bounds: {
  getSouthWest: () => { getLat: () => number; getLng: () => number };
  getNorthEast: () => { getLat: () => number; getLng: () => number };
}) {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return {
    swLat: sw.getLat(),
    swLng: sw.getLng(),
    neLat: ne.getLat(),
    neLng: ne.getLng(),
  };
}
