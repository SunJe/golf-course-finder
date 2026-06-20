import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { buildBatchQualityReport } from "./lib/enrichmentQualityReport";
import { inspectEnrichmentState } from "./lib/naverEnrichmentInspect";
import { computeCoverageReport } from "./lib/naverCoverage";
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
const OUTPUT_MD = path.join(ROOT, "data/enrichment/enrichment_quality_report.md");
const CANDIDATES_CSV = path.join(
  ROOT,
  "data/enrichment/naver_price_candidates.csv",
);
const FINAL_IMPORT_CSV = path.join(
  ROOT,
  "data/golf_courses_import_geocoded_final.csv",
);
const COURSE_LINKS_CSV = path.join(ROOT, "data/enrichment/course_links.csv");

function pct(n: number, total: number): string {
  if (total === 0) return "0%";
  return `${((n / total) * 100).toFixed(1)}% (${n}/${total})`;
}

function loadAllCandidates(): NaverPriceCandidateRow[] {
  if (!fs.existsSync(CANDIDATES_CSV)) return [];
  const encoding = readCsvWithEncodingGuess(CANDIDATES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  return parsed.rows.map((cells) => rowCellsToCandidate(cells, headers));
}

function findDuplicateIds(): string[] {
  const encoding = readCsvWithEncodingGuess(CANDIDATES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  const idIndex = headers.indexOf("id");
  const seen = new Map<string, number>();
  const duplicates: string[] = [];
  for (const cells of parsed.rows) {
    const id = idIndex >= 0 ? (cells[idIndex] ?? "").trim() : "";
    if (!id) continue;
    seen.set(id, (seen.get(id) ?? 0) + 1);
    if (seen.get(id) === 2) duplicates.push(id);
  }
  return duplicates;
}

function isSourceUrlOnly(row: NaverPriceCandidateRow): boolean {
  const hasContact =
    row.candidate_phone.trim() ||
    row.candidate_homepage_url.trim() ||
    row.candidate_price_text.trim() ||
    row.candidate_difficulty.trim() ||
    row.candidate_avg_score.trim();
  return Boolean(row.source_url.trim()) && !hasContact && !row.candidate_title.trim();
}

function hasBookingUrlColumns(): { booking: boolean; candidateBooking: boolean } {
  if (!fs.existsSync(CANDIDATES_CSV)) {
    return { booking: false, candidateBooking: false };
  }
  const encoding = readCsvWithEncodingGuess(CANDIDATES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  return {
    booking: headers.includes("booking_url"),
    candidateBooking: headers.includes("candidate_booking_url"),
  };
}

function topAttention(rows: NaverPriceCandidateRow[], limit: number): string[] {
  return rows
    .map((row) => {
      const mismatch = assessCandidateMismatch(row);
      const sortKey = computeReviewSortKey({
        suspectedMismatch: mismatch.suspectedMismatch,
        candidate_confidence: row.candidate_confidence,
        candidate_phone: row.candidate_phone,
        candidate_homepage_url: row.candidate_homepage_url,
        address: row.address,
        candidate_address: row.candidate_address,
        name: row.name,
        candidate_title: row.candidate_title,
        candidate_price_text: row.candidate_price_text,
        reviewPriority: mismatch.reviewPriority,
      });
      return { row, sortKey, mismatch };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(0, limit)
    .map(
      ({ row, mismatch }) =>
        `- **${row.name}** (\`${row.id}\`) — confidence=${row.candidate_confidence || "n/a"}, mismatch=${mismatch.suspectedMismatch ? "yes" : "no"}${mismatch.mismatchReason ? ` (${mismatch.mismatchReason})` : ""}`,
    );
}

function main(): void {
  const state = inspectEnrichmentState(ROOT);
  const coverage = computeCoverageReport(ROOT);
  const rows = loadAllCandidates();
  const report = buildBatchQualityReport(rows);
  const duplicates = findDuplicateIds();
  const bookingCols = hasBookingUrlColumns();
  const low = rows.filter((row) => row.candidate_confidence === "low");
  const mismatches = rows.filter(
    (row) => assessCandidateMismatch(row).suspectedMismatch,
  );
  const sourceOnly = rows.filter(isSourceUrlOnly);
  const courses = loadCoursesFromCourseLinks(COURSE_LINKS_CSV, FINAL_IMPORT_CSV);

  const lines: string[] = [
    "# Naver Enrichment Quality Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Coverage",
    "",
    `- Master courses: **${coverage.masterCourseCount}**`,
    `- Collected unique ids: **${coverage.collectedUniqueIds}**`,
    `- Coverage: **${((coverage.collectedUniqueIds / coverage.masterCourseCount) * 100).toFixed(1)}%**`,
    `- Missing courses: **${coverage.gaps.length}**`,
    `- First missing index: **${coverage.firstMissingIndex}**`,
    "",
  ];

  if (coverage.gaps.length > 0) {
    lines.push("### Missing courses (first 30)", "");
    for (const gap of coverage.gaps.slice(0, 30)) {
      lines.push(`- [${gap.index}] ${gap.name} (\`${gap.id}\`)`);
    }
    if (coverage.gaps.length > 30) {
      lines.push(`- ... and ${coverage.gaps.length - 30} more`);
    }
    lines.push("");
  }

  lines.push(
    "## Data integrity",
    "",
    `- Duplicate ids: **${duplicates.length === 0 ? "none" : duplicates.join(", ")}**`,
    `- Slash difficulty (candidates): **${state.slashDifficultyCandidates}**`,
    `- Slash difficulty (review): **${state.slashDifficultyReview}**`,
    `- Mojibake warnings: **${state.mojibakeWarnings.length === 0 ? "none" : state.mojibakeWarnings.join("; ")}**`,
    `- booking_url column present: **${bookingCols.booking ? "YES (unexpected)" : "no"}**`,
    `- candidate_booking_url column present: **${bookingCols.candidateBooking ? "YES (unexpected)" : "no"}**`,
    "",
    "## Fill rates (collected candidates)",
    "",
    `- Phone: ${pct(report.phoneRate, report.total)}`,
    `- Homepage: ${pct(report.homepageRate, report.total)}`,
    `- Price (reservation panel only): ${pct(report.priceRate, report.total)}`,
    `- Difficulty: ${pct(report.difficultyRate, report.total)}`,
    `- Avg score: ${pct(report.avgScoreRate, report.total)}`,
    "",
    "## Confidence",
    "",
    `- High: **${report.confidenceHigh}**`,
    `- Medium: **${report.confidenceMedium}**`,
    `- Low: **${report.confidenceLow}**`,
    `- Suspected mismatch: **${mismatches.length}**`,
    `- Source URL only: **${report.sourceUrlOnly}**`,
    `- Empty price (expected when no Naver reservation): **${report.emptyPrice}**`,
    "",
    "## Manual review priority (top 30)",
    "",
    ...topAttention(rows, 30),
    "",
    "## Low confidence list",
    "",
  );

  if (low.length === 0) {
    lines.push("- none");
  } else {
    for (const row of low) {
      lines.push(
        `- ${row.name} (\`${row.id}\`) — matched=${row.matched_query || row.query_variant}`,
      );
    }
  }

  lines.push(
    "",
    "## Suspected mismatch list",
    "",
  );

  if (mismatches.length === 0) {
    lines.push("- none");
  } else {
    for (const row of mismatches.slice(0, 50)) {
      const assessment = assessCandidateMismatch(row);
      lines.push(
        `- ${row.name} (\`${row.id}\`) — ${assessment.mismatchReason}`,
      );
    }
    if (mismatches.length > 50) {
      lines.push(`- ... and ${mismatches.length - 50} more`);
    }
  }

  lines.push(
    "",
    "## Policy checks",
    "",
    "- Price: Naver reservation panel only (no blog fallback)",
    "- Difficulty: numeric only in CSV (`9`, `2.3`); `/10` UI only",
    "- approve_* / review_*: not auto-filled",
    "- Supabase: no automatic DB writes in this pipeline",
    "",
    "## Next steps",
    "",
    "1. Edit `data/enrichment/manual_review_worklist.csv` manually",
    "2. After review, run merge scripts (separate step)",
    "",
  );

  fs.writeFileSync(OUTPUT_MD, `${lines.join("\n")}\n`, "utf8");

  console.log("");
  console.log("=== Enrichment quality report ===");
  console.log(`Output: ${OUTPUT_MD}`);
  console.log(`Collected: ${coverage.collectedUniqueIds}/${courses.length}`);
}

main();
