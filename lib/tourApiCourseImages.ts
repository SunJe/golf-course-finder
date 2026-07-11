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
  imageTitle?: string;
  serialnum?: string;
  credit?: string;
};

type TourApiCourseImageManifest = {
  version?: number;
  updatedAt?: string;
  source?: string;
  items?: TourApiCourseImageEntry[];
};

let cached: Map<string, TourApiCourseImageEntry[]> | null = null;

function manifestPath(): string {
  return path.join(process.cwd(), "data/tourapi-course-images.json");
}

export function loadTourApiCourseImageIndex(): Map<
  string,
  TourApiCourseImageEntry[]
> {
  if (cached) return cached;
  const file = manifestPath();
  const map = new Map<string, TourApiCourseImageEntry[]>();
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
      const list = map.get(item.courseId) ?? [];
      list.push(item);
      map.set(item.courseId, list);
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

export function resolveTourApiCourseImages(
  courseId: string | undefined,
): TourApiCourseImageEntry[] {
  if (!courseId) return [];
  return loadTourApiCourseImageIndex().get(courseId) ?? [];
}

/** @deprecated use resolveTourApiCourseImages */
export function resolveTourApiCourseImage(
  courseId: string | undefined,
): TourApiCourseImageEntry | undefined {
  return resolveTourApiCourseImages(courseId)[0];
}

export function formatTourApiImageCredit(
  entry: TourApiCourseImageEntry | undefined,
): string {
  if (!entry) return "사진: 한국관광공사 TourAPI";
  if (entry.credit?.trim()) return entry.credit.trim();
  if (entry.licenseLabel === "공공누리 제3유형") {
    return "사진: 한국관광공사 TourAPI · 공공누리 제3유형(변경금지)";
  }
  if (entry.licenseLabel === "공공누리 제1유형") {
    return "사진: 한국관광공사 TourAPI · 공공누리 제1유형";
  }
  return "사진: 한국관광공사 TourAPI";
}
