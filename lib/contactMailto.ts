import type { Course } from "@/types/course";
import { siteConfig } from "@/lib/siteConfig";

/** 브라우저 origin 또는 NEXT_PUBLIC_SITE_URL */
export function resolveSiteOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return siteConfig.siteUrl || "https://golfmap.kr";
}

export function getCoursePageUrl(courseId: string, origin?: string): string {
  const base = (origin ?? resolveSiteOrigin()).replace(/\/$/, "");
  const path = `/courses/${courseId}`;
  return base ? `${base}${path}` : path;
}

/** 상세페이지 정보 수정 제보 mailto URL */
export function buildCourseCorrectionMailto(
  course: Pick<Course, "id" | "name">,
  origin?: string,
): string {
  const pageUrl = getCoursePageUrl(course.id, origin);
  const subject = `[GolfMap 정보 수정 제보] ${course.name}`;
  const body = [
    `골프장명: ${course.name}`,
    `페이지: ${pageUrl}`,
    "",
    "수정할 내용:",
    "",
  ].join("\n");

  const params = new URLSearchParams({ subject, body });
  return `mailto:${siteConfig.contactEmail}?${params.toString()}`;
}
