import type { Course } from "@/types/course";
import {
  getDistanceKm,
  SEOUL_CITY_HALL,
} from "@/lib/collectionFilters";
import { hasPrice } from "@/lib/priceFormat";

export const HOME_RECOMMENDED_IDS = [
  "gc-60319bf1693c", // 인천그랜드CC
  "gc-81f36c789316", // 그랜드CC
  "gc-81ecacc0ae41", // 라싸 골프클럽
  "gc-41b5c15f44da", // 일산스프링힐스 컨트리클럽
  "gc-18640b625b94", // 올림픽 골프장
  "gc-81becbdb274e", // 파주제이퍼블릭골프클럽
  "gc-fb2e8a3b34d8", // 베스트밸리GC
  "gc-29fa36946d15", // 남양주CC
  "gc-3d63d3179c0f", // 태광CC(퍼블릭)
  "gc-27324df1736a", // 서울한양CC
] as const;

/** @deprecated use HOME_RECOMMENDED_IDS */
export const FIXED_RECOMMENDED_IDS = HOME_RECOMMENDED_IDS;

export const RECOMMENDED_COUNT = 10;

export type RecommendedCourseMeta = {
  course: Course;
  distanceKm: number | null;
  nearSeoul: boolean;
  hasReferencePrice: boolean;
  hasPhone: boolean;
  hasHomepage: boolean;
};

function hasValidCoordinates(course: Course): boolean {
  return (
    Number.isFinite(course.latitude) &&
    Number.isFinite(course.longitude) &&
    course.latitude !== 0 &&
    course.longitude !== 0
  );
}

function computeDistanceKm(course: Course): number | null {
  if (!hasValidCoordinates(course)) return null;
  return getDistanceKm(
    SEOUL_CITY_HALL.lat,
    SEOUL_CITY_HALL.lng,
    course.latitude,
    course.longitude,
  );
}

export function toRecommendedMeta(course: Course): RecommendedCourseMeta {
  const distanceKm = computeDistanceKm(course);
  return {
    course,
    distanceKm,
    nearSeoul: distanceKm != null && distanceKm <= 80,
    hasReferencePrice: hasPrice(course),
    hasPhone: Boolean(course.phone?.trim()),
    hasHomepage: Boolean(course.homepageUrl?.trim()),
  };
}

/** Build-time deterministic 추천 10곳 (홈 고정 목록) */
export function selectRecommendedCourses(
  courses: Course[],
  limit = RECOMMENDED_COUNT,
): RecommendedCourseMeta[] {
  const byId = new Map(courses.map((course) => [course.id, course]));
  const selected: Course[] = [];

  for (const id of HOME_RECOMMENDED_IDS) {
    if (selected.length >= limit) break;
    const course = byId.get(id);
    if (course) selected.push(course);
  }

  return selected.map(toRecommendedMeta);
}
