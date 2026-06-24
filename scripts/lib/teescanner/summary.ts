import type { DailyResultRow, ManualReviewRow, SummaryRow } from "./batchIo";
import { inferDayTypeFromRoundDay } from "./dateSampling";

const MANUAL_REVIEW_STATUSES = new Set([
  "possible_renamed_course",
  "candidate_mismatch",
  "ambiguous_match",
  "ambiguous",
  "no_result",
  "search_failed",
  "blocked",
  "manual_review",
]);

function parseIntOrNull(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function minNullable(values: Array<number | null>): number | null {
  const filtered = values.filter((value): value is number => value != null);
  if (filtered.length === 0) return null;
  return Math.min(...filtered);
}

function maxNullable(values: Array<number | null>): number | null {
  const filtered = values.filter((value): value is number => value != null);
  if (filtered.length === 0) return null;
  return Math.max(...filtered);
}

function formatInt(value: number | null): string {
  return value == null ? "" : String(value);
}

function resolveRowDayType(row: DailyResultRow): "weekday" | "weekend" {
  if (row.day_type === "weekday" || row.day_type === "weekend") {
    return row.day_type;
  }
  if (row.round_day) {
    return inferDayTypeFromRoundDay(row.round_day);
  }
  return "weekday";
}

function pricedSuccessRows(rows: DailyResultRow[]): DailyResultRow[] {
  return rows.filter(
    (row) => row.status === "success" && row.price_min.trim().length > 0,
  );
}

function rollupReviewAction(rows: DailyResultRow[]): string {
  if (rows.some((row) => row.review_action === "ignore_filter_only")) {
    const priced = pricedSuccessRows(rows);
    if (priced.length === 0) return "ignore_filter_only";
  }
  if (rows.some((row) => row.review_action === "manual_review")) {
    return "manual_review";
  }
  if (rows.every((row) => row.review_action === "accept_price")) {
    return "accept_price";
  }
  if (rows.some((row) => row.review_action === "accept_price")) {
    return "manual_review";
  }
  return rows.find((row) => row.review_action)?.review_action ?? "manual_review";
}

function priceScopeSummary(rows: DailyResultRow[]): string {
  const scopes = [...new Set(rows.map((row) => row.price_scope.trim()).filter(Boolean))];
  return scopes.join(" | ");
}

function dedupeLatestPerRoundDay(rows: DailyResultRow[]): DailyResultRow[] {
  const latestByKey = new Map<string, DailyResultRow>();
  for (const row of rows) {
    if (!row.id || !row.round_day) continue;
    latestByKey.set(`${row.id}|${row.round_day}`, row);
  }
  return [...latestByKey.values()];
}

function pickMetaRow(rows: DailyResultRow[]): DailyResultRow {
  const withMatch = [...rows].reverse().find((row) => row.matched_title || row.match_status);
  return withMatch ?? rows[rows.length - 1];
}

export function buildCourseSummary(
  courseId: string,
  dailyRows: DailyResultRow[],
): SummaryRow | null {
  const rows = dedupeLatestPerRoundDay(dailyRows.filter((row) => row.id === courseId));
  if (rows.length === 0) return null;

  const weekdayRows = rows.filter((row) => resolveRowDayType(row) === "weekday");
  const weekendRows = rows.filter((row) => resolveRowDayType(row) === "weekend");
  const successRows = rows.filter((row) => row.status === "success");
  const pricedRows = pricedSuccessRows(rows);

  const overallMin = minNullable(pricedRows.map((row) => parseIntOrNull(row.price_min)));
  const overallMax = maxNullable(
    pricedRows.map((row) => parseIntOrNull(row.price_max || row.price_min)),
  );

  const pricedWeekdayRows = pricedSuccessRows(weekdayRows);
  const pricedWeekendRows = pricedSuccessRows(weekendRows);
  const meta = pickMetaRow(rows);
  const collectedAt = rows[rows.length - 1]?.collected_at ?? "";

  return {
    source_row_index: meta.source_row_index,
    id: courseId,
    name: meta.name,
    change_name_to: meta.change_name_to,
    primary_search_term: meta.primary_search_term,
    fallback_search_term: meta.fallback_search_term,
    used_search_term: meta.used_search_term,
    search_attempt: meta.search_attempt,
    matched_title: meta.matched_title,
    candidate_title: meta.candidate_title || meta.matched_title,
    candidate_region: meta.candidate_region,
    candidate_subregion: meta.candidate_subregion,
    candidate_type: meta.candidate_type,
    match_status: meta.match_status,
    review_action: rollupReviewAction(rows),
    review_reason: meta.review_reason,
    suggested_change_name_to: meta.suggested_change_name_to,
    weekday_sample_count: String(weekdayRows.length),
    weekend_sample_count: String(weekendRows.length),
    weekday_price_min: formatInt(
      minNullable(pricedWeekdayRows.map((row) => parseIntOrNull(row.price_min))),
    ),
    weekday_price_max: formatInt(
      maxNullable(
        pricedWeekdayRows.map((row) =>
          parseIntOrNull(row.price_max || row.price_min),
        ),
      ),
    ),
    weekend_price_min: formatInt(
      minNullable(pricedWeekendRows.map((row) => parseIntOrNull(row.price_min))),
    ),
    weekend_price_max: formatInt(
      maxNullable(
        pricedWeekendRows.map((row) =>
          parseIntOrNull(row.price_max || row.price_min),
        ),
      ),
    ),
    price_min: formatInt(overallMin),
    price_max: formatInt(overallMax),
    overall_price_min: formatInt(overallMin),
    overall_price_max: formatInt(overallMax),
    success_day_count: String(successRows.length),
    no_price_day_count: String(rows.length - pricedRows.length),
    manual_review_count: String(
      rows.filter((row) => row.review_action === "manual_review").length,
    ),
    accept_price_day_count: String(
      rows.filter((row) => row.review_action === "accept_price").length,
    ),
    price_scope: priceScopeSummary(rows),
    price_scope_summary: priceScopeSummary(rows),
    slot_load_complete: rows.some((row) => row.price_scope.includes("partial"))
      ? "partial"
      : pricedRows.length > 0
        ? "complete"
        : "",
    matched_region: [meta.candidate_region, meta.candidate_subregion]
      .filter(Boolean)
      .join(" > "),
    source_name: "teescanner",
    last_collected_at: rows[rows.length - 1]?.collected_at ?? "",
    collected_at: rows[rows.length - 1]?.collected_at ?? "",
    detail_url: rows[rows.length - 1]?.detail_url ?? "",
  };
}

export function buildAllSummaries(dailyRows: DailyResultRow[]): SummaryRow[] {
  const ids = [...new Set(dailyRows.map((row) => row.id).filter(Boolean))];
  return ids
    .map((id) => buildCourseSummary(id, dailyRows))
    .filter((row): row is SummaryRow => row != null)
    .sort((a, b) => {
      const aIndex = Number.parseInt(a.source_row_index, 10);
      const bIndex = Number.parseInt(b.source_row_index, 10);
      if (Number.isFinite(aIndex) && Number.isFinite(bIndex)) {
        return aIndex - bIndex;
      }
      return a.name.localeCompare(b.name, "ko");
    });
}

export function buildManualReviewRows(summaries: SummaryRow[]): ManualReviewRow[] {
  return summaries
    .filter((row) => {
      if (row.review_action === "manual_review") return true;
      if (MANUAL_REVIEW_STATUSES.has(row.match_status)) return true;
      if (row.price_scope.includes("partial") && row.review_action !== "accept_price") {
        return true;
      }
      return false;
    })
    .map((row) => ({
      row_index: row.source_row_index,
      id: row.id,
      name: row.name,
      change_name_to: row.change_name_to,
      primary_search_term: row.primary_search_term,
      fallback_search_term: row.fallback_search_term,
      used_search_term: row.used_search_term,
      matched_title: row.matched_title,
      candidate_region: row.candidate_region,
      candidate_subregion: row.candidate_subregion,
      match_status: row.match_status,
      review_reason: row.review_reason,
      suggested_change_name_to: row.suggested_change_name_to,
      screenshot_path: "",
      collected_at: row.collected_at,
    }));
}
