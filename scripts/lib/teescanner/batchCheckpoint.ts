import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "../sourceRegistry";
import { formatCompactPriceRange } from "../../../lib/priceFormat";
import type { TeescannerInputRow } from "./types";
import type { TeescannerScrapeOutcome } from "./types";

const ROOT = getProjectRoot();

export const DEFAULT_CHECKPOINT_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_price_checkpoint.jsonl",
);

export type PriceCheckpointEntry = {
  index: number;
  rowIndex: number;
  golfCourseId: string;
  golfCourseName: string;
  ambiguous: boolean;
  searchKeyword: string;
  priceRaw: string;
  priceRangeNormalized: string;
  priceMin: string;
  priceMax: string;
  priceStatus: "success" | "no_price" | "failed" | "blocked" | "skipped";
  source: string;
  failureReason: string;
  detailUrl: string;
  updatedAt: string;
};

export function normalizeCheckpointPriceRange(
  priceMin: string,
  priceMax: string,
): string {
  const min = priceMin ? Number.parseInt(priceMin, 10) : null;
  const max = priceMax ? Number.parseInt(priceMax, 10) : null;
  if (!min && !max) return "";
  return formatCompactPriceRange(min, max);
}

export function appendPriceCheckpoint(
  filePath: string,
  entry: PriceCheckpointEntry,
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}

export function buildCheckpointFromOutcome(options: {
  index: number;
  course: TeescannerInputRow;
  ambiguous: boolean;
  searchKeyword: string;
  outcome?: TeescannerScrapeOutcome;
  skipped?: boolean;
  skipReason?: string;
}): PriceCheckpointEntry {
  const { index, course, ambiguous, searchKeyword, outcome, skipped, skipReason } =
    options;
  const courseName = course.change_name_to || course.name;
  const result = outcome?.result;
  const priceMin = result?.price_min ?? "";
  const priceMax = result?.price_max ?? "";
  const hasPrice = Boolean(priceMin || priceMax);

  let priceStatus: PriceCheckpointEntry["priceStatus"] = "failed";
  if (skipped) {
    priceStatus = "skipped";
  } else if (outcome?.blocked) {
    priceStatus = "blocked";
  } else if (result?.status === "success" && hasPrice) {
    priceStatus = "success";
  } else if (result?.status === "success") {
    priceStatus = "no_price";
  }

  return {
    index,
    rowIndex: course.row_index ?? index,
    golfCourseId: course.id,
    golfCourseName: courseName,
    ambiguous,
    searchKeyword,
    priceRaw: result?.price_text ?? "",
    priceRangeNormalized: normalizeCheckpointPriceRange(priceMin, priceMax),
    priceMin,
    priceMax,
    priceStatus,
    source: result?.source_name ?? "teescanner",
    failureReason:
      skipReason ?? result?.error_reason ?? outcome?.blockReason ?? "",
    detailUrl: result?.detail_url ?? "",
    updatedAt: new Date().toISOString(),
  };
}
