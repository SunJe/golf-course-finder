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
  DEFAULT_DAILY_RESULTS_CSV,
  DEFAULT_SUMMARY_CSV,
  readCourseIdsMissingDayTypePrice,
  readDailyResults,
  readProcessedCourseDatePairs,
  toDailyResultRow,
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
import { buildAllSummaries } from "./lib/teescanner/summary";
import { loadTargetRows } from "./lib/teescanner/targets";
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
    } else if (arg === "--target-name") options.targetName = next();
    else if (arg === "--target-id") options.targetId = next();
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
  let targets = loadTargetRows(
    options.inputCsv,
    new Set(),
    effectiveLimit,
    options.targetName || undefined,
    options.targetId || undefined,
  );

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

  const pendingJobs = jobs.filter((job) => {
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
    console.log(`Wrote ${summaries.length} course summary row(s).`);
  } finally {
    lock.release();
    printBatchOutputPaths(options);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
