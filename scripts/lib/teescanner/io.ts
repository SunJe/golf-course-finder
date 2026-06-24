import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv } from "../csvUtils";
import { getProjectRoot } from "../sourceRegistry";
import type {
  TeescannerBlockedState,
  TeescannerPriceResult,
  TeescannerRunLogEntry,
  WriteTeescannerBlockedStateInput,
} from "./types";

const ROOT = getProjectRoot();

export const DEFAULT_INPUT_CSV = path.join(
  ROOT,
  "data/enrichment/course_enrichment_edit.csv",
);
export const DEFAULT_RESULTS_CSV = path.join(
  ROOT,
  "data/enrichment/teescanner_price_results.csv",
);
export const DEFAULT_RUNLOG_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_price_runlog.jsonl",
);
export const DEFAULT_BLOCKED_STATE_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_blocked_state.json",
);
export const DEFAULT_LOCK_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_price_collect.lock",
);
export const DEFAULT_SCREENSHOT_DIR = path.join(
  ROOT,
  "data/enrichment/teescanner-price-screenshots",
);

export const RECENT_BLOCK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const RECENT_BLOCK_MESSAGE =
  "Recent TeeScanner block detected. Stop to avoid further access restrictions.";

export const RESULT_HEADERS = [
  "id",
  "name",
  "change_name_to",
  "address",
  "search_query",
  "round_day",
  "matched_title",
  "matched_region",
  "matched_url",
  "candidate_count",
  "match_score",
  "confidence",
  "teescanner_found",
  "reservation_found",
  "slot_count",
  "price_text",
  "price_min",
  "price_max",
  "price_unit",
  "price_source",
  "detail_url",
  "selected_round_day",
  "url_round_day",
  "date_mismatch",
  "slot_card_count",
  "visible_slot_card_count",
  "available_team_count_from_date_tab",
  "slot_load_complete",
  "slot_scroll_steps",
  "slot_count_before_scroll",
  "slot_count_after_scroll",
  "slot_count_stable_reason",
  "price_scope",
  "date_tab_match_confidence",
  "date_tab_cards_snapshot",
  "selected_date_tab_raw_text",
  "slot_times",
  "slot_price_texts",
  "sale_price_candidates",
  "original_price_candidates",
  "slot_price_mode",
  "review_action",
  "source_name",
  "source_url",
  "status",
  "needs_check",
  "error_reason",
  "collected_at",
  "screenshot_path",
] as const;

function parseTimestamp(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) return null;
  return raw;
}

export function readBlockedState(
  filePath: string = DEFAULT_BLOCKED_STATE_PATH,
): TeescannerBlockedState | null {
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
      string,
      unknown
    >;
    const timestamp = parseTimestamp(raw.timestamp);
    if (!timestamp) return null;

    return {
      timestamp,
      reason: typeof raw.reason === "string" ? raw.reason : "",
      detectedText:
        typeof raw.detectedText === "string" ? raw.detectedText : "",
      screenshotPath:
        typeof raw.screenshotPath === "string" ? raw.screenshotPath : "",
    };
  } catch {
    return null;
  }
}

export function isRecentBlockedState(
  state: TeescannerBlockedState,
  windowMs: number = RECENT_BLOCK_WINDOW_MS,
): boolean {
  const at = Date.parse(state.timestamp);
  if (!Number.isFinite(at)) return false;
  return Date.now() - at < windowMs;
}

export function getRecentBlockedState(
  filePath: string = DEFAULT_BLOCKED_STATE_PATH,
  windowMs: number = RECENT_BLOCK_WINDOW_MS,
): TeescannerBlockedState | null {
  const state = readBlockedState(filePath);
  if (!state) return null;
  return isRecentBlockedState(state, windowMs) ? state : null;
}

export function printRecentBlockWarning(state: TeescannerBlockedState): void {
  console.error(RECENT_BLOCK_MESSAGE);
  console.error(`timestamp: ${state.timestamp}`);
  if (state.reason) console.error(`reason: ${state.reason}`);
  if (state.detectedText) console.error(`detectedText: ${state.detectedText}`);
  if (state.screenshotPath) {
    console.error(`screenshotPath: ${state.screenshotPath}`);
  }
}

export function writeBlockedState(
  filePath: string,
  input: WriteTeescannerBlockedStateInput,
): TeescannerBlockedState {
  const state: TeescannerBlockedState = {
    timestamp: input.timestamp ?? new Date().toISOString(),
    reason: input.reason,
    detectedText: input.detectedText ?? "",
    screenshotPath: input.screenshotPath ?? "",
  };

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}

export function ensureResultsCsvHeader(filePath: string): void {
  if (fs.existsSync(filePath)) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `\uFEFF${rowsToCsv([...RESULT_HEADERS], [])}`,
    "utf8",
  );
}

export function appendResultRow(
  filePath: string,
  result: TeescannerPriceResult,
): void {
  ensureResultsCsvHeader(filePath);
  const line = RESULT_HEADERS.map((header) => {
    const value = result[header as keyof TeescannerPriceResult] ?? "";
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(",");
  fs.appendFileSync(filePath, `${line}\n`, "utf8");
}

export function appendRunLog(filePath: string, entry: TeescannerRunLogEntry): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

export function readProcessedIds(resultsCsvPath: string): Set<string> {
  if (!fs.existsSync(resultsCsvPath)) return new Set();
  const { headers, rows } = parseCsv(fs.readFileSync(resultsCsvPath, "utf8"));
  const idIndex = headers.indexOf("id");
  const statusIndex = headers.indexOf("status");
  if (idIndex < 0 || statusIndex < 0) return new Set();

  const skipStatuses = new Set(["success", "blocked"]);
  const ids = new Set<string>();
  for (const row of rows) {
    const status = (row[statusIndex] ?? "").trim();
    if (skipStatuses.has(status)) {
      ids.add((row[idIndex] ?? "").trim());
    }
  }
  return ids;
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function acquireCollectLock(
  lockPath: string,
): { release: () => void } | null {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });

  if (fs.existsSync(lockPath)) {
    try {
      const raw = fs.readFileSync(lockPath, "utf8");
      const parsed = JSON.parse(raw) as { pid?: number };
      if (parsed.pid && isProcessAlive(parsed.pid)) {
        return null;
      }
    } catch {
      /* stale lock */
    }
  }

  const payload = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
  };
  fs.writeFileSync(lockPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  return {
    release: () => {
      try {
        if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
      } catch {
        /* ignore */
      }
    },
  };
}

export async function saveScreenshot(
  page: import("playwright").Page,
  courseId: string,
  screenshotDir: string,
  suffix = "",
): Promise<string> {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "_");
  const filePath = path.join(
    screenshotDir,
    `${courseId}${suffix ? `-${suffix}` : ""}-${timestamp}.png`,
  );
  await page.screenshot({ path: filePath, fullPage: false }).catch(() => undefined);
  return filePath;
}

export function rowGapWithJitter(gapMs: number, jitterMs: number): number {
  if (jitterMs <= 0) return gapMs;
  return gapMs + Math.floor(Math.random() * jitterMs);
}
