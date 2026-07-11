import fs from "node:fs";
import path from "node:path";
import type { BlogPost, BlogPostSection } from "@/lib/blogPosts";
import { getCoursesForStaticPages } from "@/lib/courseRepository";
import { getDistanceKm, SEOUL_CITY_HALL } from "@/lib/collectionFilters";
import { formatPriceRange, hasPrice } from "@/lib/priceFormat";
import { getNormalizedRegionLabel } from "@/lib/regionUtils";
import type { Course } from "@/types/course";
import type { RegionSlug } from "@/lib/regionNormalize";
import { collectVisitKoreaMetaImagePaths } from "@/lib/visitKoreaMetaImages";
import {
  formatTourApiImageCredit,
  resolveTourApiCourseImages,
} from "@/lib/tourApiCourseImages";

function resolveVisitKoreaMetaPath(post: BlogPost): string | null {
  if (!post.visitKoreaMetaDir) return null;
  return path.join(
    process.cwd(),
    `public/promo-assets/blog/${post.visitKoreaMetaDir}/visit-korea-meta.json`,
  );
}

const REGION_SLUG_LABELS: Partial<Record<RegionSlug, string>> = {
  seoul: "서울",
  gyeonggi: "경기",
  incheon: "인천",
  gangwon: "강원",
  chungcheong: "충청",
  jeolla: "전라",
  gyeongsang: "경상",
  jeju: "제주",
  busan: "부산",
};

type VisitKoreaMetaEntry = {
  key?: string;
  courseId?: string;
  apiAddr?: string;
  homepage?: string;
  tel?: string;
  imagePaths?: string[];
  imagePath?: string;
  imagePath2?: string;
  imageCount?: number;
  overview?: string;
};

type VisitKoreaMetaIndex = {
  byCourseId: Map<string, VisitKoreaMetaEntry>;
  byKey: Map<string, VisitKoreaMetaEntry>;
};

function loadVisitKoreaMeta(metaPath: string | null): VisitKoreaMetaIndex {
  if (!metaPath || !fs.existsSync(metaPath)) {
    return { byCourseId: new Map(), byKey: new Map() };
  }
  const raw = JSON.parse(
    fs.readFileSync(metaPath, "utf8"),
  ) as VisitKoreaMetaEntry[];
  const byCourseId = new Map<string, VisitKoreaMetaEntry>();
  const byKey = new Map<string, VisitKoreaMetaEntry>();
  for (const entry of raw) {
    if (entry.courseId) byCourseId.set(entry.courseId, entry);
    if (entry.key) byKey.set(entry.key, entry);
  }
  return { byCourseId, byKey };
}

function resolveVisitKoreaMeta(
  item: NonNullable<BlogPostSection["items"]>[number],
  index: VisitKoreaMetaIndex,
): VisitKoreaMetaEntry | undefined {
  if (item.relatedCourseId) {
    const hit = index.byCourseId.get(item.relatedCourseId);
    if (hit) return hit;
  }
  if (item.visitKoreaKey) {
    return index.byKey.get(item.visitKoreaKey);
  }
  return undefined;
}

function resolveRegionLabel(
  post: BlogPost,
  course?: Course,
): string | undefined {
  if (post.relatedRegionSlug) {
    return REGION_SLUG_LABELS[post.relatedRegionSlug as RegionSlug];
  }
  if (course) {
    return getNormalizedRegionLabel(course) ?? undefined;
  }
  return undefined;
}

function computeDistanceFromSeoulKm(course: Course): number | undefined {
  if (
    !Number.isFinite(course.latitude) ||
    !Number.isFinite(course.longitude) ||
    course.latitude === 0 ||
    course.longitude === 0
  ) {
    return undefined;
  }
  return getDistanceKm(
    SEOUL_CITY_HALL.lat,
    SEOUL_CITY_HALL.lng,
    course.latitude,
    course.longitude,
  );
}

function formatOperatingInfo(course: Course): string | undefined {
  const parts: string[] = [];
  if (course.courseType) parts.push(course.courseType);
  if (course.nightRound) parts.push("야간 라운드");
  if (course.businessStatus?.trim()) {
    parts.push(course.businessStatus.trim());
  }
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/** Visit Korea API에서 저장한 이미지만 사용 (local thumbnail·SEO 이미지 금지) */
function resolveVisitKoreaImages(meta: VisitKoreaMetaEntry | undefined): string[] {
  return collectVisitKoreaMetaImagePaths(meta);
}

/**
 * Visit Korea overview는 홍보·관광 문장이 많아 수동 설명에 append하지 않는다.
 * 수동 description이 비어 있을 때만 짧게 정리한 fallback으로 쓴다.
 */
export function sanitizeVisitKoreaOverview(
  overview: string | undefined,
): string | undefined {
  if (!overview) return undefined;
  let text = overview.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return undefined;

  // 문장 단위로 자르고, 뚜렷한 홍보·경관 수사 문장은 제외
  const promoSnippet =
    /자랑하|절경|아름다운 경관|사계절|향기|눈꽃|단풍이|반세기|전통을|새로운 만남|창조적 휴식|개나리|진달래|벚꽃/;
  const sentences = text
    .split(/(?<=[.。!?]|다\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !promoSnippet.test(s));

  // 전부 홍보 문장으로 걸러지면 fallback 설명을 쓰지 않음 (수동 공백일 때 원문 재노출 방지)
  if (sentences.length === 0) return undefined;

  text = sentences.join(" ").trim();
  // fallback도 과도한 길이로 붙이지 않음
  const MAX_LEN = 220;
  if (text.length > MAX_LEN) {
    const cut = text.slice(0, MAX_LEN);
    const lastStop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("다."));
    text = (lastStop > 80 ? cut.slice(0, lastStop + 1) : `${cut.trim()}…`).trim();
  }
  return text || undefined;
}

export function resolveBlogItemDescription(
  manualDescription: string | undefined,
  overview: string | undefined,
): string {
  const manual = manualDescription?.trim();
  if (manual) return manual;
  return sanitizeVisitKoreaOverview(overview) ?? "";
}

function enrichCourseItem(
  item: NonNullable<BlogPostSection["items"]>[number],
  post: BlogPost,
  courseById: Map<string, Course>,
  visitKoreaMeta: VisitKoreaMetaIndex,
): NonNullable<BlogPostSection["items"]>[number] {
  const meta = resolveVisitKoreaMeta(item, visitKoreaMeta);
  const course = item.relatedCourseId
    ? courseById.get(item.relatedCourseId)
    : undefined;

  if (!item.relatedCourseId && !meta && !item.address) return item;
  const visitKoreaImages = resolveVisitKoreaImages(meta);
  const tourApiImages = resolveTourApiCourseImages(item.relatedCourseId);

  // Visit Korea 메타 우선, 없으면 TourAPI 지역형(최대 3장), 없으면 수동 item 이미지
  const images =
    visitKoreaImages.length > 0
      ? visitKoreaImages
      : tourApiImages.length > 0
        ? tourApiImages.map((entry) => entry.path)
        : item.images && item.images.length > 0
          ? item.images
          : [item.image, item.image2].filter((src): src is string =>
              Boolean(src),
            );

  const imageCredit =
    item.imageCredit ??
    (visitKoreaImages.length === 0 && tourApiImages[0]
      ? formatTourApiImageCredit(tourApiImages[0])
      : undefined);
  const imageSourcePages =
    item.imageSourcePages ??
    (visitKoreaImages.length === 0
      ? tourApiImages
          .map((entry) => entry.sourcePage)
          .filter((url): url is string => Boolean(url))
      : undefined);
  const imageSourcePage =
    item.imageSourcePage ?? imageSourcePages?.[0] ?? undefined;
  const imageAlts =
    item.imageAlts ??
    (visitKoreaImages.length === 0
      ? tourApiImages.map(
          (entry) =>
            entry.alt ||
            entry.imageTitle ||
            `${item.title} 사진 - 한국관광공사 TourAPI`,
        )
      : undefined);
  const imageAlt = item.imageAlt ?? imageAlts?.[0];

  // 수동 description 우선. overview는 비어 있을 때만 fallback (이미지 유무와 무관하게 append 금지)
  const description = resolveBlogItemDescription(
    item.description,
    meta?.overview,
  );

  const address =
    item.address ?? meta?.apiAddr ?? course?.address?.trim() ?? undefined;
  const phone = item.phone ?? meta?.tel?.trim() ?? course?.phone?.trim();
  const homepage =
    item.homepage ?? meta?.homepage?.trim() ?? course?.homepageUrl?.trim();
  const regionLabel =
    item.regionLabel ??
    post.blogRegionLabel ??
    resolveRegionLabel(post, course);
  const holeCount = item.holeCount ?? course?.holeCount;
  const priceLabel =
    item.priceLabel ??
    (course && hasPrice(course) ? formatPriceRange(course) : undefined);
  const operatingInfo =
    item.operatingInfo ?? (course ? formatOperatingInfo(course) : undefined);
  const courseType = course?.courseType;
  const distanceFromSeoulKm =
    item.distanceFromSeoulKm ??
    (course ? computeDistanceFromSeoulKm(course) : undefined);

  return {
    ...item,
    description,
    images: images.length > 0 ? images : undefined,
    image: images[0],
    image2: images[1],
    imageCredit,
    imageSourcePage,
    imageSourcePages:
      imageSourcePages && imageSourcePages.length > 0
        ? imageSourcePages
        : undefined,
    imageAlt,
    imageAlts: imageAlts && imageAlts.length > 0 ? imageAlts : undefined,
    address: address || undefined,
    phone: phone || undefined,
    homepage: homepage || undefined,
    regionLabel,
    holeCount,
    priceLabel,
    operatingInfo,
    courseType,
    distanceFromSeoulKm,
  };
}

function postHasCourseItems(post: BlogPost): boolean {
  return post.sections.some((section) =>
    section.items?.some(
      (item) =>
        Boolean(item.relatedCourseId) ||
        Boolean(item.visitKoreaKey) ||
        Boolean(item.address) ||
        Boolean(item.phone) ||
        Boolean(item.homepage),
    ),
  );
}

/** relatedCourseId 항목에 Visit Korea·GolfMap 데이터 병합 */
export async function enrichBlogPost(post: BlogPost): Promise<BlogPost> {
  if (!postHasCourseItems(post)) return post;

  const [courses] = await Promise.all([getCoursesForStaticPages()]);
  const courseById = new Map(courses.map((course) => [course.id, course]));
  const visitKoreaMeta = loadVisitKoreaMeta(resolveVisitKoreaMetaPath(post));

  return {
    ...post,
    sections: post.sections.map((section) => ({
      ...section,
      items: section.items?.map((item) =>
        enrichCourseItem(item, post, courseById, visitKoreaMeta),
      ),
    })),
  };
}
