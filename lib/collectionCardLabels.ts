import type { Course } from "@/types/course";
import type { CollectionSlug } from "@/lib/collectionLanding";
import {
  isNearSeoulCollectionSlug,
  computeCollectionStats,
} from "@/lib/collectionLanding";
import {
  isPublicCourse,
  isNineHoleCourse,
  type CourseWithMeta,
} from "@/lib/collectionFilters";
import { hasPrice } from "@/lib/priceFormat";
import { courseHasPriceInfo } from "@/lib/regionLanding";

export interface CollectionStatItem {
  label: string;
  value: number;
}

export interface CardMetaBadge {
  text: string;
  active: boolean;
}

const SORT_DESCRIPTIONS: Record<CollectionSlug, string> = {
  "near-seoul": "서울시청 기준 가까운 순으로 정렬했습니다.",
  public: "대중제 또는 퍼블릭으로 분류된 골프장을 정리했습니다.",
  baekdori: "백돌이 골퍼가 참고하기 좋은 조건을 기준으로 정리했습니다.",
  beginner: "초보자가 참고하기 좋은 조건을 기준으로 정리했습니다.",
  par3: "파3·Par3로 분류된 골프장을 정리했습니다.",
  "nine-hole": "9홀 또는 나인홀로 분류된 골프장을 정리했습니다.",
  budget: "참고 최저가 낮은 순으로 정렬했습니다.",
  "near-seoul-public":
    "서울 근교 골프장 중 대중제 또는 퍼블릭으로 분류된 곳을 정리했습니다.",
  "near-seoul-baekdori":
    "서울 근교 골프장 중 백돌이 골퍼가 참고하기 좋은 조건을 기준으로 정리했습니다.",
  "near-seoul-beginner":
    "서울 근교 골프장 중 초보자가 참고하기 좋은 조건을 기준으로 정리했습니다.",
  "near-seoul-budget":
    "서울 근교 골프장 중 참고 최저가 낮은 순으로 정렬했습니다.",
  "near-seoul-nine-hole":
    "서울 근교 골프장 중 9홀 또는 나인홀로 분류된 곳을 정리했습니다.",
  "near-seoul-par3":
    "서울 근교 골프장 중 파3·Par3로 분류된 곳을 정리했습니다.",
};

function isBudgetSlug(slug: CollectionSlug): boolean {
  return slug === "budget" || slug === "near-seoul-budget";
}

function isBaekdoriSlug(slug: CollectionSlug): boolean {
  return slug === "baekdori" || slug === "near-seoul-baekdori";
}

function isBeginnerSlug(slug: CollectionSlug): boolean {
  return slug === "beginner" || slug === "near-seoul-beginner";
}

function countWithDistance(courses: CourseWithMeta[]): number {
  return courses.filter((c) => c.distanceKm != null).length;
}

export function buildCollectionSortDescription(slug: CollectionSlug): string {
  return SORT_DESCRIPTIONS[slug];
}

export function buildCollectionDisplayStats(
  slug: CollectionSlug,
  courses: Course[],
): CollectionStatItem[] {
  const meta = courses as CourseWithMeta[];
  const base = computeCollectionStats(courses);
  const items: CollectionStatItem[] = [];

  const add = (label: string, value: number) => {
    if (value > 0) items.push({ label, value });
  };

  add("전체", base.total);

  if (isBudgetSlug(slug)) {
    add("요금 정보", base.withPrice);
    add("전화번호", base.withPhone);
    add("홈페이지", base.withHomepage);
    add("대중제", courses.filter(isPublicCourse).length);
    return items;
  }

  if (isBaekdoriSlug(slug)) {
    add("대중제", courses.filter(isPublicCourse).length);
    add("나인홀", courses.filter(isNineHoleCourse).length);
    add("요금 정보", base.withPrice);
    add("전화번호", base.withPhone);
    if (isNearSeoulCollectionSlug(slug)) {
      add("거리 정보", countWithDistance(meta));
    }
    return items;
  }

  if (isBeginnerSlug(slug)) {
    add("대중제", courses.filter(isPublicCourse).length);
    add("나인홀", courses.filter(isNineHoleCourse).length);
    add("요금 정보", base.withPrice);
    add("전화번호", base.withPhone);
    if (isNearSeoulCollectionSlug(slug)) {
      add("거리 정보", countWithDistance(meta));
    }
    return items;
  }

  if (slug === "near-seoul" || isNearSeoulCollectionSlug(slug)) {
    add("거리 정보", countWithDistance(meta));
    add("전화번호", base.withPhone);
    add("홈페이지", base.withHomepage);
    add("요금 정보", base.withPrice);
    return items;
  }

  if (slug === "public") {
    add("전화번호", base.withPhone);
    add("홈페이지", base.withHomepage);
    add("요금 정보", base.withPrice);
    return items;
  }

  if (slug === "nine-hole") {
    add("대중제", courses.filter(isPublicCourse).length);
    add("전화번호", base.withPhone);
    add("홈페이지", base.withHomepage);
    add("요금 정보", base.withPrice);
    return items;
  }

  add("전화번호", base.withPhone);
  add("홈페이지", base.withHomepage);
  add("요금 정보", base.withPrice);

  return items;
}

export function buildCourseSelectionReasons(
  course: Course,
  slug: CollectionSlug,
  meta: CourseWithMeta,
  mobile = false,
): string[] {
  const labels: string[] = [];
  const limit = mobile ? 2 : 3;

  if (isNearSeoulCollectionSlug(slug)) {
    labels.push("서울 근교");
  }

  if (isBudgetSlug(slug)) {
    if (hasPrice(course)) labels.push("참고 최저가");
    else if (courseHasPriceInfo(course)) labels.push("요금 정보");
  } else if (courseHasPriceInfo(course)) {
    labels.push("참고 요금");
  }

  if (isPublicCourse(course)) labels.push("대중제");
  if (isNineHoleCourse(course)) labels.push("9홀");

  if (
    isNearSeoulCollectionSlug(slug) &&
    meta.distanceKm != null &&
    labels.length < limit
  ) {
    labels.push(`서울시청 기준 약 ${meta.distanceKm.toFixed(1)}km`);
  }

  const unique = [...new Set(labels)];
  return unique.slice(0, limit);
}

export function buildCardMetaBadges(options: {
  slug: CollectionSlug;
  meta: CourseWithMeta;
  hasPhone: boolean;
  hasHomepage: boolean;
  mobile?: boolean;
}): CardMetaBadge[] {
  const { slug, meta, hasPhone, hasHomepage, mobile } = options;
  const badges: CardMetaBadge[] = [];

  if (isNearSeoulCollectionSlug(slug) && meta.distanceKm != null) {
    badges.push({
      text: `서울시청 기준 약 ${meta.distanceKm.toFixed(1)}km`,
      active: true,
    });
  }

  badges.push({
    text: hasPhone ? "전화번호 있음" : "전화번호 없음",
    active: hasPhone,
  });

  badges.push({
    text: hasHomepage ? "홈페이지 있음" : "홈페이지 없음",
    active: hasHomepage,
  });

  const limit = mobile ? 2 : 3;
  return badges.slice(0, limit);
}

export function getCollectionTypeDisclaimer(slug: CollectionSlug): string | null {
  switch (slug) {
    case "baekdori":
    case "near-seoul-baekdori":
      return "이 목록은 GolfMap Korea 데이터 기준 참고용입니다. 운영 형태, 홀 수, 참고 요금 등을 함께 반영해 백돌이 골퍼가 부담을 줄여볼 수 있는 조건의 골프장을 정리했습니다. 실제 체감 난이도와 요금은 코스 상태, 시즌, 예약 조건에 따라 달라질 수 있습니다.";
    case "beginner":
    case "near-seoul-beginner":
      return "초보자가 참고하기 좋은 조건의 골프장을 GolfMap Korea 데이터 기준으로 정리했습니다. 홀 수, 운영 형태, 참고 요금 등을 함께 반영했으며 실제 체감 난이도는 개인 실력과 코스 상태에 따라 달라질 수 있습니다.";
    case "budget":
    case "near-seoul-budget":
      return "참고 최저가 정보가 있는 골프장을 낮은 가격순으로 정리했습니다. 요금 정보는 참고용이며 실제 예약가와 다를 수 있습니다.";
    default:
      return null;
  }
}

/** @deprecated use buildCourseSelectionReasons */
export const buildCourseInclusionLabels = buildCourseSelectionReasons;
