import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_COURSE_RESULTS_CSV,
  DEFAULT_DAILY_RESULTS_CSV,
  DEFAULT_MANUAL_REVIEW_CSV,
  DEFAULT_SUMMARY_CSV,
  DAILY_RESULT_HEADERS,
  readDailyResults,
  writeCourseResultsCsv,
  writeManualReviewCsv,
  writeSummaryCsv,
} from "./lib/teescanner/batchIo";
import { loadCourseEnrichmentRows } from "./lib/teescanner/courseEnrichment";
import { buildAllSummaries, buildManualReviewRows } from "./lib/teescanner/summary";
import { rowsToCsv } from "./lib/csvUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const MASTER_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");

function parseArgs(argv: string[]): { startRow: number; endRow: number; dryRun: boolean } {
  let startRow = 1;
  let endRow = 100;
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--start-row") startRow = Number.parseInt(argv[++i] ?? "", 10);
    else if (arg === "--end-row") endRow = Number.parseInt(argv[++i] ?? "", 10);
    else if (arg === "--dry-run") dryRun = true;
  }
  return { startRow, endRow, dryRun };
}

function writeDailyResults(filePath: string, rows: ReturnType<typeof readDailyResults>): void {
  const body = rowsToCsv(
    [...DAILY_RESULT_HEADERS],
    rows.map((row) => DAILY_RESULT_HEADERS.map((header) => row[header] ?? "")),
  );
  fs.writeFileSync(filePath, `\uFEFF${body}`, "utf8");
}

function main(): void {
  const { startRow, endRow, dryRun } = parseArgs(process.argv.slice(2));
  const { rows: masterRows } = loadCourseEnrichmentRows(MASTER_CSV);
  const targetIds = new Set(
    masterRows
      .filter((row) => row.rowIndex >= startRow && row.rowIndex <= endRow)
      .map((row) => row.id),
  );

  const daily = readDailyResults(DEFAULT_DAILY_RESULTS_CSV);
  const approved: string[] = [];
  const updated = daily.map((row) => {
    if (!targetIds.has(row.id)) return row;
    if (row.review_action !== "manual_review") return row;
    if (row.status !== "success" || !row.price_min.trim()) return row;
    approved.push(`${row.id}|${row.round_day}`);
    return { ...row, review_action: "accept_price" };
  });

  console.log(
    `Approve manual_review → accept_price (rows ${startRow}-${endRow}, priced success only)`,
  );
  console.log(`Target courses: ${targetIds.size}`);
  console.log(`Daily rows to approve: ${approved.length}`);
  if (approved.length > 0) {
    console.log(approved.slice(0, 10).join("\n"));
    if (approved.length > 10) console.log(`... and ${approved.length - 10} more`);
  }

  if (dryRun) {
    console.log("Dry run — no files written.");
    return;
  }

  writeDailyResults(DEFAULT_DAILY_RESULTS_CSV, updated);
  const summaries = buildAllSummaries(updated);
  writeSummaryCsv(DEFAULT_SUMMARY_CSV, summaries);
  writeCourseResultsCsv(DEFAULT_COURSE_RESULTS_CSV, summaries);
  const manualReviewRows = buildManualReviewRows(summaries);
  writeManualReviewCsv(DEFAULT_MANUAL_REVIEW_CSV, manualReviewRows);

  const acceptCount = summaries.filter(
    (row) => targetIds.has(row.id) && row.review_action === "accept_price",
  ).length;
  console.log(`Summary accept_price in range: ${acceptCount}/${targetIds.size}`);
  console.log(`Manual review list: ${manualReviewRows.length} row(s)`);
}

main();
