import fs from "node:fs";
import path from "node:path";
import {
  COURSE_ENRICHMENT_EDIT_HEADERS,
  type CourseEnrichmentEditRow,
} from "../lib/enrichment/courseEnrichmentEdit";
import {
  createEmptyReportCounters,
  mergeCourseWithTeescanner,
  mergedCsvHeaders,
  mergedRowToCells,
  parseSummaryRows,
  loadSummaryById,
  updateReportCounters,
  type MergeReportCounters,
} from "../lib/enrichment/teescannerPriceMerge";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_COURSE_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const DEFAULT_TEESCANNER_CSV = path.join(
  ROOT,
  "data/enrichment/teescanner_price_course_summary.csv",
);
const PREVIEW_CSV = path.join(
  ROOT,
  "data/enrichment/course_enrichment_edit.teescanner_preview.csv",
);
const REPORT_JSON = path.join(ROOT, "data/enrichment/teescanner_merge_report.json");

interface CliOptions {
  dryRun: boolean;
  writePreview: boolean;
  applyCsv: boolean;
  courseCsv: string;
  teescannerCsv: string;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") return fallback;
  const normalized = value.toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return fallback;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: true,
    writePreview: false,
    applyCsv: false,
    courseCsv: DEFAULT_COURSE_CSV,
    teescannerCsv: DEFAULT_TEESCANNER_CSV,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => argv[index + 1] ?? "";
    if (arg === "--dry-run") options.dryRun = parseBoolean(next(), true);
    else if (arg === "--write-preview") options.writePreview = parseBoolean(next(), true);
    else if (arg === "--apply-csv") options.applyCsv = parseBoolean(next(), true);
    else if (arg === "--course-csv") {
      const value = next();
      options.courseCsv = path.isAbsolute(value) ? value : path.join(ROOT, value);
    } else if (arg === "--teescanner-csv") {
      const value = next();
      options.teescannerCsv = path.isAbsolute(value) ? value : path.join(ROOT, value);
    }
  }

  if (options.applyCsv) {
    options.dryRun = false;
    options.writePreview = true;
  }

  return options;
}

function loadCourseRows(inputPath: string): {
  headers: string[];
  rows: CourseEnrichmentEditRow[];
} {
  const encoding = readCsvWithEncodingGuess(inputPath);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  const rows = parsed.rows.map((cells) => {
    const row = {} as CourseEnrichmentEditRow;
    for (const header of COURSE_ENRICHMENT_EDIT_HEADERS) {
      const idx = headers.indexOf(header);
      row[header] = idx >= 0 ? (cells[idx] ?? "").trim() : "";
    }
    return row;
  });
  return { headers, rows };
}

function loadTeescannerRows(inputPath: string) {
  const encoding = readCsvWithEncodingGuess(inputPath);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  return parseSummaryRows(headers, parsed.rows);
}

function timestampBackupPath(courseCsv: string): string {
  const dir = path.dirname(courseCsv);
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "_");
  return path.join(dir, `course_enrichment_edit.backup.${stamp}.csv`);
}

function printSummary(report: MergeReportCounters & { previewPath: string; backupPath: string; appliedToOriginalCsv: boolean }): void {
  console.log("");
  console.log("=== TeeScanner price merge ===");
  console.log(`Matched TeeScanner rows: ${report.matchedById}`);
  console.log(`Price updated from TeeScanner: ${report.priceUpdatedCount}`);
  console.log(`Existing price overwritten by TeeScanner: ${report.priceOverwrittenByTeescannerCount}`);
  console.log(
    `Existing price kept because TeeScanner had no valid price: ${report.priceKeptExistingCount}`,
  );
  console.log(`Manual review prices reflected: ${report.manualReviewCount}`);
  console.log(`Partial day slot prices reflected: ${report.partialDaySlotsCount}`);
  console.log(`Accept price rows reflected: ${report.acceptPriceCount}`);
  console.log(`Needs check set: ${report.needsCheckSetCount}`);
  console.log(`No price from TeeScanner: ${report.noPriceFromTeescannerCount}`);
  console.log(`Missing in course CSV: ${report.missingInCourseCsv.length}`);
  console.log(`Missing in TeeScanner CSV: ${report.missingInTeescannerCsv.length}`);
  console.log(`Preview: ${report.previewPath}`);
  if (report.backupPath) console.log(`Backup: ${report.backupPath}`);
  console.log(`Applied to original CSV: ${report.appliedToOriginalCsv ? "yes" : "no"}`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(options.courseCsv)) {
    throw new Error(`Course CSV not found: ${options.courseCsv}`);
  }
  if (!fs.existsSync(options.teescannerCsv)) {
    throw new Error(`TeeScanner summary CSV not found: ${options.teescannerCsv}`);
  }

  const { headers: courseHeaders, rows: courseRows } = loadCourseRows(options.courseCsv);
  const teescannerRows = loadTeescannerRows(options.teescannerCsv);
  const summaryById = loadSummaryById(teescannerRows);
  const courseIds = new Set(courseRows.map((row) => row.id));

  const counters = createEmptyReportCounters(courseRows.length, teescannerRows.length);
  counters.missingInCourseCsv = teescannerRows
    .map((row) => row.id)
    .filter((id) => id && !courseIds.has(id));
  counters.missingInTeescannerCsv = courseRows
    .map((row) => row.id)
    .filter((id) => id && !summaryById.has(id));

  const outputHeaders = mergedCsvHeaders(courseHeaders);
  const mergedRows = courseRows.map((courseRow) => {
    const summary = summaryById.get(courseRow.id);
    const { row, decision } = mergeCourseWithTeescanner(courseRow, summary);
    updateReportCounters(counters, courseRow, summary, decision);
    return row;
  });

  const previewCsv = rowsToCsv(
    outputHeaders,
    mergedRows.map((row) => mergedRowToCells(outputHeaders, row)),
  );

  let backupPath = "";
  let appliedToOriginalCsv = false;

  if (options.writePreview || options.applyCsv) {
    writeFileUtf8Bom(PREVIEW_CSV, previewCsv);
  }

  if (options.applyCsv) {
    backupPath = timestampBackupPath(options.courseCsv);
    fs.copyFileSync(options.courseCsv, backupPath);
    writeFileUtf8Bom(options.courseCsv, previewCsv);
    appliedToOriginalCsv = true;
  }

  const report = {
    ...counters,
    backupPath: backupPath || null,
    previewPath: options.writePreview || options.applyCsv ? PREVIEW_CSV : null,
    appliedToOriginalCsv,
    courseCsv: path.relative(ROOT, options.courseCsv).replace(/\\/g, "/"),
    teescannerCsv: path.relative(ROOT, options.teescannerCsv).replace(/\\/g, "/"),
    generatedAt: new Date().toISOString(),
    dryRun: options.dryRun && !options.applyCsv,
  };

  fs.mkdirSync(path.dirname(REPORT_JSON), { recursive: true });
  fs.writeFileSync(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  printSummary({
    ...counters,
    previewPath: report.previewPath ?? "(not written)",
    backupPath,
    appliedToOriginalCsv,
  });
  console.log(`Report JSON: ${REPORT_JSON}`);

  if (options.dryRun && !options.applyCsv && !options.writePreview) {
    console.log("Dry run only — no preview written. Use --write-preview true to export preview CSV.");
  }
}

main();
