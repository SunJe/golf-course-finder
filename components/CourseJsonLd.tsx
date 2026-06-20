import type { Course } from "@/types/course";
import { getPriceMax, getPriceMin, hasPrice } from "@/lib/priceFormat";
import { isValidCourseCoordinates } from "@/lib/focusCourse";

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

/** 상세 페이지 Place / LocalBusiness JSON-LD */
export default function CourseJsonLd({ course }: { course: Course }) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Place", "LocalBusiness"],
    name: course.name.trim(),
  };

  if (course.address?.trim()) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: course.address.trim(),
      addressCountry: "KR",
    };
  }

  if (course.phone?.trim()) {
    jsonLd.telephone = course.phone.trim();
  }

  if (course.homepageUrl?.trim()) {
    jsonLd.url = course.homepageUrl.trim();
  }

  if (isValidCourseCoordinates(course)) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: course.latitude,
      longitude: course.longitude,
    };
  }

  const priceRange = buildPriceRange(course);
  if (priceRange) {
    jsonLd.priceRange = priceRange;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
