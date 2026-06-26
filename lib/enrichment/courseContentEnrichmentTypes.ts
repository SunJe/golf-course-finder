export type CourseContentEnrichmentStatus =
  | "pending"
  | "enriched"
  | "needs_review"
  | "failed";

export type CourseContentConfidence = "high" | "medium" | "low";

export type CourseContentSourceType =
  | "official"
  | "visitKorea"
  | "naverSearch"
  | "googleSearch"
  | "blog"
  | "map"
  | "existingData";

export interface CourseContentEnrichment {
  courseId: string;
  slug?: string;
  name: string;
  aliases?: string[];
  region?: string;
  city?: string;
  address?: string;
  enrichmentStatus: CourseContentEnrichmentStatus;
  featureSummary: string;
  recommendationReasons: string[];
  featureTags: string[];
  sourceUrls: string[];
  sourceTypes: CourseContentSourceType[];
  visitKoreaImages?: string[];
  visitKoreaContentId?: string;
  imageSource?: "visitKorea";
  imageAttribution?: "ⓒ한국관광콘텐츠랩";
  imageMatchConfidence?: "exact" | "high" | "medium" | "low" | "ambiguous";
  confidence: CourseContentConfidence;
  updatedAt: string;
  notes?: string;
}

export interface CourseContentEnrichmentCheckpoint {
  lastIndex: number;
  lastCourseId: string;
  lastCourseName: string;
  processedCount: number;
  enrichedCount: number;
  failedCount: number;
  stoppedAt?: string;
  stopReason?: string;
}

export interface CourseContentEnrichmentFile {
  version: number;
  updatedAt: string;
  mode?: "pilot" | "full";
  checkpoint?: CourseContentEnrichmentCheckpoint;
  items: Record<string, CourseContentEnrichment>;
}

export const COURSE_CONTENT_ENRICHMENT_PATH =
  "data/course-content-enrichment.json";

export const COURSE_CONTENT_ENRICHMENT_CHECKPOINT_PATH =
  "data/course-content-enrichment.checkpoint.json";

/** Pilot 대상 — 인천·가평·서울 근교·데이터 충분/부족 혼합 */
export const PILOT_COURSE_IDS = [
  "gc-60319bf1693c", // 인천그랜드CC
  "gc-fa86c43067e7", // 드림파크CC
  "gc-fa55dbc73e9b", // 베어즈베스트청라GC
  "gc-68bd427a4957", // 송도골프클럽
  "gc-496303f3c77c", // 오렌지듄스 영종
  "gc-3f766167d45e", // 잭니클라우스GC코리아
  "gc-d14f87b6bb30", // 썬힐GC
  "gc-8503021b2f0d", // 리앤리CC
  "gc-068617149ff3", // 베뉴지CC
  "gc-a8d0095f2145", // 가평 베네스트GC
  "gc-f0e079a5a368", // 크리스탈밸리CC
  "gc-14a40331e62c", // 마이다스밸리 청평
  "gc-81becbdb274e", // 파주제이퍼블릭
  "gc-18640b625b94", // 올림픽 골프장
  "gc-81ecacc0ae41", // 라싸GC
  "gc-29fa36946d15", // 남양주CC
  "gc-8fbc2ee961a0", // 고양CC
  "gc-41b5c15f44da", // 일산스프링힐스CC
  "gc-4487ee52808c", // 코리아퍼블릭CC
  "gc-5ec5b76d3c22", // 화성골프클럽
] as const;

export function isDisplayableEnrichment(
  enrichment: CourseContentEnrichment | null | undefined,
): enrichment is CourseContentEnrichment {
  if (!enrichment?.featureSummary?.trim()) return false;
  return (
    enrichment.enrichmentStatus === "enriched" ||
    enrichment.enrichmentStatus === "needs_review"
  );
}
