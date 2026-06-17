export const REGIONS = [
  "전체",
  "서울",
  "경기",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
] as const;

export const HOLE_OPTIONS = ["전체", "9홀", "18홀", "27홀 이상"] as const;

export const COURSE_TYPE_OPTIONS = [
  "전체",
  "대중제",
  "회원제",
  "군 골프장",
] as const;

export interface PriceRangeOption {
  label: string;
  min: number;
  max: number;
}

/** 주중 그린피(weekdayGreenFeeMin) 기준 가격대 필터 */
export const PRICE_RANGES: PriceRangeOption[] = [
  { label: "전체", min: 0, max: Infinity },
  { label: "10만원 이하", min: 0, max: 100000 },
  { label: "10~15만원", min: 100000, max: 150000 },
  { label: "15~20만원", min: 150000, max: 200000 },
  { label: "20만원 이상", min: 200000, max: Infinity },
];

export const TAG_OPTIONS = [
  "야간가능",
  "노캐디",
  "2인가능",
  "리조트형",
  "수도권",
  "초보추천",
] as const;

/** 지도 기본 중심 (대한민국 중심부, 북한 영역 최소화) */
export const DEFAULT_MAP_CENTER = { lat: 36.2, lng: 127.8 };
/** NAVER Maps zoom: 숫자가 클수록 확대. 전국 조망 ≈ 7, 골프장 선택 시 ≈ 11 */
export const DEFAULT_MAP_ZOOM = 7;
export const SELECTED_MAP_ZOOM = 11;

/** Kakao Maps level: 숫자가 클수록 줌아웃. 전국 조망 ≈ 12, 선택 시 ≈ 5 */
export const DEFAULT_KAKAO_MAP_LEVEL = 12;
export const SELECTED_KAKAO_MAP_LEVEL = 5;

/** 카드/마커 선택 시 panTo 후 허용할 최대 줌아웃 level (Kakao: 숫자 클수록 멀리) */
export const CARD_PAN_MAX_LEVEL = 8;

/** fallback 지도가 사용하는 대략적인 대한민국 좌표 경계 */
export const KOREA_BOUNDS = {
  minLat: 33.0,
  maxLat: 38.7,
  minLng: 125.8,
  maxLng: 129.8,
};
