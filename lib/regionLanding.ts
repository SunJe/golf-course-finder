import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";
import { hasPrice, formatPriceRange, formatPublicPriceDisplay } from "@/lib/priceFormat";
import { PRICE_FAQ_ANSWER, REPORT_ISSUE_ANSWER } from "@/lib/contentGuides";
import {
  resolveCourseRegionSlug,
  type RegionSlug,
} from "@/lib/regionNormalize";
import {
  formatCityNameList,
  getTopCityDisplayNames,
  type CityGroup,
} from "@/lib/regionCityHelpers";
import {
  courseHasValidHomepage,
  courseHasValidPhone,
} from "@/lib/regionContactValidation";

export interface RegionLandingConfig {
  slug: string;
  label: string;
  aliases: string[];
  title: string;
  description: string;
}

export const regionLandingPages: RegionLandingConfig[] = [
  {
    slug: "seoul",
    label: "서울",
    aliases: ["서울", "서울시", "서울특별시"],
    title: "서울 골프장 지도",
    description:
      "서울 골프장의 위치, 참고 요금, 연락처, 지도 링크를 비교해 라운드 계획에 활용할 수 있습니다.",
  },
  {
    slug: "gyeonggi",
    label: "경기",
    aliases: ["경기", "경기도"],
    title: "경기 골프장 지도",
    description:
      "경기 골프장의 위치, 참고 요금, 연락처, 지도 링크를 비교해 서울 근교 라운드 후보를 찾아보세요.",
  },
  {
    slug: "incheon",
    label: "인천",
    aliases: ["인천", "인천시", "인천광역시"],
    title: "인천 골프장 지도",
    description:
      "인천 골프장을 찾는 분들을 위해 코스 위치, 참고 요금, 연락처, 지도 링크를 함께 정리했습니다.",
  },
  {
    slug: "gangwon",
    label: "강원",
    aliases: ["강원", "강원도", "강원특별자치도"],
    title: "강원 골프장 지도",
    description:
      "강원 골프장의 위치, 참고 요금, 연락처를 지역별로 비교해 주말·휴양 라운드 계획에 활용하세요.",
  },
  {
    slug: "chungcheong",
    label: "충청",
    aliases: ["충청", "충북", "충남", "충청북도", "충청남도", "세종"],
    title: "충청 골프장 지도",
    description:
      "충청·세종 골프장의 위치, 참고 요금, 연락처, 홈페이지 링크를 한곳에서 비교할 수 있습니다.",
  },
  {
    slug: "jeolla",
    label: "전라",
    aliases: ["전라", "전북", "전남", "전라북도", "전라남도"],
    title: "전라 골프장 지도",
    description:
      "전라 골프장의 위치, 참고 요금, 연락처를 지역별로 확인하고 라운드 계획에 참고하세요.",
  },
  {
    slug: "gyeongsang",
    label: "경상",
    aliases: ["경상", "경북", "경남", "경상북도", "경상남도", "울산", "대구"],
    title: "경상 골프장 지도",
    description:
      "경상·울산·대구 골프장의 위치, 참고 요금, 연락처를 지역별로 비교해 보세요.",
  },
  {
    slug: "jeju",
    label: "제주",
    aliases: ["제주", "제주도", "제주특별자치도"],
    title: "제주 골프장 지도",
    description:
      "제주 골프장의 위치, 참고 요금, 연락처, 홈페이지 링크를 비교해 여행·라운드 계획에 활용하세요.",
  },
  {
    slug: "busan",
    label: "부산",
    aliases: ["부산", "부산시", "부산광역시"],
    title: "부산 골프장 지도",
    description:
      "부산 골프장의 위치, 참고 요금, 연락처, 지도 링크를 비교해 라운드 후보를 찾아보세요.",
  },
];

export function getRegionLandingBySlug(
  slug: string,
): RegionLandingConfig | undefined {
  return regionLandingPages.find((page) => page.slug === slug);
}

/** region/city/address 기준 — 골프장명은 사용하지 않음 */
export function courseMatchesRegion(
  course: Course,
  config: RegionLandingConfig,
): boolean {
  const slug = resolveCourseRegionSlug(course);
  if (slug) {
    return slug === (config.slug as RegionSlug);
  }

  const region = course.region?.trim() ?? "";
  const city = course.city?.trim() ?? "";
  const address = course.address?.trim() ?? "";
  const aliases = config.aliases;

  return aliases.some(
    (alias) =>
      region.includes(alias) ||
      city.includes(alias) ||
      address.includes(alias),
  );
}

export function filterCoursesByRegion(
  courses: Course[],
  config: RegionLandingConfig,
): Course[] {
  return courses
    .filter((course) => courseMatchesRegion(course, config))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export interface RegionLandingStats {
  total: number;
  publicCount: number;
  memberCount: number;
  withPhone: number;
  withHomepage: number;
  withPrice: number;
}

export function courseHasPriceInfo(course: Course): boolean {
  return hasPrice(course) || Boolean(course.priceText?.trim());
}

export function computeRegionStats(courses: Course[]): RegionLandingStats {
  return {
    total: courses.length,
    publicCount: courses.filter((c) => c.courseType === "대중제").length,
    memberCount: courses.filter((c) => c.courseType === "회원제").length,
    withPhone: courses.filter((c) => courseHasValidPhone(c)).length,
    withHomepage: courses.filter((c) => courseHasValidHomepage(c)).length,
    withPrice: courses.filter((c) => courseHasPriceInfo(c)).length,
  };
}

function infoCompletenessScore(course: Course): number {
  let score = 0;
  if (courseHasValidPhone(course)) score += 2;
  if (courseHasValidHomepage(course)) score += 2;
  if (courseHasPriceInfo(course)) score += 2;
  if (course.address?.trim()) score += 1;
  return score;
}

/** 정보 완성도 상위 N개 */
export function pickFeaturedCourses(
  courses: Course[],
  limit = 5,
): Course[] {
  return [...courses]
    .sort((a, b) => {
      const diff = infoCompletenessScore(b) - infoCompletenessScore(a);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name, "ko");
    })
    .filter((course) => infoCompletenessScore(course) >= 3)
    .slice(0, limit);
}

export function buildRegionSummaryLine(
  label: string,
  stats: RegionLandingStats,
): string {
  return `${label} 지역 골프장 ${stats.total}곳 · 대중제 ${stats.publicCount}곳 · 회원제 ${stats.memberCount}곳 · 전화번호 ${stats.withPhone}곳 · 홈페이지 ${stats.withHomepage}곳 · 요금 정보 ${stats.withPrice}곳`;
}

export function buildRegionHeroDescription(
  label: string,
  stats: RegionLandingStats,
  courses: Course[],
): string {
  const topCities = getTopCityDisplayNames(courses, 3);
  const cityPhrase = topCities.length
    ? `${formatCityNameList(topCities)} 등 시군구별 골프장과`
    : "골프장과";

  return `${label} 지역 골프장 ${stats.total}곳의 위치, 주소, 전화번호, 홈페이지, 참고 요금을 한눈에 확인하세요. ${cityPhrase} 대중제·회원제 골프장을 함께 비교할 수 있습니다.`;
}

export function buildRegionSeoParagraph(
  label: string,
  _stats: RegionLandingStats,
  courses: Course[],
): string {
  const topCities = getTopCityDisplayNames(courses, 4);
  const cityPhrase = topCities.length
    ? `${formatCityNameList(topCities)} 등 ${label} 지역`
    : `${label} 지역`;

  return `${label} 지역 골프장을 시·군·구별로 살펴볼 수 있는 페이지입니다. ${cityPhrase} 골프장의 주소, 전화번호, 홈페이지, 참고 요금을 비교하고, 상세 페이지에서 주변 골프장도 함께 확인할 수 있습니다.`;
}

export interface RegionHeroPill {
  suffix: string;
  value: number;
}

export function buildRegionHeroPills(
  _label: string,
  stats: RegionLandingStats,
): RegionHeroPill[] {
  return [
    { suffix: "골프장", value: stats.total },
    { suffix: "대중제", value: stats.publicCount },
    { suffix: "회원제", value: stats.memberCount },
    { suffix: "요금 정보", value: stats.withPrice },
    { suffix: "전화번호", value: stats.withPhone },
  ];
}

export function buildConditionalSectionIntro(
  label: string,
  section: ConditionalSectionConfig,
  count: number,
): string {
  switch (section.key) {
    case "public":
      return `${label} 지역에서 대중제로 운영되는 골프장입니다. 총 ${count.toLocaleString("ko-KR")}곳`;
    case "member":
      return `${label} 지역에서 회원제로 운영되는 골프장입니다. 총 ${count.toLocaleString("ko-KR")}곳`;
    case "withPrice":
      return `참고 요금 정보가 등록된 ${label} 지역 골프장입니다. 실제 요금은 날짜, 시간대, 예약 조건에 따라 달라질 수 있습니다. 총 ${count.toLocaleString("ko-KR")}곳`;
    case "withPhone":
      return `전화번호가 등록된 ${label} 지역 골프장입니다. 총 ${count.toLocaleString("ko-KR")}곳`;
    case "withHomepage":
      return `홈페이지 링크가 등록된 ${label} 지역 골프장입니다. 총 ${count.toLocaleString("ko-KR")}곳`;
    default:
      return `${section.description} 총 ${count.toLocaleString("ko-KR")}곳`;
  }
}

export function getCityQuickLinkDescription(
  label: string,
  courses: Course[],
): string {
  const topCities = getTopCityDisplayNames(courses, 3);
  const cityPhrase = topCities.length
    ? formatCityNameList(topCities)
    : label;
  return `${label} 지역 골프장을 시·군·구별로 확인해보세요. ${cityPhrase} 등 골프장이 많은 지역을 빠르게 살펴볼 수 있습니다.`;
}

export interface RegionFaqItem {
  question: string;
  answer: string;
}

export function buildRegionFaqItems(
  label: string,
  stats: RegionLandingStats,
): RegionFaqItem[] {
  return [
    {
      question: `${label} 골프장은 몇 곳이 등록되어 있나요?`,
      answer: `GolfMap Korea ${label} 골프장 지도에는 현재 ${stats.total}곳이 등록되어 있습니다. 대중제 ${stats.publicCount}곳, 회원제 ${stats.memberCount}곳으로 분류되어 있습니다.`,
    },
    {
      question: `${label} 대중제 골프장도 확인할 수 있나요?`,
      answer: `네. ${label} 지역 대중제 골프장 ${stats.publicCount}곳을 이 페이지의 '대중제 골프장' 섹션에서 바로 확인할 수 있습니다.`,
    },
    {
      question: `${label} 골프장 전화번호와 홈페이지를 볼 수 있나요?`,
      answer: `${label} 지역 ${stats.total}곳 중 전화번호가 등록된 곳은 ${stats.withPhone}곳, 홈페이지 링크가 있는 곳은 ${stats.withHomepage}곳입니다. 각 골프장 상세 페이지에서 연락처와 홈페이지를 확인할 수 있습니다.`,
    },
    {
      question: "요금 정보는 실제 예약가인가요?",
      answer: `${PRICE_FAQ_ANSWER} ${label} 지역 ${stats.withPrice}곳에서 참고 요금 정보를 제공합니다.`,
    },
    {
      question: "골프장 정보가 틀린 경우 어떻게 제보하나요?",
      answer: REPORT_ISSUE_ANSWER,
    },
  ];
}

export type ConditionalFilterKey =
  | "public"
  | "member"
  | "withPrice"
  | "withPhone"
  | "withHomepage";

export interface ConditionalSectionConfig {
  key: ConditionalFilterKey;
  id: string;
  title: string;
  description: string;
}

export const CONDITIONAL_SECTIONS: ConditionalSectionConfig[] = [
  {
    key: "public",
    id: "public-courses",
    title: "퍼블릭(대중제) 골프장",
    description: "대중제로 운영되는 골프장입니다.",
  },
  {
    key: "member",
    id: "member-courses",
    title: "회원제 골프장",
    description: "회원제로 운영되는 골프장입니다.",
  },
  {
    key: "withPrice",
    id: "with-price",
    title: "요금 정보가 있는 골프장",
    description: "참고 요금 정보가 등록된 골프장입니다.",
  },
  {
    key: "withPhone",
    id: "with-phone",
    title: "전화번호가 있는 골프장",
    description: "연락처(전화번호)가 등록된 골프장입니다.",
  },
  {
    key: "withHomepage",
    id: "with-homepage",
    title: "홈페이지가 있는 골프장",
    description: "공식 홈페이지 링크가 등록된 골프장입니다.",
  },
];

export const CONDITIONAL_CHIP_LABELS: Record<ConditionalFilterKey, string> = {
  public: "대중제 골프장",
  member: "회원제 골프장",
  withPrice: "요금 정보 있는 골프장",
  withPhone: "전화번호 있는 골프장",
  withHomepage: "홈페이지 있는 골프장",
};

export function buildConditionalChipLabel(
  key: ConditionalFilterKey,
  count: number,
): string {
  const base = CONDITIONAL_CHIP_LABELS[key];
  return count > 0 ? `${base} ${count.toLocaleString("ko-KR")}곳` : base;
}

/** 메인 흐름에 표시할 조건별 섹션 (public → member → price) */
export const PRIMARY_CONDITIONAL_SECTIONS: ConditionalSectionConfig[] =
  CONDITIONAL_SECTIONS.filter((s) =>
    ["public", "member", "withPrice"].includes(s.key),
  );

/** 칩 anchor용 — phone/homepage 포함 전체 */
export const SECONDARY_CONDITIONAL_SECTIONS: ConditionalSectionConfig[] =
  CONDITIONAL_SECTIONS.filter((s) =>
    ["withPhone", "withHomepage"].includes(s.key),
  );

export function filterCoursesByCondition(
  courses: Course[],
  key: ConditionalFilterKey,
): Course[] {
  switch (key) {
    case "public":
      return courses.filter((c) => c.courseType === "대중제");
    case "member":
      return courses.filter((c) => c.courseType === "회원제");
    case "withPrice":
      return courses.filter((c) => courseHasPriceInfo(c));
    case "withPhone":
      return courses.filter((c) => courseHasValidPhone(c));
    case "withHomepage":
      return courses.filter((c) => courseHasValidHomepage(c));
    default:
      return courses;
  }
}

export function pickRepresentativeCourses(
  courses: Course[],
  limit = 3,
): Course[] {
  return pickFeaturedCourses(courses, limit).length >= limit
    ? pickFeaturedCourses(courses, limit)
    : [...courses]
        .sort((a, b) => a.name.localeCompare(b.name, "ko"))
        .slice(0, limit);
}

export function getCityQuickLinkTitle(label: string): string {
  return `시·군·구별 ${label} 골프장`;
}

export function getRegionMapHref(slug: string): string {
  return `/map?region=${encodeURIComponent(slug)}`;
}

/** 메인 지도 REGIONS 필터 값 — 없으면 slug 기반 랜딩 필터 사용 */
export function getRegionMapFilterRegion(slug: string): string | null {
  switch (slug) {
    case "seoul":
      return "서울";
    case "gyeonggi":
      return "경기";
    case "incheon":
      return "인천";
    case "gangwon":
      return "강원";
    case "chungcheong":
      return "충청";
    case "jeolla":
      return "전라";
    case "gyeongsang":
      return "경상";
    case "jeju":
      return "제주";
    case "busan":
      return "부산";
    default:
      return null;
  }
}

export function buildRegionAllCoursesDescription(label: string): string {
  return `${label} 지역에 등록된 골프장 전체 목록입니다. 각 골프장 상세페이지에서 주소, 전화번호, 홈페이지, 참고 요금과 주변 골프장 정보를 확인할 수 있습니다.`;
}

export { courseHasValidPhone, courseHasValidHomepage } from "@/lib/regionContactValidation";

export { type CityGroup };

export function formatRegionCoursePrice(course: Course): string {
  return formatPublicPriceDisplay(course);
}

export function formatRegionCourseMeta(course: Course): string {
  const parts: string[] = [course.courseType || "기타"];
  if (course.holeCount) parts.push(formatHoleCount(course.holeCount));
  return parts.join(" · ");
}
