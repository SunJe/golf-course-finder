import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_STATS_OVERRIDE_HEADERS,
  courseStatsOverrideToCells,
  rowCellsToCourseStatsOverride,
  type CourseStatsOverrideRow,
} from "./lib/courseStatsOverrides";
import {
  resolveEnrichmentPath,
  verifyUtf8Bom,
  warnMojibakeInCsvFields,
} from "./lib/enrichmentCsvUtils";
import {
  loadNaverPriceReviewCsv,
  resolveApprovedStatsFields,
} from "./lib/naverPriceReviewMerge";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const REVIEW_CSV = resolveEnrichmentPath(
  ROOT,
  "data/enrichment/naver_price_review.csv",
);
const STATS_CSV = resolveEnrichmentPath(
  ROOT,
  "data/enrichment/course_stats_overrides.csv",
);

interface CliOptions {
  overwrite: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  return { overwrite: argv.includes("--overwrite") };
}

function loadExistingStats(): Map<string, CourseStatsOverrideRow> {
  const map = new Map<string, CourseStatsOverrideRow>();
  if (!fs.existsSync(STATS_CSV)) return map;

  const encoding = readCsvWithEncodingGuess(STATS_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));

  for (const cells of parsed.rows) {
    const row = rowCellsToCourseStatsOverride(cells, headers);
    if (!row.id) continue;
    map.set(row.id, row);
  }

  return map;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const reviewRows = loadNaverPriceReviewCsv(REVIEW_CSV);
  if (reviewRows.length === 0) {
    throw new Error(`Review CSV not found or empty: ${REVIEW_CSV}`);
  }

  const statsById = loadExistingStats();
  let merged = 0;
  let skippedExisting = 0;
  let skippedNoData = 0;

  for (const review of reviewRows) {
    const approved = resolveApprovedStatsFields(review);
    if (!approved) continue;

    const existing = statsById.get(review.id);
    if (existing && !options.overwrite) {
      const hasValues =
        existing.difficulty.trim() ||
        existing.avg_score.trim() ||
        existing.reservation_prices_text.trim();
      if (hasValues) {
        skippedExisting += 1;
        continue;
      }
    }

    if (
      !approved.difficulty &&
      !approved.avg_score &&
      !approved.reservation_prices_text
    ) {
      skippedNoData += 1;
      continue;
    }

    const row: CourseStatsOverrideRow = {
      id: review.id,
      name: review.name,
      difficulty: approved.difficulty,
      avg_score: approved.avg_score,
      reservation_prices_text: approved.reservation_prices_text,
      source_url: approved.source_url,
      source: "naver",
      checked_at: new Date().toISOString(),
      note: approved.note,
    };

    statsById.set(review.id, row);
    merged += 1;

    warnMojibakeInCsvFields(
      [row.name, row.difficulty, row.avg_score, row.note],
      review.id,
    );
  }

  const outputRows = [...statsById.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "ko"),
  );

  const csvBody = rowsToCsv(
    [...COURSE_STATS_OVERRIDE_HEADERS],
    outputRows.map(courseStatsOverrideToCells),
    { crlf: true },
  );
  writeFileUtf8Bom(STATS_CSV, csvBody);

  const hasBom = verifyUtf8Bom(STATS_CSV);

  console.log("");
  console.log("=== Merge approved Naver stats → course_stats_overrides.csv ===");
  console.log(`Review rows read     : ${reviewRows.length}`);
  console.log(`Stats rows merged    : ${merged}`);
  console.log(`Skip (existing)      : ${skippedExisting}`);
  console.log(`Skip (no stats data) : ${skippedNoData}`);
  console.log(`Total stats rows     : ${outputRows.length}`);
  console.log(`Overwrite mode       : ${options.overwrite ? "yes" : "no"}`);
  console.log(`Output               : ${STATS_CSV}`);
  console.log(`Encoding             : UTF-8 with BOM (${hasBom ? "verified" : "missing"})`);
  console.log(`Line endings         : CRLF`);
  console.log(`DB reflect           : not performed (stats file only)`);
}

main();
