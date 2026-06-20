import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  assessCandidateMismatch,
  addressesLikelyMismatch,
  titlesLikelyMismatch,
} from "./lib/mismatchUtils";
import {
  loadCoursesFromCourseLinks,
  normalizeCsvHeader,
  rowCellsToCandidate,
  type NaverPriceCandidateRow,
} from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const FINAL_IMPORT_CSV = path.join(
  ROOT,
  "data/golf_courses_import_geocoded_final.csv",
);
const COURSE_LINKS_CSV = path.join(ROOT, "data/enrichment/course_links.csv");
const CANDIDATES_CSV = path.join(
  ROOT,
  "data/enrichment/naver_price_candidates.csv",
);
const OUTPUT_CSV = path.join(
  ROOT,
  "data/enrichment/course_enrichment_edit.csv",
);

import {
  COURSE_ENRICHMENT_EDIT_HEADERS,
  type CourseEnrichmentEditRow,
} from "../lib/enrichment/courseEnrichmentEdit";

function loadCandidatesById(): Map<string, NaverPriceCandidateRow> {
  const map = new Map<string, NaverPriceCandidateRow>();
  if (!fs.existsSync(CANDIDATES_CSV)) return map;
  const encoding = readCsvWithEncodingGuess(CANDIDATES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  for (const cells of parsed.rows) {
    const row = rowCellsToCandidate(cells, headers);
    if (row.id) map.set(row.id, row);
  }
  return map;
}

function loadExistingEditRows(): Map<string, CourseEnrichmentEditRow> {
  const map = new Map<string, CourseEnrichmentEditRow>();
  if (!fs.existsSync(OUTPUT_CSV)) return map;
  const encoding = readCsvWithEncodingGuess(OUTPUT_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  for (const cells of parsed.rows) {
    const row = rowCellsToEdit(cells, headers);
    if (row.id) map.set(row.id, row);
  }
  return map;
}

function rowCellsToEdit(
  cells: string[],
  headers: string[],
): CourseEnrichmentEditRow {
  const row = {} as CourseEnrichmentEditRow;
  for (const header of COURSE_ENRICHMENT_EDIT_HEADERS) {
    const idx = headers.indexOf(header);
    row[header] = idx >= 0 ? (cells[idx] ?? "").trim() : "";
  }
  return row;
}

function isSourceUrlOnly(candidate: NaverPriceCandidateRow): boolean {
  const hasContact =
    candidate.candidate_phone.trim() ||
    candidate.candidate_homepage_url.trim() ||
    candidate.candidate_price_text.trim() ||
    candidate.candidate_difficulty.trim() ||
    candidate.candidate_avg_score.trim();
  return (
    Boolean(candidate.source_url.trim()) &&
    !hasContact &&
    !candidate.candidate_title.trim()
  );
}

function computeNeedsCheck(
  row: CourseEnrichmentEditRow,
  candidate: NaverPriceCandidateRow | undefined,
): string {
  if (row.confidence === "low") return "y";
  if (!row.phone.trim()) return "y";
  if (!row.homepage_url.trim()) return "y";

  if (!candidate) {
    return row.source_url.trim() ? "y" : "";
  }

  const mismatch = assessCandidateMismatch(candidate);
  if (mismatch.suspectedMismatch) return "y";

  if (titlesLikelyMismatch(row.name, candidate.candidate_title)) return "y";
  if (addressesLikelyMismatch(row.address, candidate.candidate_address)) {
    return "y";
  }

  if (isSourceUrlOnly(candidate)) return "y";

  return "";
}

function rowFromCandidate(
  course: { id: string; name: string; address: string },
  candidate: NaverPriceCandidateRow | undefined,
): CourseEnrichmentEditRow {
  const row: CourseEnrichmentEditRow = {
    id: course.id,
    name: course.name,
    change_name_to: "",
    address: course.address,
    phone: candidate?.candidate_phone ?? "",
    homepage_url: candidate?.candidate_homepage_url ?? "",
    price_text: candidate?.candidate_price_text ?? "",
    price_min: candidate?.candidate_price_min ?? "",
    price_max: candidate?.candidate_price_max ?? "",
    price_type: candidate?.candidate_price_type ?? "",
    difficulty: candidate?.candidate_difficulty ?? "",
    avg_score: candidate?.candidate_avg_score ?? "",
    source_url: candidate?.source_url ?? "",
    confidence: candidate?.candidate_confidence ?? "",
    needs_check: "",
    note: "",
  };
  row.needs_check = computeNeedsCheck(row, candidate);
  return row;
}

function computeSortKey(row: CourseEnrichmentEditRow): number {
  let score = 0;
  if (row.needs_check === "y") score -= 10_000;
  if (row.confidence === "low") score -= 5_000;
  if (!row.phone.trim()) score -= 1_000;
  if (!row.homepage_url.trim()) score -= 500;
  return score;
}

export function buildCourseEnrichmentEditRows(): CourseEnrichmentEditRow[] {
  const courses = loadCoursesFromCourseLinks(COURSE_LINKS_CSV, FINAL_IMPORT_CSV);
  const candidates = loadCandidatesById();
  const existing = loadExistingEditRows();

  const rows: CourseEnrichmentEditRow[] = courses.map((course) => {
    const preserved = existing.get(course.id);
    if (preserved) {
      return { ...preserved };
    }
    return rowFromCandidate(course, candidates.get(course.id));
  });

  rows.sort((a, b) => computeSortKey(a) - computeSortKey(b));
  return rows;
}

function main(): void {
  const rows = buildCourseEnrichmentEditRows();
  const outputRows = rows.map((row) =>
    COURSE_ENRICHMENT_EDIT_HEADERS.map((header) => row[header] ?? ""),
  );

  writeFileUtf8Bom(
    OUTPUT_CSV,
    rowsToCsv([...COURSE_ENRICHMENT_EDIT_HEADERS], outputRows, { crlf: true }),
  );

  const needsCheckCount = rows.filter((row) => row.needs_check === "y").length;

  console.log("");
  console.log("=== Course enrichment edit CSV ===");
  console.log(`Output      : ${OUTPUT_CSV}`);
  console.log(`Rows        : ${rows.length}`);
  console.log(`needs_check : ${needsCheckCount} rows marked 'y'`);
  console.log(`Columns     : ${COURSE_ENRICHMENT_EDIT_HEADERS.join(", ")}`);
  console.log("");
  console.log("Edit this file directly. Re-run preserves existing row values by id.");
}

main();
