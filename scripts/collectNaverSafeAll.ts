import fs from "node:fs";
import { execSync } from "node:child_process";
import {
  inspectEnrichmentState,
  printEnrichmentStateReport,
} from "./lib/naverEnrichmentInspect";
import {
  computeCoverageReport,
  printCoverageReport,
} from "./lib/naverCoverage";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  buildBatchQualityReport,
  printBatchQualityReport,
} from "./lib/enrichmentQualityReport";
import { assessCandidateMismatch, isSeriousBatchMismatch } from "./lib/mismatchUtils";
import { verifyNormalizeExports } from "./lib/safeBatchPreflight";
import {
  loadCoursesFromCourseLinks,
  normalizeCsvHeader,
  rowCellsToCandidate,
  type NaverPriceCandidateRow,
} from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const FINAL_IMPORT_CSV = `${ROOT}/data/golf_courses_import_geocoded_final.csv`;
const COURSE_LINKS_CSV = `${ROOT}/data/enrichment/course_links.csv`;
const CANDIDATES_CSV = `${ROOT}/data/enrichment/naver_price_candidates.csv`;

interface AllCliOptions {
  batchSize: number;
  delayMs: number;
  dryRun: boolean;
  maxBatches: number | null;
  stopOnError: boolean;
}

interface BatchRunRecord {
  batchNumber: number;
  offset: number;
  limit: number;
  success: boolean;
  collected: number;
  failed: number;
  stopReason?: string;
}

function parseAllCli(argv: string[]): AllCliOptions {
  let batchSize = 50;
  let delayMs = 3000;
  let dryRun = false;
  let maxBatches: number | null = null;
  let stopOnError = true;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--batch-size") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value > 0) batchSize = value;
    } else if (arg === "--delay-ms") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value >= 0) delayMs = value;
    } else if (arg === "--max-batches") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (Number.isFinite(value) && value > 0) maxBatches = value;
    } else if (arg === "--stop-on-error") {
      stopOnError = argv[i + 1] !== "false";
    }
  }

  return { batchSize, delayMs, dryRun, maxBatches, stopOnError };
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

function evaluateBatchStopConditions(
  batchRows: NaverPriceCandidateRow[],
  failedCount: number,
  state: ReturnType<typeof inspectEnrichmentState>,
): string | null {
  const report = buildBatchQualityReport(batchRows, { failed: failedCount });
  const mismatchCount = batchRows.filter((row) =>
    isSeriousBatchMismatch(row),
  ).length;

  if (state.mojibakeWarnings.length > 0) {
    return `mojibake suspected: ${state.mojibakeWarnings.join(", ")}`;
  }
  if (state.slashDifficultyCandidates > 0 || state.slashDifficultyReview > 0) {
    return "9/10 slash difficulty format detected";
  }
  if (report.failed >= 5) {
    return `batch failures >= 5 (${report.failed})`;
  }
  if (report.sourceUrlOnly >= 10) {
    return `source_url only >= 10 (${report.sourceUrlOnly})`;
  }
  if (report.confidenceLow >= 10) {
    return `low confidence >= 10 (${report.confidenceLow})`;
  }
  if (mismatchCount >= 10) {
    return `suspected_mismatch >= 10 (${mismatchCount})`;
  }
  return null;
}

function printInitialState(): {
  startUniqueIds: number;
  duplicates: string[];
} {
  const state = inspectEnrichmentState(ROOT);
  printEnrichmentStateReport(state, "Initial state");
  const coverage = computeCoverageReport(ROOT);
  printCoverageReport(coverage);
  const duplicates = findDuplicateIds();
  console.log("");
  console.log(`Duplicate ids          : ${duplicates.length === 0 ? "none" : duplicates.join(", ")}`);
  console.log(`Missing courses        : ${coverage.gaps.length}`);
  if (coverage.gaps.length > 0) {
    const first = coverage.gaps[0];
    console.log(`First missing course   : [${first.index}] ${first.name} (${first.id})`);
  }
  return { startUniqueIds: state.candidateUniqueIds, duplicates };
}

async function main(): Promise<void> {
  const options = parseAllCli(process.argv.slice(2));

  console.log("");
  console.log("=== Naver safe all collection ===");
  console.log(`Mode       : ${options.dryRun ? "dry-run" : "live"}`);
  console.log(`Batch size : ${options.batchSize}`);
  console.log(`Delay ms   : ${options.delayMs}`);
  console.log(`Stop on err: ${options.stopOnError}`);

  verifyNormalizeExports();
  console.log("[ok] normalizeDifficultyField export verified");

  const initial = printInitialState();
  const batchRecords: BatchRunRecord[] = [];

  if (options.dryRun) {
    const coverage = computeCoverageReport(ROOT);
    const gapChunks: Array<typeof coverage.gaps> = [];
    for (let i = 0; i < coverage.gaps.length; i += options.batchSize) {
      gapChunks.push(coverage.gaps.slice(i, i + options.batchSize));
    }
  const max = options.maxBatches ?? gapChunks.length;
    for (let i = 0; i < Math.min(gapChunks.length, max); i += 1) {
      const chunk = gapChunks[i];
      const offset = chunk[0]?.index ?? 0;
      console.log("");
      console.log(`=== Batch ${i + 1} plan (dry-run) ===`);
      console.log(`Offset : ${offset}`);
      console.log(`Limit  : ${chunk.length}`);
      for (const gap of chunk.slice(0, 3)) {
        console.log(`  - ${gap.name} (${gap.id})`);
      }
      if (chunk.length > 3) console.log(`  ... and ${chunk.length - 3} more`);
      batchRecords.push({
        batchNumber: i + 1,
        offset,
        limit: chunk.length,
        success: true,
        collected: chunk.length,
        failed: 0,
      });
    }
    console.log("");
    console.log(`=== Dry-run complete: ${batchRecords.length} batch(es), ${coverage.gaps.length} courses remaining ===`);
    console.log(
      `Would run: npm run collect:naver-safe-all -- --batch-size ${options.batchSize} --delay-ms ${options.delayMs}`,
    );
    return;
  }

  let batchNumber = 0;

  while (true) {
    const coverage = computeCoverageReport(ROOT);
    if (coverage.gaps.length === 0) {
      console.log("");
      console.log("[done] All master courses collected.");
      break;
    }

    if (options.maxBatches !== null && batchNumber >= options.maxBatches) {
      console.log("");
      console.log(`[stop] Reached --max-batches ${options.maxBatches}`);
      break;
    }

    batchNumber += 1;
    const offset = coverage.nextOffsetRecommended;
    const limit = Math.min(options.batchSize, coverage.gaps.length);
    const courses = loadCoursesFromCourseLinks(COURSE_LINKS_CSV, FINAL_IMPORT_CSV);
    const batchCourses = courses.slice(offset, offset + limit);

    console.log("");
    console.log(`=== Batch ${batchNumber} plan ===`);
    console.log(`Offset : ${offset}`);
    console.log(`Limit  : ${limit}`);
    console.log(`Remaining gaps: ${coverage.gaps.length}`);
    for (const course of batchCourses.slice(0, 3)) {
      console.log(`  - ${course.name} (${course.id})`);
    }
    if (batchCourses.length > 3) {
      console.log(`  ... and ${batchCourses.length - 3} more`);
    }

    const beforeIds = new Set(loadCandidatesById().keys());
    const cmd = `npm run collect:naver-safe-batch -- --limit ${limit} --delay-ms ${options.delayMs}`;
    console.log(`Running: ${cmd}`);

    let exitCode = 0;
    try {
      execSync(cmd, { cwd: ROOT, stdio: "inherit" });
    } catch {
      exitCode = 1;
    }

    const afterMap = loadCandidatesById();
    const batchRows = batchCourses
      .map((course) => afterMap.get(course.id))
      .filter((row): row is NaverPriceCandidateRow => Boolean(row));
    const failed = Math.max(0, batchCourses.length - batchRows.length);
    const newCount = [...afterMap.keys()].filter((id) => !beforeIds.has(id)).length;

    printBatchQualityReport(`Batch ${batchNumber} quality`, batchRows, {
      failed,
    });

    const state = inspectEnrichmentState(ROOT);
    const stopReason = evaluateBatchStopConditions(batchRows, failed, state);

    batchRecords.push({
      batchNumber,
      offset,
      limit,
      success: exitCode === 0 && failed < 5 && !stopReason,
      collected: newCount,
      failed,
      stopReason: stopReason ?? (exitCode !== 0 ? "safe-batch exit code != 0" : undefined),
    });

    if (exitCode !== 0 && options.stopOnError) {
      console.error(`[STOP] Batch ${batchNumber} failed (exit ${exitCode})`);
      console.error(`Retry: npm run collect:naver-safe-all -- --batch-size ${options.batchSize} --delay-ms ${options.delayMs}`);
      process.exit(1);
    }

    if (stopReason && options.stopOnError) {
      console.error(`[STOP] Batch ${batchNumber}: ${stopReason}`);
      console.error(`Retry: npm run collect:naver-safe-all -- --batch-size ${options.batchSize} --delay-ms ${options.delayMs}`);
      process.exit(1);
    }
  }

  console.log("");
  console.log("=== All batches summary ===");
  console.log(`Start unique ids : ${initial.startUniqueIds}`);
  const finalState = inspectEnrichmentState(ROOT);
  const finalCoverage = computeCoverageReport(ROOT);
  console.log(`Final unique ids : ${finalState.candidateUniqueIds}`);
  console.log(`Batches planned/run: ${batchRecords.length}`);
  for (const record of batchRecords) {
    const mark = record.success ? "OK" : "FAILED";
    console.log(
      `[${mark}] batch ${record.batchNumber} offset=${record.offset} limit=${record.limit} collected=${record.collected} failed=${record.failed}${record.stopReason ? ` (${record.stopReason})` : ""}`,
    );
  }
  console.log(`Remaining gaps   : ${finalCoverage.gaps.length}`);

  if (finalCoverage.gaps.length === 0) {
    console.log("");
    console.log("Running post-collection artifacts...");
    execSync("npm run generate:manual-review-worklist", { cwd: ROOT, stdio: "inherit" });
    execSync("npm run generate:enrichment-quality-report", { cwd: ROOT, stdio: "inherit" });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
