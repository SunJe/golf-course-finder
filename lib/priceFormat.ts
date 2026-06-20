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

/** 요금 요약: `9~11만원` / `9만원~` / `9만원` / `요금 정보 준비 중` */
export function formatPriceRange(course: Course): string {
  const min = getPriceMin(course);
  if (min == null) return PRICE_UNAVAILABLE;

  const max = getPriceMax(course);
  if (max != null && max !== min) {
    return `${formatManwon(min)}~${formatManwon(max)}만원`;
  }
  if (max != null && max === min) {
    return `${formatManwon(min)}만원`;
  }
  return `${formatManwon(min)}만원~`;
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
      value: `${formatManwon(min)}~${formatManwon(max)}만원`,
    };
  }
  if (max != null && max === min) {
    return { label: "예약가", value: `${formatManwon(min)}만원` };
  }
  return { label: "최저 예약가", value: `${formatManwon(min)}만원~` };
}
