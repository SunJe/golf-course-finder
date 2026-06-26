import visitKoreaAppliedFile from "@/data/visit-korea-golf-image-matches-applied.json";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";
import type { CourseContentEnrichment } from "@/lib/enrichment/courseContentEnrichmentTypes";
import type { ImageMatchConfidence } from "@/lib/enrichment/visitKoreaImageMatcher";

export interface CourseVisitKoreaImageSet {
  images: string[];
  attribution: string;
  contentId?: string;
  imageMatchConfidence?: ImageMatchConfidence;
}

type AppliedMatchItem = {
  courseId: string;
  visitKoreaContentId: string;
  images: string[];
  imageMatchConfidence: ImageMatchConfidence;
};

type VisitKoreaMetaEntry = {
  courseId?: string;
  contentId?: string;
  imagePath?: string;
  imagePath2?: string;
};

const appliedStore = visitKoreaAppliedFile as {
  items: AppliedMatchItem[];
};

function isAllowedVisitKoreaImageUrl(imagePath: string): boolean {
  const trimmed = imagePath.trim();
  if (!trimmed) return false;
  if (trimmed.includes("/promo-assets/blog/source/")) return false;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return true;
  if (trimmed.startsWith("/promo-assets/blog/")) return true;
  return false;
}

function collectImagesFromEntry(entry: VisitKoreaMetaEntry): string[] {
  return [entry.imagePath, entry.imagePath2]
    .filter((image): image is string => Boolean(image?.trim()))
    .filter(isAllowedVisitKoreaImageUrl)
    .slice(0, 4);
}

function buildAppliedIndex(): Map<string, CourseVisitKoreaImageSet> {
  const map = new Map<string, CourseVisitKoreaImageSet>();
  for (const item of appliedStore.items ?? []) {
    const images = item.images.filter(isAllowedVisitKoreaImageUrl).slice(0, 4);
    if (images.length === 0) continue;
    map.set(item.courseId, {
      images,
      attribution: VISIT_KOREA_IMAGE_CREDIT,
      contentId: item.visitKoreaContentId,
      imageMatchConfidence: item.imageMatchConfidence,
    });
  }
  return map;
}

let cachedAppliedIndex: Map<string, CourseVisitKoreaImageSet> | null = null;

function getAppliedIndex(): Map<string, CourseVisitKoreaImageSet> {
  if (!cachedAppliedIndex) {
    cachedAppliedIndex = buildAppliedIndex();
  }
  return cachedAppliedIndex;
}

export function resolveCourseVisitKoreaImages(
  courseId: string,
  enrichment?: CourseContentEnrichment | null,
): CourseVisitKoreaImageSet | null {
  const applied = getAppliedIndex().get(courseId);
  if (applied) return applied;

  const fromEnrichment = enrichment?.visitKoreaImages
    ?.filter(isAllowedVisitKoreaImageUrl)
    .slice(0, 4);

  if (
    fromEnrichment?.length &&
    enrichment?.imageMatchConfidence &&
    ["exact", "high", "medium"].includes(enrichment.imageMatchConfidence)
  ) {
    return {
      images: fromEnrichment,
      attribution: VISIT_KOREA_IMAGE_CREDIT,
      contentId: enrichment.visitKoreaContentId,
      imageMatchConfidence: enrichment.imageMatchConfidence,
    };
  }

  return null;
}
