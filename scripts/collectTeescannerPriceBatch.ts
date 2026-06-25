import fs from "node:fs";
import path from "node:path";
import {
  createTeescannerBrowser,
  runTeescannerAccessCheck,
  sleep,
} from "./lib/teescanner/access";
import {
  printBatchCourseSummary,
  scrapeTeescannerCourseBatchDates,
} from "./lib/teescanner/batchCollect";
import {
  appendBatchRunLog,
  appendDailyResultRow,
  DEFAULT_BATCH_RUNLOG_PATH,
  DEFAULT_COURSE_RESULTS_CSV,
  DEFAULT_DAILY_RESULTS_CSV,
  DEFAULT_MANUAL_REVIEW_CSV,
  DEFAULT_SUMMARY_CSV,
  readCourseIdsMissingDayTypePrice,
  readDailyResults,
  readProcessedCourseDatePairs,
  toDailyResultRow,
  writeCourseResultsCsv,
  writeManualReviewCsv,
  writeSummaryCsv,
} from "./lib/teescanner/batchIo";
import { buildSampledDates, sortSampledDatesAsc } from "./lib/teescanner/dateSampling";
import {
  printCollectResult,
  printWindowsRunHints,
  resultToRunLog,
} from "./lib/teescanner/debug";
import {
  acquireCollectLock,
  DEFAULT_BLOCKED_STATE_PATH,
  DEFAULT_INPUT_CSV,
  DEFAULT_LOCK_PATH,
  DEFAULT_SCREENSHOT_DIR,
  getRecentBlockedState,
  printRecentBlockWarning,
  rowGapWithJitter,
  writeBlockedState,
} from "./lib/teescanner/io";
import { buildTeescannerSearchQueries } from "./lib/teescanner/search";
import { buildAllSummaries, buildManualReviewRows } from "./lib/teescanner/summary";
import { loadAmbiguousTargetIds, loadTargetRows } from "./lib/teescanner/targets";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_WAIT_MS = 7000;

interface CliOptions {
  startDay: string;
  weekdayDay: string;
  weekendDay: string;
  sampleDays: string;
  dateMode: "representative";
  weekdayCount: number;
  weekendCount: number;
  limit: number;
  startRow: number;
  endRow: number;
  concurrency: number;
  dailyCourseCap: number;
  maxCourseDatePairs: number;
  clickMinMs: number;
  clickJitterMs: number;
  dateGapMs: number;
  courseGapMs: number;
  maxRetries: number;
  stopOnBlock: boolean;
  headful: boolean;
  dryRun: boolean;
  retryMissingDayType: "" | "weekday" | "weekend";
  inputCsv: string;
  dailyResultsCsv: string;
  summaryCsv: string;
  batchRunlogPath: string;
  blockedStatePath: string;
  lockPath: string;
  screenshotDir: string;
  targetName: string;
  targetId: string;
  targetMode: "price_missing" | "sequential" | "ambiguous";
  includePriced: boolean;
  forceRecrawl: boolean;
  skipRecentTeescannerSuccessDays: number;
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
    startDay: "2026-06-29",
    weekdayDay: "2026-06-29",
    weekendDay: "2026-06-27",
    sampleDays: "",
    dateMode: "representative",
    weekdayCount: 1,
    weekendCount: 1,
    limit: 10,
    startRow: 1,
    endRow: 0,
    concurrency: 1,
    dailyCourseCap: 10,
    maxCourseDatePairs: 20,
    clickMinMs: 2000,
    clickJitterMs: 3000,
    dateGapMs: 30_000,
    courseGapMs: 120_000,
    maxRetries: 0,
    stopOnBlock: true,
    headful: true,
    dryRun: false,
    retryMissingDayType: "",
    inputCsv: DEFAULT_INPUT_CSV,
    dailyResultsCsv: DEFAULT_DAILY_RESULTS_CSV,
    summaryCsv: DEFAULT_SUMMARY_CSV,
    batchRunlogPath: DEFAULT_BATCH_RUNLOG_PATH,
    blockedStatePath: DEFAULT_BLOCKED_STATE_PATH,
    lockPath: DEFAULT_LOCK_PATH,
    screenshotDir: DEFAULT_SCREENSHOT_DIR,
    targetName: "",
    targetId: "",
    targetMode: "sequential",
    includePriced: false,
    forceRecrawl: false,
    skipRecentTeescannerSuccessDays: 0,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i] ?? "";

    if (arg === "--start-day") options.startDay = next();
    else if (arg === "--weekday-day") options.weekdayDay = next();
    else if (arg === "--weekend-day") options.weekendDay = next();
    else if (arg === "--sample-days") options.sampleDays = next();
    else if (arg === "--date-mode") options.dateMode = next() as "representative";
    else if (arg === "--weekday-count") options.weekdayCount = Number.parseInt(next(), 10);
    else if (arg === "--weekend-count") options.weekendCount = Number.parseInt(next(), 10);
    else if (arg === "--limit") options.limit = Number.parseInt(next(), 10);
    else if (arg === "--start-row") options.startRow = Number.parseInt(next(), 10);
    else if (arg === "--end-row") options.endRow = Number.parseInt(next(), 10);
    else if (arg === "--gap-ms") options.courseGapMs = Number.parseInt(next(), 10);
    else if (arg === "--click-delay-ms") {
      options.clickMinMs = Number.parseInt(next(), 10);
      options.clickJitterMs = 0;
    } else if (arg === "--concurrency") {
      options.concurrency = Number.parseInt(next(), 10);
    }
    else if (arg === "--daily-course-cap") options.dailyCourseCap = Number.parseInt(next(), 10);
    else if (arg === "--max-course-date-pairs") {
      options.maxCourseDatePairs = Number.parseInt(next(), 10);
    } else if (arg === "--click-min-ms") options.clickMinMs = Number.parseInt(next(), 10);
    else if (arg === "--click-jitter-ms") options.clickJitterMs = Number.parseInt(next(), 10);
    else if (arg === "--date-gap-ms") options.dateGapMs = Number.parseInt(next(), 10);
    else if (arg === "--course-gap-ms") options.courseGapMs = Number.parseInt(next(), 10);
    else if (arg === "--max-retries") options.maxRetries = Number.parseInt(next(), 10);
    else if (arg === "--stop-on-block") options.stopOnBlock = parseBoolean(next(), true);
    else if (arg === "--headful") options.headful = parseBoolean(next(), true);
    else if (arg === "--dry-run") options.dryRun = parseBoolean(next(), false);
    else if (arg === "--retry-missing-day-type") {
      const value = next().toLowerCase();
      if (value === "weekday" || value === "weekend") {
        options.retryMissingDayType = value;
      } else {
        throw new Error("--retry-missing-day-type must be weekday or weekend.");
      }
    } else if (arg === "--input") {
      const value = next();
      options.inputCsv = path.isAbsolute(value) ? value : path.join(ROOT, value);
    }     else if (arg === "--target-name") options.targetName = next();
    else if (arg === "--target-id") options.targetId = next();
    else if (arg === "--target-mode") {
      const value = next() as CliOptions["targetMode"];
      if (value !== "price_missing" && value !== "sequential" && value !== "ambiguous") {
        throw new Error("--target-mode must be price_missing, sequential, or ambiguous.");
      }
      options.targetMode = value;
    } else if (arg === "--include-priced") options.includePriced = parseBoolean(next(), true);
    else if (arg === "--force-recrawl") options.forceRecrawl = parseBoolean(next(), true);
    else if (arg === "--skip-recent-teescanner-success-days") {
      options.skipRecentTeescannerSuccessDays = Number.parseInt(next(), 10);
    }
    else if (arg === "--daily-results") {
      const value = next();
      options.dailyResultsCsv = path.isAbsolute(value) ? value : path.join(ROOT, value);
    } else if (arg === "--summary") {
      const value = next();
      options.summaryCsv = path.isAbsolute(value) ? value : path.join(ROOT, value);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.startDay)) {
    throw new Error("--start-day must be YYYY-MM-DD.");
  }
  if (options.dateMode !== "representative") {
    throw new Error("Only --date-mode representative is supported.");
  }
  if (options.maxRetries !== 0) {
    throw new Error("Batch collect only allows --max-retries 0.");
  }
  if (!Number.isFinite(options.startRow) || options.startRow < 1) {
    throw new Error("--start-row must be a positive integer.");
  }
  if (options.endRow < 0) {
    throw new Error("--end-row must be zero or a positive integer.");
  }
  if (options.targetMode === "ambiguous") {
    options.forceRecrawl = true;
    options.includePriced = true;
  }
  if (options.concurrency !== 1) {
    throw new Error("--concurrency must be 1 for TeeScanner batch collect.");
  }

  const datePairCount = options.weekdayCount + options.weekendCount;
  options.dailyCourseCap = Math.max(options.dailyCourseCap, options.limit);
  options.maxCourseDatePairs = Math.max(
    options.maxCourseDatePairs,
    options.limit * Math.max(datePairCount, 1),
  );

  for (const label of ["startDay", "weekdayDay", "weekendDay"] as const) {
    const value = options[label];
    if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(`--${label.replace(/([A-Z])/g, "-$1").toLowerCase()} must be YYYY-MM-DD.`);
    }
  }

  return options;
}

function printBatchOutputPaths(options: CliOptions): void {
  console.log(`daily results : ${options.dailyResultsCsv}`);
  console.log(`course summary: ${options.summaryCsv}`);
  console.log(`batch runlog  : ${options.batchRunlogPath}`);
  console.log(`screenshots   : ${options.screenshotDir}`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const sampledDates = sortSampledDatesAsc(
    buildSampledDates({
      startDay: options.startDay,
      weekdayCount: options.weekdayCount,
      weekendCount: options.weekendCount,
      weekdayDay: options.weekdayDay,
      weekendDay: options.weekendDay,
      sampleDays: options.sampleDays,
    }),
  );

  console.log("TeeScanner price batch collector");
  console.log(`startDay: ${options.startDay}`);
  console.log(`dateMode: ${options.dateMode}`);
  if (options.sampleDays) {
    console.log(`sampleDays: ${options.sampleDays}`);
  }
  console.log(`sampled dates: ${sampledDates.map((d) => `${d.roundDay}(${d.dayType})`).join(", ")}`);
  if (options.retryMissingDayType) {
    console.log(`retryMissingDayType: ${options.retryMissingDayType}`);
  }
  console.log(`limit: ${options.limit}`);
  console.log(`startRow: ${options.startRow}`);
  if (options.endRow > 0) {
    console.log(`endRow: ${options.endRow}`);
  }
  console.log(`targetMode: ${options.targetMode}`);
  console.log(`concurrency: ${options.concurrency}`);
  console.log(`courseGapMs: ${options.courseGapMs}`);
  console.log(`clickMinMs: ${options.clickMinMs}`);
  console.log(`includePriced: ${options.includePriced}`);
  console.log(`forceRecrawl: ${options.forceRecrawl}`);
  if (options.skipRecentTeescannerSuccessDays > 0) {
    console.log(`skipRecentTeescannerSuccessDays: ${options.skipRecentTeescannerSuccessDays}`);
  }
  console.log(`dailyCourseCap: ${options.dailyCourseCap}`);
  console.log(`maxCourseDatePairs: ${options.maxCourseDatePairs}`);
  console.log(`dryRun: ${options.dryRun}`);
  console.log(`headful: ${options.headful}`);
  printWindowsRunHints();

  if (!fs.existsSync(options.inputCsv)) {
    throw new Error(`Input CSV not found: ${options.inputCsv}`);
  }

  const recentBlock = getRecentBlockedState(options.blockedStatePath);
  if (recentBlock && !options.dryRun) {
    printRecentBlockWarning(recentBlock);
    process.exitCode = 2;
    return;
  }

  const processedPairs = readProcessedCourseDatePairs(options.dailyResultsCsv);
  const retryMissingIds =
    options.retryMissingDayType === "weekend" || options.retryMissingDayType === "weekday"
      ? readCourseIdsMissingDayTypePrice(options.summaryCsv, options.retryMissingDayType)
      : null;

  const effectiveLimit = Math.min(options.limit, options.dailyCourseCap);
  const ambiguousIds =
    options.targetMode === "ambiguous"
      ? loadAmbiguousTargetIds(options.summaryCsv)
      : undefined;
  if (options.targetMode === "ambiguous") {
    console.log(`ambiguous targets in summary: ${ambiguousIds?.size ?? 0}`);
  }

  let targets = loadTargetRows(options.inputCsv, {
    processedIds: new Set(),
    limit: effectiveLimit,
    startRow: options.startRow,
    endRow: options.endRow,
    targetName: options.targetName || undefined,
    targetId: options.targetId || undefined,
    targetMode: options.targetMode,
    includePriced: options.includePriced,
    skipRecentTeescannerSuccessDays: options.skipRecentTeescannerSuccessDays,
    summaryCsvPath: options.summaryCsv,
    ambiguousIds,
  });

  if (retryMissingIds && retryMissingIds.size > 0) {
    targets = targets.filter((course) => retryMissingIds.has(course.id));
    console.log(
      `Retry mode: ${targets.length} course(s) missing ${options.retryMissingDayType} prices.`,
    );
  }

  if (targets.length === 0) {
    console.log("No target rows found.");
    printBatchOutputPaths(options);
    return;
  }

  const jobs = targets.flatMap((course) =>
    sampledDates
      .filter((sample) => {
        if (options.retryMissingDayType === "weekend") {
          return sample.dayType === "weekend";
        }
        if (options.retryMissingDayType === "weekday") {
          return sample.dayType === "weekday";
        }
        return true;
      })
      .map((sample) => ({
        course,
        sample,
        pairKey: `${course.id}|${sample.roundDay}`,
      })),
  );

  const forceRecrawlIds =
    options.forceRecrawl && options.targetMode === "ambiguous"
      ? new Set(targets.map((course) => course.id))
      : options.forceRecrawl
        ? new Set(targets.map((course) => course.id))
        : null;

  const pendingJobs = jobs.filter((job) => {
    if (forceRecrawlIds?.has(job.course.id)) {
      return true;
    }
    if (retryMissingIds?.has(job.course.id)) {
      return job.sample.dayType === options.retryMissingDayType;
    }
    return !processedPairs.has(job.pairKey);
  });

  if (options.dryRun) {
    console.log(`Dry run — ${targets.length} course(s), ${pendingJobs.length} pending pair(s):`);
    for (const job of pendingJobs.slice(0, options.maxCourseDatePairs)) {
      const queries = buildTeescannerSearchQueries(job.course);
      console.log(
        `${job.course.id} | ${job.course.change_name_to || job.course.name} | ${job.sample.roundDay} (${job.sample.dayType})`,
      );
      console.log(`  search_query: ${queries.join(" -> ")}`);
    }
    printBatchOutputPaths(options);
    return;
  }

  const lock = acquireCollectLock(options.lockPath);
  if (!lock) {
    console.error("Another TeeScanner collect process appears to be running.");
    process.exitCode = 2;
    return;
  }

  let pairCount = 0;
  let stopped = false;

  try {
    const recentBlockBeforeCollect = getRecentBlockedState(options.blockedStatePath);
    if (recentBlockBeforeCollect) {
      printRecentBlockWarning(recentBlockBeforeCollect);
      process.exitCode = 2;
      return;
    }

    console.log("Running TeeScanner access check before batch collect...");
    const access = await runTeescannerAccessCheck({
      roundDay: sampledDates[0]?.roundDay ?? options.startDay,
      headless: !options.headful,
      waitMs: DEFAULT_WAIT_MS,
      screenshotDir: options.screenshotDir,
    });

    appendBatchRunLog(options.batchRunlogPath, {
      timestamp: new Date().toISOString(),
      step: "access_check",
      status: access.status,
      blockDetected: access.status === "blocked",
    });

    if (access.status === "blocked") {
      writeBlockedState(options.blockedStatePath, {
        reason: access.reason,
        detectedText: access.matchedText ?? "",
      });
      process.exitCode = 2;
      return;
    }

    if (access.status === "error") {
      console.error(`Access check failed: ${access.message ?? access.reason}`);
      process.exitCode = 1;
      return;
    }

    const browser = await createTeescannerBrowser(!options.headful);
    const page = await browser.newPage();

    try {
      for (let courseIndex = 0; courseIndex < targets.length; courseIndex += 1) {
        const course = targets[courseIndex];
        const courseName = course.change_name_to || course.name;
        const pendingDates = sortSampledDatesAsc(
          pendingJobs
            .filter((job) => job.course.id === course.id)
            .map((job) => job.sample),
        );

        if (pendingDates.length === 0) continue;

        const remainingPairBudget = options.maxCourseDatePairs - pairCount;
        const datesToCollect = pendingDates.slice(0, remainingPairBudget);
        if (datesToCollect.length === 0) {
          stopped = true;
          break;
        }

        console.log(
          `[course ${courseIndex + 1}/${targets.length}] ${course.id} | ${courseName} | ${datesToCollect.length} date(s)`,
        );

        const clickDelay = rowGapWithJitter(options.clickMinMs, options.clickJitterMs);
        await sleep(clickDelay);

        const batchOutcomes = await scrapeTeescannerCourseBatchDates({
          page,
          course,
          dates: datesToCollect,
          screenshotDir: options.screenshotDir,
        });

        printBatchCourseSummary(courseName, batchOutcomes);

        for (const item of batchOutcomes) {
          if (pairCount >= options.maxCourseDatePairs) {
            stopped = true;
            break;
          }

          const dailyRow = toDailyResultRow(item.outcome.result, item.dayType);
          appendDailyResultRow(options.dailyResultsCsv, dailyRow);
          appendBatchRunLog(options.batchRunlogPath, {
            ...resultToRunLog(item.outcome, course.id, courseName),
            batchStep: "course_date_collect",
            roundDay: item.roundDay,
            dayType: item.dayType,
            golfclubSeq: item.golfclubSeq,
            detailUrlTemplate: item.detailUrlTemplate,
            perDateDetailReload: item.perDateDetailReload,
          });

          printCollectResult(item.outcome);
          pairCount += 1;
          processedPairs.add(`${course.id}|${item.roundDay}`);

          if (item.outcome.blocked) {
            writeBlockedState(options.blockedStatePath, {
              reason: item.outcome.blockReason ?? "blocked",
              detectedText: item.outcome.blockDetectedText ?? "",
              screenshotPath: item.outcome.result.screenshot_path,
            });
            if (options.stopOnBlock) {
              console.error("Block detected. Stopping batch.");
              process.exitCode = 2;
              stopped = true;
              break;
            }
          }
        }

        if (stopped) break;

        if (courseIndex < targets.length - 1) {
          const courseDelay = rowGapWithJitter(options.courseGapMs, options.clickJitterMs);
          console.log(`  waiting ${Math.round(courseDelay / 1000)}s before next course...`);
          await sleep(courseDelay);
        }
      }
    } finally {
      await browser.close().catch(() => undefined);
    }

    const allDaily = readDailyResults(options.dailyResultsCsv);
    const summaries = buildAllSummaries(allDaily);
    writeSummaryCsv(options.summaryCsv, summaries);
    writeCourseResultsCsv(DEFAULT_COURSE_RESULTS_CSV, summaries);
    const manualReviewRows = buildManualReviewRows(summaries);
    writeManualReviewCsv(DEFAULT_MANUAL_REVIEW_CSV, manualReviewRows);
    console.log(`Wrote ${summaries.length} course summary row(s).`);
    console.log(`Wrote ${manualReviewRows.length} manual review row(s).`);
  } finally {
    lock.release();
    printBatchOutputPaths(options);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
