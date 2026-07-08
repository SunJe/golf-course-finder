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
import {
  formatCourseDisplayName,
  formatNaturalLocationLabel,
  looksLikeSoftParticleTemplate,
} from "@/lib/koreanParticles";

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
  return formatNaturalLocationLabel(course.region, course.city);
}

function courseTypeLabel(course: Course): string {
  const raw = course.courseType?.trim();
  if (!raw || raw === "골프장") return "";
  return raw;
}

/**
 * 조사 강제 부착 대신 위치·규모를 앞에 두는 안전한 소개 문장.
 * 예: "충주시에 위치한 대영베이스CC는 18홀 대중제 골프장입니다."
 */
export function buildCourseSeoIntroParagraph(course: Course): string {
  const name = formatCourseDisplayName(course.name.trim() || "골프장");
  const location = formatRegionLabel(course);
  const type = courseTypeLabel(course);
  const holeLabel = course.holeCount
    ? formatHoleCount(course.holeCount)
    : "";

  const sizeParts = [holeLabel, type].filter(Boolean).join(" ");

  let sentence: string;
  if (location && sizeParts) {
    sentence = `${location}에 위치한 ${name}는 ${sizeParts} 골프장입니다.`;
  } else if (location) {
    sentence = `${name}의 위치는 ${location}입니다.`;
  } else if (sizeParts) {
    sentence = `${name}는 ${sizeParts} 규모로 등록되어 있습니다.`;
  } else {
    sentence = `${name}의 위치·연락처·지도 정보를 아래에서 확인할 수 있습니다.`;
  }

  if (hasPrice(course)) {
    sentence += ` 현재 등록된 참고 요금은 ${formatPriceRange(course)}입니다.`;
  }

  const infoFields = ["주소", "전화번호", "홈페이지"];
  if (hasPrice(course)) infoFields.push("참고 요금");
  infoFields.push("지도 위치", "주변 골프장");
  sentence += ` ${siteConfig.siteName}에서는 ${infoFields.join(", ")}을 확인할 수 있습니다.`;

  return sentence.replace(/\s+/g, " ").trim();
}

export function buildCourseDetailDescription(
  course: Course,
  enrichment?: CourseContentEnrichment | null,
): string {
  const name = formatCourseDisplayName(course.name.trim() || "골프장");
  const aliases = resolveCourseSearchAliases(course);
  const displayName = formatAliasesForMetaDescription(name, aliases);

  if (
    isDisplayableEnrichment(enrichment) &&
    !looksLikeSoftParticleTemplate(enrichment.featureSummary)
  ) {
    const firstSentence =
      enrichment.featureSummary.split(/(?<=[.!?])\s+/)[0]?.trim() ??
      enrichment.featureSummary;
    const enriched = truncateMetaDescription(
      firstSentence,
      META_DESCRIPTION_TARGET_MAX,
    );
    if (enriched.length >= 40) return enriched;
  }

  void displayName;
  return truncateMetaDescription(
    buildCourseSeoIntroParagraph(course),
    META_DESCRIPTION_TARGET_MAX,
  );
}

export function resolveCourseIntroParagraph(
  course: Course,
  enrichment?: CourseContentEnrichment | null,
): string {
  if (
    isDisplayableEnrichment(enrichment) &&
    !looksLikeSoftParticleTemplate(enrichment.featureSummary)
  ) {
    return enrichment.featureSummary.trim();
  }
  return buildCourseSeoIntroParagraph(course);
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
