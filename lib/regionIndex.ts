import type { Course } from "@/types/course";
import {
  filterCoursesByRegion,
  getRegionLandingBySlug,
  regionLandingPages,
} from "@/lib/regionLanding";
import type { RegionSlug } from "@/lib/regionNormalize";

export const REGION_SLUGS: readonly RegionSlug[] = [
  "seoul",
  "gyeonggi",
  "incheon",
  "gangwon",
  "chungcheong",
  "jeolla",
  "gyeongsang",
  "jeju",
  "busan",
] as const;

export function computeRegionCounts(
  courses: Course[],
): Record<RegionSlug, number> {
  const counts = {} as Record<RegionSlug, number>;
  for (const slug of REGION_SLUGS) {
    const config = getRegionLandingBySlug(slug);
    counts[slug] = config ? filterCoursesByRegion(courses, config).length : 0;
  }
  return counts;
}

export function getSitemapRegionSlugs(
  counts: Record<RegionSlug, number>,
): RegionSlug[] {
  return REGION_SLUGS.filter((slug) => counts[slug] >= 1);
}

export function getNoindexRegionSlugs(
  counts: Record<RegionSlug, number>,
): RegionSlug[] {
  return REGION_SLUGS.filter((slug) => counts[slug] === 0);
}

export interface MobileHubRegionLink {
  label: string;
  href: string;
  ariaLabel: string;
}

/** 모바일 허브 3열 그리드용 지역 링크 (서울은 count>0일 때만) */
export function getMobileHubRegionLinks(
  counts: Record<RegionSlug, number>,
): MobileHubRegionLink[] {
  const links: MobileHubRegionLink[] = [
    {
      label: "서울근교",
      href: "/collections/near-seoul",
      ariaLabel: "서울 근교 골프장 보기",
    },
  ];

  if (counts.seoul > 0) {
    links.push({
      label: "서울",
      href: "/regions/seoul",
      ariaLabel: "서울 골프장 보기",
    });
  }

  const regionItems: { slug: RegionSlug; label: string }[] = [
    { slug: "gyeonggi", label: "경기" },
    { slug: "incheon", label: "인천" },
    { slug: "gangwon", label: "강원" },
    { slug: "chungcheong", label: "충청" },
    { slug: "jeolla", label: "전라" },
    { slug: "gyeongsang", label: "경상" },
    { slug: "jeju", label: "제주" },
    { slug: "busan", label: "부산" },
  ];

  for (const { slug, label } of regionItems) {
    links.push({
      label,
      href: `/regions/${slug}`,
      ariaLabel: `${label} 골프장 보기`,
    });
  }

  return links;
}

export { regionLandingPages };
