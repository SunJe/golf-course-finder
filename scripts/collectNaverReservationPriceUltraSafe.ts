import fs from "node:fs";
import path from "node:path";
import {
  AccessCircuitBreaker,
  GotoRateLimiter,
  rowGapWithJitter,
} from "./lib/naverMapEnrichment/accessControl";
import {
  createNaverMapBrowser,
  scrapeEnrichmentRow,
} from "./lib/naverMapEnrichment/enrichmentScraper";
import { mapScrapeToUltraSafeResult } from "./lib/naverMapEnrichment/ultraSafeMapResult";
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
  readProcessedIds,
  saveScreenshot,
  writeBlockedState,
} from "./lib/naverMapEnrichment/ultraSafeIo";
import { loadTargetRows } from "./lib/naverMapEnrichment/ultraSafeTargets";
import {
  detectNaverBlock,
  collectVisibleNaverText,
  runNaverMapAccessCheck,
  sleep,
} from "./lib/naverMapEnrichment/ultraSafeAccess";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_SLOW_MS = 12_000;
const DEFAULT_GOTO_MIN_INTERVAL_MS = 90_000;

interface CliOptions {
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
  skipAccessCheck: boolean;
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
    limit: 1,
    gapMs: 300_000,
    jitterMs: 120_000,
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
    skipAccessCheck: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--limit") {
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
    } else if (arg === "--output") {
      const value = argv[++i] ?? "";
      options.outputCsv = path.isAbsolute(value)
        ? value
        : path.join(ROOT, value);
    } else if (arg === "--skip-access-check") {
      options.skipAccessCheck = true;
    }
  }

  if (!Number.isFinite(options.limit) || options.limit < 1) {
    throw new Error("--limit must be a positive integer.");
  }
  if (options.maxRetries !== 0) {
    throw new Error(
      "Ultra-safe mode only supports --max-retries 0 (no retries).",
    );
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  console.log("Naver reservation price — ultra-safe collect");
  console.log(
    JSON.stringify(
      {
        limit: options.limit,
        gapMs: options.gapMs,
        jitterMs: options.jitterMs,
        maxRetries: options.maxRetries,
        stopOnBlock: options.stopOnBlock,
        headful: options.headful,
        dryRun: options.dryRun,
      },
      null,
      2,
    ),
  );

  if (!fs.existsSync(options.inputCsv)) {
    throw new Error(`Input CSV not found: ${options.inputCsv}`);
  }

  const lock = acquireCollectLock(options.lockPath);
  if (!lock) {
    console.error(
      `Lock file exists (${options.lockPath}). Another collect may be running.`,
    );
    process.exitCode = 1;
    return;
  }

  const releaseLock = () => lock.release();
  process.on("exit", releaseLock);
  process.on("SIGINT", () => {
    releaseLock();
    process.exit(130);
  });

  const processedIds = readProcessedIds(options.outputCsv);
  const targets = loadTargetRows(options.inputCsv, processedIds, options.limit);

  if (targets.length === 0) {
    console.log("No target rows (missing price_min/max, or already processed).");
    return;
  }

  console.log(`Target rows: ${targets.length}`);
  for (const row of targets) {
    console.log(`  - ${row.id} | ${row.name} | ${row.address}`);
  }

  if (options.dryRun) {
    console.log("Dry run complete — no Naver access attempted.");
    return;
  }

  if (!options.skipAccessCheck) {
    console.log("Running Naver access check before collect...");
    const access = await runNaverMapAccessCheck({
      headless: !options.headful,
      waitMs: 10_000,
    });

    if (access.status === "blocked") {
      console.error(
        "Naver access appears blocked. Stop immediately. No crawling attempted.",
      );
      writeBlockedState(options.blockedStatePath, {
        detectedAt: new Date().toISOString(),
        phase: "pre_check",
        reason: access.reason,
        matchedText: access.matchedText ?? "",
      });
      process.exitCode = 2;
      return;
    }

    if (access.status === "error") {
      console.error(`Naver access check failed: ${access.message}`);
      process.exitCode = 1;
      return;
    }

    console.log(`Access check OK (${access.reason})`);
    await sleep(5_000);
  }

  const circuitBreaker = new AccessCircuitBreaker();
  const gotoRateLimiter = new GotoRateLimiter(DEFAULT_GOTO_MIN_INTERVAL_MS);
  const { browser, context } = await createNaverMapBrowser(options.headful);

  try {
    for (let index = 0; index < targets.length; index += 1) {
      const row = targets[index];
      const step = "scrape_row";
      let screenshotPath = "";

      console.log(`\n[${index + 1}/${targets.length}] ${row.name}`);

      try {
        const scrape = await scrapeEnrichmentRow(row, context, {
          headful: options.headful,
          slowMs: DEFAULT_SLOW_MS,
          timeoutMs: 60_000,
          addressFirst: true,
          maxRetries: 0,
          singleSearchPerRow: true,
          skipReservation: false,
          contactOnly: false,
          candidateOpenMode: "click",
          circuitBreaker,
          gotoRateLimiter,
          onBeforePageClose: async (page) => {
            screenshotPath = await saveScreenshot(
              page,
              row.id,
              options.screenshotDir,
            );
            const blockText = await collectVisibleNaverText(page);
            const block = detectNaverBlock(blockText);
            if (block) {
              circuitBreaker.trip(block.matchedText);
            }
          },
        });

        const result = mapScrapeToUltraSafeResult(row, scrape, screenshotPath);

        if (circuitBreaker.tripped || result.status === "blocked") {
          result.status = "blocked";
          result.error_reason =
            circuitBreaker.reason ||
            result.error_reason ||
            "blocked during scrape";

          appendResultRow(options.outputCsv, result);
          appendRunLog(options.runlogPath, {
            timestamp: new Date().toISOString(),
            rowId: row.id,
            courseName: row.name,
            step,
            status: result.status,
            blockDetected: true,
            screenshotPath,
            errorMessage: result.error_reason,
          });

          writeBlockedState(options.blockedStatePath, {
            detectedAt: new Date().toISOString(),
            phase: "scrape",
            rowId: row.id,
            courseName: row.name,
            reason: result.error_reason,
            screenshotPath,
          });

          console.error(
            "Naver access appears blocked. Stop immediately. No further rows.",
          );
          if (options.stopOnBlock) {
            process.exitCode = 2;
            return;
          }
        } else {
          appendResultRow(options.outputCsv, result);
          appendRunLog(options.runlogPath, {
            timestamp: new Date().toISOString(),
            rowId: row.id,
            courseName: row.name,
            step,
            status: result.status,
            blockDetected: false,
            screenshotPath,
            errorMessage: result.error_reason || undefined,
          });
          console.log(`Result: ${result.status}`);
          if (result.price_min) {
            console.log(`  price: ${result.price_min} ~ ${result.price_max} won`);
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const failed = {
          id: row.id,
          name: row.name,
          address: row.address,
          matched_title: "",
          matched_address: "",
          naver_reservation_found: "n",
          price_text: "",
          price_min: "",
          price_max: "",
          price_unit: "won",
          source_url: row.source_url,
          status: "failed" as const,
          error_reason: message,
          collected_at: new Date().toISOString(),
          screenshot_path: screenshotPath,
        };
        appendResultRow(options.outputCsv, failed);
        appendRunLog(options.runlogPath, {
          timestamp: new Date().toISOString(),
          rowId: row.id,
          courseName: row.name,
          step: "error",
          status: "failed",
          blockDetected: false,
          screenshotPath,
          errorMessage: message,
        });
        console.error(`Failed (no retry): ${message}`);
      }

      if (circuitBreaker.tripped && options.stopOnBlock) {
        process.exitCode = 2;
        return;
      }

      if (index < targets.length - 1) {
        const delay = rowGapWithJitter(options.gapMs, options.jitterMs);
        console.log(`Waiting ${Math.round(delay / 1000)}s before next row...`);
        appendRunLog(options.runlogPath, {
          timestamp: new Date().toISOString(),
          rowId: row.id,
          courseName: row.name,
          step: "gap_wait",
          status: "waiting",
          delayUsedMs: delay,
          blockDetected: false,
        });
        await sleep(delay);
      }
    }
  } finally {
    await browser.close().catch(() => undefined);
    releaseLock();
  }

  console.log("\nUltra-safe collect finished.");
  console.log(`Results: ${options.outputCsv}`);
  console.log(`Run log: ${options.runlogPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
