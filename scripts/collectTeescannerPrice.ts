import fs from "node:fs";
import path from "node:path";
import {
  createTeescannerBrowser,
  runTeescannerAccessCheck,
  sleep,
  tomorrowDateString,
} from "./lib/teescanner/access";
import {
  printCollectResult,
  printOutputPaths,
  printWindowsRunHints,
  resultToRunLog,
} from "./lib/teescanner/debug";
import {
  acquireCollectLock,
  appendResultRow,
  appendRunLog,
  DEFAULT_BLOCKED_STATE_PATH,
  DEFAULT_INPUT_CSV,
  DEFAULT_LOCK_PATH,
  DEFAULT_RESULTS_CSV,
  DEFAULT_RUNLOG_PATH,
  DEFAULT_SCREENSHOT_DIR,
  getRecentBlockedState,
  printRecentBlockWarning,
  readProcessedIds,
  rowGapWithJitter,
  writeBlockedState,
} from "./lib/teescanner/io";
import { buildTeescannerSearchQueries, scrapeTeescannerCourse } from "./lib/teescanner/search";
import { loadTargetRows } from "./lib/teescanner/targets";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_WAIT_MS = 7000;

interface CliOptions {
  roundDay: string;
  limit: number;
  gapMs: number;
  jitterMs: number;
  maxRetries: number;
  stopOnBlock: boolean;
  headful: boolean;
  dryRun: boolean;
  inputCsv: string;
  outputCsv: string;
  runlogPath: string;
  blockedStatePath: string;
  lockPath: string;
  screenshotDir: string;
  targetName: string;
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
    roundDay: tomorrowDateString(),
    limit: 1,
    gapMs: 180_000,
    jitterMs: 60_000,
    maxRetries: 0,
    stopOnBlock: true,
    headful: true,
    dryRun: false,
    inputCsv: DEFAULT_INPUT_CSV,
    outputCsv: DEFAULT_RESULTS_CSV,
    runlogPath: DEFAULT_RUNLOG_PATH,
    blockedStatePath: DEFAULT_BLOCKED_STATE_PATH,
    lockPath: DEFAULT_LOCK_PATH,
    screenshotDir: DEFAULT_SCREENSHOT_DIR,
    targetName: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--round-day") {
      options.roundDay = argv[++i] ?? options.roundDay;
    } else if (arg === "--limit") {
      options.limit = Number.parseInt(argv[++i] ?? "", 10);
    } else if (arg === "--gap-ms") {
      options.gapMs = Number.parseInt(argv[++i] ?? "", 10);
    } else if (arg === "--jitter-ms") {
      options.jitterMs = Number.parseInt(argv[++i] ?? "", 10);
    } else if (arg === "--max-retries") {
      options.maxRetries = Number.parseInt(argv[++i] ?? "", 10);
    } else if (arg === "--stop-on-block") {
      options.stopOnBlock = parseBoolean(argv[++i], true);
    } else if (arg === "--headful") {
      options.headful = parseBoolean(argv[++i], true);
    } else if (arg === "--dry-run") {
      options.dryRun = parseBoolean(argv[++i], false);
    } else if (arg === "--input") {
      const value = argv[++i] ?? "";
      options.inputCsv = path.isAbsolute(value)
        ? value
        : path.join(ROOT, value);
    } else if (arg === "--target-name") {
      options.targetName = argv[++i] ?? "";
    } else if (arg === "--output") {
      const value = argv[++i] ?? "";
      options.outputCsv = path.isAbsolute(value)
        ? value
        : path.join(ROOT, value);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.roundDay)) {
    throw new Error("--round-day must be YYYY-MM-DD.");
  }
  if (!Number.isFinite(options.limit) || options.limit < 1) {
    throw new Error("--limit must be a positive integer.");
  }
  if (options.maxRetries !== 0) {
    throw new Error(
      "This POC only allows --max-retries 0. Refusing to run with retries.",
    );
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  console.log("TeeScanner price collector (POC)");
  console.log(`roundDay: ${options.roundDay}`);
  console.log(`limit: ${options.limit}`);
  console.log(`dryRun: ${options.dryRun}`);
  console.log(`headful: ${options.headful}`);
  if (options.targetName) {
    console.log(`targetName: ${options.targetName}`);
  }
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

  const processedIds = readProcessedIds(options.outputCsv);
  const targets = loadTargetRows(
    options.inputCsv,
    processedIds,
    options.limit,
    options.targetName || undefined,
  );

  if (targets.length === 0) {
    console.log("No target rows found.");
    printOutputPaths(options.outputCsv, options.runlogPath, options.screenshotDir);
    return;
  }

  if (options.dryRun) {
    console.log(`Dry run — ${targets.length} target row(s):`);
    for (const row of targets) {
      const queries = buildTeescannerSearchQueries(row);
      console.log(
        `${row.id} | ${row.change_name_to || row.name} | ${row.address}`,
      );
      console.log(`  search_query: ${queries.join(" -> ")}`);
    }
    printOutputPaths(options.outputCsv, options.runlogPath, options.screenshotDir);
    return;
  }

  const lock = acquireCollectLock(options.lockPath);
  if (!lock) {
    console.error(
      "Another TeeScanner collect process appears to be running (lock file present).",
    );
    process.exitCode = 2;
    return;
  }

  try {
    const recentBlockBeforeCollect = getRecentBlockedState(
      options.blockedStatePath,
    );
    if (recentBlockBeforeCollect) {
      printRecentBlockWarning(recentBlockBeforeCollect);
      process.exitCode = 2;
      return;
    }

    console.log("Running TeeScanner access check before collect...");
    const access = await runTeescannerAccessCheck({
      roundDay: options.roundDay,
      headless: !options.headful,
      waitMs: DEFAULT_WAIT_MS,
      screenshotDir: options.screenshotDir,
    });

    appendRunLog(options.runlogPath, {
      timestamp: new Date().toISOString(),
      rowId: "access-check",
      courseName: "teescanner-home",
      step: "access_check",
      status: access.status,
      blockDetected: access.status === "blocked",
      screenshotPath: access.screenshotPath,
      errorMessage: access.message ?? access.reason,
      popupDetected: access.popupDetected ?? false,
      popupAction: access.popupAction,
      clickedText: access.clickedText ?? "",
      searchInputFound: access.searchInputFound ?? false,
      pageUrl: access.pageUrl,
      pageTextSample: access.pageTextSample,
    });

    if (access.status === "blocked") {
      console.error(
        "TeeScanner access appears blocked. Stop immediately. No crawling attempted.",
      );
      writeBlockedState(options.blockedStatePath, {
        reason: access.reason,
        detectedText: access.matchedText ?? "",
      });
      printOutputPaths(options.outputCsv, options.runlogPath, options.screenshotDir);
      process.exitCode = 2;
      return;
    }

    if (access.status === "error") {
      console.error(`Access check failed: ${access.message ?? access.reason}`);
      printOutputPaths(options.outputCsv, options.runlogPath, options.screenshotDir);
      process.exitCode = 1;
      return;
    }

    console.log("Access check passed. Starting single-browser collect...");

    const browser = await createTeescannerBrowser(!options.headful);
    const page = await browser.newPage();

    try {
      for (let index = 0; index < targets.length; index += 1) {
        const row = targets[index];
        console.log(
          `[${index + 1}/${targets.length}] ${row.id} | ${row.change_name_to || row.name}`,
        );

        const outcome = await scrapeTeescannerCourse({
          page,
          course: row,
          roundDay: options.roundDay,
          screenshotDir: options.screenshotDir,
        });

        appendResultRow(options.outputCsv, outcome.result);
        appendRunLog(
          options.runlogPath,
          resultToRunLog(outcome, row.id, row.change_name_to || row.name),
        );

        printCollectResult(outcome);

        if (outcome.blocked) {
          writeBlockedState(options.blockedStatePath, {
            reason: outcome.blockReason ?? "blocked",
            detectedText: outcome.blockDetectedText ?? "",
            screenshotPath: outcome.result.screenshot_path,
          });
          if (options.stopOnBlock) {
            console.error("Block detected. Stopping collect.");
            process.exitCode = 2;
            break;
          }
        }

        if (index < targets.length - 1) {
          const delay = rowGapWithJitter(options.gapMs, options.jitterMs);
          console.log(`  waiting ${Math.round(delay / 1000)}s before next row...`);
          await sleep(delay);
        }
      }
    } finally {
      await browser.close().catch(() => undefined);
    }
  } finally {
    lock.release();
    printOutputPaths(options.outputCsv, options.runlogPath, options.screenshotDir);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
