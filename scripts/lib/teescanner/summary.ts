import type { DailyResultRow, SummaryRow } from "./batchIo";
import { inferDayTypeFromRoundDay } from "./dateSampling";

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

function latestCollectedAt(_rows: DailyResultRow[]): string {
  return "";
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

  const latest = rows[rows.length - 1];

  return {
    id: courseId,
    name: latest.name,
    matched_title: "",
    matched_region: "",
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
    price_scope_summary: priceScopeSummary(rows),
    source_name: "teescanner",
    last_collected_at: latestCollectedAt(rows),
    review_action: rollupReviewAction(rows),
    detail_url: latest.detail_url,
  };
}

export function buildAllSummaries(dailyRows: DailyResultRow[]): SummaryRow[] {
  const ids = [...new Set(dailyRows.map((row) => row.id).filter(Boolean))];
  return ids
    .map((id) => buildCourseSummary(id, dailyRows))
    .filter((row): row is SummaryRow => row != null)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
