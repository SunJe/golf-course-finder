import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csvUtils";
import { readCsvWithEncodingGuess } from "./encodingUtils";
import {
  loadCoursesFromCourseLinks,
  normalizeCsvHeader,
} from "./naverPriceCandidates";
import { getProjectRoot } from "./sourceRegistry";

export interface CoverageGap {
  index: number;
  id: string;
  name: string;
}

export interface CoverageReport {
  masterCourseCount: number;
  collectedUniqueIds: number;
  firstMissingIndex: number;
  nextOffsetRecommended: number;
  offsetMatchesUniqueCount: boolean;
  gaps: CoverageGap[];
}

function loadCollectedIds(candidatesPath: string): Set<string> {
  const ids = new Set<string>();
  if (!fs.existsSync(candidatesPath)) return ids;
  const encoding = readCsvWithEncodingGuess(candidatesPath);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  const idIndex = headers.indexOf("id");
  for (const cells of parsed.rows) {
    const id = idIndex >= 0 ? (cells[idIndex] ?? "").trim() : "";
    if (id) ids.add(id);
  }
  return ids;
}

export function computeCoverageReport(
  root = getProjectRoot(),
): CoverageReport {
  const finalImport = path.join(
    root,
    "data/golf_courses_import_geocoded_final.csv",
  );
  const courseLinks = path.join(root, "data/enrichment/course_links.csv");
  const candidates = path.join(
    root,
    "data/enrichment/naver_price_candidates.csv",
  );

  const courses = loadCoursesFromCourseLinks(courseLinks, finalImport);
  const collectedIds = loadCollectedIds(candidates);

  const gaps: CoverageGap[] = [];
  let firstMissingIndex = courses.length;

  for (let index = 0; index < courses.length; index += 1) {
    const course = courses[index];
    if (!collectedIds.has(course.id)) {
      gaps.push({ index, id: course.id, name: course.name });
      if (firstMissingIndex === courses.length) {
        firstMissingIndex = index;
      }
    }
  }

  const collectedUniqueIds = collectedIds.size;
  const offsetMatchesUniqueCount =
    firstMissingIndex === collectedUniqueIds ||
    (gaps.length === 0 && firstMissingIndex === courses.length);

  return {
    masterCourseCount: courses.length,
    collectedUniqueIds,
    firstMissingIndex,
    nextOffsetRecommended: firstMissingIndex,
    offsetMatchesUniqueCount,
    gaps,
  };
}

export function printCoverageReport(report: CoverageReport): void {
  console.log("");
  console.log("=== Master course coverage ===");
  console.log(`Master courses       : ${report.masterCourseCount}`);
  console.log(`Collected unique ids : ${report.collectedUniqueIds}`);
  console.log(`First missing index  : ${report.firstMissingIndex}`);
  console.log(`Next offset (recommend): ${report.nextOffsetRecommended}`);

  if (report.offsetMatchesUniqueCount) {
    console.log(
      "Offset check         : unique id count matches first missing index",
    );
  } else {
    console.warn(
      `[warn] unique id count (${report.collectedUniqueIds}) differs from first missing index (${report.firstMissingIndex})`,
    );
    const preview = report.gaps.slice(0, 15);
    console.warn("[warn] Missing courses in master order (first gaps):");
    for (const gap of preview) {
      console.warn(
        `  index ${gap.index}: ${gap.id} (${gap.name})`,
      );
    }
    if (report.gaps.length > 15) {
      console.warn(`  ... and ${report.gaps.length - 15} more gaps`);
    }
    console.warn(
      "Use --offset <firstMissingIndex> for sequential fill, or fix gaps first.",
    );
  }
}
