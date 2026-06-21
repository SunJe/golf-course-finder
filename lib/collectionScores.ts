import type { Course } from "@/types/course";
import { getDifficultyScore, hasValidDifficulty } from "@/lib/difficulty";
import { courseHasValidPhone, courseHasValidHomepage } from "@/lib/regionContactValidation";

/** GolfMap Korea 데이터 기준 참고용 분류 — 절대값·보장 표현 금지 */

export interface CollectionScoreBreakdown {
  total: number;
  difficulty: number;
  holeCount: number;
  courseType: number;
  price: number;
  contact: number;
  region: number;
}

function isPar3Course(course: Course): boolean {
  const tags = course.tags.map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("par3") || t.includes("파3"))) return true;
  return course.holeCount != null && course.holeCount <= 9;
}

function isNineHoleCourse(course: Course): boolean {
  return course.holeCount != null && course.holeCount <= 9;
}

function isPublicCourse(course: Course): boolean {
  return course.courseType === "대중제";
}

function isLowPrice(course: Course, threshold = 100_000): boolean {
  const price = course.priceMin ?? course.weekdayGreenFeeMin;
  return price != null && price > 0 && price <= threshold;
}

function isSeoulMetro(course: Course): boolean {
  const haystack = `${course.region} ${course.city} ${course.address}`;
  return /서울|경기|인천/.test(haystack);
}

function difficultyPointsForBeginner(course: Course): number {
  if (!hasValidDifficulty(course.difficulty)) return 0;
  const score = getDifficultyScore(course.difficulty);
  if (score == null) return 0;
  if (score <= 1) return 4;
  if (score <= 2) return 2;
  return 0;
}

function difficultyPointsForBaekdori(course: Course): number {
  if (!hasValidDifficulty(course.difficulty)) return 0;
  const score = getDifficultyScore(course.difficulty);
  if (score == null) return 0;
  if (score <= 2) return 3;
  if (score <= 3) return 2;
  return 0;
}

/** 초보자 컬렉션 참고 점수 (높을수록 초보 친화 지표가 많음) */
export function scoreBeginnerFriendly(course: Course): CollectionScoreBreakdown {
  const difficulty = difficultyPointsForBeginner(course);
  const holeCount =
    (isPar3Course(course) ? 4 : 0) + (isNineHoleCourse(course) ? 3 : 0);
  const courseType = isPublicCourse(course) ? 2 : 0;
  const price = isLowPrice(course) ? 1 : 0;
  const contact =
    (courseHasValidPhone(course) ? 1 : 0) +
    (courseHasValidHomepage(course) ? 1 : 0);

  return {
    total: difficulty + holeCount + courseType + price + contact,
    difficulty,
    holeCount,
    courseType,
    price,
    contact,
    region: 0,
  };
}

/** 백돌이 컬렉션 참고 점수 */
export function scoreBaekdoriFriendly(course: Course): CollectionScoreBreakdown {
  const difficulty = difficultyPointsForBaekdori(course);
  const holeCount =
    (isPar3Course(course) ? 3 : 0) + (isNineHoleCourse(course) ? 3 : 0);
  const courseType = isPublicCourse(course) ? 3 : 0;
  const price = isLowPrice(course, 120_000) ? 2 : 0;
  const region = isSeoulMetro(course) ? 1 : 0;

  return {
    total: difficulty + holeCount + courseType + price + region,
    difficulty,
    holeCount,
    courseType,
    price,
    contact: 0,
    region,
  };
}

/** 저렴한 골프장 — difficulty는 보조, price_min 우선 */
export function scoreBudgetFriendly(course: Course): CollectionScoreBreakdown {
  const priceMin = course.priceMin ?? course.weekdayGreenFeeMin;
  let price = 0;
  if (priceMin != null && priceMin > 0) {
    if (priceMin <= 80_000) price = 5;
    else if (priceMin <= 100_000) price = 4;
    else if (priceMin <= 120_000) price = 3;
    else if (priceMin <= 150_000) price = 2;
    else price = 1;
  }

  const difficulty =
    hasValidDifficulty(course.difficulty) && getDifficultyScore(course.difficulty) != null
      ? 1
      : 0;

  return {
    total: price + difficulty + (isPublicCourse(course) ? 1 : 0),
    difficulty,
    holeCount: 0,
    courseType: isPublicCourse(course) ? 1 : 0,
    price,
    contact: 0,
    region: 0,
  };
}
