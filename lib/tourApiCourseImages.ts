import fs from "node:fs";
import path from "node:path";

export type TourApiCourseImageEntry = {
  courseId: string;
  blogSlug?: string;
  courseName?: string;
  contentId: string;
  path: string;
  originalUrl?: string;
  md5?: string;
  width?: number | null;
  height?: number | null;
  copyrightCodeRaw?: string | null;
  licenseLabel?: string | null;
  sourcePage?: string | null;
  alt?: string;
  credit?: string;
};

type TourApiCourseImageManifest = {
  version?: number;
  updatedAt?: string;
  items?: TourApiCourseImageEntry[];
};

let cached: Map<string, TourApiCourseImageEntry> | null = null;

function manifestPath(): string {
  return path.join(process.cwd(), "data/tourapi-course-images.json");
}

export function loadTourApiCourseImageIndex(): Map<
  string,
  TourApiCourseImageEntry
> {
  if (cached) return cached;
  const file = manifestPath();
  const map = new Map<string, TourApiCourseImageEntry>();
  if (!fs.existsSync(file)) {
    cached = map;
    return map;
  }
  try {
    const raw = JSON.parse(
      fs.readFileSync(file, "utf8"),
    ) as TourApiCourseImageManifest;
    for (const item of raw.items ?? []) {
      if (!item.courseId || !item.path) continue;
      map.set(item.courseId, item);
    }
  } catch {
    // manifest 손상 시 이미지 미사용
  }
  cached = map;
  return map;
}

/** 테스트/스크립트용 캐시 초기화 */
export function clearTourApiCourseImageCache(): void {
  cached = null;
}

export function resolveTourApiCourseImage(
  courseId: string | undefined,
): TourApiCourseImageEntry | undefined {
  if (!courseId) return undefined;
  return loadTourApiCourseImageIndex().get(courseId);
}

export function formatTourApiImageCredit(
  entry: TourApiCourseImageEntry,
): string {
  if (entry.credit?.trim()) return entry.credit.trim();
  if (entry.licenseLabel === "공공누리 제3유형") {
    return "사진: 한국관광공사 TourAPI · 공공누리 제3유형(변경금지)";
  }
  if (entry.licenseLabel === "공공누리 제1유형") {
    return "사진: 한국관광공사 TourAPI · 공공누리 제1유형";
  }
  return "사진: 한국관광공사 TourAPI";
}
