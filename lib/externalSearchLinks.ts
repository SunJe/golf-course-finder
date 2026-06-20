import type { Course } from "@/types/course";
import {
  buildExternalSearchQuery,
  getNaverMapSearchUrlFromQuery,
} from "@/lib/externalMapLinks";

/** 네이버 통합검색 URL — 괄호 제거 이름, `골프장` suffix 없음 */
export function getNaverSearchUrl(course: Course): string {
  const query = buildExternalSearchQuery(course);
  return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
}

/** 네이버지도 — 골프장 주변 맛집 카테고리 검색 */
export function getNearbyRestaurantMapUrl(
  course: Course,
  category: string,
): string {
  const base = buildExternalSearchQuery(course);
  const query = base ? `${base} 근처 ${category}` : `근처 ${category}`;
  return getNaverMapSearchUrlFromQuery(query);
}

export const NEARBY_RESTAURANT_CATEGORIES = [
  "한정식",
  "중국음식",
  "국수",
  "고기집",
  "해장국",
  "카페",
] as const;
