import type { Course } from "@/types/course";
import { isValidCourseCoordinates } from "@/lib/focusCourse";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 두 골프장 간 직선 거리(km). 좌표 없으면 null */
export function getDistanceKm(from: Course, to: Course): number | null {
  if (!isValidCourseCoordinates(from) || !isValidCourseCoordinates(to)) {
    return null;
  }

  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(from: Course, to: Course): string | null {
  const km = getDistanceKm(from, to);
  if (km == null) return null;
  if (km < 1) return "직선거리 약 1km 미만";
  return `직선거리 약 ${km.toFixed(1)}km`;
}
