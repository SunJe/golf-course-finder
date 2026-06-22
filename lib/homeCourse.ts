import type { Course } from "@/types/course";

/**
 * 홈 페이지 클라이언트 전달용 경량 코스 DTO.
 * 지도·리스트·필터·모바일 카드에 필요한 필드만 포함한다.
 */
export type HomeCourse = Pick<
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
  | "difficulty"
  | "nightRound"
  | "noCaddie"
  | "twoPlayerAllowed"
  | "resort"
  | "description"
  | "source"
  | "updatedAt"
>;

/** 상세·컬렉션 필터에 불필요한 대용량/미사용 필드 제외 */
export function toHomeCourse(course: Course): HomeCourse {
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
    difficulty: course.difficulty,
    nightRound: course.nightRound,
    noCaddie: course.noCaddie,
    twoPlayerAllowed: course.twoPlayerAllowed,
    resort: course.resort,
    description: course.description,
    source: course.source,
    updatedAt: course.updatedAt,
  };
}

export function toHomeCourses(courses: Course[]): HomeCourse[] {
  return courses.map(toHomeCourse);
}
