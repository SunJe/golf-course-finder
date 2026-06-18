import type { Course } from "@/types/course";
import { formatPrice } from "@/lib/format";

export function isPriceAvailable(value?: number): boolean {
  return value != null && value > 0;
}

export function formatOptionalPrice(value?: number): string {
  if (!isPriceAvailable(value)) return "가격 정보 없음";
  return formatPrice(value!);
}

export function formatGreenFeeShortOptional(value?: number): string {
  if (!isPriceAvailable(value)) return "가격 정보 없음";
  if (value! % 10000 === 0) return `${value! / 10000}만원~`;
  return `${Math.round(value! / 10000)}만원~`;
}

export function formatHoleCount(holeCount?: number): string {
  return holeCount ? `${holeCount}홀` : "홀수 정보 없음";
}

export function getCourseDescription(course: Course): string {
  if (course.description?.trim()) return course.description.trim();
  return "기본 정보가 준비 중입니다.";
}

export function hasPhone(course: Course): boolean {
  return Boolean(course.phone?.trim());
}

export function hasHomepage(course: Course): boolean {
  return Boolean(course.homepageUrl?.trim());
}

export function hasBookingUrl(course: Course): boolean {
  return Boolean(course.bookingUrl?.trim());
}

export function hasAnyGreenFee(course: Course): boolean {
  return (
    isPriceAvailable(course.weekdayGreenFeeMin) ||
    isPriceAvailable(course.weekendGreenFeeMin)
  );
}
