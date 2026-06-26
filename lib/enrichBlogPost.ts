import fs from "node:fs";
import path from "node:path";
import type { BlogPost, BlogPostSection } from "@/lib/blogPosts";
import { getCoursesForStaticPages } from "@/lib/courseRepository";
import { getDistanceKm, SEOUL_CITY_HALL } from "@/lib/collectionFilters";
import { formatPriceRange, hasPrice } from "@/lib/priceFormat";
import { getNormalizedRegionLabel } from "@/lib/regionUtils";
import type { Course } from "@/types/course";
import type { RegionSlug } from "@/lib/regionNormalize";

function resolveVisitKoreaMetaPath(post: BlogPost): string {
  const dir = post.visitKoreaMetaDir ?? "incheon";
  return path.join(
    process.cwd(),
    `public/promo-assets/blog/${dir}/visit-korea-meta.json`,
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
  imagePath?: string;
  imagePath2?: string;
  imageCount?: number;
  overview?: string;
};

type VisitKoreaMetaIndex = {
  byCourseId: Map<string, VisitKoreaMetaEntry>;
  byKey: Map<string, VisitKoreaMetaEntry>;
};

function loadVisitKoreaMeta(metaPath: string): VisitKoreaMetaIndex {
  if (!fs.existsSync(metaPath)) {
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
function resolveVisitKoreaImages(
  meta: VisitKoreaMetaEntry | undefined,
): { primary?: string; secondary?: string } {
  if (!meta) return {};
  return {
    primary: meta.imagePath,
    secondary: meta.imagePath2,
  };
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
  const { primary, secondary } = resolveVisitKoreaImages(meta);

  let description = item.description;
  if (meta?.overview?.trim() && !primary && !secondary) {
    const overview = meta.overview.trim();
    if (!description.includes(overview.slice(0, 48))) {
      description = `${description} ${overview}`.trim();
    }
  }

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
    image: primary,
    image2: secondary,
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
