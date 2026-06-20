import type { Course, CourseSource, CourseType } from "@/types/course";
import type { GolfCourseRow } from "@/types/database";

const COURSE_TYPES: CourseType[] = ["대중제", "회원제", "군 골프장", "기타"];
const COURSE_SOURCES: CourseSource[] = [
  "mock",
  "public_data",
  "manual",
  "naver",
  "kakao",
];

function toOptionalString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toOptionalNumber(value: number | null | undefined): number | undefined {
  return value == null ? undefined : value;
}

function toCourseType(value: string | null | undefined): CourseType {
  if (value && COURSE_TYPES.includes(value as CourseType)) {
    return value as CourseType;
  }
  return "기타";
}

function toCourseSource(value: string | null | undefined): CourseSource {
  if (value && COURSE_SOURCES.includes(value as CourseSource)) {
    return value as CourseSource;
  }
  return "manual";
}

function toBoolean(value: boolean | null | undefined): boolean | undefined {
  return value == null ? undefined : value;
}

function toTags(value: string[] | null | undefined): string[] {
  return value ?? [];
}

function toUpdatedAt(value: string | null | undefined): string {
  return value?.trim() || new Date().toISOString();
}

/** DB row → 프론트엔드 Course */
export function mapGolfCourseRowToCourse(row: GolfCourseRow): Course {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    city: row.city?.trim() || row.region,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: toOptionalString(row.phone),
    homepageUrl: toOptionalString(row.homepage_url),
    bookingUrl: toOptionalString(row.booking_url),
    holeCount: toOptionalNumber(row.hole_count),
    courseType: toCourseType(row.course_type),
    weekdayGreenFeeMin: toOptionalNumber(row.weekday_green_fee_min),
    weekendGreenFeeMin: toOptionalNumber(row.weekend_green_fee_min),
    caddieFee: toOptionalNumber(row.caddie_fee),
    cartFee: toOptionalNumber(row.cart_fee),
    nightRound: toBoolean(row.night_round),
    noCaddie: toBoolean(row.no_caddie),
    twoPlayerAllowed: toBoolean(row.two_player_allowed),
    resort: toBoolean(row.resort),
    tags: toTags(row.tags),
    imageUrl: toOptionalString(row.image_url),
    description: toOptionalString(row.description),
    businessStatus: toOptionalString(row.business_status),
    source: toCourseSource(row.source),
    updatedAt: toUpdatedAt(row.updated_at),
    priceText: toOptionalString(row.price_text),
    priceMin: toOptionalNumber(row.price_min),
    priceMax: toOptionalNumber(row.price_max),
    priceType: toOptionalString(row.price_type),
    priceSourceUrl: toOptionalString(row.price_source_url),
    priceUpdatedAt: toOptionalString(row.price_updated_at),
  };
}

/** Course → DB insert/update row */
export function mapCourseToGolfCourseRow(course: Course): GolfCourseRow {
  return {
    id: course.id,
    name: course.name,
    region: course.region,
    city: course.city || null,
    address: course.address,
    latitude: course.latitude,
    longitude: course.longitude,
    phone: course.phone ?? null,
    homepage_url: course.homepageUrl ?? null,
    booking_url: course.bookingUrl ?? null,
    hole_count: course.holeCount ?? null,
    course_type: course.courseType,
    weekday_green_fee_min: course.weekdayGreenFeeMin ?? null,
    weekend_green_fee_min: course.weekendGreenFeeMin ?? null,
    caddie_fee: course.caddieFee ?? null,
    cart_fee: course.cartFee ?? null,
    night_round: course.nightRound ?? false,
    no_caddie: course.noCaddie ?? false,
    two_player_allowed: course.twoPlayerAllowed ?? false,
    resort: course.resort ?? false,
    tags: course.tags.length > 0 ? course.tags : [],
    image_url: course.imageUrl ?? null,
    description: course.description ?? null,
    business_status: course.businessStatus ?? null,
    source: course.source,
    updated_at: course.updatedAt,
    price_text: course.priceText ?? null,
    price_min: course.priceMin ?? null,
    price_max: course.priceMax ?? null,
    price_type: course.priceType ?? null,
    price_source_url: course.priceSourceUrl ?? null,
    price_updated_at: course.priceUpdatedAt ?? null,
  };
}
