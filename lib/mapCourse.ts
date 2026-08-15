import type { Course, CourseSource, CourseType } from "@/types/course";
import type { GolfCourseRow } from "@/types/database";

/** Public, narrow DTO used only by the interactive `/map` experience. */
export type MapCourse = Pick<
  Course,
  | "id"
  | "name"
  | "region"
  | "city"
  | "address"
  | "latitude"
  | "longitude"
  | "courseType"
  | "holeCount"
  | "phone"
  | "homepageUrl"
  | "tags"
  | "priceMin"
  | "priceMax"
  | "priceText"
  | "weekdayGreenFeeMin"
  | "nightRound"
  | "noCaddie"
  | "twoPlayerAllowed"
  | "resort"
  | "description"
  | "source"
  | "updatedAt"
>;

export const MAP_COURSE_SELECT = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "latitude",
  "longitude",
  "course_type",
  "hole_count",
  "phone",
  "homepage_url",
  "tags",
  "price_min",
  "price_max",
  "price_text",
  "weekday_green_fee_min",
  "night_round",
  "no_caddie",
  "two_player_allowed",
  "resort",
  "description",
  "source",
  "updated_at",
].join(",");

export type MapGolfCourseRow = Pick<
  GolfCourseRow,
  | "id"
  | "name"
  | "region"
  | "city"
  | "address"
  | "latitude"
  | "longitude"
  | "course_type"
  | "hole_count"
  | "phone"
  | "homepage_url"
  | "tags"
  | "price_min"
  | "price_max"
  | "price_text"
  | "weekday_green_fee_min"
  | "night_round"
  | "no_caddie"
  | "two_player_allowed"
  | "resort"
  | "description"
  | "source"
  | "updated_at"
>;

const COURSE_TYPES: CourseType[] = ["대중제", "회원제", "군 골프장", "기타"];
const COURSE_SOURCES: CourseSource[] = [
  "mock",
  "public_data",
  "manual",
  "naver",
  "kakao",
];

function optionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function optionalNumber(value: number | null | undefined): number | undefined {
  return value == null ? undefined : value;
}

function optionalBoolean(
  value: boolean | null | undefined,
): boolean | undefined {
  return value == null ? undefined : value;
}

function courseType(value: string | null | undefined): CourseType {
  if (value && COURSE_TYPES.includes(value as CourseType)) {
    return value as CourseType;
  }
  throw new Error("Map course row has an invalid course_type");
}

function courseSource(value: string | null | undefined): CourseSource {
  if (value && COURSE_SOURCES.includes(value as CourseSource)) {
    return value as CourseSource;
  }
  throw new Error("Map course row has an invalid source");
}

function updatedAt(value: string | null | undefined): string {
  const trimmed = value?.trim();
  if (trimmed) return trimmed;
  throw new Error("Map course row has no updated_at value");
}

export function mapGolfCourseRowToMapCourse(
  row: MapGolfCourseRow,
): MapCourse {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    city: row.city?.trim() || row.region,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    courseType: courseType(row.course_type),
    holeCount: optionalNumber(row.hole_count),
    phone: optionalString(row.phone),
    homepageUrl: optionalString(row.homepage_url),
    tags: row.tags ?? [],
    priceMin: optionalNumber(row.price_min),
    priceMax: optionalNumber(row.price_max),
    priceText: optionalString(row.price_text),
    weekdayGreenFeeMin: optionalNumber(row.weekday_green_fee_min),
    nightRound: optionalBoolean(row.night_round),
    noCaddie: optionalBoolean(row.no_caddie),
    twoPlayerAllowed: optionalBoolean(row.two_player_allowed),
    resort: optionalBoolean(row.resort),
    description: optionalString(row.description),
    source: courseSource(row.source),
    updatedAt: updatedAt(row.updated_at),
  };
}

/** Keeps the pre-Phase-2A `/map` projection as the behavior-parity baseline. */
export function toMapCourse(course: Course): MapCourse {
  return {
    id: course.id,
    name: course.name,
    region: course.region,
    city: course.city,
    address: course.address,
    latitude: course.latitude,
    longitude: course.longitude,
    courseType: course.courseType,
    holeCount: course.holeCount,
    phone: course.phone,
    homepageUrl: course.homepageUrl,
    tags: course.tags,
    priceMin: course.priceMin,
    priceMax: course.priceMax,
    priceText: course.priceText,
    weekdayGreenFeeMin: course.weekdayGreenFeeMin,
    nightRound: course.nightRound,
    noCaddie: course.noCaddie,
    twoPlayerAllowed: course.twoPlayerAllowed,
    resort: course.resort,
    description: course.description,
    source: course.source,
    updatedAt: course.updatedAt,
  };
}

export function toMapCourses(courses: Course[]): MapCourse[] {
  return courses.map(toMapCourse);
}
