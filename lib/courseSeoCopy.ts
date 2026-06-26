import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";
import { formatPriceRange, hasPrice } from "@/lib/priceFormat";
import {
  formatAliasesForMetaDescription,
  resolveCourseSearchAliases,
} from "@/lib/seo/courseNameAliases";
import { siteConfig } from "@/lib/siteConfig";
import type { CourseContentEnrichment } from "@/lib/enrichment/courseContentEnrichmentTypes";
import { isDisplayableEnrichment } from "@/lib/enrichment/courseContentEnrichmentTypes";

/** 네이버 Search Advisor·OG description 권장 길이 */
export const META_DESCRIPTION_MAX_LENGTH = 80;
export const META_DESCRIPTION_TARGET_MAX = 150;

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

export function buildCourseDetailDescription(
  course: Course,
  enrichment?: CourseContentEnrichment | null,
): string {
  const name = course.name.trim() || "골프장";
  const aliases = resolveCourseSearchAliases(course);
  const displayName = formatAliasesForMetaDescription(name, aliases);

  if (isDisplayableEnrichment(enrichment)) {
    const firstSentence =
      enrichment.featureSummary.split(/(?<=[.!?])\s+/)[0]?.trim() ??
      enrichment.featureSummary;
    const enriched = truncateMetaDescription(
      firstSentence,
      META_DESCRIPTION_TARGET_MAX,
    );
    if (enriched.length >= 40) return enriched;
  }

  const regionLabel = formatRegionLabel(course);
  const holeLabel = course.holeCount ? `${course.holeCount}홀 ` : "";
  const courseType = course.courseType?.trim() || "골프장";
  const locationPhrase = regionLabel ? `${regionLabel}에 위치한 ` : "";
  const base = `${displayName}은(는) ${locationPhrase}${holeLabel}${courseType} 골프장입니다. 접근성, 참고 요금, 전화번호, 지도 위치와 주변 골프장 정보를 ${siteConfig.siteName}에서 확인해보세요.`;
  return truncateMetaDescription(base, META_DESCRIPTION_TARGET_MAX);
}

export function resolveCourseIntroParagraph(
  course: Course,
  enrichment?: CourseContentEnrichment | null,
): string {
  if (isDisplayableEnrichment(enrichment)) {
    return enrichment.featureSummary.trim();
  }
  return buildCourseSeoIntroParagraph(course);
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

export function buildCourseJsonLdDescription(
  course: Course,
  enrichment?: CourseContentEnrichment | null,
): string {
  return truncateMetaDescription(
    resolveCourseIntroParagraph(course, enrichment),
    300,
  );
}
