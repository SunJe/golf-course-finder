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

/**
 * Kakao Maps level: 숫자가 클수록 줌아웃.
 * 메인 첫 화면 — 남한 전체·제주 포함 전국 조망 (스크린샷 기준)
 */
export const INITIAL_KAKAO_MAP_LEVEL = 12;

/** 데스크탑 첫 화면 고정 카메라 */
export const DESKTOP_INITIAL_MAP_CENTER = DEFAULT_MAP_CENTER;
export const DESKTOP_INITIAL_KAKAO_MAP_LEVEL = INITIAL_KAKAO_MAP_LEVEL;

/**
 * 모바일 fitBounds 실패 시 fallback — 남한 본토 중심 (북쪽 바다·북한 최소화)
 */
export const MOBILE_INITIAL_MAP_CENTER = { lat: 36.05, lng: 127.6 };
export const MOBILE_INITIAL_KAKAO_MAP_LEVEL = 12;

/** 모바일 초기 fitBounds UI padding (px) — 상단 검색·하단 half sheet·탭바 고려 */
export const MOBILE_INITIAL_MAP_PADDING = {
  top: 64,
  right: 24,
  bottom: 248,
  left: 24,
} as const;

/** half sheet 기준 padding (동적 relayout용) */
export const MOBILE_HALF_SHEET_MAP_PADDING = {
  top: 64,
  right: 24,
  bottom: 248,
  left: 24,
} as const;

/** collapsed sheet 기준 padding — 지도 영역 확대 */
export const MOBILE_COLLAPSED_SHEET_MAP_PADDING = {
  top: 64,
  right: 24,
  bottom: 168,
  left: 24,
} as const;

/**
 * fitBounds 후 남한 본토가 시각적 중심에 오도록 위도 보정 (deg, 음수=남쪽)
 */
export const MOBILE_MAP_VISUAL_CENTER_LAT_OFFSET = -0.18;

/** 데스크탑 초기 fitBounds padding (px) */
export const DESKTOP_INITIAL_MAP_PADDING = {
  top: 48,
  right: 48,
  bottom: 48,
  left: 48,
} as const;

/**
 * 모바일 전국 fitBounds 지리적 여백 (deg)
 * 북쪽(북한·동해) 여백 축소, 남쪽·서쪽 여유 확보
 */
export const MOBILE_FIT_GEO_PADDING = {
  latSouth: 0.1,
  latNorth: 0.04,
  lngWest: 0.08,
  lngEast: 0.02,
} as const;

/** 데스크탑/일반 fitBounds 지리적 여백 */
export const DEFAULT_FIT_GEO_PADDING = {
  latSouth: 0.12,
  latNorth: 0.12,
  lngWest: 0.1,
  lngEast: 0.1,
} as const;

/** @deprecated INITIAL_KAKAO_MAP_LEVEL 사용 */
export const DEFAULT_KAKAO_MAP_LEVEL = INITIAL_KAKAO_MAP_LEVEL;

export const SELECTED_KAKAO_MAP_LEVEL = 5;

/** 검색 결과 1건 포커스 / 상세 페이지 소형 지도 — 주변 도로가 보이는 확대 */
export const SEARCH_RESULT_FOCUS_LEVEL = 6;
export const DETAIL_KAKAO_MAP_LEVEL = 6;

/** 모바일에서 골프장 카드/핀 선택 시 지도 확대 level */
export const MOBILE_SELECTED_MAP_LEVEL = 6;

/**
 * 첫 화면(level 12)에서 확대 2단계(level 10)까지 cluster 허용.
 * level 9 이하(확대 3단계~)는 개별 pin만.
 */
export const CLUSTER_MAX_ZOOM_IN_STEPS = 2;

/** cluster 허용 최소 level (= INITIAL - CLUSTER_MAX_ZOOM_IN_STEPS) */
export const CLUSTER_MIN_LEVEL =
  INITIAL_KAKAO_MAP_LEVEL - CLUSTER_MAX_ZOOM_IN_STEPS;

/** 필터/검색 결과가 이 값 이하면 클러스터 해제 */
export const CLUSTER_MAX_DISPLAYED_COUNT = 30;

/** 카드/마커 선택 시 panTo 후 허용할 최대 줌아웃 level (Kakao: 숫자 클수록 멀리) */
export const CARD_PAN_MAX_LEVEL = 8;

/** fallback 지도가 사용하는 대략적인 대한민국 좌표 경계 */
export const KOREA_BOUNDS = {
  minLat: 33.0,
  maxLat: 38.7,
  minLng: 125.8,
  maxLng: 129.8,
};

