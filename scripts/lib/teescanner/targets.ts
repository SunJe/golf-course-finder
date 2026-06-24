import fs from "node:fs";
import { parseCsv } from "../csvUtils";
import { readCsvWithEncodingGuess } from "../encodingUtils";
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

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

function rowToInput(
  headers: string[],
  row: string[],
): TeescannerInputRow | null {
  const get = (key: string) => {
    const index = headers.indexOf(key);
    return index >= 0 ? (row[index] ?? "").trim() : "";
  };

  const id = get("id");
  const name = get("name");
  const address = get("address");
  if (!id || !name || !address) return null;

  return {
    id,
    name,
    change_name_to: get("change_name_to"),
    address,
  };
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

export function loadTargetRows(
  inputCsvPath: string,
  processedIds: Set<string>,
  limit: number,
  targetName?: string,
  targetId?: string,
): TeescannerInputRow[] {
  if (!fs.existsSync(inputCsvPath)) return [];

  const content = readCsvWithEncodingGuess(inputCsvPath).content;
  const { headers, rows } = parseCsv(content);

  const scored = rows
    .map((row) => {
      const input = rowToInput(headers, row);
      if (!input) return null;
      if (!isPriceMissing(headers, row)) return null;
      if (processedIds.has(input.id)) return null;
      if (targetId && input.id !== targetId.trim()) return null;
      if (targetName) {
        const needle = targetName.trim().toLowerCase();
        const haystack = `${input.name} ${input.change_name_to}`.toLowerCase();
        if (!haystack.includes(needle)) return null;
      }
      return { input, score: scoreTarget(input, headers, row) };
    })
    .filter(
      (item): item is { input: TeescannerInputRow; score: number } =>
        item !== null,
    )
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.input);
}
