import fs from "node:fs";
import path from "node:path";
import { getFinalCourseName } from "../lib/enrichment/courseEnrichmentEdit";
import { buildCourseNameAliases } from "../lib/seo/courseNameAliases";
import { parseCsv, rowsToCsv } from "./lib/csvUtils";
import { loadCourseEnrichmentRows, normalizeCourseName } from "./lib/teescanner/courseEnrichment";
import { getProjectRoot } from "./lib/sourceRegistry";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";

const ROOT = getProjectRoot();

const PATHS = {
  master: path.join(ROOT, "data/enrichment/course_enrichment_edit.csv"),
  importGeocoded: path.join(ROOT, "data/golf_courses_import_geocoded_final.csv"),
  import: path.join(ROOT, "data/golf_courses_import.csv"),
  publicRaw: path.join(ROOT, "data/raw/golf_courses_public.csv"),
  fullSet:
    process.env.GOLF_FULL_SET_OUTPUT_PATH?.trim() ||
    path.join(ROOT, "data/enrichment/golf_courses_full_set.csv"),
  supabaseUpload:
    process.env.GOLF_SUPABASE_UPLOAD_OUTPUT_PATH?.trim() ||
    path.join(ROOT, "data/enrichment/golf_courses_supabase_upload.csv"),
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

  const fullSetRows: string[][] = [];
  const supabaseRows: string[][] = [];

  for (const master of masterRows) {
    const importRow =
      importMap?.get(master.id) ?? importByName.get(normalizeCourseName(master.name));
    // Approved prices are durable data owned by course_enrichment_edit.csv.
    // Ignored collector outputs must never affect tracked build artifacts.
    const priceMin = master.priceMin;
    const priceMax = master.priceMax;
    const priceText = getMasterCell(master.id, "price_text");
    const priceType = getMasterCell(master.id, "price_type");

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
      price_type: priceType,
      // These columns are diagnostic-only. Runtime collector output is ignored,
      // so they are intentionally normalized instead of becoming hidden inputs.
      price_source: "",
      weekday_price_min: "",
      weekday_price_max: "",
      weekend_price_min: "",
      weekend_price_max: "",
      teescanner_used_search_term: "",
      teescanner_matched_title: "",
      candidate_region: "",
      candidate_subregion: "",
      teescanner_match_status: "",
      teescanner_review_action: "",
      teescanner_review_reason: "",
      suggested_change_name_to: "",
      needs_price_review: "",
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
      fullRow.updatedAt,
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

}

main();
