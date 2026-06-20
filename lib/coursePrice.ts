import type { Course } from "@/types/course";
import {
  formatCardPriceParts,
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
