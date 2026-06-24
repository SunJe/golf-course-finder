import type { Course } from "@/types/course";

export const PRICE_UNAVAILABLE = "요금 정보 준비 중";

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
  priceMax?: number | null,
): string {
  const min =
    priceMin != null && priceMin > 0 ? Math.round(priceMin / 10000) : null;
  const max =
    priceMax != null && priceMax > 0 ? Math.round(priceMax / 10000) : null;

  if (min != null && max != null) {
    if (min === max) return `${min}만원`;
    return `${min}~${max}만원`;
  }
  if (min != null) return `${min}만원~`;
  if (max != null) return `~${max}만원`;
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

/** 요금 요약: `9~11만원` / `9만원~` / `9만원` / `요금 정보 준비 중` */
export function formatPriceRange(course: Course): string {
  const min = getPriceMin(course);
  if (min == null) return PRICE_UNAVAILABLE;

  const max = getPriceMax(course);
  const compact = formatCompactPriceRange(min, max ?? null);
  return compact ? normalizeCompactPriceDisplay(compact) : PRICE_UNAVAILABLE;
}

/** Hero 뱃지: `예약가 9~11만원` / `최저 예약가 9만원~` */
export function formatPriceBadge(course: Course): string {
  const min = getPriceMin(course);
  if (min == null) return PRICE_UNAVAILABLE;

  const max = getPriceMax(course);
  if (max != null && max !== min) {
    return `예약가 ${formatManwon(min)}~${formatManwon(max)}만원`;
  }
  if (max != null && max === min) {
    return `예약가 ${formatManwon(min)}만원`;
  }
  return `최저 예약가 ${formatManwon(min)}만원~`;
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

  const max = getPriceMax(course);
  if (max != null && max !== min) {
    return {
      label: "예약가",
      value: normalizeCompactPriceDisplay(`${formatManwon(min)}~${formatManwon(max)}만원`),
    };
  }
  if (max != null && max === min) {
    return { label: "예약가", value: normalizeCompactPriceDisplay(`${formatManwon(min)}만원`) };
  }
  return {
    label: "최저 예약가",
    value: normalizeCompactPriceDisplay(`${formatManwon(min)}만원~`),
  };
}
