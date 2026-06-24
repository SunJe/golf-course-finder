import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csvUtils";
import { readCsvWithEncodingGuess } from "./encodingUtils";
import { getProjectRoot } from "./sourceRegistry";

const ROOT = getProjectRoot();
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");

export const UPLOAD_CSV_PATH = path.join(
  ROOT,
  "data/enrichment/golf_courses_supabase_upload.csv",
);
export const FAILED_CSV_PATH = path.join(
  ROOT,
  "data/enrichment/golf_courses_supabase_upload_failed.csv",
);
export const REPORT_JSON_PATH = path.join(
  ROOT,
  "data/enrichment/golf_courses_supabase_upload_report.json",
);
export const BACKUP_DIR = path.join(ROOT, "data/enrichment/backups");
export const TABLE_NAME = "golf_courses";
export const EXPECTED_ROW_COUNT = 532;

export const UPLOAD_CSV_COLUMNS = [
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

export type UploadCsvColumn = (typeof UPLOAD_CSV_COLUMNS)[number];

const NUMBER_COLUMNS = new Set<string>([
  "price_min",
  "price_max",
  "hole_count",
  "latitude",
  "longitude",
]);

const ARRAY_COLUMNS = new Set<string>(["tags", "seo_aliases"]);

const NOT_NULL_ARRAY_COLUMNS = new Set<string>(["tags"]);

export interface NormalizeOptions {
  overwriteAll: boolean;
  schemaColumns?: Set<string>;
}

export interface NormalizeResult {
  payload: Record<string, unknown>;
  nullOverwrites: {
    price_min: boolean;
    price_max: boolean;
    price_text: boolean;
  };
  latLngNull: boolean;
  errors: string[];
}

export function loadSchemaColumns(): Set<string> {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
  }
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  const match = schema.match(
    /create table if not exists public\.golf_courses\s*\(([\s\S]*?)\);/i,
  );
  if (!match) {
    throw new Error("Could not parse golf_courses table from schema.sql");
  }
  const columns = new Set<string>();
  for (const line of match[1].split("\n")) {
    const colMatch = line.match(/^\s+([a-z_][a-z0-9_]*)\s+/i);
    if (colMatch) columns.add(colMatch[1]);
  }
  return columns;
}

export function loadUploadCsvRows(): {
  headers: string[];
  rows: Record<string, string>[];
} {
  if (!fs.existsSync(UPLOAD_CSV_PATH)) {
    throw new Error(`Upload CSV not found: ${UPLOAD_CSV_PATH}`);
  }
  const encoding = readCsvWithEncodingGuess(UPLOAD_CSV_PATH);
  const { headers, rows } = parseCsv(encoding.content);
  const normalizedHeaders = headers.map((header) => header.trim());

  const mappedRows = rows.map((cells) => {
    const record: Record<string, string> = {};
    for (let index = 0; index < normalizedHeaders.length; index += 1) {
      const header = normalizedHeaders[index];
      if (!header) continue;
      record[header] = (cells[index] ?? "").trim();
    }
    return record;
  });

  return { headers: normalizedHeaders, rows: mappedRows };
}

export function parseSeoAliases(
  value: string | null | undefined,
): string[] | null {
  if (!value || !value.trim()) return null;
  const items = value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export function parseArrayValue(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "{}") return [];

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let index = 0; index < inner.length; index += 1) {
      const char = inner[index];
      if (inQuotes) {
        if (char === '"' && inner[index + 1] === '"') {
          current += '"';
          index += 1;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
        continue;
      }
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        const value = current.trim();
        if (value) values.push(value);
        current = "";
      } else {
        current += char;
      }
    }
    const last = current.trim();
    if (last) values.push(last);
    return values;
  }

  return trimmed
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseNumber(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export function normalizeRowForSupabase(
  row: Record<string, string>,
  options: NormalizeOptions,
): NormalizeResult {
  const schema = options.schemaColumns ?? loadSchemaColumns();
  const payload: Record<string, unknown> = {};
  const errors: string[] = [];
  const nullOverwrites = {
    price_min: false,
    price_max: false,
    price_text: false,
  };
  let latLngNull = false;

  const id = (row.id ?? "").trim();
  if (!id) {
    errors.push("missing id");
    return { payload, nullOverwrites, latLngNull, errors };
  }
  payload.id = id;

  for (const column of UPLOAD_CSV_COLUMNS) {
    if (column === "id") continue;
    if (!schema.has(column)) continue;

    const raw = row[column] ?? "";
    const trimmed = raw.trim();
    const isEmpty = trimmed === "";

    if (NUMBER_COLUMNS.has(column)) {
      if (isEmpty) {
        if (options.overwriteAll) {
          payload[column] = null;
          if (column === "price_min") nullOverwrites.price_min = true;
          if (column === "price_max") nullOverwrites.price_max = true;
          if (column === "latitude" || column === "longitude") latLngNull = true;
        }
        continue;
      }
      const num = parseNumber(trimmed);
      if (num == null) {
        errors.push(`invalid number for ${column}: ${trimmed}`);
        continue;
      }
      payload[column] = num;
      continue;
    }

    if (ARRAY_COLUMNS.has(column)) {
      if (isEmpty) {
        if (options.overwriteAll) {
          payload[column] = NOT_NULL_ARRAY_COLUMNS.has(column) ? [] : null;
        }
        continue;
      }
      if (column === "seo_aliases") {
        payload[column] = parseSeoAliases(trimmed);
        continue;
      }
      payload[column] = parseArrayValue(trimmed);
      continue;
    }

    if (isEmpty) {
      if (options.overwriteAll) {
        payload[column] = null;
        if (column === "price_text") nullOverwrites.price_text = true;
      }
      continue;
    }
    payload[column] = trimmed;
  }

  return { payload, nullOverwrites, latLngNull, errors };
}

export function getExcludedCsvColumns(
  headers: string[],
  schemaColumns: Set<string>,
): string[] {
  return headers.filter(
    (header) =>
      header &&
      !schemaColumns.has(header) &&
      header !== "id",
  );
}

export function createSupabaseClientFromEnv(): {
  url: string;
  serviceRoleKey: string;
} {
  const env = loadEnvFromRoot();
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }
  return { url, serviceRoleKey };
}

function loadEnvFromRoot(): Record<string, string> {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const result: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}
