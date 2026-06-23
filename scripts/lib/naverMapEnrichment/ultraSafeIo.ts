import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv } from "../csvUtils";
import { getProjectRoot } from "../sourceRegistry";

const ROOT = getProjectRoot();

export const DEFAULT_INPUT_CSV = path.join(
  ROOT,
  "data/enrichment/course_enrichment_edit.csv",
);
export const DEFAULT_RESULTS_CSV = path.join(
  ROOT,
  "data/enrichment/naver_reservation_price_results.csv",
);
export const DEFAULT_RUNLOG_PATH = path.join(
  ROOT,
  "data/enrichment/naver_reservation_price_runlog.jsonl",
);
export { DEFAULT_BLOCKED_STATE_PATH } from "./ultraSafeBlockedState";
export const DEFAULT_LOCK_PATH = path.join(
  ROOT,
  "data/enrichment/naver_price_collect.lock",
);
export const DEFAULT_SCREENSHOT_DIR = path.join(
  ROOT,
  "data/enrichment/naver-price-screenshots",
);

export const RESULT_HEADERS = [
  "id",
  "name",
  "address",
  "matched_title",
  "matched_address",
  "naver_reservation_found",
  "price_text",
  "price_min",
  "price_max",
  "price_unit",
  "source_url",
  "status",
  "error_reason",
  "collected_at",
  "screenshot_path",
] as const;

export type UltraSafeResultStatus =
  | "success"
  | "no_reservation"
  | "no_price"
  | "ambiguous_match"
  | "blocked"
  | "failed";

export interface UltraSafePriceResult {
  id: string;
  name: string;
  address: string;
  matched_title: string;
  matched_address: string;
  naver_reservation_found: string;
  price_text: string;
  price_min: string;
  price_max: string;
  price_unit: string;
  source_url: string;
  status: UltraSafeResultStatus;
  error_reason: string;
  collected_at: string;
  screenshot_path: string;
}

export interface RunLogEntry {
  timestamp: string;
  rowId: string;
  courseName: string;
  step: string;
  status: string;
  delayUsedMs?: number;
  blockDetected: boolean;
  screenshotPath?: string;
  errorMessage?: string;
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
  result: UltraSafePriceResult,
): void {
  ensureResultsCsvHeader(filePath);
  const line = RESULT_HEADERS.map((header) => {
    const value = result[header as keyof UltraSafePriceResult] ?? "";
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(",");
  fs.appendFileSync(filePath, `${line}\n`, "utf8");
}

export function appendRunLog(filePath: string, entry: RunLogEntry): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

export { writeBlockedState } from "./ultraSafeBlockedState";

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
): Promise<string> {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "_");
  const filePath = path.join(screenshotDir, `${courseId}-${timestamp}.png`);
  await page.screenshot({ path: filePath, fullPage: false }).catch(() => undefined);
  return filePath;
}
