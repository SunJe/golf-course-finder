import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_ENRICHMENT_EDIT_HEADERS,
  getFinalCourseName,
  type CourseEnrichmentEditRow,
} from "../lib/enrichment/courseEnrichmentEdit";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const EDIT_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");
const SQL_SAFE_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_golf_courses_core_update.sql",
);
const SQL_PREVIEW_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_golf_courses_core_update_preview.sql",
);
const SQL_OVERWRITE_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_golf_courses_core_update_full_overwrite.sql",
);

const DB_TABLE = "public.golf_courses";
const PREVIEW_LIMIT = 20;

const REQUIRED_COLUMNS = [
  "id",
  "name",
  "change_name_to",
  "address",
  "phone",
  "homepage_url",
] as const;

interface CoreUpdateRow {
  id: string;
  finalName: string;
  address: string;
  phone: string;
  homepageUrl: string;
  usesChangeNameTo: boolean;
}

interface CoreValidationReport {
  rowCount: number;
  uniqueIds: number;
  emptyIds: number;
  duplicateIds: string[];
  missingColumns: string[];
  changeNameToApplied: number;
  addressFilled: number;
  phoneFilled: number;
  homepageFilled: number;
  emptyFinalNameRows: Array<{ id: string; name: string; change_name_to: string }>;
  errors: string[];
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlString(value: string): string {
  return `'${escapeSqlLiteral(value)}'`;
}

function loadEditRows(): { headers: string[]; rows: CourseEnrichmentEditRow[] } {
  if (!fs.existsSync(EDIT_CSV)) {
    throw new Error(`Input CSV not found: ${EDIT_CSV}`);
  }
  const { content } = readCsvWithEncodingGuess(EDIT_CSV);
  const parsed = parseCsv(content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));

  const rows: CourseEnrichmentEditRow[] = parsed.rows.map((cells) => {
    const row = {} as CourseEnrichmentEditRow;
    for (const header of COURSE_ENRICHMENT_EDIT_HEADERS) {
      const idx = headers.indexOf(header);
      row[header] = idx >= 0 ? (cells[idx] ?? "").trim() : "";
    }
    return row;
  });

  return { headers, rows };
}

function verifySchema(): void {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
  }
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  for (const column of ["name", "address", "phone", "homepage_url", "updated_at"]) {
    if (!schema.includes(column)) {
      throw new Error(`Schema verification failed: missing column "${column}"`);
    }
  }
}

function validateCoreRows(
  rows: CourseEnrichmentEditRow[],
  headers: string[],
): CoreValidationReport {
  const normalizedHeaders = new Set(headers.map((h) => h.trim().toLowerCase()));
  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !normalizedHeaders.has(column),
  );

  const idCounts = new Map<string, number>();
  let emptyIds = 0;
  let changeNameToApplied = 0;
  let addressFilled = 0;
  let phoneFilled = 0;
  let homepageFilled = 0;
  const duplicateIds: string[] = [];
  const emptyFinalNameRows: CoreValidationReport["emptyFinalNameRows"] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const id = row.id.trim();
    if (!id) {
      emptyIds += 1;
      continue;
    }

    idCounts.set(id, (idCounts.get(id) ?? 0) + 1);

    if (row.change_name_to.trim()) changeNameToApplied += 1;
    if (row.address.trim()) addressFilled += 1;
    if (row.phone.trim()) phoneFilled += 1;
    if (row.homepage_url.trim()) homepageFilled += 1;

    const finalName = getFinalCourseName(row);
    if (!finalName) {
      emptyFinalNameRows.push({
        id,
        name: row.name,
        change_name_to: row.change_name_to,
      });
    }
  }

  for (const [id, count] of idCounts.entries()) {
    if (count > 1) duplicateIds.push(id);
  }

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
  }
  if (emptyIds > 0) {
    errors.push(`Empty id rows: ${emptyIds}`);
  }
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate ids: ${duplicateIds.join(", ")}`);
  }
  if (emptyFinalNameRows.length > 0) {
    errors.push(
      `Empty final name rows: ${emptyFinalNameRows.length} (id/name/change_name_to all empty)`,
    );
  }

  return {
    rowCount: rows.length,
    uniqueIds: idCounts.size,
    emptyIds,
    duplicateIds,
    missingColumns,
    changeNameToApplied,
    addressFilled,
    phoneFilled,
    homepageFilled,
    emptyFinalNameRows,
    errors,
  };
}

function toCoreUpdateRow(row: CourseEnrichmentEditRow): CoreUpdateRow {
  return {
    id: row.id.trim(),
    finalName: getFinalCourseName(row),
    address: row.address.trim(),
    phone: row.phone.trim(),
    homepageUrl: row.homepage_url.trim(),
    usesChangeNameTo: Boolean(row.change_name_to.trim()),
  };
}

function buildValuesClause(rows: CoreUpdateRow[]): string {
  return rows
    .map(
      (row) =>
        `  (${sqlString(row.id)}, ${sqlString(row.finalName)}, ${sqlString(row.address)}, ${sqlString(row.phone)}, ${sqlString(row.homepageUrl)})`,
    )
    .join(",\n");
}

function buildUpdateSql(
  rows: CoreUpdateRow[],
  mode: "safe" | "overwrite",
  title: string,
): string {
  if (rows.length === 0) {
    return `-- ${title}\n-- No rows to update.\n`;
  }

  const generatedAt = new Date().toISOString();
  const values = buildValuesClause(rows);

  const setClause =
    mode === "safe"
      ? `  name = v.name,
  address = COALESCE(NULLIF(v.address, ''), ${DB_TABLE}.address),
  phone = COALESCE(NULLIF(v.phone, ''), ${DB_TABLE}.phone),
  homepage_url = COALESCE(NULLIF(v.homepage_url, ''), ${DB_TABLE}.homepage_url),
  updated_at = NOW()`
      : `  name = v.name,
  address = v.address,
  phone = v.phone,
  homepage_url = v.homepage_url,
  updated_at = NOW()`;

  const policyNote =
    mode === "safe"
      ? "-- Policy: name always updated; address/phone/homepage_url only when CSV value is non-empty"
      : "-- Policy: CSV values applied as-is (empty string clears address/phone/homepage_url)";

  return `-- ${title}
-- Generated: ${generatedAt}
-- Source: data/enrichment/course_enrichment_edit.csv
-- Table: ${DB_TABLE}
-- Columns: name, address, phone, homepage_url, updated_at
-- Excluded: price, difficulty, avg_score, tags, course_type, latitude, longitude
${policyNote}
-- Run manually in Supabase SQL Editor. Do not auto-execute.

UPDATE ${DB_TABLE}
SET
${setClause}
FROM (
  VALUES
${values}
) AS v(id, name, address, phone, homepage_url)
WHERE ${DB_TABLE}.id = v.id;
`;
}

function printValidationReport(report: CoreValidationReport): void {
  console.log("");
  console.log("=== course_enrichment_edit.csv validation (core update) ===");
  console.log(`Row count              : ${report.rowCount}`);
  console.log(`Unique ids             : ${report.uniqueIds}`);
  console.log(`Empty id rows          : ${report.emptyIds}`);
  console.log(`Duplicate ids          : ${report.duplicateIds.length}`);
  console.log(`Missing columns        : ${report.missingColumns.length ? report.missingColumns.join(", ") : "none"}`);
  console.log(`change_name_to applied : ${report.changeNameToApplied} rows`);
  console.log(`address filled         : ${report.addressFilled}`);
  console.log(`phone filled           : ${report.phoneFilled}`);
  console.log(`homepage_url filled    : ${report.homepageFilled}`);
  console.log(`Empty final name rows  : ${report.emptyFinalNameRows.length}`);

  if (report.emptyFinalNameRows.length > 0) {
    for (const row of report.emptyFinalNameRows.slice(0, 5)) {
      console.warn(
        `  [warn] ${row.id}: name="${row.name}" change_name_to="${row.change_name_to}"`,
      );
    }
  }
}

function main(): void {
  verifySchema();
  const { headers, rows } = loadEditRows();
  const validation = validateCoreRows(rows, headers);
  printValidationReport(validation);

  if (validation.errors.length > 0) {
    for (const error of validation.errors) {
      console.error(`[error] ${error}`);
    }
    throw new Error("Validation failed — fix course_enrichment_edit.csv");
  }

  const coreRows = rows.map(toCoreUpdateRow);
  const previewRows = coreRows.slice(0, PREVIEW_LIMIT);

  fs.writeFileSync(
    SQL_SAFE_OUT,
    buildUpdateSql(coreRows, "safe", "Safe core update SQL (full)"),
    "utf8",
  );
  fs.writeFileSync(
    SQL_PREVIEW_OUT,
    buildUpdateSql(
      previewRows,
      "safe",
      `Safe core update SQL (preview, first ${PREVIEW_LIMIT} rows)`,
    ),
    "utf8",
  );
  fs.writeFileSync(
    SQL_OVERWRITE_OUT,
    buildUpdateSql(
      coreRows,
      "overwrite",
      "Full overwrite core update SQL (CSV empty clears fields)",
    ),
    "utf8",
  );

  const addressTargets = coreRows.filter((row) => row.address.length > 0).length;
  const phoneTargets = coreRows.filter((row) => row.phone.length > 0).length;
  const homepageTargets = coreRows.filter((row) => row.homepageUrl.length > 0).length;

  console.log("");
  console.log("=== Generated SQL files ===");
  console.log(`Preview (safe)     : ${SQL_PREVIEW_OUT} (${previewRows.length} rows)`);
  console.log(`Full (safe)        : ${SQL_SAFE_OUT} (${coreRows.length} rows)`);
  console.log(`Full overwrite     : ${SQL_OVERWRITE_OUT} (${coreRows.length} rows)`);
  console.log("");
  console.log("Update targets (non-empty CSV values):");
  console.log(`  name (all rows)  : ${coreRows.length}`);
  console.log(`  change_name_to   : ${coreRows.filter((r) => r.usesChangeNameTo).length}`);
  console.log(`  address          : ${addressTargets}`);
  console.log(`  phone            : ${phoneTargets}`);
  console.log(`  homepage_url     : ${homepageTargets}`);
  console.log("");
  console.log("Supabase run order:");
  console.log("  1. supabase_golf_courses_core_update_preview.sql");
  console.log("  2. verify a few courses on site");
  console.log("  3. supabase_golf_courses_core_update.sql");
  console.log("  (optional) supabase_golf_courses_core_update_full_overwrite.sql");
}

main();
