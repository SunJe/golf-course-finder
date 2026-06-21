import type { Course } from "@/types/course";
import {
  COLLECTION_SLUGS,
  isCollectionSlug,
  type CollectionSlug,
} from "@/lib/collectionLanding";
import {
  scoreBaekdoriFriendly,
  scoreBeginnerFriendly,
} from "@/lib/collectionScores";
import {
  courseHasValidHomepage,
  courseHasValidPhone,
} from "@/lib/regionContactValidation";
import { getDifficultyScore } from "@/lib/difficulty";
import { getPriceMin } from "@/lib/priceFormat";

export const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 };

const NEAR_SEOUL_KM_PRIMARY = 80;
const NEAR_SEOUL_KM_FALLBACK = 100;
const NEAR_SEOUL_MIN_RESULTS = 20;

export const BUDGET_BOTTOM_PERCENT = 0.3;
export const BUDGET_MAX_COURSES = 120;

const PUBLIC_KEYWORDS = ["대중제", "퍼블릭", "public"];
const PAR3_KEYWORDS = ["파3", "par3", "par 3", "파 3"];
const NINE_HOLE_KEYWORDS = [
  "9홀",
  "나인홀",
  "nine hole",
  "nine-hole",
  "9 hole",
];

const BAEKDORI_LOW_PRICE_THRESHOLD = 120_000;

export interface CourseWithMeta extends Course {
  distanceKm?: number;
  referenceScore?: number;
}

/** @deprecated Use CourseWithMeta */
export type NearSeoulCourse = CourseWithMeta;
/** @deprecated Use CourseWithMeta */
export type ScoredCourse = CourseWithMeta;

export function normalizeText(value?: string | null): string {
  return value?.trim() ?? "";
}

export function includesAny(text: string, keywords: string[]): boolean {
  const haystack = text.toLowerCase();
  return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
}

export function hasValidPhone(course: Course): boolean {
  return courseHasValidPhone(course);
}

export function hasValidHomepage(course: Course): boolean {
  return courseHasValidHomepage(course);
}

export function hasValidPrice(course: Course): boolean {
  return getPriceMin(course) != null;
}

export { getDifficultyScore } from "@/lib/difficulty";

function searchableCourseText(course: Course): string {
  return [
    course.name,
    course.courseType,
    course.description,
    course.priceText,
    course.address,
    course.region,
    course.city,
    ...course.tags,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

export function isPublicCourse(course: Course): boolean {
  if (course.courseType === "대중제") return true;
  return includesAny(searchableCourseText(course), PUBLIC_KEYWORDS);
}

export function isPar3Course(course: Course): boolean {
  const text = searchableCourseText(course);
  if (includesAny(text, PAR3_KEYWORDS)) return true;
  const tags = course.tags.map((t) => t.toLowerCase());
  return tags.some((t) => t.includes("par3") || t.includes("파3"));
}

export function isNineHoleCourse(course: Course): boolean {
  if (course.holeCount === 9) return true;
  return includesAny(searchableCourseText(course), NINE_HOLE_KEYWORDS);
}

function getNumericPriceMin(course: Course): number | null {
  const min = getPriceMin(course) ?? course.priceMin ?? course.weekdayGreenFeeMin;
  if (min != null && min > 0) return min;
  return null;
}

function isLowPriceCourse(
  course: Course,
  threshold = BAEKDORI_LOW_PRICE_THRESHOLD,
): boolean {
  const min = getNumericPriceMin(course);
  return min != null && min <= threshold;
}

export function hasBeginnerCoreCondition(course: Course): boolean {
  const score = getDifficultyScore(course.difficulty);
  if (score != null && score <= 2) return true;
  if (isPar3Course(course)) return true;
  if (isNineHoleCourse(course)) return true;
  return false;
}

export function hasBaekdoriCoreCondition(course: Course): boolean {
  const score = getDifficultyScore(course.difficulty);
  if (score != null && score <= 3) return true;
  if (isPar3Course(course)) return true;
  if (isNineHoleCourse(course)) return true;
  if (isLowPriceCourse(course, 100_000)) return true;
  return false;
}

export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isGyeonggiIncheonAddress(course: Course): boolean {
  const haystack = `${course.region} ${course.city} ${course.address}`;
  return /경기|인천/.test(haystack);
}

function withDistance(course: Course): CourseWithMeta | null {
  if (
    !Number.isFinite(course.latitude) ||
    !Number.isFinite(course.longitude) ||
    course.latitude === 0 ||
    course.longitude === 0
  ) {
    return null;
  }
  const distanceKm = getDistanceKm(
    SEOUL_CITY_HALL.lat,
    SEOUL_CITY_HALL.lng,
    course.latitude,
    course.longitude,
  );
  return { ...course, distanceKm };
}

export function getNearSeoulCourses(courses: Course[]): CourseWithMeta[] {
  const withDistances = courses
    .map(withDistance)
    .filter((c): c is CourseWithMeta => c != null)
    .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  let radius = NEAR_SEOUL_KM_PRIMARY;
  let filtered = withDistances.filter(
    (c) => (c.distanceKm ?? Infinity) <= radius,
  );

  if (filtered.length < NEAR_SEOUL_MIN_RESULTS) {
    radius = NEAR_SEOUL_KM_FALLBACK;
    filtered = withDistances.filter(
      (c) => (c.distanceKm ?? Infinity) <= radius,
    );
  }

  if (filtered.length >= NEAR_SEOUL_MIN_RESULTS) {
    return filtered;
  }

  const fallbackByAddress = courses
    .filter(
      (c) =>
        !withDistances.some((d) => d.id === c.id) &&
        isGyeonggiIncheonAddress(c),
    )
    .map((c) => ({ ...c, distanceKm: undefined }));

  const merged = [...filtered, ...fallbackByAddress];
  return merged.sort((a, b) => {
    if (a.distanceKm != null && b.distanceKm != null) {
      return a.distanceKm - b.distanceKm;
    }
    if (a.distanceKm != null) return -1;
    if (b.distanceKm != null) return 1;
    return a.name.localeCompare(b.name, "ko");
  });
}

/** @deprecated Use getNearSeoulCourses */
export const filterNearSeoulCourses = getNearSeoulCourses;

function applyScoreThreshold(
  courses: CourseWithMeta[],
  minResults: number,
  maxResults?: number,
): CourseWithMeta[] {
  const positive = courses.filter((c) => (c.referenceScore ?? 0) > 0);
  if (positive.length === 0) return positive;

  const thresholds = [6, 5, 4, 3, 2, 1];
  let selected = positive;

  for (const threshold of thresholds) {
    const subset = positive.filter((c) => (c.referenceScore ?? 0) >= threshold);
    if (subset.length < minResults) continue;
    selected = subset;
    if (maxResults == null || subset.length <= maxResults) {
      break;
    }
  }

  const sorted = selected.sort((a, b) => {
    const diff = (b.referenceScore ?? 0) - (a.referenceScore ?? 0);
    if (diff !== 0) return diff;
    return a.name.localeCompare(b.name, "ko");
  });

  if (maxResults != null && sorted.length > maxResults) {
    return sorted.slice(0, maxResults);
  }

  return sorted;
}

export function getBeginnerScoreThreshold(courses: Course[]): number {
  const scored = courses
    .filter(hasBeginnerCoreCondition)
    .map((course) => scoreBeginnerFriendly(course).total);
  return resolveAppliedThreshold(scored, 20);
}

export function getBaekdoriScoreThreshold(courses: Course[]): number {
  const scored = courses
    .filter(hasBaekdoriCoreCondition)
    .map((course) => scoreBaekdoriFriendly(course).total);
  return resolveAppliedThreshold(scored, 20);
}

function resolveAppliedThreshold(scores: number[], minResults: number): number {
  const positive = scores.filter((score) => score > 0);
  if (positive.length === 0) return 0;

  for (const threshold of [4, 3, 2, 1]) {
    const subset = positive.filter((score) => score >= threshold);
    if (subset.length >= minResults || threshold === 1) {
      return threshold;
    }
  }

  return 1;
}

export function filterPublicCourses(courses: Course[]): CourseWithMeta[] {
  return courses
    .filter(isPublicCourse)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export function filterPar3Courses(courses: Course[]): CourseWithMeta[] {
  return courses
    .filter(isPar3Course)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export function filterNineHoleCourses(courses: Course[]): CourseWithMeta[] {
  return courses
    .filter(isNineHoleCourse)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export interface BudgetFilterResult {
  courses: CourseWithMeta[];
  cutoffPrice: number | null;
  takeCount: number;
  eligibleCount: number;
}

export function filterBudgetCoursesWithMeta(
  courses: Course[],
): BudgetFilterResult {
  const withNumericPrice = courses
    .map((course) => ({
      course,
      min: getNumericPriceMin(course),
    }))
    .filter(
      (entry): entry is { course: Course; min: number } => entry.min != null,
    )
    .sort((a, b) => {
      if (a.min !== b.min) return a.min - b.min;
      return a.course.name.localeCompare(b.course.name, "ko");
    });

  const takeCount = Math.min(
    Math.ceil(withNumericPrice.length * BUDGET_BOTTOM_PERCENT),
    BUDGET_MAX_COURSES,
  );
  const selected = withNumericPrice.slice(0, takeCount);
  const cutoffPrice =
    selected.length > 0 ? selected[selected.length - 1]!.min : null;

  return {
    courses: selected.map((entry) => entry.course),
    cutoffPrice,
    takeCount,
    eligibleCount: withNumericPrice.length,
  };
}

export function filterBudgetCourses(courses: Course[]): CourseWithMeta[] {
  return filterBudgetCoursesWithMeta(courses).courses;
}

export function filterBeginnerCourses(
  courses: Course[],
  options?: { minResults?: number; maxResults?: number },
): CourseWithMeta[] {
  const scored: CourseWithMeta[] = courses
    .filter(hasBeginnerCoreCondition)
    .map((course) => ({
      ...course,
      referenceScore: scoreBeginnerFriendly(course).total,
    }));
  return applyScoreThreshold(
    scored,
    options?.minResults ?? 20,
    options?.maxResults ?? 130,
  );
}

export function filterBaekdoriCourses(
  courses: Course[],
  options?: { minResults?: number; maxResults?: number },
): CourseWithMeta[] {
  const scored: CourseWithMeta[] = courses
    .filter(hasBaekdoriCoreCondition)
    .map((course) => ({
      ...course,
      referenceScore: scoreBaekdoriFriendly(course).total,
    }));
  return applyScoreThreshold(
    scored,
    options?.minResults ?? 20,
    options?.maxResults ?? 180,
  );
}

const PURPOSE_FILTER_FNS: Record<
  "public" | "baekdori" | "beginner" | "par3" | "nine-hole" | "budget",
  (courses: Course[], options?: { minResults?: number; maxResults?: number }) => CourseWithMeta[]
> = {
  public: filterPublicCourses,
  baekdori: filterBaekdoriCourses,
  beginner: filterBeginnerCourses,
  par3: filterPar3Courses,
  "nine-hole": filterNineHoleCourses,
  budget: filterBudgetCourses,
};

function applyPurposeFilter(
  courses: CourseWithMeta[],
  purpose: keyof typeof PURPOSE_FILTER_FNS,
  options?: { minResults?: number; maxResults?: number },
): CourseWithMeta[] {
  const filtered = PURPOSE_FILTER_FNS[purpose](courses, options);
  const metaById = new Map(courses.map((course) => [course.id, course]));

  return filtered.map((course) => {
    const source = metaById.get(course.id);
    if (!source) return course;
    return {
      ...course,
      distanceKm: source.distanceKm ?? course.distanceKm,
      referenceScore: course.referenceScore ?? source.referenceScore,
    };
  });
}

export function applyCollectionFilter(
  courses: Course[],
  slug: CollectionSlug,
): CourseWithMeta[] {
  switch (slug) {
    case "near-seoul":
      return getNearSeoulCourses(courses);
    case "public":
      return filterPublicCourses(courses);
    case "baekdori":
      return filterBaekdoriCourses(courses, {
        minResults: 50,
        maxResults: 180,
      });
    case "beginner":
      return filterBeginnerCourses(courses, {
        minResults: 50,
        maxResults: 130,
      });
    case "par3":
      return filterPar3Courses(courses);
    case "nine-hole":
      return filterNineHoleCourses(courses);
    case "budget":
      return filterBudgetCourses(courses);
    case "near-seoul-public":
      return applyPurposeFilter(getNearSeoulCourses(courses), "public");
    case "near-seoul-baekdori":
      return applyPurposeFilter(
        getNearSeoulCourses(courses),
        "baekdori",
        { minResults: 20, maxResults: 100 },
      );
    case "near-seoul-beginner":
      return applyPurposeFilter(
        getNearSeoulCourses(courses),
        "beginner",
        { minResults: 20, maxResults: 80 },
      );
    case "near-seoul-budget":
      return applyPurposeFilter(getNearSeoulCourses(courses), "budget");
    case "near-seoul-nine-hole":
      return applyPurposeFilter(getNearSeoulCourses(courses), "nine-hole");
    case "near-seoul-par3":
      return applyPurposeFilter(getNearSeoulCourses(courses), "par3");
    default:
      return [];
  }
}

export type CollectionFilterFn = (courses: Course[]) => CourseWithMeta[];

export function getCollectionFilterFn(
  slug: string,
): CollectionFilterFn | null {
  if (!isCollectionSlug(slug)) return null;
  return (courses) => applyCollectionFilter(courses, slug);
}

/** budget 정렬용 — scoreBreakdown.price 참고 */
export { scoreBudgetFriendly } from "@/lib/collectionScores";
