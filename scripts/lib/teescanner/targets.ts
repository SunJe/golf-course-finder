import fs from "node:fs";
import { parseCsv } from "../csvUtils";
import { readCsvWithEncodingGuess } from "../encodingUtils";
import {
  hasValidTeescannerPrice,
  parseSummaryRows,
} from "../../../lib/enrichment/teescannerPriceMerge";
import { readSummaryRows } from "./batchIo";
import { buildCourseSearchTerms, findChangeNameColumnIndex } from "./courseEnrichment";
import { enrichInputRowFromCourse } from "./courseMeta";
import type { TeescannerInputRow } from "./types";

const CONFIDENCE_RANK: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  "": 3,
};

const METRO_REGIONS = [
  "서울",
  "경기",
  "인천",
  "부산",
  "대구",
  "대전",
  "광주",
  "울산",
  "세종",
];

export type TargetMode = "price_missing" | "sequential" | "ambiguous";

export interface LoadTargetOptions {
  processedIds: Set<string>;
  limit: number;
  startRow?: number;
  endRow?: number;
  targetName?: string;
  targetId?: string;
  targetMode?: TargetMode;
  includePriced?: boolean;
  skipRecentTeescannerSuccessDays?: number;
  summaryCsvPath?: string;
  ambiguousIds?: Set<string>;
}

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

function rowToInput(
  headers: string[],
  row: string[],
  rowIndex: number,
): TeescannerInputRow | null {
  const get = (key: string) => {
    const index = headers.indexOf(key);
    return index >= 0 ? (row[index] ?? "").trim() : "";
  };

  const id = get("id");
  const name = get("name");
  const address = get("address");
  if (!id || !name || !address) return null;

  const changeIndex = findChangeNameColumnIndex(headers);
  const changeNameTo =
    changeIndex >= 0 ? (row[changeIndex] ?? "").trim() : get("change_name_to");

  return enrichInputRowFromCourse({
    row_index: rowIndex + 1,
    id,
    name,
    change_name_to: changeNameTo,
    address,
    price_min: get("price_min"),
    price_max: get("price_max"),
  });
}

function isPriceMissing(headers: string[], row: string[]): boolean {
  const minIndex = headers.indexOf("price_min");
  const maxIndex = headers.indexOf("price_max");
  const priceMin = minIndex >= 0 ? (row[minIndex] ?? "").trim() : "";
  const priceMax = maxIndex >= 0 ? (row[maxIndex] ?? "").trim() : "";
  return isBlank(priceMin) && isBlank(priceMax);
}

function scoreTarget(
  row: TeescannerInputRow,
  headers: string[],
  rawRow: string[],
): number {
  let score = 0;
  const confIndex = headers.indexOf("confidence");
  const conf =
    confIndex >= 0 ? (rawRow[confIndex] ?? "").toLowerCase() : "";
  score += (3 - (CONFIDENCE_RANK[conf] ?? 3)) * 100;

  if (row.change_name_to.trim()) score += 15;
  if (row.address.length >= 12) score += 20;

  if (METRO_REGIONS.some((region) => row.address.includes(region))) {
    score += 10;
  }

  return score;
}

function loadRecentSuccessfulIds(
  summaryCsvPath: string | undefined,
  skipDays: number,
): Set<string> {
  const recentIds = new Set<string>();
  if (!summaryCsvPath || skipDays <= 0 || !fs.existsSync(summaryCsvPath)) {
    return recentIds;
  }

  const encoding = readCsvWithEncodingGuess(summaryCsvPath);
  const { headers, rows } = parseCsv(encoding.content);
  const summaries = parseSummaryRows(headers, rows);
  const cutoff = Date.now() - skipDays * 24 * 60 * 60 * 1000;

  for (const summary of summaries) {
    if (!summary.id || !hasValidTeescannerPrice(summary)) continue;
    const collectedAt = summary.last_collected_at.trim();
    if (!collectedAt) continue;
    const parsed = Date.parse(collectedAt);
    if (Number.isFinite(parsed) && parsed >= cutoff) {
      recentIds.add(summary.id);
    }
  }

  return recentIds;
}

function isAmbiguousSummaryRow(row: {
  match_status: string;
  review_reason: string;
  review_action: string;
}): boolean {
  if (row.review_action === "accept_price") return false;
  if (row.match_status === "ambiguous") return true;
  const reason = (row.review_reason ?? "").trim();
  return (
    reason === "ambiguous_match" ||
    reason === "multiple similar candidates"
  );
}

export function loadAmbiguousTargetIds(summaryCsvPath: string): Set<string> {
  const ids = new Set<string>();
  for (const summary of readSummaryRows(summaryCsvPath)) {
    if (!summary.id) continue;
    if (isAmbiguousSummaryRow(summary)) {
      ids.add(summary.id);
    }
  }
  return ids;
}

function withinRowRange(
  rowIndex: number,
  startRow: number,
  endRow: number,
): boolean {
  if (rowIndex < startRow) return false;
  if (endRow > 0 && rowIndex > endRow) return false;
  return true;
}

export function loadTargetRows(
  inputCsvPath: string,
  options: LoadTargetOptions,
): TeescannerInputRow[] {
  if (!fs.existsSync(inputCsvPath)) return [];

  const {
    processedIds,
    limit,
    startRow = 1,
    endRow = 0,
    targetName,
    targetId,
    targetMode = "sequential",
    includePriced = false,
    skipRecentTeescannerSuccessDays = 0,
    summaryCsvPath,
    ambiguousIds,
  } = options;

  const content = readCsvWithEncodingGuess(inputCsvPath).content;
  const { headers, rows } = parseCsv(content);
  const recentSuccessIds = loadRecentSuccessfulIds(
    summaryCsvPath,
    skipRecentTeescannerSuccessDays,
  );

  const priceMissingOnly =
    targetMode === "price_missing" && !includePriced;
  const candidates: Array<{ input: TeescannerInputRow; score: number; index: number }> = [];

  rows.forEach((row, index) => {
    const input = rowToInput(headers, row, index);
    if (!input) return;
    if (processedIds.has(input.id)) return;
    if (targetId && input.id !== targetId.trim()) return;
    if (targetName) {
      const needle = targetName.trim().toLowerCase();
      const haystack = `${input.name} ${input.change_name_to}`.toLowerCase();
      if (!haystack.includes(needle)) return;
    }
    if (targetMode === "ambiguous") {
      if (!ambiguousIds?.has(input.id)) return;
    }
    if (priceMissingOnly && !isPriceMissing(headers, row)) return;
    if (recentSuccessIds.has(input.id)) return;

    candidates.push({
      input,
      score: scoreTarget(input, headers, row),
      index,
    });
  });

  if (!priceMissingOnly) {
    return candidates
      .filter((item) => withinRowRange(item.input.row_index ?? item.index + 1, startRow, endRow))
      .sort((a, b) => a.index - b.index)
      .slice(0, limit)
      .map((item) => item.input);
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.input);
}

export function loadAllCourseRowsInCsvOrder(
  inputCsvPath: string,
): TeescannerInputRow[] {
  if (!fs.existsSync(inputCsvPath)) return [];
  const content = readCsvWithEncodingGuess(inputCsvPath).content;
  const { headers, rows } = parseCsv(content);
  return rows
    .map((row, index) => rowToInput(headers, row, index))
    .filter((row): row is TeescannerInputRow => row != null);
}
