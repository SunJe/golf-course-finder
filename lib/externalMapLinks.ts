import type { Course } from "@/types/course";
import { normalizeCourseNameForMapSearch } from "@/lib/mapSearchName";

/** 외부 검색/지도용 plain query — 괄호 제거 이름, 없으면 주소 fallback */
export function buildExternalSearchQuery(course: Course): string {
  const searchText = normalizeCourseNameForMapSearch(course.name ?? "");
  if (searchText) return searchText;
  return course.address?.trim() ?? "";
}

/** @deprecated use buildExternalSearchQuery */
export function buildExternalMapQuery(course: Course): string {
  return encodeURIComponent(buildExternalSearchQuery(course));
}

/** 네이버 지도 장소 검색 URL (raw query) */
export function getNaverMapSearchUrlFromQuery(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

/** 카카오맵 장소 검색 URL */
export function getKakaoMapSearchUrl(course: Course): string {
  return `https://map.kakao.com/link/search/${encodeURIComponent(buildExternalSearchQuery(course))}`;
}

/** 네이버 지도 장소 검색 URL */
export function getNaverMapSearchUrl(course: Course): string {
  return getNaverMapSearchUrlFromQuery(buildExternalSearchQuery(course));
}
