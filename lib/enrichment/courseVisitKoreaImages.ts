import fs from "node:fs";
import path from "node:path";
import { VISIT_KOREA_IMAGE_CREDIT } from "@/lib/visitKoreaAttribution";
import type { CourseContentEnrichment } from "@/lib/enrichment/courseContentEnrichmentTypes";

export interface CourseVisitKoreaImageSet {
  images: string[];
  attribution: string;
  contentId?: string;
}

type VisitKoreaMetaEntry = {
  courseId?: string;
  contentId?: string;
  imagePath?: string;
  imagePath2?: string;
};

function isAllowedVisitKoreaImagePath(imagePath: string): boolean {
  const trimmed = imagePath.trim();
  if (!trimmed.startsWith("/promo-assets/blog/")) return false;
  return !trimmed.includes("/promo-assets/blog/source/");
}

function collectImagesFromEntry(entry: VisitKoreaMetaEntry): string[] {
  return [entry.imagePath, entry.imagePath2]
    .filter((image): image is string => Boolean(image?.trim()))
    .filter(isAllowedVisitKoreaImagePath)
    .slice(0, 4);
}

function collectVisitKoreaMetaFiles(dir: string, files: string[] = []): string[] {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectVisitKoreaMetaFiles(fullPath, files);
    } else if (entry.name === "visit-korea-meta.json") {
      files.push(fullPath);
    }
  }
  return files;
}

let cachedIndex: Map<string, CourseVisitKoreaImageSet> | null = null;

function buildVisitKoreaImageIndex(): Map<string, CourseVisitKoreaImageSet> {
  const map = new Map<string, CourseVisitKoreaImageSet>();
  const files = collectVisitKoreaMetaFiles(
    path.join(process.cwd(), "public/promo-assets/blog"),
  );

  for (const file of files) {
    const entries = JSON.parse(
      fs.readFileSync(file, "utf8"),
    ) as VisitKoreaMetaEntry[];

    for (const entry of entries) {
      if (!entry.courseId) continue;
      const images = collectImagesFromEntry(entry);
      if (images.length === 0) continue;

      map.set(entry.courseId, {
        images,
        attribution: VISIT_KOREA_IMAGE_CREDIT,
        contentId: entry.contentId,
      });
    }
  }

  return map;
}

function getVisitKoreaImageIndex(): Map<string, CourseVisitKoreaImageSet> {
  if (!cachedIndex) {
    cachedIndex = buildVisitKoreaImageIndex();
  }
  return cachedIndex;
}

export function getCourseVisitKoreaImagesFromMeta(
  courseId: string,
): CourseVisitKoreaImageSet | null {
  return getVisitKoreaImageIndex().get(courseId) ?? null;
}

export function resolveCourseVisitKoreaImages(
  courseId: string,
  enrichment?: CourseContentEnrichment | null,
): CourseVisitKoreaImageSet | null {
  const fromEnrichment = enrichment?.visitKoreaImages
    ?.filter(isAllowedVisitKoreaImagePath)
    .slice(0, 4);

  if (fromEnrichment?.length) {
    return {
      images: fromEnrichment,
      attribution: VISIT_KOREA_IMAGE_CREDIT,
      contentId: enrichment?.visitKoreaContentId,
    };
  }

  return getCourseVisitKoreaImagesFromMeta(courseId);
}
