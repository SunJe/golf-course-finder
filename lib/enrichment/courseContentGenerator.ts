import type { Course } from "@/types/course";
import { formatHoleCount } from "@/lib/courseDisplay";
import { formatPriceRange, hasPrice } from "@/lib/priceFormat";
import { siteConfig } from "@/lib/siteConfig";
import type {
  CourseContentConfidence,
  CourseContentEnrichment,
  CourseContentEnrichmentStatus,
  CourseContentSourceType,
} from "@/lib/enrichment/courseContentEnrichmentTypes";
import { formatRegionLabel } from "@/lib/courseSeoCopy";

export interface BlogContentHint {
  description: string;
  recommendationReasons?: string[];
  blogSlug: string;
  blogTitle: string;
  sourceTypes?: CourseContentSourceType[];
}

export interface VisitKoreaCourseMeta {
  contentId?: string;
  overview?: string;
  homepage?: string;
  apiAddr?: string;
  images: string[];
  imageAttribution?: "ⓒ한국관광콘텐츠랩";
}

export interface GenerateCourseContentInput {
  course: Course;
  blogHint?: BlogContentHint;
  visitKoreaMeta?: VisitKoreaCourseMeta;
  officialUrl?: string;
  naverSearchUrl?: string;
}

const REPEATED_GOLFMAP_CLOSING =
  "GolfMap에서는 주소, 전화번호, 참고 요금, 지도 위치와 주변 골프장을 함께 비교할 수 있습니다.";

const COURSE_COPY_OVERRIDES: Record<
  string,
  {
    featureSummary: string;
    recommendationReasons: string[];
    confidence?: CourseContentConfidence;
    status?: CourseContentEnrichmentStatus;
    notes?: string;
  }
> = {
  "gc-a8d0095f2145": {
    featureSummary:
      "가평 베네스트G.C는 경기도 가평군 상면에 위치한 27홀 골프장입니다. 산세와 계곡 지형을 살린 코스로 소개되며, 메이플·파인·버치 3개 코스를 기준으로 라운드 계획을 세울 수 있습니다. 방문 전 공식 홈페이지에서 운영 정보와 예약 가능 시간을 확인하는 것이 좋습니다.",
    recommendationReasons: [
      "가평 상면에 위치한 27홀 골프장",
      "메이플·파인·버치 3개 코스 구성",
      "산세와 계곡 지형을 함께 살펴볼 수 있는 코스",
      "방문 전 공식 홈페이지에서 운영 정보 확인 필요",
    ],
    confidence: "high",
    status: "enriched",
    notes:
      "운영사 관련 혼동 가능성이 있는 문구를 제거하고 Visit Korea 메타와 기존 코스 데이터 기준으로 재작성했습니다.",
  },
  "gc-41b5c15f44da": {
    featureSummary:
      "일산스프링힐스 컨트리클럽은 고양시 일산동구에 위치한 9홀 대중제 골프장입니다. 일산·서울 서북부 생활권에서 이동 거리와 참고 요금을 함께 비교해볼 수 있습니다. 라운드 전 공식 홈페이지나 예약 페이지에서 운영 여부와 티타임을 확인하는 것이 좋습니다.",
    recommendationReasons: [
      "고양시 일산동구에 위치한 9홀 대중제 코스",
      "일산·서울 서북부 이동 동선을 함께 확인 가능",
      "요금은 날짜와 시간대에 따라 달라질 수 있음",
    ],
    confidence: "medium",
    status: "needs_review",
  },
  "gc-4487ee52808c": {
    featureSummary:
      "코리아대중CC는 용인 기흥권에서 확인할 수 있는 9홀 대중제 골프장입니다. 짧은 홀 구성과 경기 남부 접근성을 함께 고려해 라운드 후보로 비교해볼 수 있습니다. 방문 전 공식 홈페이지나 지도 서비스에서 운영 시간과 예약 가능 여부를 확인하는 것이 좋습니다.",
    recommendationReasons: [
      "용인 기흥권에서 확인할 수 있는 9홀 대중제 코스",
      "경기 남부와 서울 남부 이동 동선 비교 가능",
      "방문 전 운영 시간과 예약 가능 여부 확인 필요",
    ],
    confidence: "medium",
    status: "needs_review",
  },
  "gc-5ec5b76d3c22": {
    featureSummary:
      "화성골프클럽은 화성 남양읍에 위치한 9홀 대중제 골프장입니다. 경기 남부권에서 짧은 라운드를 계획할 때 홀 수, 참고 요금, 이동 동선을 함께 비교해볼 수 있습니다. 실제 요금과 예약 가능 시간은 방문 전 공식 채널에서 확인하는 것이 좋습니다.",
    recommendationReasons: [
      "화성 남양읍에 위치한 9홀 대중제 코스",
      "경기 남부권 이동 동선 비교 가능",
      "실제 요금과 예약 가능 시간은 방문 전 확인 필요",
    ],
    confidence: "medium",
    status: "needs_review",
  },
};

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function stripRepeatedGolfMapClosing(text: string): string {
  return text
    .replace(REPEATED_GOLFMAP_CLOSING, "")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeFeatureSummary(text: string): string {
  return stripRepeatedGolfMapClosing(text)
    .replace(/최고의?/g, "특징적인")
    .replace(/명품 퍼블릭/g, "프리미엄 성격의 퍼블릭")
    .replace(/강력 추천/g, "참고")
    .replace(/자주 추천됩니다/g, "자주 검색됩니다")
    .replace(/가성비가 좋습니다/g, "요금 비교가 필요합니다")
    .replace(/가성비 좋은/g, "비용 부담을 비교해볼 수 있는")
    .replace(/\s+/g, " ")
    .trim();
}

function buildFeatureSummaryFromBlog(
  course: Course,
  hint: BlogContentHint,
  confidence: CourseContentConfidence,
): string {
  const sentences = splitSentences(hint.description);
  const maxSentences = confidence === "high" ? 3 : 2;
  const body =
    sentences.length >= maxSentences
      ? sentences.slice(0, maxSentences).join(" ")
      : sentences.join(" ");

  const summary = sanitizeFeatureSummary(body);
  if (summary.length > 80) return summary;

  return `${summary} 방문 전 공식 홈페이지나 예약 페이지에서 운영 시간과 요금을 다시 확인하는 것이 좋습니다.`;
}

function buildFallbackFeatureSummary(course: Course): string {
  const name = course.name.trim() || "골프장";
  const regionLabel = formatRegionLabel(course);
  const courseType = course.courseType?.trim() || "골프장";
  const holeLabel = course.holeCount
    ? `${formatHoleCount(course.holeCount)} `
    : "";

  const locationPhrase = regionLabel
    ? `${regionLabel}에 위치한 `
    : "";

  let summary = `${name}은(는) ${locationPhrase}${holeLabel}${courseType} 골프장입니다.`;

  if (hasPrice(course)) {
    summary += ` 참고 요금은 ${formatPriceRange(course)}이며, 실제 요금은 날짜와 시간대에 따라 달라질 수 있습니다.`;
  } else {
    summary += " 요금과 운영 정보는 방문 전 공식 홈페이지나 지도 서비스에서 확인하는 것이 좋습니다.";
  }

  return summary;
}

function buildFallbackRecommendationReasons(course: Course): string[] {
  const regionLabel = formatRegionLabel(course) || "해당 지역";
  const reasons = [`${regionLabel}에서 라운드 후보를 비교할 때 참고할 수 있는 골프장`];

  if (course.holeCount === 9) {
    reasons.push("9홀 규모의 코스로 짧은 라운드를 계획하는 분들이 참고할 수 있습니다");
  } else if (course.holeCount) {
    reasons.push(`${course.holeCount}홀 규모 정보를 확인할 수 있습니다`);
  }

  if (course.courseType?.trim()) {
    reasons.push(`${course.courseType} 운영 형태로 등록된 골프장입니다`);
  }

  reasons.push("방문 전 운영 시간과 예약 가능 여부를 공식 채널에서 확인하는 것이 좋습니다");
  reasons.push("주변 골프장과 함께 비교보면 선택이 쉬워집니다");

  return uniqueStrings(reasons).slice(0, 4);
}

function adjustReasonsForConfidence(
  reasons: string[],
  confidence: CourseContentConfidence,
): string[] {
  const sanitized = uniqueStrings(reasons)
    .map((reason) =>
      reason
        .replace(/강력 추천/g, "참고 가능")
        .replace(/추천/g, "참고")
        .replace(/장점/g, "확인할 점")
        .replace(/최고/g, "특징")
        .replace(/좋음/g, "확인 가능")
        .replace(/적합/g, "참고 가능")
        .trim(),
    )
    .filter(Boolean);

  if (confidence === "high") return sanitized.slice(0, 4);
  if (confidence === "medium") return sanitized.slice(0, 3);
  return sanitized.slice(0, 2);
}

export function refreshConservativeEnrichmentCopy(
  course: Course,
  item: CourseContentEnrichment,
): CourseContentEnrichment {
  const cleaned = cleanupCourseContentEnrichment(item);
  const blogSourced = cleaned.sourceTypes.includes("blog");

  if (!blogSourced && cleaned.confidence === "low") {
    return {
      ...cleaned,
      recommendationReasons: adjustReasonsForConfidence(
        buildFallbackRecommendationReasons(course),
        "low",
      ),
    };
  }

  if (!blogSourced && cleaned.confidence === "medium") {
    return {
      ...cleaned,
      recommendationReasons: adjustReasonsForConfidence(
        buildFallbackRecommendationReasons(course),
        "medium",
      ),
    };
  }

  return cleaned;
}

export function cleanupCourseContentEnrichment(
  item: CourseContentEnrichment,
  visitKoreaMeta?: VisitKoreaCourseMeta,
): CourseContentEnrichment {
  const cleaned: CourseContentEnrichment = {
    ...item,
    featureSummary: sanitizeFeatureSummary(item.featureSummary),
    recommendationReasons: adjustReasonsForConfidence(
      item.recommendationReasons,
      item.confidence,
    ),
  };

  if (visitKoreaMeta?.images.length) {
    cleaned.visitKoreaImages = visitKoreaMeta.images;
    cleaned.visitKoreaContentId = visitKoreaMeta.contentId;
    cleaned.imageSource = "visitKorea";
    cleaned.imageAttribution = "ⓒ한국관광콘텐츠랩";
  }

  return cleaned;
}

function buildFeatureTags(course: Course, hint?: BlogContentHint): string[] {
  const tags: string[] = [];

  if (course.region?.trim()) tags.push(course.region.trim());
  if (course.city?.trim()) tags.push(course.city.trim());
  if (course.holeCount) tags.push(`${course.holeCount}홀`);
  if (course.courseType?.trim()) tags.push(course.courseType.trim());
  if (hasPrice(course)) tags.push("참고요금");

  if (hint?.description.includes("야간")) tags.push("야간라운드");
  if (hint?.description.includes("9홀") || course.holeCount === 9) {
    tags.push("9홀");
  }
  if (hint?.description.includes("접근")) tags.push("접근성");

  return uniqueStrings(tags);
}

function collectSourceUrls(
  course: Course,
  hint?: BlogContentHint,
  visitKoreaMeta?: VisitKoreaCourseMeta,
  officialUrl?: string,
  naverSearchUrl?: string,
): { urls: string[]; types: CourseContentSourceType[] } {
  const urls: string[] = [];
  const types: CourseContentSourceType[] = [];

  const homepage = officialUrl?.trim() || course.homepageUrl?.trim();
  if (homepage) {
    urls.push(homepage);
    types.push("official");
  }

  if (naverSearchUrl?.trim()) {
    urls.push(naverSearchUrl.trim());
    types.push("naverSearch");
  }

  if (visitKoreaMeta?.contentId) {
    urls.push(
      `https://apis.data.go.kr/B551011/KorService2/detailCommon2?contentId=${visitKoreaMeta.contentId}`,
    );
    types.push("visitKorea");
  }

  if (hint?.blogSlug) {
    urls.push(`/blog/${hint.blogSlug}`);
    types.push("blog");
  }

  urls.push(`${siteConfig.siteUrl}/courses/${course.id}`);
  types.push("existingData");

  return {
    urls: uniqueStrings(urls),
    types: uniqueStrings(types) as CourseContentSourceType[],
  };
}

function resolveStatusAndConfidence(
  course: Course,
  hint?: BlogContentHint,
): { status: CourseContentEnrichmentStatus; confidence: CourseContentConfidence } {
  if (hint?.description?.trim() && (hint.recommendationReasons?.length ?? 0) >= 3) {
    return { status: "enriched", confidence: "high" };
  }

  if (hint?.description?.trim()) {
    return { status: "needs_review", confidence: "medium" };
  }

  if (course.address?.trim() && (course.holeCount || course.courseType)) {
    return { status: "enriched", confidence: "low" };
  }

  return { status: "needs_review", confidence: "low" };
}

export function generateCourseContentEnrichment(
  input: GenerateCourseContentInput,
): CourseContentEnrichment {
  const { course, blogHint, visitKoreaMeta, officialUrl, naverSearchUrl } = input;
  const override = COURSE_COPY_OVERRIDES[course.id];
  const resolved = resolveStatusAndConfidence(course, blogHint);
  const status = override?.status ?? resolved.status;
  const confidence = override?.confidence ?? resolved.confidence;
  const { urls, types } = collectSourceUrls(
    course,
    blogHint,
    visitKoreaMeta,
    officialUrl,
    naverSearchUrl,
  );

  const featureSummary = override?.featureSummary
    ? sanitizeFeatureSummary(override.featureSummary)
    : blogHint?.description?.trim()
    ? buildFeatureSummaryFromBlog(course, blogHint, confidence)
    : buildFallbackFeatureSummary(course);

  const recommendationReasons = adjustReasonsForConfidence(
    override?.recommendationReasons?.length
      ? override.recommendationReasons
      : blogHint?.recommendationReasons?.length
      ? blogHint.recommendationReasons
      : buildFallbackRecommendationReasons(course),
    confidence,
  );

  const notes = override?.notes ?? (blogHint
    ? `GolfMap 블로그 가이드(${blogHint.blogSlug})와 기존 코스 데이터를 참고해 재작성했습니다.`
    : "GolfMap 기존 코스 데이터만으로 생성한 기본 설명입니다. 검수 후 보강이 필요할 수 있습니다.");

  return {
    courseId: course.id,
    name: course.name,
    aliases: course.searchAliases,
    region: course.region,
    city: course.city,
    address: course.address,
    enrichmentStatus: status,
    featureSummary,
    recommendationReasons,
    featureTags: buildFeatureTags(course, blogHint),
    sourceUrls: urls,
    sourceTypes: types,
    visitKoreaImages: visitKoreaMeta?.images,
    visitKoreaContentId: visitKoreaMeta?.contentId,
    imageSource: visitKoreaMeta?.images.length ? "visitKorea" : undefined,
    imageAttribution: visitKoreaMeta?.images.length
      ? "ⓒ한국관광콘텐츠랩"
      : undefined,
    confidence,
    updatedAt: new Date().toISOString(),
    notes,
  };
}
