export type CourseType = "대중제" | "회원제" | "군 골프장" | "기타";

export type CourseSource =
  | "mock"
  | "public_data"
  | "manual"
  | "naver"
  | "kakao";

export interface Course {
  id: string;
  name: string;
  /** enrichment CSV / Supabase 보강용 검색 대표명 */
  changeNameTo?: string;
  /** SEO·내부 검색용 별칭 (CC/GC/컨트리클럽 등) */
  searchAliases?: string[];
  /** Supabase search_keywords (공백 구분 문자열) */
  searchKeywords?: string | null;
  region: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  homepageUrl?: string;
  bookingUrl?: string;
  holeCount?: number;
  courseType: CourseType;
  weekdayGreenFeeMin?: number;
  weekendGreenFeeMin?: number;
  caddieFee?: number;
  cartFee?: number;
  nightRound?: boolean;
  noCaddie?: boolean;
  twoPlayerAllowed?: boolean;
  resort?: boolean;
  tags: string[];
  imageUrl?: string;
  description?: string;
  businessStatus?: string;
  source: CourseSource;
  updatedAt: string;
  /** Naver reservation price (from enrichment CSV → Supabase) */
  priceText?: string;
  priceMin?: number;
  priceMax?: number;
  priceType?: string;
  priceSourceUrl?: string;
  priceUpdatedAt?: string;
  /** Naver/enrichment course difficulty (0–10 scale or text) */
  difficulty?: string | null;
}

/** UI 필터 상태 — 그룹 내 OR, 그룹 간 AND */
export interface CourseFilters {
  query: string;
  regions: string[];
  holeCounts: string[];
  courseTypes: string[];
  priceRanges: string[];
  tags: string[];
}

export const EMPTY_FILTERS: CourseFilters = {
  query: "",
  regions: [],
  holeCounts: [],
  courseTypes: [],
  priceRanges: [],
  tags: [],
};
