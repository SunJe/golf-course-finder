import type { Course } from "@/types/course";
import { buildCourseJsonLdDescription } from "@/lib/courseSeoCopy";
import { getCourseContentEnrichment } from "@/lib/enrichment/courseContentEnrichmentStore";
import { getPriceMax, getPriceMin, hasPrice } from "@/lib/priceFormat";
import { isValidCourseCoordinates } from "@/lib/focusCourse";
import { resolveCourseSearchAliases } from "@/lib/seo/courseNameAliases";
import { absoluteUrl } from "@/lib/siteConfig";

function buildPriceRange(course: Course): string | undefined {
  if (!hasPrice(course)) return undefined;

  const min = getPriceMin(course);
  if (min == null) return undefined;

  const max = getPriceMax(course);
  if (max != null && max !== min) {
    return `₩${min.toLocaleString("ko-KR")}-₩${max.toLocaleString("ko-KR")}`;
  }
  return `₩${min.toLocaleString("ko-KR")}+`;
}

function compactJsonLd(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) =>
        entry !== undefined &&
        entry !== null &&
        entry !== "" &&
        !(Array.isArray(entry) && entry.length === 0),
    ),
  );
}

/** 상세 페이지 GolfCourse JSON-LD */
export default function CourseJsonLd({ course }: { course: Course }) {
  const enrichment = getCourseContentEnrichment(course.id);
  const pageUrl = absoluteUrl(`/courses/${course.id}`);
  const homepage = course.homepageUrl?.trim();
  const aliases = resolveCourseSearchAliases(course);
  const alternateName = [
    ...new Set(
      aliases
        .map((alias) => alias.trim())
        .filter((alias) => alias && alias !== course.name.trim()),
    ),
  ];

  const jsonLd = compactJsonLd({
    "@context": "https://schema.org",
    "@type": "GolfCourse",
    name: course.name.trim(),
    alternateName: alternateName.length > 0 ? alternateName : undefined,
    url: pageUrl,
    description: buildCourseJsonLdDescription(course, enrichment),
    telephone: course.phone?.trim(),
    sameAs: homepage ? [homepage] : undefined,
    address: course.address?.trim()
      ? {
          "@type": "PostalAddress",
          streetAddress: course.address.trim(),
          addressCountry: "KR",
        }
      : undefined,
    geo: isValidCourseCoordinates(course)
      ? {
          "@type": "GeoCoordinates",
          latitude: course.latitude,
          longitude: course.longitude,
        }
      : undefined,
    priceRange: buildPriceRange(course),
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
