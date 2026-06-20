import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import {
  backupEnrichmentCsvs,
  printBackupResult,
} from "./lib/enrichmentBackup";
import { printBatchQualityReport } from "./lib/enrichmentQualityReport";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { verifyNormalizeExports } from "./lib/safeBatchPreflight";
import {
  inspectEnrichmentState,
  printEnrichmentStateReport,
} from "./lib/naverEnrichmentInspect";
import {
  computeCoverageReport,
  printCoverageReport,
} from "./lib/naverCoverage";
import {
  loadCoursesFromCourseLinks,
  normalizeCsvHeader,
  rowCellsToCandidate,
  type NaverPriceCandidateRow,
} from "./lib/naverPriceCandidates";
import { loadPreservedReviewFields } from "./lib/naverPriceReviewMerge";
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
const REVIEW_CSV = path.join(ROOT, "data/enrichment/naver_price_review.csv");

interface CliOptions {
  limit: number;
  dryRun: boolean;
  offsetOverride: number | null;
  delayMs: number;
}

function parseCliOptions(argv: string[]): CliOptions {
  let limit = 50;
  let dryRun = false;
  let offsetOverride: number | null = null;
  let delayMs = 3000;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--limit") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value > 0) limit = value;
    } else if (arg === "--offset") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value >= 0) offsetOverride = value;
    } else if (arg === "--delay-ms") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value >= 0) delayMs = value;
    }
  }

  return { limit, dryRun, offsetOverride, delayMs };
}

interface StepOutcome {
  step: string;
  success: boolean;
  detail?: string;
}

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

function snapshotApproveFields(): Map<string, string> {
  const preserved = loadPreservedReviewFields(REVIEW_CSV);
  const snapshot = new Map<string, string>();
  for (const [id, fields] of preserved.entries()) {
    snapshot.set(
      id,
      JSON.stringify({
        approve_phone: fields.approve_phone ?? "",
        approve_homepage: fields.approve_homepage ?? "",
        approve_price: fields.approve_price ?? "",
        approve_difficulty: fields.approve_difficulty ?? "",
        approve_avg_score: fields.approve_avg_score ?? "",
        review_phone: fields.review_phone ?? "",
        review_homepage_url: fields.review_homepage_url ?? "",
        review_price_min: fields.review_price_min ?? "",
        review_price_max: fields.review_price_max ?? "",
        review_price_type: fields.review_price_type ?? "",
        review_difficulty: fields.review_difficulty ?? "",
        review_avg_score: fields.review_avg_score ?? "",
        review_note: fields.review_note ?? "",
      }),
    );
  }
  return snapshot;
}

function compareApprovePreservation(
  before: Map<string, string>,
  after: Map<string, string>,
): { preserved: number; changed: string[] } {
  const changed: string[] = [];
  let preserved = 0;
  for (const [id, beforeJson] of before.entries()) {
    const afterJson = after.get(id);
    if (afterJson === beforeJson) {
      preserved += 1;
    } else if (afterJson !== undefined) {
      changed.push(id);
    }
  }
  return { preserved, changed };
}

function runShellStep(
  step: string,
  command: string,
  outcomes: StepOutcome[],
): boolean {
  console.log("");
  console.log(`Running: ${command}`);
  try {
    execSync(command, { cwd: ROOT, stdio: "inherit" });
    outcomes.push({ step, success: true });
    return true;
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Command exited with error";
    outcomes.push({ step, success: false, detail });
    console.error(`[FAILED] ${step}`);
    console.error(`  command: ${command}`);
    console.error(`  reason : ${detail}`);
    return false;
  }
}

function printStepSummary(
  outcomes: StepOutcome[],
  options: CliOptions,
  offset: number,
): void {
  console.log("");
  console.log("=== Step summary ===");
  for (const outcome of outcomes) {
    const mark = outcome.success ? "OK" : "FAILED";
    console.log(`[${mark}] ${outcome.step}`);
    if (!outcome.success && outcome.detail) {
      console.log(`       ${outcome.detail}`);
    }
  }

  const failed = outcomes.filter((outcome) => !outcome.success);
  if (failed.length === 0) return;

  console.log("");
  console.log("=== Retry commands ===");
  const failedSteps = new Set(failed.map((outcome) => outcome.step));

  if (failedSteps.has("collect")) {
    console.log(
      `npm run collect:naver-price-candidates -- --offset ${offset} --limit ${options.limit} --scrape --delay-ms ${options.delayMs}`,
    );
  }
  if (failedSteps.has("normalize")) {
    console.log("npm run normalize:naver-stats");
  }
  if (failedSteps.has("build")) {
    console.log("npm run build");
  }
  if (
    failedSteps.has("normalize") ||
    failedSteps.has("build")
  ) {
    console.log(
      `npm run collect:naver-safe-batch -- --limit ${options.limit} --offset ${offset}`,
    );
  }
}

async function main(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const outcomes: StepOutcome[] = [];

  console.log("");
  console.log("=== Naver safe batch ===");
  console.log(`Mode : ${options.dryRun ? "dry-run (no writes)" : "live"}`);
  console.log(`Limit: ${options.limit}`);

  try {
    verifyNormalizeExports();
    outcomes.push({ step: "preflight (normalizeDifficultyField)", success: true });
    console.log("[ok] normalizeDifficultyField export verified");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    outcomes.push({
      step: "preflight (normalizeDifficultyField)",
      success: false,
      detail,
    });
    console.error(`[FAILED] preflight: ${detail}`);
    printStepSummary(outcomes, options, 0);
    process.exit(1);
  }

  const beforeState = inspectEnrichmentState(ROOT);
  printEnrichmentStateReport(beforeState, "Pre-batch state");
  outcomes.push({ step: "inspect state", success: true });

  const coverage = computeCoverageReport(ROOT);
  printCoverageReport(coverage);
  outcomes.push({ step: "coverage check", success: true });

  const offset =
    options.offsetOverride ?? coverage.nextOffsetRecommended;

  if (
    options.offsetOverride !== null &&
    options.offsetOverride !== coverage.nextOffsetRecommended
  ) {
    console.warn(
      `[warn] Using explicit --offset ${options.offsetOverride} (recommended: ${coverage.nextOffsetRecommended})`,
    );
  }

  const courses = loadCoursesFromCourseLinks(COURSE_LINKS_CSV, FINAL_IMPORT_CSV);
  const batchCourses = courses.slice(offset, offset + options.limit);

  console.log("");
  console.log("=== Planned batch ===");
  console.log(`Offset               : ${offset}`);
  console.log(`Limit                : ${options.limit}`);
  console.log(`Courses in batch     : ${batchCourses.length}`);
  if (batchCourses.length > 0) {
    const preview = batchCourses.slice(0, 5);
    for (const course of preview) {
      console.log(`  - [${course.id}] ${course.name}`);
    }
    if (batchCourses.length > 5) {
      console.log(`  ... and ${batchCourses.length - 5} more`);
    }
  }

  if (options.dryRun) {
    console.log("");
    console.log("=== Dry-run complete (no backup, collection, normalize, or build) ===");
    console.log(
      `Would run: npm run collect:naver-price-candidates -- --offset ${offset} --limit ${options.limit} --scrape --delay-ms ${options.delayMs}`,
    );
    printStepSummary(outcomes, options, offset);
    return;
  }

  let backup;
  try {
    backup = backupEnrichmentCsvs(offset, ROOT);
    printBackupResult(backup);
    outcomes.push({ step: "CSV backup", success: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    outcomes.push({ step: "CSV backup", success: false, detail });
    console.error(`[FAILED] CSV backup: ${detail}`);
    printStepSummary(outcomes, options, offset);
    process.exit(1);
  }

  const approveBefore = snapshotApproveFields();
  const candidatesBefore = loadCandidatesById();

  console.log("");
  console.log("=== Before collection ===");
  console.log(
    "Before running collection, close CSV files in Excel, VS Code preview, or file explorer preview.",
  );
  console.log("Writing files: naver_price_candidates.csv, naver_price_review.csv");

  const collectCmd = `npm run collect:naver-price-candidates -- --offset ${offset} --limit ${options.limit} --scrape --delay-ms ${options.delayMs}`;
  const collectOk = runShellStep("collect", collectCmd, outcomes);

  const candidatesAfter = loadCandidatesById();
  const batchRows = batchCourses
    .map((course) => candidatesAfter.get(course.id))
    .filter((row): row is NaverPriceCandidateRow => Boolean(row));

  const batchNewCount = batchRows.filter(
    (row) => !candidatesBefore.has(row.id),
  ).length;
  const batchFailed = Math.max(0, batchCourses.length - batchRows.length);

  printBatchQualityReport("This batch quality", batchRows, {
    failed: batchFailed,
  });
  console.log(`New rows this batch  : ${batchNewCount}`);
  console.log(`Batch ids in scope   : ${batchCourses.length}`);

  const afterState = inspectEnrichmentState(ROOT);
  printEnrichmentStateReport(afterState, "Cumulative state");

  const allRows = [...candidatesAfter.values()];
  printBatchQualityReport("Cumulative quality", allRows);

  const approveAfter = snapshotApproveFields();
  const approveCheck = compareApprovePreservation(approveBefore, approveAfter);
  console.log("");
  console.log("=== approve/review preservation ===");
  console.log(`Rows unchanged       : ${approveCheck.preserved}`);
  if (approveCheck.changed.length > 0) {
    console.warn(
      `[warn] approve/review changed for: ${approveCheck.changed.join(", ")}`,
    );
  } else {
    console.log("approve/review values: preserved for existing rows");
  }

  const normalizeOk = runShellStep(
    "normalize",
    "npm run normalize:naver-stats",
    outcomes,
  );

  if (normalizeOk) {
    const normalizedState = inspectEnrichmentState(ROOT);
    console.log("");
    console.log("=== After normalize ===");
    console.log(
      `Slash difficulty (candidates): ${normalizedState.slashDifficultyCandidates}`,
    );
    console.log(
      `Slash difficulty (review)    : ${normalizedState.slashDifficultyReview}`,
    );
  }

  const buildOk = runShellStep("build", "npm run build", outcomes);

  const postCoverage = computeCoverageReport(ROOT);
  console.log("");
  console.log("=== Batch run complete ===");
  console.log(`Pre-batch unique ids : ${beforeState.candidateUniqueIds}`);
  console.log(`Post-batch unique ids: ${afterState.candidateUniqueIds}`);
  console.log(`Next recommended offset: ${postCoverage.nextOffsetRecommended}`);
  console.log(`Next recommended limit : 50`);

  printStepSummary(outcomes, options, offset);

  const anyFailed = outcomes.some((outcome) => !outcome.success);
  if (anyFailed) {
    if (collectOk && (!normalizeOk || !buildOk)) {
      console.warn(
        "[warn] Collection succeeded but a later step failed — CSV data is saved; retry normalize/build above.",
      );
    }
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
