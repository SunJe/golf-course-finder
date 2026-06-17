import type { Course } from "@/types/course";

/** 왼쪽 리스트용 가나다순 정렬 */
export function sortCoursesByName(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export interface KakaoLatLngBounds {
  getSouthWest: () => { getLat: () => number; getLng: () => number };
  getNorthEast: () => { getLat: () => number; getLng: () => number };
  contains: (latlng: unknown) => boolean;
}

/** bounds가 유효한지 (초기화 전 0 span 등 비정상이면 false) */
export function isValidKakaoBounds(bounds: KakaoLatLngBounds): boolean {
  try {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const latSpan = Math.abs(ne.getLat() - sw.getLat());
    const lngSpan = Math.abs(ne.getLng() - sw.getLng());
    return latSpan > 0 && lngSpan > 0;
  } catch {
    return false;
  }
}

function isPointInKakaoBounds(
  lat: number,
  lng: number,
  bounds: KakaoLatLngBounds,
  LatLng: new (lat: number, lng: number) => unknown,
): boolean {
  try {
    if (bounds.contains(new LatLng(lat, lng))) return true;
  } catch {
    // contains 실패 시 수동 비교로 fallback
  }

  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const minLat = Math.min(sw.getLat(), ne.getLat());
  const maxLat = Math.max(sw.getLat(), ne.getLat());
  const minLng = Math.min(sw.getLng(), ne.getLng());
  const maxLng = Math.max(sw.getLng(), ne.getLng());

  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/** Kakao bounds.contains 로 course id 목록 계산 (실패 시 null) */
export function getCourseIdsInKakaoBounds(
  courses: Course[],
  bounds: KakaoLatLngBounds,
  LatLng: new (lat: number, lng: number) => unknown,
): string[] | null {
  if (!bounds || typeof bounds.getSouthWest !== "function") return null;
  if (!isValidKakaoBounds(bounds)) return null;

  return courses
    .filter((c) => isPointInKakaoBounds(c.latitude, c.longitude, bounds, LatLng))
    .map((c) => c.id);
}

/** course가 bounds 안에 있는지 */
export function isCourseInKakaoBounds(
  course: Course,
  bounds: KakaoLatLngBounds,
  LatLng: new (lat: number, lng: number) => unknown,
): boolean {
  if (!bounds) return false;
  return isPointInKakaoBounds(
    course.latitude,
    course.longitude,
    bounds,
    LatLng,
  );
}
