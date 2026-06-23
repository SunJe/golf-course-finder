import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "../sourceRegistry";

export const DEFAULT_BLOCKED_STATE_PATH = path.join(
  getProjectRoot(),
  "data/enrichment/naver_blocked_state.json",
);

export const RECENT_BLOCK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const RECENT_BLOCK_MESSAGE =
  "Recent Naver block detected. Stop to avoid further access restrictions.";

export interface NaverBlockedState {
  timestamp: string;
  reason: string;
  detectedText: string;
  screenshotPath: string;
}

export interface WriteBlockedStateInput {
  reason: string;
  detectedText?: string;
  screenshotPath?: string;
  timestamp?: string;
}

function parseTimestamp(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) return null;
  return raw;
}

/** 기존 detectedAt / matchedText 필드도 읽을 수 있게 호환 */
export function readBlockedState(
  filePath: string = DEFAULT_BLOCKED_STATE_PATH,
): NaverBlockedState | null {
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
      string,
      unknown
    >;
    const timestamp =
      parseTimestamp(raw.timestamp) ??
      parseTimestamp(raw.detectedAt) ??
      null;
    if (!timestamp) return null;

    return {
      timestamp,
      reason: typeof raw.reason === "string" ? raw.reason : "",
      detectedText:
        (typeof raw.detectedText === "string" ? raw.detectedText : "") ||
        (typeof raw.matchedText === "string" ? raw.matchedText : ""),
      screenshotPath:
        typeof raw.screenshotPath === "string" ? raw.screenshotPath : "",
    };
  } catch {
    return null;
  }
}

export function isRecentBlockedState(
  state: NaverBlockedState,
  windowMs: number = RECENT_BLOCK_WINDOW_MS,
): boolean {
  const at = Date.parse(state.timestamp);
  if (!Number.isFinite(at)) return false;
  return Date.now() - at < windowMs;
}

export function getRecentBlockedState(
  filePath: string = DEFAULT_BLOCKED_STATE_PATH,
  windowMs: number = RECENT_BLOCK_WINDOW_MS,
): NaverBlockedState | null {
  const state = readBlockedState(filePath);
  if (!state) return null;
  return isRecentBlockedState(state, windowMs) ? state : null;
}

export function printRecentBlockWarning(state: NaverBlockedState): void {
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
  input: WriteBlockedStateInput,
): NaverBlockedState {
  const state: NaverBlockedState = {
    timestamp: input.timestamp ?? new Date().toISOString(),
    reason: input.reason,
    detectedText: input.detectedText ?? "",
    screenshotPath: input.screenshotPath ?? "",
  };

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}
