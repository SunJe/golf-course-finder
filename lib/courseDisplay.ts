import type { Course } from "@/types/course";
import { formatPrice } from "@/lib/format";

export function formatOptionalPrice(value?: number): string {
  if (value == null || value <= 0) return "가격 정보 없음";
  return formatPrice(value);
}

export function formatGreenFeeShortOptional(value?: number): string {
  if (value == null || value <= 0) return "가격 정보 없음";
  if (value % 10000 === 0) return `${value / 10000}만원~`;
  return `${Math.round(value / 10000)}만원~`;
}

export function formatHoleCount(holeCount?: number): string {
  return holeCount ? `${holeCount}홀` : "홀수 정보 없음";
}

export function getCourseDescription(course: Course): string {
  if (course.description?.trim()) return course.description.trim();
  const hole = course.holeCount ? `${course.holeCount}홀 ` : "";
  return `${course.name}은(는) ${course.region} 지역의 ${hole}${course.courseType} 골프장입니다.`;
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
