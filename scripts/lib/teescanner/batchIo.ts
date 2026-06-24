import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv } from "../csvUtils";
import { getProjectRoot } from "../sourceRegistry";
import type { DayType } from "./dateSampling";
import { inferDayTypeFromRoundDay } from "./dateSampling";
import type { TeescannerPriceResult } from "./types";

const ROOT = getProjectRoot();

export const DEFAULT_DAILY_RESULTS_CSV = path.join(
  ROOT,
  "data/enrichment/teescanner_price_daily_results.csv",
);
export const DEFAULT_SUMMARY_CSV = path.join(
  ROOT,
  "data/enrichment/teescanner_price_course_summary.csv",
);
export const DEFAULT_MANUAL_REVIEW_CSV = path.join(
  ROOT,
  "data/enrichment/teescanner_manual_review_list.csv",
);
export const DEFAULT_COURSE_RESULTS_CSV = path.join(
  ROOT,
  "data/enrichment/teescanner_price_results.csv",
);
export const DEFAULT_BATCH_RUNLOG_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_price_batch_runlog.jsonl",
);

export const DAILY_RESULT_HEADERS = [
  "id",
  "name",
  "source_row_index",
  "change_name_to",
  "primary_search_term",
  "fallback_search_term",
  "used_search_term",
  "search_attempt",
  "matched_title",
  "candidate_title",
  "candidate_region",
  "candidate_subregion",
  "candidate_type",
  "match_status",
  "review_reason",
  "suggested_change_name_to",
  "round_day",
  "day_type",
  "status",
  "error_reason",
  "selected_round_day",
  "url_round_day",
  "date_mismatch",
  "selected_date_tab_raw_text",
  "available_team_count_from_date_tab",
  "loaded_slot_card_count",
  "price_scope",
  "price_source",
  "sale_price_candidates",
  "price_min",
  "price_max",
  "review_action",
  "detail_url",
  "screenshot_path",
  "collected_at",
  "golfclub_seq",
  "detail_url_template",
  "per_date_detail_reload",
] as const;

export const SUMMARY_HEADERS = [
  "source_row_index",
  "id",
  "name",
  "change_name_to",
  "primary_search_term",
  "fallback_search_term",
  "used_search_term",
  "search_attempt",
  "matched_title",
  "candidate_title",
  "candidate_region",
  "candidate_subregion",
  "candidate_type",
  "match_status",
  "review_action",
  "review_reason",
  "suggested_change_name_to",
  "weekday_sample_count",
  "weekend_sample_count",
  "weekday_price_min",
  "weekday_price_max",
  "weekend_price_min",
  "weekend_price_max",
  "price_min",
  "price_max",
  "overall_price_min",
  "overall_price_max",
  "success_day_count",
  "no_price_day_count",
  "manual_review_count",
  "accept_price_day_count",
  "price_scope",
  "price_scope_summary",
  "slot_load_complete",
  "matched_region",
  "source_name",
  "last_collected_at",
  "collected_at",
  "detail_url",
] as const;

export const MANUAL_REVIEW_HEADERS = [
  "row_index",
  "id",
  "name",
  "change_name_to",
  "primary_search_term",
  "fallback_search_term",
  "used_search_term",
  "matched_title",
  "candidate_region",
  "candidate_subregion",
  "match_status",
  "review_reason",
  "suggested_change_name_to",
  "screenshot_path",
  "collected_at",
] as const;

export type DailyResultRow = Record<(typeof DAILY_RESULT_HEADERS)[number], string>;
export type SummaryRow = Record<(typeof SUMMARY_HEADERS)[number], string>;
export type ManualReviewRow = Record<(typeof MANUAL_REVIEW_HEADERS)[number], string>;

function normalizeDateMismatch(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "y" || trimmed === "true") return "true";
  if (trimmed === "n" || trimmed === "false" || trimmed === "") return "false";
  return trimmed;
}

export function toDailyResultRow(
  result: TeescannerPriceResult,
  dayType: DayType,
): DailyResultRow {
  return {
    id: result.id,
    name: result.change_name_to || result.name,
    source_row_index: result.source_row_index,
    change_name_to: result.change_name_to,
    primary_search_term: result.primary_search_term,
    fallback_search_term: result.fallback_search_term,
    used_search_term: result.used_search_term || result.search_query,
    search_attempt: result.search_attempt,
    matched_title: result.matched_title,
    candidate_title: result.candidate_title || result.matched_title,
    candidate_region: result.candidate_region,
    candidate_subregion: result.candidate_subregion,
    candidate_type: result.candidate_type,
    match_status: result.match_status,
    review_reason: result.review_reason,
    suggested_change_name_to: result.suggested_change_name_to,
    round_day: result.round_day,
    day_type: dayType,
    status: result.status,
    error_reason: result.error_reason,
    selected_round_day: result.selected_round_day,
    url_round_day: result.url_round_day,
    date_mismatch: normalizeDateMismatch(result.date_mismatch),
    selected_date_tab_raw_text: result.selected_date_tab_raw_text,
    available_team_count_from_date_tab: result.available_team_count_from_date_tab,
    loaded_slot_card_count: result.slot_card_count,
    price_scope: result.price_scope,
    price_source: result.price_source,
    sale_price_candidates: result.sale_price_candidates,
    price_min: result.price_min,
    price_max: result.price_max,
    review_action: result.review_action,
    detail_url: result.detail_url,
    screenshot_path: result.screenshot_path,
    collected_at: result.collected_at,
    golfclub_seq: result.golfclub_seq,
    detail_url_template: result.detail_url_template,
    per_date_detail_reload: result.per_date_detail_reload,
  };
}

function ensureCsvHeader(filePath: string, headers: readonly string[]): void {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, `\uFEFF${rowsToCsv([...headers], [])}`, "utf8");
    return;
  }
  migrateDailyResultsFile(filePath);
}

export function appendDailyResultRow(
  filePath: string,
  row: DailyResultRow,
): void {
  ensureCsvHeader(filePath, DAILY_RESULT_HEADERS);
  const line = DAILY_RESULT_HEADERS.map((header) => {
    const value = row[header] ?? "";
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }).join(",");
  fs.appendFileSync(filePath, `${line}\n`, "utf8");
}

function rowCellsToDailyResult(headers: string[], cells: string[]): DailyResultRow {
  const get = (header: string) => {
    const index = headers.indexOf(header);
    return index >= 0 ? (cells[index] ?? "").trim() : "";
  };

  const hasNewSchema = headers.includes("golfclub_seq");
  if (hasNewSchema) {
    const row = {} as DailyResultRow;
    for (const header of DAILY_RESULT_HEADERS) {
      row[header] = get(header);
    }
    return row;
  }

  const legacyDayType = get("day_type");
  const legacyRoundDay = get("round_day");
  return {
    id: get("id"),
    name: get("name"),
    source_row_index: get("source_row_index"),
    change_name_to: get("change_name_to"),
    primary_search_term: get("primary_search_term"),
    fallback_search_term: get("fallback_search_term"),
    used_search_term: get("used_search_term"),
    search_attempt: get("search_attempt"),
    matched_title: get("matched_title"),
    candidate_title: get("candidate_title"),
    candidate_region: get("candidate_region"),
    candidate_subregion: get("candidate_subregion"),
    candidate_type: get("candidate_type"),
    match_status: get("match_status"),
    review_reason: get("review_reason"),
    suggested_change_name_to: get("suggested_change_name_to"),
    round_day: legacyRoundDay,
    day_type: legacyDayType === "weekend" || legacyDayType === "weekday"
      ? legacyDayType
      : legacyRoundDay
        ? inferDayTypeFromRoundDay(legacyRoundDay)
        : "weekday",
    status: get("status"),
    error_reason: get("error_reason"),
    selected_round_day: get("selected_round_day"),
    url_round_day: get("url_round_day"),
    date_mismatch: normalizeDateMismatch(get("date_mismatch")),
    selected_date_tab_raw_text: get("selected_date_tab_raw_text"),
    available_team_count_from_date_tab: get("available_team_count_from_date_tab"),
    loaded_slot_card_count: get("loaded_slot_card_count") || get("slot_card_count"),
    price_scope: get("price_scope"),
    price_source: get("price_source"),
    sale_price_candidates: get("sale_price_candidates"),
    price_min: get("price_min"),
    price_max: get("price_max"),
    review_action: get("review_action"),
    detail_url: get("detail_url"),
    screenshot_path: get("screenshot_path"),
    collected_at: get("collected_at"),
    golfclub_seq: "",
    detail_url_template: "",
    per_date_detail_reload: "",
  };
}

const VALID_DAILY_STATUSES = new Set([
  "success",
  "not_on_teescanner",
  "ambiguous_match",
  "no_price",
  "no_available_slots",
  "blocked",
  "failed",
  "skipped",
]);

function dedupeRowsForMigration(rows: DailyResultRow[]): DailyResultRow[] {
  const latestByKey = new Map<string, DailyResultRow>();
  for (const row of rows) {
    if (!row.id || !row.round_day) continue;
    const key = `${row.id}|${row.round_day}`;
    const existing = latestByKey.get(key);
    const rowValid = VALID_DAILY_STATUSES.has(row.status);
    const existingValid = existing ? VALID_DAILY_STATUSES.has(existing.status) : false;
    if (!existing || (rowValid && !existingValid)) {
      latestByKey.set(key, row);
      continue;
    }
    if (rowValid === existingValid) {
      latestByKey.set(key, row);
    }
  }
  return [...latestByKey.values()];
}

function migrateDailyResultsFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  const { headers, rows } = parseCsv(content);
  if (headers.includes("golfclub_seq")) {
    const parsed = rows.map((cells) => rowCellsToDailyResult(headers, cells));
    const deduped = dedupeRowsForMigration(parsed);
    if (deduped.length === parsed.length) return;
    const body = rowsToCsv(
      [...DAILY_RESULT_HEADERS],
      deduped.map((row) => DAILY_RESULT_HEADERS.map((header) => row[header] ?? "")),
    );
    fs.writeFileSync(filePath, `\uFEFF${body}`, "utf8");
    return;
  }

  const migrated = dedupeRowsForMigration(
    rows.map((cells) => rowCellsToDailyResult(headers, cells)),
  );
  const body = rowsToCsv(
    [...DAILY_RESULT_HEADERS],
    migrated.map((row) => DAILY_RESULT_HEADERS.map((header) => row[header] ?? "")),
  );
  fs.writeFileSync(filePath, `\uFEFF${body}`, "utf8");
}

export function readDailyResults(filePath: string): DailyResultRow[] {
  if (!fs.existsSync(filePath)) return [];
  migrateDailyResultsFile(filePath);
  const { headers, rows } = parseCsv(fs.readFileSync(filePath, "utf8"));
  return rows.map((cells) => rowCellsToDailyResult(headers, cells));
}

export function readProcessedCourseDatePairs(filePath: string): Set<string> {
  const pairs = new Set<string>();
  for (const row of readDailyResults(filePath)) {
    if (!row.id || !row.round_day) continue;
    pairs.add(`${row.id}|${row.round_day}`);
  }
  return pairs;
}

export function readSummaryRows(filePath: string): SummaryRow[] {
  if (!fs.existsSync(filePath)) return [];
  const { headers, rows } = parseCsv(fs.readFileSync(filePath, "utf8"));
  return rows.map((cells) => {
    const row = {} as SummaryRow;
    for (const header of SUMMARY_HEADERS) {
      const index = headers.indexOf(header);
      row[header] = index >= 0 ? (cells[index] ?? "").trim() : "";
    }
    return row;
  });
}

export function readCourseIdsMissingDayTypePrice(
  summaryCsv: string,
  dayType: DayType,
): Set<string> {
  const missing = new Set<string>();
  for (const row of readSummaryRows(summaryCsv)) {
    if (!row.id) continue;
    const priceMin =
      dayType === "weekend" ? row.weekend_price_min : row.weekday_price_min;
    if (!priceMin.trim()) {
      missing.add(row.id);
    }
  }
  return missing;
}

export function writeSummaryCsv(filePath: string, rows: SummaryRow[]): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const body = rowsToCsv(
    [...SUMMARY_HEADERS],
    rows.map((row) => SUMMARY_HEADERS.map((header) => row[header] ?? "")),
  );
  fs.writeFileSync(filePath, `\uFEFF${body}`, "utf8");
}

export function writeManualReviewCsv(
  filePath: string,
  rows: ManualReviewRow[],
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const body = rowsToCsv(
    [...MANUAL_REVIEW_HEADERS],
    rows.map((row) => MANUAL_REVIEW_HEADERS.map((header) => row[header] ?? "")),
  );
  fs.writeFileSync(filePath, `\uFEFF${body}`, "utf8");
}

export function writeCourseResultsCsv(
  filePath: string,
  rows: SummaryRow[],
): void {
  writeSummaryCsv(filePath, rows);
}

export function appendBatchRunLog(
  filePath: string,
  entry: Record<string, unknown>,
): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, "utf8");
}
