import {
  DEFAULT_BLOCKED_STATE_PATH,
  getRecentBlockedState,
  printRecentBlockWarning,
  writeBlockedState,
} from "./lib/naverMapEnrichment/ultraSafeBlockedState";
import {
  runNaverMapAccessCheck,
  sleep,
} from "./lib/naverMapEnrichment/ultraSafeAccess";
import { NAVER_MAP_BASE } from "./lib/naverMapEnrichment/selectors";

interface CliOptions {
  headless: boolean;
  keepOpen: boolean;
  waitMs: number;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    headless: false,
    keepOpen: false,
    waitMs: 7000,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--headless") {
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

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  console.log("Naver Map access check");
  console.log(`URL: ${NAVER_MAP_BASE}`);
  console.log(`mode: ${options.headless ? "headless" : "headful"}, wait: ${options.waitMs}ms`);

  const recentBlock = getRecentBlockedState(DEFAULT_BLOCKED_STATE_PATH);
  if (recentBlock) {
    printRecentBlockWarning(recentBlock);
    console.log("skipped: true");
    console.log("reason: recent_blocked_state");
    process.exitCode = 2;
    return;
  }

  const result = await runNaverMapAccessCheck({
    headless: options.headless,
    waitMs: options.waitMs,
  });

  if (result.status === "blocked") {
    console.log("blocked: true");
    console.log(`reason: ${result.reason}`);
    console.log(`matchedText: ${result.matchedText ?? ""}`);
    writeBlockedState(DEFAULT_BLOCKED_STATE_PATH, {
      reason: result.reason,
      detectedText: result.matchedText ?? "",
    });
    console.log("recommendation: wait at least 7 days before retrying");
    if (options.keepOpen) {
      console.log("Press Ctrl+C to exit (--keep-open ignored; browser already closed).");
      await sleep(Number.MAX_SAFE_INTEGER);
    }
    process.exitCode = 2;
    return;
  }

  if (result.status === "error") {
    console.log("blocked: false");
    console.log(`error: ${result.message ?? result.reason}`);
    process.exitCode = 1;
    return;
  }

  console.log("blocked: false");
  console.log(`reason: ${result.reason}`);
  console.log(
    "recommendation: light access check passed; start with single-row headful collect test",
  );

  if (options.keepOpen) {
    console.log("Press Ctrl+C to exit (--keep-open: re-run with collect script for browser).");
    await sleep(Number.MAX_SAFE_INTEGER);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
