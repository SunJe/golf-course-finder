export type CourseType = "대중제" | "회원제" | "군 골프장" | "기타";

export interface Course {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  homepageUrl: string;
  bookingUrl: string;
  holeCount: number;
  courseType: CourseType;
  weekdayGreenFeeMin: number;
  weekendGreenFeeMin: number;
  caddieFee: number;
  cartFee: number;
  nightRound: boolean;
  noCaddie: boolean;
  twoPlayerAllowed: boolean;
  resort: boolean;
  tags: string[];
  imageUrl: string;
  description: string;
  updatedAt: string;
}

/** UI 필터 상태 */
export interface CourseFilters {
  query: string;
  region: string;
  holeCount: string;
  courseType: string;
  priceRange: string;
  tags: string[];
}

export const EMPTY_FILTERS: CourseFilters = {
  query: "",
  region: "전체",
  holeCount: "전체",
  courseType: "전체",
  priceRange: "전체",
  tags: [],
};
