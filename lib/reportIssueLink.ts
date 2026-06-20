import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";
import { getCoursePageUrl } from "@/lib/contactMailto";
import { siteConfig } from "@/lib/siteConfig";

function fieldOrMissing(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed || "정보 없음";
}

/** 문의/제보 수신 이메일 (NEXT_PUBLIC_CONTACT_EMAIL → siteConfig → fallback) */
export function getReportContactEmail(): string {
  return siteConfig.contactEmail;
}

/**
 * 골프장 상세 — 정보 수정 제보 mailto URL.
 * DB 제보 폼으로 교체 시 이 함수만 대체하면 된다.
 */
export function createCourseReportIssueMailto(course: Course): string {
  const email = getReportContactEmail();
  const pageUrl = getCoursePageUrl(course.id, siteConfig.siteUrl);
  const subject = `[GolfMap 정보 수정 제보] ${course.name}`;

  const body = [
    "안녕하세요. GolfMap 정보 수정 제보드립니다.",
    "",
    `골프장명: ${course.name}`,
    `페이지 URL: ${pageUrl}`,
    `주소: ${fieldOrMissing(course.address)}`,
    `전화번호: ${fieldOrMissing(course.phone)}`,
    `홈페이지: ${fieldOrMissing(course.homepageUrl)}`,
    `운영 형태: ${fieldOrMissing(course.courseType)}`,
    `홀수: ${formatHoleCount(course.holeCount)}`,
    "",
    "수정이 필요한 내용:",
    "- ",
    "",
    "확인 가능한 출처 URL:",
    "- ",
    "",
    "감사합니다.",
  ].join("\n");

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
