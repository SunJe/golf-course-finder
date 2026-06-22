import fs from "node:fs";
import { parseCsv } from "../csvUtils";
import { readCsvWithEncodingGuess } from "../encodingUtils";
import type { EnrichmentInputRow } from "./types";

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

function isExcludedNeedsCheck(value: string, note: string): boolean {
  const combined = `${value} ${note}`.toLowerCase();
  return /fatal|block|circuit_breaker|access\s*blocked/i.test(combined);
}

function rowToInput(
  headers: string[],
  row: string[],
): EnrichmentInputRow | null {
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
    phone: get("phone"),
    homepage_url: get("homepage_url"),
    price_text: get("price_text"),
    price_min: get("price_min"),
    price_max: get("price_max"),
    price_type: get("price_type"),
    difficulty: get("difficulty"),
    avg_score: get("avg_score"),
    source_url: get("source_url"),
    confidence: get("confidence"),
    needs_check: get("needs_check"),
    note: get("note"),
  };
}

function isPriceMissing(row: EnrichmentInputRow): boolean {
  return isBlank(row.price_min) && isBlank(row.price_max);
}

function scoreTarget(row: EnrichmentInputRow): number {
  let score = 0;
  const conf = (row.confidence || "").toLowerCase();
  score += (3 - (CONFIDENCE_RANK[conf] ?? 3)) * 100;

  if (row.address.length >= 12) score += 20;
  if (row.phone.trim()) score += 10;
  if (row.homepage_url.trim()) score += 10;

  if (METRO_REGIONS.some((region) => row.address.includes(region))) {
    score += 5;
  }

  return score;
}

export function loadTargetRows(
  inputCsvPath: string,
  processedIds: Set<string>,
  limit: number,
): EnrichmentInputRow[] {
  const content = readCsvWithEncodingGuess(inputCsvPath).content;
  const { headers, rows } = parseCsv(content);

  const candidates: EnrichmentInputRow[] = [];
  for (const row of rows) {
    const input = rowToInput(headers, row);
    if (!input) continue;
    if (!isPriceMissing(input)) continue;
    if (isExcludedNeedsCheck(input.needs_check, input.note)) continue;
    if (processedIds.has(input.id)) continue;
    candidates.push(input);
  }

  candidates.sort((a, b) => scoreTarget(b) - scoreTarget(a));
  return candidates.slice(0, limit);
}

export function loadInputCsvRows(inputCsvPath: string): EnrichmentInputRow[] {
  if (!fs.existsSync(inputCsvPath)) return [];
  const content = readCsvWithEncodingGuess(inputCsvPath).content;
  const { headers, rows } = parseCsv(content);
  return rows
    .map((row) => rowToInput(headers, row))
    .filter((row): row is EnrichmentInputRow => row !== null);
}
