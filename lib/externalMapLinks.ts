import type { Course } from "@/types/course";

function buildQuery(course: Course): string {
  return encodeURIComponent(`${course.name} ${course.address}`);
}

/** 카카오맵 장소 검색 URL */
export function getKakaoMapSearchUrl(course: Course): string {
  return `https://map.kakao.com/link/search/${buildQuery(course)}`;
}

/** 네이버 지도 장소 검색 URL */
export function getNaverMapSearchUrl(course: Course): string {
  return `https://map.naver.com/p/search/${buildQuery(course)}`;
}
