/**
 * Visit Korea 이미지 매칭 결과를 enrichment에 반영 (전체 force 재생성 없음)
 * Usage: npm run apply:visit-korea-images
 */
import fs from "node:fs";
import path from "node:path";
import {
  COURSE_CONTENT_ENRICHMENT_PATH,
  type CourseContentEnrichment,
  type CourseContentEnrichmentFile,
} from "@/lib/enrichment/courseContentEnrichmentTypes";
import { cleanupCourseContentEnrichment, refreshConservativeEnrichmentCopy } from "@/lib/enrichment/courseContentGenerator";
import type { ImageMatchConfidence } from "@/lib/enrichment/visitKoreaImageMatcher";
import type { Course, CourseType } from "@/types/course";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const APPLIED_PATH = path.join(ROOT, "data/visit-korea-golf-image-matches-applied.json");
const DECISIONS_PATH = path.join(
  ROOT,
  "data/visit-korea-golf-image-review-decisions.json",
);
const FULL_REPORT_PATH = path.join(ROOT, "reports/course-enrichment-full.md");
const REPEATED_GOLFMAP_CLOSING =
  "GolfMap에서는 주소, 전화번호, 참고 요금, 지도 위치와 주변 골프장을 함께 비교할 수 있습니다.";

type AppliedItem = {
  courseId: string;
  courseName: string;
  visitKoreaContentId: string;
  visitKoreaTitle: string;
  images: string[];
  imageMatchConfidence: ImageMatchConfidence;
};

type ReviewDecisionsFile = {
  rejected?: string[];
};

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

function loadCoursesFromCsv(): Map<string, Course> {
  const csvPath = path.join(ROOT, "data/enrichment/golf_courses_full_set.csv");
  const lines = fs.readFileSync(csvPath, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((header) =>
    header.replace(/^\uFEFF/, ""),
  );
  const index = (name: string) => headers.indexOf(name);
  const map = new Map<string, Course>();

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const get = (field: string) => cols[index(field)] ?? "";
    const num = (field: string) => {
      const parsed = Number(get(field));
      return Number.isFinite(parsed) ? parsed : undefined;
    };
    const id = get("id");
    if (!id) continue;
    map.set(id, {
      id,
      name: get("name"),
      region: get("region"),
      city: get("city"),
      address: get("address"),
      latitude: num("latitude") ?? 0,
      longitude: num("longitude") ?? 0,
      courseType: (get("courseType") || "기타") as CourseType,
      holeCount: num("hole_count"),
      phone: get("phone") || undefined,
      homepageUrl: get("website") || undefined,
      tags: [],
    });
  }

  return map;
}

function readEnrichmentFile(): CourseContentEnrichmentFile {
  const filePath = path.join(ROOT, COURSE_CONTENT_ENRICHMENT_PATH);
  return JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as CourseContentEnrichmentFile;
}

function writeEnrichmentFile(file: CourseContentEnrichmentFile): void {
  const filePath = path.join(ROOT, COURSE_CONTENT_ENRICHMENT_PATH);
  fs.writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

function loadRejectedReviewCourseIds(): Set<string> {
  if (!fs.existsSync(DECISIONS_PATH)) return new Set();
  const decisions = JSON.parse(
    fs.readFileSync(DECISIONS_PATH, "utf8"),
  ) as ReviewDecisionsFile;
  return new Set(decisions.rejected ?? []);
}

function clearVisitKoreaImageFields(
  item: CourseContentEnrichment,
): CourseContentEnrichment {
  const cleaned = { ...item };
  delete cleaned.visitKoreaImages;
  delete cleaned.visitKoreaContentId;
  delete cleaned.imageSource;
  delete cleaned.imageAttribution;
  delete cleaned.imageMatchConfidence;
  return cleaned;
}

function buildFullReport(items: Record<string, CourseContentEnrichment>): string {
  const statusCounts: Record<string, number> = {};
  const confidenceCounts: Record<string, number> = {};
  let withVisitKoreaImages = 0;
  let withRepeatedClosing = 0;
  let withLocalThumbnail = 0;
  const needsReview: CourseContentEnrichment[] = [];

  for (const item of Object.values(items)) {
    statusCounts[item.enrichmentStatus] =
      (statusCounts[item.enrichmentStatus] ?? 0) + 1;
    confidenceCounts[item.confidence] =
      (confidenceCounts[item.confidence] ?? 0) + 1;

    if (item.visitKoreaImages?.length) withVisitKoreaImages += 1;
    if (item.featureSummary.includes(REPEATED_GOLFMAP_CLOSING)) {
      withRepeatedClosing += 1;
    }
    if (
      item.visitKoreaImages?.some((image) =>
        image.includes("/promo-assets/blog/source/"),
      )
    ) {
      withLocalThumbnail += 1;
    }
    if (item.enrichmentStatus === "needs_review") needsReview.push(item);
  }

  const lines = [
    "# Course Content Enrichment Full Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total enrichment items: ${Object.keys(items).length}`,
    `- Visit Korea images attached: ${withVisitKoreaImages}`,
    `- Repeated GolfMap closing remaining: ${withRepeatedClosing}`,
    `- /promo-assets/blog/source/ in gallery images: ${withLocalThumbnail}`,
    "",
    "### Confidence counts",
    "",
    ...Object.entries(confidenceCounts).map(
      ([confidence, count]) => `- ${confidence}: ${count}`,
    ),
    "",
    "### Status counts",
    "",
    ...Object.entries(statusCounts).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## needs_review",
    "",
    ...needsReview
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => `- ${item.name} (\`${item.courseId}\`) — ${item.confidence}`),
    "",
    "## Notes",
    "",
    "- confidence 값은 사용자 화면에 노출하지 않습니다.",
    "- Visit Korea 이미지는 imageMatchConfidence exact/high/조건부 medium만 자동 적용됩니다.",
    "- local thumbnail(/promo-assets/blog/source/)은 상세 갤러리에 사용하지 않습니다.",
    "",
  ];

  return lines.join("\n");
}

async function main(): Promise<void> {
  if (!fs.existsSync(APPLIED_PATH)) {
    throw new Error(
      "data/visit-korea-golf-image-matches-applied.json not found. Run audit first.",
    );
  }

  const appliedFile = JSON.parse(fs.readFileSync(APPLIED_PATH, "utf8")) as {
    items: AppliedItem[];
  };
  const enrichmentFile = readEnrichmentFile();
  const coursesById = loadCoursesFromCsv();
  const rejectedCourseIds = loadRejectedReviewCourseIds();

  let cleanedCount = 0;
  let imageAppliedCount = 0;
  let copyRefreshedCount = 0;
  let rejectedClearedCount = 0;
  let legacyRetainedCount = 0;

  for (const courseId of Object.keys(enrichmentFile.items)) {
    const before = enrichmentFile.items[courseId];
    const course = coursesById.get(courseId);
    const refreshed = course
      ? refreshConservativeEnrichmentCopy(course, before)
      : cleanupCourseContentEnrichment(before);
    if (JSON.stringify(refreshed) !== JSON.stringify(before)) {
      enrichmentFile.items[courseId] = refreshed;
      cleanedCount += 1;
      if (
        course &&
        !before.sourceTypes.includes("blog") &&
        (before.confidence === "low" || before.confidence === "medium")
      ) {
        copyRefreshedCount += 1;
      }
    }
  }

  for (const courseId of rejectedCourseIds) {
    const existing = enrichmentFile.items[courseId];
    if (!existing?.visitKoreaImages?.length) continue;
    enrichmentFile.items[courseId] = clearVisitKoreaImageFields(existing);
    rejectedClearedCount += 1;
  }

  const appliedCourseIds = new Set(
    appliedFile.items.map((item) => item.courseId),
  );

  for (const [courseId, existing] of Object.entries(enrichmentFile.items)) {
    if (rejectedCourseIds.has(courseId)) continue;
    if (appliedCourseIds.has(courseId)) continue;
    if (!existing.visitKoreaImages?.length) continue;
    if (existing.imageMatchConfidence) continue;

    enrichmentFile.items[courseId] = {
      ...existing,
      imageMatchConfidence: "high",
      imageSource: "visitKorea",
      imageAttribution: "ⓒ한국관광콘텐츠랩",
      updatedAt: new Date().toISOString(),
    };
    legacyRetainedCount += 1;
  }

  for (const applied of appliedFile.items) {
    const existing = enrichmentFile.items[applied.courseId];
    if (!existing) continue;

    enrichmentFile.items[applied.courseId] = {
      ...existing,
      visitKoreaImages: applied.images,
      visitKoreaContentId: applied.visitKoreaContentId,
      imageSource: "visitKorea",
      imageAttribution: "ⓒ한국관광콘텐츠랩",
      imageMatchConfidence: applied.imageMatchConfidence,
      sourceUrls: [
        ...new Set([
          ...existing.sourceUrls.filter(
            (url) => !url.includes("detailCommon2?contentId="),
          ),
          `https://apis.data.go.kr/B551011/KorService2/detailCommon2?contentId=${applied.visitKoreaContentId}`,
        ]),
      ],
      sourceTypes: existing.sourceTypes.includes("visitKorea")
        ? existing.sourceTypes
        : [...existing.sourceTypes, "visitKorea"],
      updatedAt: new Date().toISOString(),
    };
    imageAppliedCount += 1;
  }

  enrichmentFile.updatedAt = new Date().toISOString();
  writeEnrichmentFile(enrichmentFile);

  const report = buildFullReport(enrichmentFile.items);
  fs.mkdirSync(path.dirname(FULL_REPORT_PATH), { recursive: true });
  fs.writeFileSync(FULL_REPORT_PATH, report, "utf8");

  console.log("=== Apply Visit Korea images ===");
  console.log(`cleaned=${cleanedCount}`);
  console.log(`copyRefreshed=${copyRefreshedCount}`);
  console.log(`rejectedCleared=${rejectedClearedCount}`);
  console.log(`legacyRetained=${legacyRetainedCount}`);
  console.log(`imagesApplied=${imageAppliedCount}`);
  console.log(`saved: ${COURSE_CONTENT_ENRICHMENT_PATH}`);
  console.log(`saved: ${FULL_REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
