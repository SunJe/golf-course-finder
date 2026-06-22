import type { Course } from "@/types/course";
import { extractCourseCity } from "@/lib/regionCityHelpers";
import {
  resolveCourseRegionSlug,
  type RegionSlug,
} from "@/lib/regionNormalize";

const SLUG_TO_LABEL: Record<RegionSlug, string> = {
  seoul: "서울",
  gyeonggi: "경기",
  incheon: "인천",
  gangwon: "강원",
  chungcheong: "충청",
  jeolla: "전라",
  gyeongsang: "경상",
  jeju: "제주",
  busan: "부산",
};

/** 필터 chip·집계용 정규화 지역명 (서울, 경기, 인천, …) */
export function getNormalizedRegionLabel(
  course: Pick<Course, "region" | "city" | "address">,
): string | null {
  const slug = resolveCourseRegionSlug(course);
  return slug ? SLUG_TO_LABEL[slug] : null;
}

/** @deprecated use getNormalizedRegionLabel — 레거시 호환 */
export function normalizeRegion(
  input?: string | null,
  address?: string | null,
): string | null {
  return getNormalizedRegionLabel({
    region: input ?? "",
    city: "",
    address: address ?? "",
  });
}

export function getDisplayRegion(
  course: Pick<Course, "region" | "city" | "address">,
): string | null {
  return getNormalizedRegionLabel(course);
}

export function getDisplayCity(course: Course): string | null {
  const regionLabel = getNormalizedRegionLabel(course);
  const address = course.address?.trim() ?? "";
  const cityRaw = course.city?.trim() ?? "";

  if (regionLabel === "인천") {
    const district = address.match(
      /인천(?:광역시|특별자치시|시)?\s+([가-힣]+(?:구|군))/,
    );
    if (district) return district[1];

    const fromCity = cityRaw.match(/([가-힣]+(?:구|군))/);
    if (fromCity && !/^인천/.test(fromCity[1])) return fromCity[1];
  }

  let local = extractCourseCity(course) ?? cityRaw;
  if (!local) return null;

  local = local
    .replace(/^경기도\s*/, "")
    .replace(/^경기\s*/, "")
    .replace(/^서울특별시\s*/, "")
    .replace(/^서울\s*/, "")
    .replace(/^인천광역시\s*/, "")
    .replace(/^인천특별자치시\s*/, "")
    .replace(/^인천시\s*/, "")
    .replace(/^인천\s*/, "")
    .replace(/^부산광역시\s*/, "")
    .replace(/^부산\s*/, "")
    .trim();

  if (!local) return null;
  if (regionLabel && (local === regionLabel || local === `${regionLabel}시`)) {
    return null;
  }

  return local;
}

/** 카드·리스트 공통: `인천 · 서구`, `경기 · 용인시` */
export function formatCourseLocationLabel(course: Course): string {
  const region = getDisplayRegion(course);
  const city = getDisplayCity(course);

  if (region && city) return `${region} · ${city}`;
  if (region) return region;
  if (city) return city;

  const fallback = [course.city?.trim(), course.region?.trim()]
    .filter(Boolean)
    .join(" · ");
  return fallback || "정보 준비 중";
}

export function courseMatchesRegionFilter(
  course: Course,
  filterRegion: string,
): boolean {
  const normalized = getNormalizedRegionLabel(course);
  if (normalized) return normalized === filterRegion;
  return course.region?.trim() === filterRegion;
}

export { SLUG_TO_LABEL as REGION_SLUG_LABELS };
