import fs from "node:fs";
import path from "node:path";
import { getFinalCourseName } from "../lib/enrichment/courseEnrichmentEdit";
import { buildCourseNameAliases } from "../lib/seo/courseNameAliases";
import {
  hasValidTeescannerPrice,
  PRICE_TYPE_RESERVATION,
} from "../lib/enrichment/teescannerPriceMerge";
import { parseCsv, rowsToCsv } from "./lib/csvUtils";
import { loadCourseEnrichmentRows, normalizeCourseName } from "./lib/teescanner/courseEnrichment";
import { readSummaryRows, writeManualReviewCsv, DEFAULT_MANUAL_REVIEW_CSV } from "./lib/teescanner/batchIo";
import { buildManualReviewRows } from "./lib/teescanner/summary";
import { getProjectRoot } from "./lib/sourceRegistry";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";

const ROOT = getProjectRoot();

const PATHS = {
  master: path.join(ROOT, "data/enrichment/course_enrichment_edit.csv"),
  importGeocoded: path.join(ROOT, "data/golf_courses_import_geocoded_final.csv"),
  import: path.join(ROOT, "data/golf_courses_import.csv"),
  publicRaw: path.join(ROOT, "data/raw/golf_courses_public.csv"),
  teescannerSummary: path.join(
    ROOT,
    "data/enrichment/teescanner_price_course_summary.csv",
  ),
  fullSet: path.join(ROOT, "data/enrichment/golf_courses_full_set.csv"),
  supabaseUpload: path.join(ROOT, "data/enrichment/golf_courses_supabase_upload.csv"),
};

const FULL_SET_HEADERS = [
  "id",
  "name",
  "change_name_to",
  "region",
  "city",
  "address",
  "latitude",
  "longitude",
  "courseType",
  "holes",
  "hole_count",
  "is_public",
  "membership_type",
  "phone",
  "website",
  "difficulty",
  "price_min",
  "price_max",
  "price_text",
  "price_type",
  "price_source",
  "weekday_price_min",
  "weekday_price_max",
  "weekend_price_min",
  "weekend_price_max",
  "teescanner_used_search_term",
  "teescanner_matched_title",
  "candidate_region",
  "candidate_subregion",
  "teescanner_match_status",
  "teescanner_review_action",
  "teescanner_review_reason",
  "suggested_change_name_to",
  "needs_price_review",
  "seo_aliases",
  "search_keywords",
  "tags",
  "source",
  "updatedAt",
] as const;

const SUPABASE_HEADERS = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "latitude",
  "longitude",
  "course_type",
  "tags",
  "source",
  "updated_at",
  "phone",
  "homepage_url",
  "hole_count",
  "difficulty",
  "price_min",
  "price_max",
  "price_text",
  "price_type",
  "change_name_to",
  "seo_aliases",
  "search_keywords",
] as const;

type CsvMap = Map<string, Record<string, string>>;

function warnMissing(filePath: string): void {
  console.warn(`[warn] missing optional input: ${filePath}`);
}

function loadCsvById(filePath: string): CsvMap | null {
  if (!fs.existsSync(filePath)) {
    warnMissing(filePath);
    return null;
  }
  const { headers, rows } = parseCsv(readCsvWithEncodingGuess(filePath).content);
  const map: CsvMap = new Map();
  const idIndex = headers.indexOf("id");
  for (const row of rows) {
    const id = idIndex >= 0 ? (row[idIndex] ?? "").trim() : "";
    if (!id) continue;
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (row[index] ?? "").trim();
    });
    map.set(id, record);
  }
  return map;
}

function loadCsvByNormalizedName(filePath: string): Map<string, Record<string, string>> {
  const byId = loadCsvById(filePath);
  const map = new Map<string, Record<string, string>>();
  if (!byId) return map;
  for (const record of byId.values()) {
    const key = normalizeCourseName(record.name ?? "");
    if (key) map.set(key, record);
  }
  return map;
}

function getField(
  record: Record<string, string> | undefined,
  keys: string[],
): string {
  if (!record) return "";
  for (const key of keys) {
    const value = record[key];
    if (value?.trim()) return value.trim();
  }
  return "";
}

function formatPriceText(options: {
  weekdayMin: string;
  weekdayMax: string;
  weekendMin: string;
  weekendMax: string;
  overallMin: string;
  overallMax: string;
}): string {
  const { weekdayMin, weekdayMax, weekendMin, weekendMax, overallMin, overallMax } =
    options;
  if (weekdayMin && weekendMin) {
    const weekdayRange =
      weekdayMax && weekdayMax !== weekdayMin
        ? `${weekdayMin}~${weekdayMax}`
        : weekdayMin;
    const weekendRange =
      weekendMax && weekendMax !== weekendMin
        ? `${weekendMin}~${weekendMax}`
        : weekendMin;
    return `티스캐너 예약가 기준 평일 ${weekdayRange}원 / 주말 ${weekendRange}원`;
  }
  if (overallMin) {
    const range =
      overallMax && overallMax !== overallMin
        ? `${overallMin}~${overallMax}`
        : overallMin;
    return `티스캐너 예약가 기준 ${range}원`;
  }
  return "";
}

function isManualReviewSummary(summary: Record<string, string>): boolean {
  const status = summary.match_status?.trim() ?? "";
  const action = summary.review_action?.trim() ?? "";
  if (action === "manual_review") return true;
  return [
    "possible_renamed_course",
    "candidate_mismatch",
    "ambiguous",
    "no_result",
    "search_failed",
    "blocked",
    "manual_review",
  ].includes(status);
}

function formatPostgresTextArray(values: string[]): string {
  if (values.length === 0) return "{}";
  return `{${values
    .map((value) => `"${value.replace(/"/g, '""')}"`)
    .join(",")}}`;
}

function buildRows(): {
  fullSetRows: string[][];
  supabaseRows: string[][];
} {
  const { headers, rows: masterRows } = loadCourseEnrichmentRows(PATHS.master);
  const masterById = new Map(masterRows.map((row) => [row.id, row]));
  const getMasterCell = (id: string, key: string): string => {
    const row = masterById.get(id);
    if (!row) return "";
    const index = headers.indexOf(key);
    return index >= 0 ? (row.raw[index] ?? "").trim() : "";
  };
  const importMap = loadCsvById(PATHS.importGeocoded) ?? loadCsvById(PATHS.import);
  const importByName = loadCsvByNormalizedName(PATHS.importGeocoded);

  let teescannerMap = new Map<string, Record<string, string>>();
  if (fs.existsSync(PATHS.teescannerSummary)) {
    for (const row of readSummaryRows(PATHS.teescannerSummary)) {
      teescannerMap.set(row.id, row as unknown as Record<string, string>);
    }
  } else {
    warnMissing(PATHS.teescannerSummary);
  }

  const fullSetRows: string[][] = [];
  const supabaseRows: string[][] = [];

  for (const master of masterRows) {
    const importRow =
      importMap?.get(master.id) ?? importByName.get(normalizeCourseName(master.name));
    const summary = teescannerMap.get(master.id);

    const existingPriceMin = master.priceMin;
    const existingPriceMax = master.priceMax;
    const teescannerValid = summary ? hasValidTeescannerPrice(summary as never) : false;
    const manualReview = summary ? isManualReviewSummary(summary) : false;

    const priceMin = teescannerValid
      ? summary?.overall_price_min || summary?.price_min || existingPriceMin
      : existingPriceMin;
    const priceMax = teescannerValid
      ? summary?.overall_price_max || summary?.price_max || existingPriceMax
      : existingPriceMax;

    const priceText =
      formatPriceText({
        weekdayMin: summary?.weekday_price_min ?? "",
        weekdayMax: summary?.weekday_price_max ?? "",
        weekendMin: summary?.weekend_price_min ?? "",
        weekendMax: summary?.weekend_price_max ?? "",
        overallMin: priceMin,
        overallMax: priceMax,
      }) || getField(importRow, ["price_text"]) || "";

    const aliases = buildCourseNameAliases({
      name: master.name,
      changeNameTo: master.changeNameTo,
    });

    const fullRow: Record<(typeof FULL_SET_HEADERS)[number], string> = {
      id: master.id,
      name: master.name,
      change_name_to: master.changeNameTo,
      region: getField(importRow, ["region"]),
      city: getField(importRow, ["city"]),
      address: master.address || getField(importRow, ["address"]),
      latitude: getField(importRow, ["latitude"]),
      longitude: getField(importRow, ["longitude"]),
      courseType: getField(importRow, ["course_type", "courseType"]),
      holes: getField(importRow, ["holes", "hole_count", "total_holes"]),
      hole_count: getField(importRow, ["hole_count", "holes", "total_holes"]),
      is_public: getField(importRow, ["is_public", "public_private"]),
      membership_type: getField(importRow, [
        "membership_type",
        "course_type",
        "public_private",
      ]),
      phone: getMasterCell(master.id, "phone") || getField(importRow, ["phone"]),
      website:
        getMasterCell(master.id, "homepage_url") ||
        getField(importRow, ["homepage_url", "website"]),
      difficulty:
        getMasterCell(master.id, "difficulty") || getField(importRow, ["difficulty"]),
      price_min: priceMin,
      price_max: priceMax,
      price_text: priceText,
      price_type: teescannerValid
        ? PRICE_TYPE_RESERVATION
        : getField(importRow, ["price_type"]),
      price_source: teescannerValid ? "teescanner" : "",
      weekday_price_min: summary?.weekday_price_min ?? "",
      weekday_price_max: summary?.weekday_price_max ?? "",
      weekend_price_min: summary?.weekend_price_min ?? "",
      weekend_price_max: summary?.weekend_price_max ?? "",
      teescanner_used_search_term: summary?.used_search_term ?? "",
      teescanner_matched_title: summary?.matched_title ?? "",
      candidate_region: summary?.candidate_region ?? "",
      candidate_subregion: summary?.candidate_subregion ?? "",
      teescanner_match_status: summary?.match_status ?? "",
      teescanner_review_action: summary?.review_action ?? "",
      teescanner_review_reason: summary?.review_reason ?? "",
      suggested_change_name_to: summary?.suggested_change_name_to ?? "",
      needs_price_review: manualReview ? "true" : "false",
      seo_aliases: aliases.join("|"),
      search_keywords: aliases.join(" "),
      tags: getField(importRow, ["tags"]),
      source: getField(importRow, ["source"]) || "course_enrichment_edit",
      updatedAt: getField(importRow, ["updated_at", "updatedAt"]),
    };

    fullSetRows.push(FULL_SET_HEADERS.map((header) => fullRow[header] ?? ""));

    const uploadName = getFinalCourseName({
      name: master.name,
      change_name_to: master.changeNameTo,
    });

    supabaseRows.push([
      fullRow.id,
      uploadName,
      fullRow.region,
      fullRow.city,
      fullRow.address,
      fullRow.latitude,
      fullRow.longitude,
      fullRow.courseType,
      fullRow.tags || "{}",
      fullRow.source,
      fullRow.updatedAt || new Date().toISOString(),
      fullRow.phone,
      fullRow.website,
      fullRow.hole_count || fullRow.holes,
      fullRow.difficulty,
      priceMin,
      priceMax,
      fullRow.price_text,
      fullRow.price_type,
      master.changeNameTo ?? "",
      aliases.join("|"),
      aliases.join(" "),
    ]);
  }

  return { fullSetRows, supabaseRows };
}

function main(): void {
  const { fullSetRows, supabaseRows } = buildRows();
  fs.mkdirSync(path.dirname(PATHS.fullSet), { recursive: true });
  fs.writeFileSync(
    PATHS.fullSet,
    `\uFEFF${rowsToCsv([...FULL_SET_HEADERS], fullSetRows)}`,
    "utf8",
  );
  fs.writeFileSync(
    PATHS.supabaseUpload,
    `\uFEFF${rowsToCsv([...SUPABASE_HEADERS], supabaseRows)}`,
    "utf8",
  );
  console.log(`Wrote ${fullSetRows.length} row(s) to ${PATHS.fullSet}`);
  console.log(`Wrote ${supabaseRows.length} row(s) to ${PATHS.supabaseUpload}`);

  if (fs.existsSync(PATHS.teescannerSummary)) {
    const summaries = readSummaryRows(PATHS.teescannerSummary);
    const manualReviewRows = buildManualReviewRows(summaries);
    writeManualReviewCsv(DEFAULT_MANUAL_REVIEW_CSV, manualReviewRows);
    console.log(
      `Wrote ${manualReviewRows.length} manual review row(s) to ${DEFAULT_MANUAL_REVIEW_CSV}`,
    );
  }
}

main();
