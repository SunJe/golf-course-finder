import fs from "node:fs";
import path from "node:path";
import type { Course, CourseType } from "@/types/course";
import {
  COURSE_CONTENT_ENRICHMENT_CHECKPOINT_PATH,
  COURSE_CONTENT_ENRICHMENT_PATH,
  PILOT_COURSE_IDS,
  type CourseContentEnrichment,
  type CourseContentEnrichmentCheckpoint,
  type CourseContentEnrichmentFile,
} from "@/lib/enrichment/courseContentEnrichmentTypes";
import {
  cleanupCourseContentEnrichment,
  generateCourseContentEnrichment,
  type VisitKoreaCourseMeta,
} from "@/lib/enrichment/courseContentGenerator";
import { buildCourseSeoIntroParagraph } from "@/lib/courseSeoCopy";
import { parseCsv } from "./lib/csvUtils";
import { extractBlogContentHints } from "./lib/courseContentBlogHints";

const ROOT = process.cwd();
const FULL_SET_CSV = path.join(ROOT, "data/enrichment/golf_courses_full_set.csv");
const ENRICHMENT_EDIT_CSV = path.join(
  ROOT,
  "data/enrichment/course_enrichment_edit.csv",
);
const REVIEW_REPORT_PATH = path.join(
  ROOT,
  "reports/course-enrichment-pilot.md",
);
const FULL_REPORT_PATH = path.join(ROOT, "reports/course-enrichment-full.md");
const REPEATED_GOLFMAP_CLOSING =
  "GolfMap에서는 주소, 전화번호, 참고 요금, 지도 위치와 주변 골프장을 함께 비교할 수 있습니다.";

interface CliOptions {
  mode: "pilot" | "full";
  limit?: number;
  start: number;
  resume: boolean;
  force: boolean;
  dryRun: boolean;
  checkpointEvery: number;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    mode: "pilot",
    start: 0,
    resume: false,
    force: false,
    dryRun: false,
    checkpointEvery: 50,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--mode" && argv[i + 1]) {
      options.mode = argv[i + 1] === "full" ? "full" : "pilot";
      i += 1;
    } else if (arg === "--limit" && argv[i + 1]) {
      options.limit = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === "--start" && argv[i + 1]) {
      options.start = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === "--resume") {
      options.resume = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--checkpoint-every" && argv[i + 1]) {
      options.checkpointEvery = Number.parseInt(argv[i + 1], 10);
      i += 1;
    }
  }

  return options;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  values.push(current);
  return values;
}

function loadCoursesFromCsv(): Course[] {
  const lines = fs.readFileSync(FULL_SET_CSV, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]).map((header) =>
    header.replace(/^\uFEFF/, ""),
  );
  const index = (name: string) => headers.indexOf(name);

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const get = (field: string) => cols[index(field)] ?? "";
    const num = (field: string) => {
      const parsed = Number(get(field));
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    return {
      id: get("id"),
      name: get("name"),
      changeNameTo: get("change_name_to") || undefined,
      region: get("region"),
      city: get("city"),
      address: get("address"),
      latitude: num("latitude") ?? 0,
      longitude: num("longitude") ?? 0,
      phone: get("phone") || undefined,
      homepageUrl: get("website") || undefined,
      holeCount: num("hole_count"),
      courseType: (get("courseType") || "기타") as CourseType,
      priceMin: num("price_min"),
      priceMax: num("price_max"),
      tags: [],
      source: "public_data",
      updatedAt: get("updatedAt") || new Date().toISOString(),
    } satisfies Course;
  });
}

function loadNaverSearchUrls(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(ENRICHMENT_EDIT_CSV)) return map;

  const csv = fs.readFileSync(ENRICHMENT_EDIT_CSV, "utf8");
  const { headers, rows } = parseCsv(csv);
  const idIndex = headers.indexOf("id");
  const sourceIndex = headers.indexOf("source_url");
  if (idIndex < 0 || sourceIndex < 0) return map;

  for (const row of rows) {
    const id = row[idIndex]?.trim();
    const sourceUrl = row[sourceIndex]?.trim();
    if (id && sourceUrl) {
      map.set(id, sourceUrl);
    }
  }

  return map;
}

type VisitKoreaMetaEntry = {
  courseId?: string;
  contentId?: string;
  overview?: string;
  homepage?: string;
  apiAddr?: string;
  imagePath?: string;
  imagePath2?: string;
  imageCredit?: string;
};

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

function loadVisitKoreaCourseMeta(): Map<string, VisitKoreaCourseMeta> {
  const map = new Map<string, VisitKoreaCourseMeta>();
  const files = collectVisitKoreaMetaFiles(
    path.join(ROOT, "public/promo-assets/blog"),
  );

  for (const file of files) {
    const entries = JSON.parse(
      fs.readFileSync(file, "utf8"),
    ) as VisitKoreaMetaEntry[];

    for (const entry of entries) {
      if (!entry.courseId) continue;
      const images = [entry.imagePath, entry.imagePath2]
        .filter((image): image is string => Boolean(image?.trim()))
        .filter((image) => !image.includes("/promo-assets/blog/source/"))
        .slice(0, 4);

      if (images.length === 0 && !entry.contentId) continue;

      map.set(entry.courseId, {
        contentId: entry.contentId,
        overview: entry.overview,
        homepage: entry.homepage,
        apiAddr: entry.apiAddr,
        images,
        imageAttribution: "ⓒ한국관광콘텐츠랩",
      });
    }
  }

  return map;
}

function readEnrichmentFile(): CourseContentEnrichmentFile {
  const filePath = path.join(ROOT, COURSE_CONTENT_ENRICHMENT_PATH);
  if (!fs.existsSync(filePath)) {
    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      items: {},
    };
  }

  return JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as CourseContentEnrichmentFile;
}

function writeEnrichmentFile(file: CourseContentEnrichmentFile): void {
  const filePath = path.join(ROOT, COURSE_CONTENT_ENRICHMENT_PATH);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

function writeCheckpoint(checkpoint: CourseContentEnrichmentCheckpoint): void {
  const filePath = path.join(ROOT, COURSE_CONTENT_ENRICHMENT_CHECKPOINT_PATH);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(checkpoint, null, 2)}\n`,
    "utf8",
  );
}

function selectTargetCourses(
  allCourses: Course[],
  options: CliOptions,
): Course[] {
  if (options.mode === "pilot") {
    const byId = new Map(allCourses.map((course) => [course.id, course]));
    return PILOT_COURSE_IDS.map((id) => byId.get(id)).filter(
      (course): course is Course => Boolean(course),
    );
  }

  const sliceStart = options.resume
    ? readCheckpoint()?.lastIndex ?? options.start
    : options.start;

  const sorted = [...allCourses].sort((a, b) => a.id.localeCompare(b.id));
  const sliced = sorted.slice(sliceStart);
  return options.limit ? sliced.slice(0, options.limit) : sliced;
}

function readCheckpoint(): CourseContentEnrichmentCheckpoint | null {
  const filePath = path.join(ROOT, COURSE_CONTENT_ENRICHMENT_CHECKPOINT_PATH);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as CourseContentEnrichmentCheckpoint;
}

function shouldSkipExisting(
  existing: CourseContentEnrichment | undefined,
  force: boolean,
): boolean {
  if (!existing) return false;
  if (force) return false;
  return (
    existing.enrichmentStatus === "enriched" ||
    existing.enrichmentStatus === "needs_review"
  );
}

function cleanupExistingItem(
  item: CourseContentEnrichment,
  visitKoreaMeta: Map<string, VisitKoreaCourseMeta>,
): { item: CourseContentEnrichment; changed: boolean } {
  const cleaned = cleanupCourseContentEnrichment(
    item,
    visitKoreaMeta.get(item.courseId),
  );

  const changed =
    cleaned.featureSummary !== item.featureSummary ||
    JSON.stringify(cleaned.recommendationReasons) !==
      JSON.stringify(item.recommendationReasons) ||
    JSON.stringify(cleaned.visitKoreaImages ?? []) !==
      JSON.stringify(item.visitKoreaImages ?? []) ||
    cleaned.visitKoreaContentId !== item.visitKoreaContentId ||
    cleaned.imageSource !== item.imageSource ||
    cleaned.imageAttribution !== item.imageAttribution;

  return { item: cleaned, changed };
}

function cleanupAllExistingItems(
  items: Record<string, CourseContentEnrichment>,
  visitKoreaMeta: Map<string, VisitKoreaCourseMeta>,
): number {
  let changedCount = 0;

  for (const courseId of Object.keys(items)) {
    const current = items[courseId];
    const { item, changed } = cleanupExistingItem(current, visitKoreaMeta);
    if (changed) {
      items[courseId] = item;
      changedCount += 1;
    }
  }

  return changedCount;
}

function buildFullReport(
  allCourses: Course[],
  items: Record<string, CourseContentEnrichment>,
): string {
  const statusCounts: Record<string, number> = {};
  const confidenceCounts: Record<string, number> = {};
  let withVisitKoreaImages = 0;
  let withRepeatedClosing = 0;
  const needsReview: CourseContentEnrichment[] = [];
  const failed: CourseContentEnrichment[] = [];

  for (const item of Object.values(items)) {
    statusCounts[item.enrichmentStatus] =
      (statusCounts[item.enrichmentStatus] ?? 0) + 1;
    confidenceCounts[item.confidence] =
      (confidenceCounts[item.confidence] ?? 0) + 1;

    if (item.visitKoreaImages?.length) withVisitKoreaImages += 1;
    if (item.featureSummary.includes(REPEATED_GOLFMAP_CLOSING)) {
      withRepeatedClosing += 1;
    }
    if (item.enrichmentStatus === "needs_review") needsReview.push(item);
    if (item.enrichmentStatus === "failed") failed.push(item);
  }

  const lines: string[] = [
    "# Course Content Enrichment Full Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total courses in CSV: ${allCourses.length}`,
    `- Total enrichment items: ${Object.keys(items).length}`,
    `- Visit Korea images attached: ${withVisitKoreaImages}`,
    `- Repeated GolfMap closing remaining: ${withRepeatedClosing}`,
    "",
    "### Status counts",
    "",
    ...Object.entries(statusCounts).map(([status, count]) => `- ${status}: ${count}`),
    "",
    "### Confidence counts",
    "",
    ...Object.entries(confidenceCounts).map(
      ([confidence, count]) => `- ${confidence}: ${count}`,
    ),
    "",
  ];

  if (needsReview.length > 0) {
    lines.push("## Needs review", "");
    for (const item of needsReview.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(`- ${item.name} (\`${item.courseId}\`) — ${item.confidence}`);
    }
    lines.push("");
  }

  if (failed.length > 0) {
    lines.push("## Failed", "");
    for (const item of failed.sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(
        `- ${item.name} (\`${item.courseId}\`) — ${item.notes ?? "unknown error"}`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

function buildReviewReport(
  courses: Course[],
  items: Record<string, CourseContentEnrichment>,
): string {
  const lines: string[] = [
    "# Course Content Enrichment Pilot Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Total reviewed: ${courses.length}`,
    "",
  ];

  for (const course of courses) {
    const enrichment = items[course.id];
    if (!enrichment) continue;

    lines.push(`## ${course.name} (\`${course.id}\`)`);
    lines.push("");
    lines.push("### 기존 기본 설명");
    lines.push("");
    lines.push("```");
    lines.push(buildCourseSeoIntroParagraph(course));
    lines.push("```");
    lines.push("");
    lines.push("### 새 featureSummary");
    lines.push("");
    lines.push(enrichment.featureSummary);
    lines.push("");
    lines.push("### 추천 이유");
    lines.push("");
    for (const reason of enrichment.recommendationReasons) {
      lines.push(`- ${reason}`);
    }
    lines.push("");
    lines.push(`- confidence: **${enrichment.confidence}**`);
    lines.push(`- status: **${enrichment.enrichmentStatus}**`);
    lines.push("");
    lines.push("### sourceUrls");
    lines.push("");
    for (const url of enrichment.sourceUrls) {
      lines.push(`- ${url}`);
    }
    lines.push("");
    if (enrichment.notes) {
      lines.push("### 검수 메모");
      lines.push("");
      lines.push(enrichment.notes);
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const allCourses = loadCoursesFromCsv();
  const blogHints = extractBlogContentHints();
  const naverSearchUrls = loadNaverSearchUrls();
  const visitKoreaMeta = loadVisitKoreaCourseMeta();
  const enrichmentFile = readEnrichmentFile();
  const targetCourses = selectTargetCourses(allCourses, options);

  let processedCount = 0;
  let enrichedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let cleanedCount = 0;

  const startIndex = options.resume
    ? readCheckpoint()?.lastIndex ?? options.start
    : options.start;

  console.log("=== Course content enrichment ===");
  console.log(`mode=${options.mode} limit=${options.limit ?? "all"} start=${startIndex}`);
  console.log(`targets=${targetCourses.length} force=${options.force} dryRun=${options.dryRun}`);

  for (let index = 0; index < targetCourses.length; index += 1) {
    const course = targetCourses[index];
    const absoluteIndex = startIndex + index;

    if (shouldSkipExisting(enrichmentFile.items[course.id], options.force)) {
      const existing = enrichmentFile.items[course.id];
      const { item, changed } = cleanupExistingItem(existing, visitKoreaMeta);
      if (changed && !options.dryRun) {
        enrichmentFile.items[course.id] = item;
        cleanedCount += 1;
      }
      skippedCount += 1;
      console.log(`[skip] ${course.name} (${course.id}) — already enriched`);
      continue;
    }

    try {
      const blogHint = blogHints.get(course.id);
      const enrichment = generateCourseContentEnrichment({
        course,
        blogHint,
        visitKoreaMeta: visitKoreaMeta.get(course.id),
        officialUrl: course.homepageUrl,
        naverSearchUrl: naverSearchUrls.get(course.id),
      });

      if (!options.dryRun) {
        enrichmentFile.items[course.id] = enrichment;
      }

      processedCount += 1;
      if (
        enrichment.enrichmentStatus === "enriched" ||
        enrichment.enrichmentStatus === "needs_review"
      ) {
        enrichedCount += 1;
      }

      console.log(
        `[ok] ${course.name} (${course.id}) status=${enrichment.enrichmentStatus} confidence=${enrichment.confidence}`,
      );

      if (
        !options.dryRun &&
        options.mode === "full" &&
        processedCount % options.checkpointEvery === 0
      ) {
        enrichmentFile.updatedAt = new Date().toISOString();
        enrichmentFile.mode = options.mode;
        enrichmentFile.checkpoint = {
          lastIndex: absoluteIndex + 1,
          lastCourseId: course.id,
          lastCourseName: course.name,
          processedCount,
          enrichedCount,
          failedCount,
        };
        writeEnrichmentFile(enrichmentFile);
        writeCheckpoint(enrichmentFile.checkpoint);
        console.log(`[checkpoint] saved at index ${absoluteIndex + 1}`);
      }
    } catch (error) {
      failedCount += 1;
      const message =
        error instanceof Error ? error.message : "Unknown enrichment error";

      enrichmentFile.items[course.id] = {
        courseId: course.id,
        name: course.name,
        region: course.region,
        city: course.city,
        address: course.address,
        enrichmentStatus: "failed",
        featureSummary: "",
        recommendationReasons: [],
        featureTags: [],
        sourceUrls: [],
        sourceTypes: [],
        confidence: "low",
        updatedAt: new Date().toISOString(),
        notes: message,
      };

      console.error(`[failed] ${course.name} (${course.id}) — ${message}`);

      if (options.mode === "full") {
        writeCheckpoint({
          lastIndex: absoluteIndex,
          lastCourseId: course.id,
          lastCourseName: course.name,
          processedCount,
          enrichedCount,
          failedCount,
          stoppedAt: new Date().toISOString(),
          stopReason: message,
        });
        throw error;
      }
    }
  }

  if (!options.dryRun) {
    cleanedCount += cleanupAllExistingItems(enrichmentFile.items, visitKoreaMeta);

    enrichmentFile.version = 1;
    enrichmentFile.updatedAt = new Date().toISOString();
    enrichmentFile.mode = options.mode;
    enrichmentFile.checkpoint = {
      lastIndex: startIndex + targetCourses.length,
      lastCourseId: targetCourses.at(-1)?.id ?? "",
      lastCourseName: targetCourses.at(-1)?.name ?? "",
      processedCount,
      enrichedCount,
      failedCount,
    };
    writeEnrichmentFile(enrichmentFile);

    fs.mkdirSync(path.dirname(REVIEW_REPORT_PATH), { recursive: true });

    if (options.mode === "pilot") {
      const report = buildReviewReport(targetCourses, enrichmentFile.items);
      fs.writeFileSync(REVIEW_REPORT_PATH, report, "utf8");
    }

    if (options.mode === "full") {
      const fullReport = buildFullReport(allCourses, enrichmentFile.items);
      fs.writeFileSync(FULL_REPORT_PATH, fullReport, "utf8");
    }
  }

  console.log("");
  console.log("Summary");
  console.log(`processed=${processedCount}`);
  console.log(`enriched=${enrichedCount}`);
  console.log(`skipped=${skippedCount}`);
  console.log(`cleaned=${cleanedCount}`);
  console.log(`failed=${failedCount}`);
  if (!options.dryRun) {
    console.log(`saved: ${COURSE_CONTENT_ENRICHMENT_PATH}`);
    if (options.mode === "pilot") {
      console.log(`review: ${REVIEW_REPORT_PATH}`);
    }
    if (options.mode === "full") {
      console.log(`full report: ${FULL_REPORT_PATH}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
