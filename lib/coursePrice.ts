import type { Course } from "@/types/course";
import {
  formatCardPriceParts,
  formatMobileWonAmount,
  formatPriceRange,
  getPriceMax,
  getPriceMin,
  hasPrice,
  PRICE_UNAVAILABLE,
} from "@/lib/priceFormat";

export {
  formatPriceRange,
  formatPriceBadge,
  hasPrice,
  getPriceMin,
  getPriceMax,
} from "@/lib/priceFormat";

/** @deprecated use hasPrice */
export const hasReservationPrice = hasPrice;

/** @deprecated use getPriceMin */
export const getReservationPriceMin = getPriceMin;

/** @deprecated use getPriceMax */
export const getReservationPriceMax = getPriceMax;

/** @deprecated use formatCardPriceParts */
export const formatCardReservationPriceParts = formatCardPriceParts;

/** @deprecated use formatCardPriceParts().value */
export function formatCardReservationPrice(course: Course): string {
  return formatCardPriceParts(course).value;
}

/** 상세 페이지 요약 */
export function formatDetailReservationPriceSummary(course: Course): string {
  const summary = formatPriceRange(course);
  if (summary === PRICE_UNAVAILABLE) return summary;
  return summary;
}

export type MobilePriceTone = "highlight" | "muted";

export interface MobilePriceText {
  value: string;
  tone: MobilePriceTone;
}

const MOBILE_PRICE_UNAVAILABLE = "요금 정보 없음";

/** 모바일 리스트 카드 전용 가격 (라벨 없음, 범위 미표시, min 우선) */
export function getMobilePriceText(course: Course): MobilePriceText {
  const min = getPriceMin(course);
  if (min != null) {
    return {
      value: `${formatMobileWonAmount(min)}~`,
      tone: "highlight",
    };
  }

  const max = getPriceMax(course);
  if (max != null) {
    return {
      value: `~${formatMobileWonAmount(max)}`,
      tone: "highlight",
    };
  }

  return {
    value: MOBILE_PRICE_UNAVAILABLE,
    tone: "muted",
  };
}
