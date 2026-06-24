import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";
import { formatPriceRange, hasPrice } from "@/lib/priceFormat";
import {
  formatAliasesForMetaDescription,
  resolveCourseSearchAliases,
} from "@/lib/seo/courseNameAliases";
import { siteConfig } from "@/lib/siteConfig";

/** 네이버 Search Advisor·OG description 권장 길이 */
export const META_DESCRIPTION_MAX_LENGTH = 80;

/** 메타 description용 — 공백 정리 후 최대 길이 제한 */
export function truncateMetaDescription(
  text: string,
  maxLength = META_DESCRIPTION_MAX_LENGTH,
): string {
  const normalized = text.trim().replace(/\s+/g, " ");
  if (normalized.length <= maxLength) return normalized;
  const cut = normalized.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.6) {
    return `${cut.slice(0, lastSpace)}…`;
  }
  return `${cut}…`;
}

export function formatRegionLabel(course: Course): string {
  const parts = [course.region?.trim(), course.city?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join("·") : "";
}

export function buildCourseDetailDescription(course: Course): string {
  const name = course.name.trim() || "골프장";
  const aliases = resolveCourseSearchAliases(course);
  const displayName = formatAliasesForMetaDescription(name, aliases);
  const base = `${displayName}의 주소, 전화번호, 홈페이지, 예약 참고 요금 정보를 ${siteConfig.siteName}에서 확인하세요.`;
  return truncateMetaDescription(base);
}

/** 상세 본문 — 크롤러·사용자용 짧은 소개 */
export function buildCourseSeoIntroParagraph(course: Course): string {
  const name = course.name.trim() || "골프장";
  const regionLabel = formatRegionLabel(course);
  const courseType = course.courseType?.trim() || "골프장";
  const holeLabel = course.holeCount ? `${course.holeCount}홀 ` : "";

  const locationPhrase = regionLabel
    ? `${regionLabel}에 위치한 `
    : "";

  let sentence = `${name}은(는) ${locationPhrase}${holeLabel}${courseType} 골프장입니다.`;

  if (hasPrice(course)) {
    sentence += ` 참고 요금은 ${formatPriceRange(course)}입니다.`;
  }

  const infoFields = ["주소", "전화번호", "홈페이지"];
  if (hasPrice(course)) infoFields.push("참고 요금");
  infoFields.push("지도 위치", "주변 골프장");

  sentence += ` ${siteConfig.siteName}에서는 ${name}의 ${infoFields.join(", ")}을 확인할 수 있습니다.`;

  return sentence;
}

export function buildCourseJsonLdDescription(course: Course): string {
  return truncateMetaDescription(buildCourseSeoIntroParagraph(course), 300);
}
