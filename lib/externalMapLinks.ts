import type { Course } from "@/types/course";

/** 외부 지도 검색어 — 골프장명 우선, 없으면 주소 fallback */
export function buildExternalMapQuery(course: Course): string {
  const name = course.name?.trim();
  if (name) return encodeURIComponent(name);
  return encodeURIComponent(course.address?.trim() ?? "");
}

/** 카카오맵 장소 검색 URL (이름 기준) */
export function getKakaoMapSearchUrl(course: Course): string {
  return `https://map.kakao.com/link/search/${buildExternalMapQuery(course)}`;
}

/** 네이버 지도 장소 검색 URL (이름 기준) */
export function getNaverMapSearchUrl(course: Course): string {
  return `https://map.naver.com/p/search/${buildExternalMapQuery(course)}`;
}
