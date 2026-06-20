import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  assessCandidateMismatch,
  computeReviewSortKey,
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
  "data/enrichment/manual_review_worklist.csv",
);

export const MANUAL_REVIEW_HEADERS = [
  "id",
  "name",
  "address",
  "candidate_title",
  "candidate_address",
  "candidate_phone",
  "candidate_homepage_url",
  "candidate_price_text",
  "candidate_price_min",
  "candidate_price_max",
  "candidate_price_type",
  "candidate_difficulty",
  "candidate_difficulty_text",
  "candidate_avg_score",
  "source_url",
  "confidence",
  "suspected_mismatch",
  "mismatch_reason",
  "query_variant",
  "matched_query",
  "manual_phone",
  "manual_homepage_url",
  "manual_price_text",
  "manual_price_min",
  "manual_price_max",
  "manual_price_type",
  "manual_difficulty",
  "manual_avg_score",
  "manual_status",
  "manual_note",
] as const;

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

function emptyCandidate(): NaverPriceCandidateRow {
  return {
    id: "",
    name: "",
    address: "",
    query: "",
    query_variant: "",
    attempted_queries: "",
    matched_query: "",
    source: "",
    candidate_title: "",
    candidate_address: "",
    candidate_phone: "",
    candidate_homepage_url: "",
    candidate_price_text: "",
    candidate_price_min: "",
    candidate_price_max: "",
    candidate_price_type: "unknown",
    candidate_difficulty: "",
    candidate_difficulty_text: "",
    candidate_avg_score: "",
    candidate_reservation_prices_text: "",
    candidate_confidence: "",
    needs_review: "",
    reason: "",
    source_url: "",
    collected_at: "",
  };
}

export function buildManualReviewRows(): Array<Record<string, string>> {
  const courses = loadCoursesFromCourseLinks(COURSE_LINKS_CSV, FINAL_IMPORT_CSV);
  const candidates = loadCandidatesById();

  const rows = courses.map((course) => {
    const candidate = candidates.get(course.id) ?? emptyCandidate();
    const mismatch = candidate.id
      ? assessCandidateMismatch(candidate)
      : {
          suspectedMismatch: true,
          mismatchReason: "not collected",
          reviewPriority: -1000,
        };

    const sortKey = computeReviewSortKey({
      suspectedMismatch: mismatch.suspectedMismatch,
      candidate_confidence: candidate.candidate_confidence || "low",
      candidate_phone: candidate.candidate_phone,
      candidate_homepage_url: candidate.candidate_homepage_url,
      address: course.address,
      candidate_address: candidate.candidate_address,
      name: course.name,
      candidate_title: candidate.candidate_title,
      candidate_price_text: candidate.candidate_price_text,
      reviewPriority: mismatch.reviewPriority,
    });

    return {
      sortKey,
      row: {
        id: course.id,
        name: course.name,
        address: course.address,
        candidate_title: candidate.candidate_title,
        candidate_address: candidate.candidate_address,
        candidate_phone: candidate.candidate_phone,
        candidate_homepage_url: candidate.candidate_homepage_url,
        candidate_price_text: candidate.candidate_price_text,
        candidate_price_min: candidate.candidate_price_min,
        candidate_price_max: candidate.candidate_price_max,
        candidate_price_type: candidate.candidate_price_type,
        candidate_difficulty: candidate.candidate_difficulty,
        candidate_difficulty_text: candidate.candidate_difficulty_text,
        candidate_avg_score: candidate.candidate_avg_score,
        source_url: candidate.source_url,
        confidence: candidate.candidate_confidence,
        suspected_mismatch: mismatch.suspectedMismatch ? "true" : "false",
        mismatch_reason: mismatch.mismatchReason,
        query_variant: candidate.query_variant,
        matched_query: candidate.matched_query,
        manual_phone: "",
        manual_homepage_url: "",
        manual_price_text: "",
        manual_price_min: "",
        manual_price_max: "",
        manual_price_type: "",
        manual_difficulty: "",
        manual_avg_score: "",
        manual_status: "pending",
        manual_note: "",
      },
    };
  });

  rows.sort((a, b) => a.sortKey - b.sortKey);
  return rows.map((entry) => entry.row);
}

function main(): void {
  const rows = buildManualReviewRows();
  const outputRows = rows.map((row) =>
    MANUAL_REVIEW_HEADERS.map((header) => row[header] ?? ""),
  );

  writeFileUtf8Bom(
    OUTPUT_CSV,
    rowsToCsv([...MANUAL_REVIEW_HEADERS], outputRows, { crlf: true }),
  );

  console.log("");
  console.log("=== Manual review worklist ===");
  console.log(`Output : ${OUTPUT_CSV}`);
  console.log(`Rows   : ${rows.length}`);
  console.log(`Sort   : suspected_mismatch → low confidence → missing fields → pending`);
  console.log(`manual_status default: pending`);
  console.log(`manual_* columns: empty (fill manually)`);
}

main();
