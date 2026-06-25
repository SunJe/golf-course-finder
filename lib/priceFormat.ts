import type { Course } from "@/types/course";

export const PRICE_UNAVAILABLE = "요금 정보 준비 중";

/** 상세페이지 요금 정보 섹션 안내 문구 */
export const PRICE_REFERENCE_DISCLAIMER =
  "네이버 예약/홈페이지 참고 요금입니다. 실제 요금은 날짜, 시간대, 예약 조건에 따라 달라질 수 있습니다.";

export const PRICE_CHECK_ON_BOOKING_PAGE = "예약 페이지에서 확인해주세요";

export function getPriceMin(course: Course): number | undefined {
  if (course.priceMin != null && course.priceMin > 0) return course.priceMin;
  return undefined;
}

export function getPriceMax(course: Course): number | undefined {
  if (course.priceMax != null && course.priceMax > 0) return course.priceMax;
  return undefined;
}

export function hasPrice(course: Course): boolean {
  return getPriceMin(course) != null;
}

function formatManwon(value: number): string {
  if (value % 10000 === 0) return `${value / 10000}`;
  return `${Math.round(value / 10000)}`;
}

/** `10~20만 원` → `10~20만원` 등 표시용 공백 정리 */
export function normalizeCompactPriceDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === PRICE_UNAVAILABLE) return trimmed;
  return trimmed
    .replace(/\u00a0/g, "")
    .replace(/\s*만\s*원/g, "만원")
    .replace(/(\d)\s*~/g, "$1~")
    .replace(/~\s*(\d)/g, "~$1")
    .replace(/(\d)\s+만원/g, "$1만원");
}

export function formatCompactPriceRange(
  priceMin?: number | null,
  _priceMax?: number | null,
): string {
  const min =
    priceMin != null && priceMin > 0 ? Math.round(priceMin / 10000) : null;

  if (min != null) return `${min}만원~`;
  return "";
}

/** 단일 금액: `14만원` */
export function formatSinglePriceManwon(value: number): string {
  return `${formatManwon(value)}만원`;
}

/** 모바일 카드용 원화 표기: 만원 단위 정수면 `14만원`, 아니면 `59,000원` */
export function formatMobileWonAmount(value: number): string {
  if (value % 10000 === 0) {
    return `${value / 10000}만원`;
  }
  return `${value.toLocaleString("ko-KR")}원`;
}

/** 홈 추천: 최저가만 `22만원~` 형식 */
export function formatHomeCarouselPrice(course: Course): string {
  return formatPriceRange(course);
}

/** UI 표시용 참고 요금 — price_min만 사용 */
export function formatPublicPriceDisplay(course: Course): string {
  return formatPriceRange(course);
}

/** 요금 요약: `22만원~` / `요금 정보 준비 중` (max 미표시) */
export function formatPriceRange(course: Course): string {
  const min = getPriceMin(course);
  if (min == null) return PRICE_UNAVAILABLE;

  const compact = formatCompactPriceRange(min, null);
  return compact ? normalizeCompactPriceDisplay(compact) : PRICE_UNAVAILABLE;
}

/** Hero 뱃지: `22만원~` */
export function formatPriceBadge(course: Course): string {
  return formatPriceRange(course);
}

export interface CardPriceParts {
  label: string;
  value: string;
}

/** 목록 카드용 라벨 + 값 */
export function formatCardPriceParts(course: Course): CardPriceParts {
  const min = getPriceMin(course);
  if (min == null) {
    return { label: "요금", value: PRICE_UNAVAILABLE };
  }

  return {
    label: "참고 요금",
    value: normalizeCompactPriceDisplay(`${formatManwon(min)}만원~`),
  };
}
