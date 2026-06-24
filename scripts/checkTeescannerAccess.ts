import {
  runTeescannerAccessCheck,
  sleep,
  tomorrowDateString,
  buildHomeUrl,
} from "./lib/teescanner/access";
import {
  appendRunLog,
  DEFAULT_BLOCKED_STATE_PATH,
  DEFAULT_RUNLOG_PATH,
  DEFAULT_SCREENSHOT_DIR,
  getRecentBlockedState,
  printRecentBlockWarning,
  writeBlockedState,
} from "./lib/teescanner/io";

interface CliOptions {
  roundDay: string;
  headless: boolean;
  keepOpen: boolean;
  waitMs: number;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    roundDay: tomorrowDateString(),
    headless: false,
    keepOpen: false,
    waitMs: 7000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--round-day") {
      options.roundDay = argv[++i] ?? options.roundDay;
    } else if (arg === "--headless") {
      options.headless = true;
    } else if (arg === "--keep-open") {
      options.keepOpen = true;
    } else if (arg === "--wait") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--wait requires a non-negative integer (ms).");
      }
      options.waitMs = value;
      i += 1;
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.roundDay)) {
    throw new Error("--round-day must be YYYY-MM-DD.");
  }

  return options;
}

function logAccessRun(
  result: Awaited<ReturnType<typeof runTeescannerAccessCheck>>,
): void {
  appendRunLog(DEFAULT_RUNLOG_PATH, {
    timestamp: new Date().toISOString(),
    rowId: "access-check",
    courseName: "teescanner-home",
    step: "access_check",
    status: result.status,
    blockDetected: result.status === "blocked",
    screenshotPath: result.screenshotPath,
    errorMessage: result.message ?? result.reason,
    popupDetected: result.popupDetected ?? false,
    popupAction: result.popupAction,
    clickedText: result.clickedText ?? "",
    searchInputFound: result.searchInputFound ?? false,
    pageUrl: result.pageUrl,
    pageTextSample: result.pageTextSample,
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const url = buildHomeUrl(options.roundDay);

  console.log("TeeScanner access check");
  console.log(`URL: ${url}`);
  console.log(
    `mode: ${options.headless ? "headless" : "headful"}, wait: ${options.waitMs}ms`,
  );

  const recentBlock = getRecentBlockedState(DEFAULT_BLOCKED_STATE_PATH);
  if (recentBlock) {
    printRecentBlockWarning(recentBlock);
    console.log("skipped: true");
    console.log("reason: recent_blocked_state");
    process.exitCode = 2;
    return;
  }

  const result = await runTeescannerAccessCheck({
    roundDay: options.roundDay,
    headless: options.headless,
    waitMs: options.waitMs,
    screenshotDir: DEFAULT_SCREENSHOT_DIR,
  });

  logAccessRun(result);

  console.log(`popupDetected: ${result.popupDetected ? "true" : "false"}`);
  if (result.popupAction) console.log(`popupAction: ${result.popupAction}`);
  if (result.clickedText) console.log(`clickedText: ${result.clickedText}`);

  if (result.status === "blocked") {
    console.log("blocked: true");
    console.log(`reason: ${result.reason}`);
    console.log(`matchedText: ${result.matchedText ?? ""}`);
    if (result.screenshotPath) {
      console.log(`screenshotPath: ${result.screenshotPath}`);
    }
    writeBlockedState(DEFAULT_BLOCKED_STATE_PATH, {
      reason: result.reason,
      detectedText: result.matchedText ?? "",
      screenshotPath: result.screenshotPath ?? "",
    });
    console.log("recommendation: wait at least 7 days before retrying");
    process.exitCode = 2;
    return;
  }

  if (result.status === "error") {
    console.log("blocked: false");
    console.log(`error: ${result.message ?? result.reason}`);
    console.log(`searchInputFound: ${result.searchInputFound ? "true" : "false"}`);
    if (result.pageUrl) console.log(`pageUrl: ${result.pageUrl}`);
    if (result.screenshotPath) {
      console.log(`screenshotPath: ${result.screenshotPath}`);
    }
    if (result.pageTextSample) {
      console.log(`pageTextSample: ${result.pageTextSample.slice(0, 300)}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("blocked: false");
  console.log(`reason: ${result.reason}`);
  console.log(`searchInputFound: ${result.searchInputFound ? "true" : "false"}`);
  console.log(
    "recommendation: access check passed; start with --limit 1 headful collect test",
  );

  if (options.keepOpen) {
    console.log("Press Ctrl+C to exit.");
    await sleep(Number.MAX_SAFE_INTEGER);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
