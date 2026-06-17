import { KOREA_BOUNDS } from "@/lib/constants";

/** 위·경도를 fallback/커스텀 지도 컨테이너 내 % 좌표로 변환 */
export function projectToPercent(lat: number, lng: number) {
  const x =
    ((lng - KOREA_BOUNDS.minLng) /
      (KOREA_BOUNDS.maxLng - KOREA_BOUNDS.minLng)) *
    100;
  const y =
    ((KOREA_BOUNDS.maxLat - lat) /
      (KOREA_BOUNDS.maxLat - KOREA_BOUNDS.minLat)) *
    100;
  return {
    left: Math.min(97, Math.max(3, x)),
    top: Math.min(96, Math.max(4, y)),
  };
}

/** MapFallback 용 지역 라벨 */
export const FALLBACK_REGION_LABELS = [
  { name: "서울", lat: 37.57, lng: 126.98 },
  { name: "경기", lat: 37.3, lng: 127.05 },
  { name: "강원", lat: 37.8, lng: 128.3 },
  { name: "충청", lat: 36.5, lng: 127.3 },
  { name: "전라", lat: 35.2, lng: 126.9 },
  { name: "경상", lat: 35.7, lng: 128.6 },
  { name: "제주", lat: 33.42, lng: 126.5 },
] as const;

/** CustomKoreaMap 용 지역 라벨 */
export const CUSTOM_REGION_LABELS = [
  { name: "서울/경기", lat: 37.45, lng: 127.0 },
  { name: "강원", lat: 37.8, lng: 128.3 },
  { name: "충청", lat: 36.5, lng: 127.3 },
  { name: "전라", lat: 35.2, lng: 126.9 },
  { name: "경상", lat: 35.7, lng: 128.6 },
  { name: "제주", lat: 33.42, lng: 126.5 },
] as const;
