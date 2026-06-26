import type { CourseEnrichmentEditRow } from "./courseEnrichmentEdit";

export const TEESCANNER_SUMMARY_HEADERS = [
  "id",
  "name",
  "matched_title",
  "matched_region",
  "weekday_sample_count",
  "weekend_sample_count",
  "weekday_price_min",
  "weekday_price_max",
  "weekend_price_min",
  "weekend_price_max",
  "overall_price_min",
  "overall_price_max",
  "success_day_count",
  "no_price_day_count",
  "manual_review_count",
  "accept_price_day_count",
  "price_scope_summary",
  "source_name",
  "last_collected_at",
  "review_action",
  "detail_url",
] as const;

export type TeescannerSummaryRow = Record<
  (typeof TEESCANNER_SUMMARY_HEADERS)[number],
  string
>;

export const TEESCANNER_META_COLUMNS = [
  "teescanner_matched_title",
  "teescanner_matched_region",
  "teescanner_weekday_price_min",
  "teescanner_weekday_price_max",
  "teescanner_weekend_price_min",
  "teescanner_weekend_price_max",
  "teescanner_overall_price_min",
  "teescanner_overall_price_max",
  "teescanner_success_day_count",
  "teescanner_no_price_day_count",
  "teescanner_manual_review_count",
  "teescanner_accept_price_day_count",
  "teescanner_price_scope_summary",
  "teescanner_review_action",
  "teescanner_detail_url",
  "teescanner_last_collected_at",
  "teescanner_source_name",
] as const;

export type TeescannerMetaColumn = (typeof TEESCANNER_META_COLUMNS)[number];

export type MergedEnrichmentRow = CourseEnrichmentEditRow &
  Record<TeescannerMetaColumn, string>;

export const PRICE_TYPE_RESERVATION = "reservation_reference";

export const NOTE_ACCEPT =
  "네이버 예약/홈페이지 참고 요금으로 보강함. 날짜/시간/예약 조건에 따라 요금이 달라질 수 있음.";

export const NOTE_REVIEW =
  "네이버 예약/홈페이지 참고 요금으로 보강함. 날짜/시간/예약 조건에 따라 요금이 달라질 수 있음. manual_review 또는 partial_day_slots인 경우 검토 필요.";

export interface TeescannerPriceRange {
  min: number | null;
  max: number | null;
  weekdayMin: number | null;
  weekdayMax: number | null;
  weekendMin: number | null;
  weekendMax: number | null;
}

export interface MergePriceDecision {
  hasValidPrice: boolean;
  priceMin: string;
  priceMax: string;
  priceText: string;
  priceType: string;
  needsCheck: string;
  noteAddition: string;
  priceUpdated: boolean;
  priceOverwritten: boolean;
  priceKeptExisting: boolean;
  isManualReview: boolean;
  isPartialDaySlots: boolean;
  isAcceptPrice: boolean;
  isNoPrice: boolean;
  needsCheckSet: boolean;
}

export interface MergeReportCounters {
  totalCourseRows: number;
  totalTeescannerRows: number;
  matchedById: number;
  priceUpdatedCount: number;
  priceOverwrittenByTeescannerCount: number;
  priceKeptExistingCount: number;
  noPriceFromTeescannerCount: number;
  manualReviewCount: number;
  partialDaySlotsCount: number;
  acceptPriceCount: number;
  needsCheckSetCount: number;
  missingInCourseCsv: string[];
  missingInTeescannerCsv: string[];
}

function parsePriceInt(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatRange(min: number | null, max: number | null): string {
  if (min != null && max != null) {
    if (min === max) return formatWon(min);
    return `${formatWon(min)}~${formatWon(max)}`;
  }
  if (min != null) return `${formatWon(min)}~`;
  if (max != null) return `~${formatWon(max)}`;
  return "";
}

export function summaryToMeta(summary: TeescannerSummaryRow): Record<TeescannerMetaColumn, string> {
  return {
    teescanner_matched_title: summary.matched_title,
    teescanner_matched_region: summary.matched_region,
    teescanner_weekday_price_min: summary.weekday_price_min,
    teescanner_weekday_price_max: summary.weekday_price_max,
    teescanner_weekend_price_min: summary.weekend_price_min,
    teescanner_weekend_price_max: summary.weekend_price_max,
    teescanner_overall_price_min: summary.overall_price_min,
    teescanner_overall_price_max: summary.overall_price_max,
    teescanner_success_day_count: summary.success_day_count,
    teescanner_no_price_day_count: summary.no_price_day_count,
    teescanner_manual_review_count: summary.manual_review_count,
    teescanner_accept_price_day_count: summary.accept_price_day_count,
    teescanner_price_scope_summary: summary.price_scope_summary,
    teescanner_review_action: summary.review_action,
    teescanner_detail_url: summary.detail_url,
    teescanner_last_collected_at: summary.last_collected_at,
    teescanner_source_name: summary.source_name || "teescanner",
  };
}

export function computeTeescannerPriceRange(summary: TeescannerSummaryRow): TeescannerPriceRange {
  const weekdayMin = parsePriceInt(summary.weekday_price_min);
  const weekdayMax = parsePriceInt(summary.weekday_price_max);
  const weekendMin = parsePriceInt(summary.weekend_price_min);
  const weekendMax = parsePriceInt(summary.weekend_price_max);
  const overallMin = parsePriceInt(summary.overall_price_min);
  const overallMax = parsePriceInt(summary.overall_price_max);

  const mins = [weekdayMin, weekendMin, overallMin].filter(
    (value): value is number => value != null,
  );
  const maxs = [weekdayMax, weekendMax, overallMax].filter(
    (value): value is number => value != null,
  );

  return {
    min: mins.length > 0 ? Math.min(...mins) : null,
    max: maxs.length > 0 ? Math.max(...maxs) : null,
    weekdayMin,
    weekdayMax,
    weekendMin,
    weekendMax,
  };
}

export function hasValidTeescannerPrice(summary: TeescannerSummaryRow): boolean {
  if (summary.review_action === "ignore_filter_only") return false;
  const range = computeTeescannerPriceRange(summary);
  return range.min != null || range.max != null;
}

export function buildTeescannerPriceText(range: TeescannerPriceRange): string {
  const hasWeekday = range.weekdayMin != null || range.weekdayMax != null;
  const hasWeekend = range.weekendMin != null || range.weekendMax != null;
  const weekdayText = hasWeekday
    ? `평일 ${formatRange(range.weekdayMin, range.weekdayMax)}`
    : "";
  const weekendText = hasWeekend
    ? `주말 ${formatRange(range.weekendMin, range.weekendMax)}`
    : "";

  if (hasWeekday && hasWeekend) {
    return `참고 요금 ${weekdayText} / ${weekendText}`;
  }
  if (hasWeekday) {
    return `참고 요금 ${weekdayText}`;
  }
  if (hasWeekend) {
    return `참고 요금 ${weekendText}`;
  }

  const overallText = formatRange(range.min, range.max);
  if (!overallText) return "";
  if (range.min != null && range.max != null && range.min !== range.max) {
    return `참고 요금 ${overallText}`;
  }
  if (range.min != null && range.max == null) {
    return `참고 요금 ${formatWon(range.min)}~`;
  }
  if (range.max != null && range.min == null) {
    return `참고 요금 ~${formatWon(range.max)}`;
  }
  return `참고 요금 ${overallText}`;
}

export function isPartialDaySlots(summary: TeescannerSummaryRow): boolean {
  return summary.price_scope_summary.toLowerCase().includes("partial_day_slots");
}

export function needsTeescannerReview(summary: TeescannerSummaryRow): boolean {
  return summary.review_action === "manual_review" || isPartialDaySlots(summary);
}

export function appendNote(existing: string, addition: string): string {
  const base = existing.trim();
  const snippet = addition.trim();
  if (!snippet) return base;
  if (!base) return snippet;
  if (base.includes(snippet)) return base;
  const normalizedBase = base.endsWith(".") ? base : `${base}.`;
  return `${normalizedBase} ${snippet}`;
}

function hadExistingPrice(row: CourseEnrichmentEditRow): boolean {
  return Boolean(row.price_min.trim() || row.price_max.trim());
}

export function decideMergePrice(
  courseRow: CourseEnrichmentEditRow,
  summary: TeescannerSummaryRow,
): MergePriceDecision {
  const isManualReview = summary.review_action === "manual_review";
  const isPartial = isPartialDaySlots(summary);
  const isAcceptPrice = summary.review_action === "accept_price";
  const valid = hasValidTeescannerPrice(summary);
  const existingHadPrice = hadExistingPrice(courseRow);

  if (!valid) {
    return {
      hasValidPrice: false,
      priceMin: courseRow.price_min,
      priceMax: courseRow.price_max,
      priceText: courseRow.price_text,
      priceType: courseRow.price_type,
      needsCheck: courseRow.needs_check,
      noteAddition: "",
      priceUpdated: false,
      priceOverwritten: false,
      priceKeptExisting: existingHadPrice,
      isManualReview,
      isPartialDaySlots: isPartial,
      isAcceptPrice,
      isNoPrice: true,
      needsCheckSet: false,
    };
  }

  const range = computeTeescannerPriceRange(summary);
  const priceMin = range.min != null ? String(range.min) : "";
  const priceMax = range.max != null ? String(range.max) : range.min != null ? String(range.min) : "";
  const priceText = buildTeescannerPriceText(range);
  const review = needsTeescannerReview(summary);
  const noteAddition = review ? NOTE_REVIEW : NOTE_ACCEPT;
  const needsCheck = review ? "y" : courseRow.needs_check;

  return {
    hasValidPrice: true,
    priceMin,
    priceMax,
    priceText,
    priceType: PRICE_TYPE_RESERVATION,
    needsCheck,
    noteAddition,
    priceUpdated: true,
    priceOverwritten: existingHadPrice,
    priceKeptExisting: false,
    isManualReview,
    isPartialDaySlots: isPartial,
    isAcceptPrice,
    isNoPrice: false,
    needsCheckSet: review,
  };
}

export function mergeCourseWithTeescanner(
  courseRow: CourseEnrichmentEditRow,
  summary: TeescannerSummaryRow | undefined,
): { row: MergedEnrichmentRow; decision?: MergePriceDecision } {
  const merged = {
    ...courseRow,
    ...Object.fromEntries(TEESCANNER_META_COLUMNS.map((column) => [column, ""])),
  } as MergedEnrichmentRow;

  if (!summary) {
    return { row: merged };
  }

  Object.assign(merged, summaryToMeta(summary));
  const decision = decideMergePrice(courseRow, summary);
  if (decision.hasValidPrice) {
    merged.price_min = decision.priceMin;
    merged.price_max = decision.priceMax;
    merged.price_text = decision.priceText;
    merged.price_type = decision.priceType;
    merged.needs_check = decision.needsCheck;
    merged.note = appendNote(courseRow.note, decision.noteAddition);
  }

  return { row: merged, decision };
}

export function loadSummaryById(
  summaries: TeescannerSummaryRow[],
): Map<string, TeescannerSummaryRow> {
  return new Map(summaries.map((summary) => [summary.id, summary]));
}

export function parseSummaryRows(
  headers: string[],
  rows: string[][],
): TeescannerSummaryRow[] {
  return rows.map((cells) => {
    const row = {} as TeescannerSummaryRow;
    for (const header of TEESCANNER_SUMMARY_HEADERS) {
      const index = headers.indexOf(header);
      row[header] = index >= 0 ? (cells[index] ?? "").trim() : "";
    }
    return row;
  });
}

export function mergedCsvHeaders(
  courseHeaders: string[],
): string[] {
  const headerSet = new Set(courseHeaders);
  const extra = TEESCANNER_META_COLUMNS.filter((column) => !headerSet.has(column));
  return [...courseHeaders, ...extra];
}

export function mergedRowToCells(
  headers: string[],
  row: MergedEnrichmentRow,
): string[] {
  return headers.map((header) => {
    const value = row[header as keyof MergedEnrichmentRow];
    return value == null ? "" : String(value);
  });
}

export function createEmptyReportCounters(
  courseCount: number,
  teescannerCount: number,
): MergeReportCounters {
  return {
    totalCourseRows: courseCount,
    totalTeescannerRows: teescannerCount,
    matchedById: 0,
    priceUpdatedCount: 0,
    priceOverwrittenByTeescannerCount: 0,
    priceKeptExistingCount: 0,
    noPriceFromTeescannerCount: 0,
    manualReviewCount: 0,
    partialDaySlotsCount: 0,
    acceptPriceCount: 0,
    needsCheckSetCount: 0,
    missingInCourseCsv: [],
    missingInTeescannerCsv: [],
  };
}

export function updateReportCounters(
  counters: MergeReportCounters,
  _courseRow: CourseEnrichmentEditRow,
  summary: TeescannerSummaryRow | undefined,
  decision?: MergePriceDecision,
): void {
  if (!summary) return;
  counters.matchedById += 1;

  if (!decision) return;

  if (decision.isManualReview && decision.hasValidPrice) {
    counters.manualReviewCount += 1;
  }
  if (decision.isPartialDaySlots && decision.hasValidPrice) {
    counters.partialDaySlotsCount += 1;
  }
  if (decision.isAcceptPrice && decision.hasValidPrice) {
    counters.acceptPriceCount += 1;
  }
  if (decision.needsCheckSet) {
    counters.needsCheckSetCount += 1;
  }

  if (decision.hasValidPrice) {
    counters.priceUpdatedCount += 1;
    if (decision.priceOverwritten) {
      counters.priceOverwrittenByTeescannerCount += 1;
    }
  } else if (decision.isNoPrice) {
    counters.noPriceFromTeescannerCount += 1;
    if (decision.priceKeptExisting) {
      counters.priceKeptExistingCount += 1;
    }
  }
}
