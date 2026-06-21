import type { Course } from "@/types/course";
import {
  COLLECTION_SLUGS,
  isCollectionSlug,
  type CollectionSlug,
} from "@/lib/collectionLanding";
import {
  applyCollectionFilter,
  filterBudgetCoursesWithMeta,
  getBaekdoriScoreThreshold,
  getBeginnerScoreThreshold,
} from "@/lib/collectionFilters";

const PAR3_SLUGS: CollectionSlug[] = ["par3", "near-seoul-par3"];

export function computeCollectionCounts(
  courses: Course[],
): Record<CollectionSlug, number> {
  const counts = {} as Record<CollectionSlug, number>;
  for (const slug of COLLECTION_SLUGS) {
    counts[slug] = applyCollectionFilter(courses, slug).length;
  }
  return counts;
}

export function getNoindexCollectionSlugs(
  counts: Record<CollectionSlug, number>,
): CollectionSlug[] {
  return COLLECTION_SLUGS.filter((slug) => counts[slug] === 0);
}

export function getSitemapCollectionSlugs(
  counts: Record<CollectionSlug, number>,
): CollectionSlug[] {
  return COLLECTION_SLUGS.filter((slug) => {
    if (counts[slug] < 1) return false;
    if (PAR3_SLUGS.includes(slug) && counts[slug] === 0) return false;
    return true;
  });
}

export function getCollectionSitemapPriority(slug: CollectionSlug): number {
  if (slug === "near-seoul") return 0.78;
  if (slug.startsWith("near-seoul-")) return 0.76;
  return 0.75;
}

export function getBudgetAnalysis(courses: Course[]) {
  const national = filterBudgetCoursesWithMeta(courses);
  const nearSeoul = filterBudgetCoursesWithMeta(
    applyCollectionFilter(courses, "near-seoul"),
  );
  return { national, nearSeoul };
}

export function getScoreThresholdAnalysis(courses: Course[]) {
  return {
    beginnerNational: getBeginnerScoreThreshold(courses),
    baekdoriNational: getBaekdoriScoreThreshold(courses),
    beginnerNearSeoul: getBeginnerScoreThreshold(
      applyCollectionFilter(courses, "near-seoul"),
    ),
    baekdoriNearSeoul: getBaekdoriScoreThreshold(
      applyCollectionFilter(courses, "near-seoul"),
    ),
  };
}

export { isCollectionSlug };
