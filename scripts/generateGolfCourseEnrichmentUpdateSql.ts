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
const SQL_PREVIEW_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_golf_courses_enrichment_update_preview.sql",
);
const SQL_SAFE_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_golf_courses_enrichment_update.sql",
);
const SQL_OVERWRITE_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_golf_courses_enrichment_update_full_overwrite.sql",
);
const REPORT_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_golf_courses_enrichment_update_report.md",
);

const DB_TABLE = "public.golf_courses";
const PREVIEW_LIMIT = 20;

/** Explicit allowlist — avg_score/difficulty never included */
const SQL_MAPPINGS = [
  { db: "name", kind: "text" as const },
  { db: "address", kind: "text" as const },
  { db: "phone", kind: "text" as const },
  { db: "homepage_url", kind: "text" as const },
  { db: "price_text", kind: "text" as const },
  { db: "price_min", kind: "int" as const },
  { db: "price_max", kind: "int" as const },
  { db: "price_type", kind: "text" as const },
] as const;

const EXCLUDED_FROM_SQL = [
  "avg_score",
  "difficulty",
  "scraped_avg_score",
  "scraped_difficulty",
  "scraped_difficulty_text",
] as const;

const REQUIRED_CSV_COLUMNS = [
  "id",
  "name",
  "change_name_to",
  "address",
  "phone",
  "homepage_url",
] as const;

interface EnrichmentUpdateRow {
  id: string;
  finalName: string;
  usesChangeNameTo: boolean;
  address: string;
  phone: string;
  homepageUrl: string;
  priceText: string;
  priceMin: number | null;
  priceMax: number | null;
  priceType: string;
}

interface EnrichmentValidationReport {
  rowCount: number;
  uniqueIds: number;
  emptyIds: number;
  duplicateIds: string[];
  missingColumns: string[];
  changeNameToApplied: number;
  addressFilled: number;
  phoneFilled: number;
  homepageFilled: number;
  priceTextFilled: number;
  priceMinFilled: number;
  priceMaxFilled: number;
  emptyFinalNameRows: Array<{ id: string; name: string; change_name_to: string }>;
  sqlColumns: string[];
  errors: string[];
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlString(value: string): string {
  return `'${escapeSqlLiteral(value)}'`;
}

function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number.parseInt(trimmed.replace(/,/g, ""), 10);
  return Number.isFinite(num) ? num : null;
}

function sqlInt(value: number | null): string {
  return value === null ? "NULL" : String(value);
}

function loadSchemaColumns(): Set<string> {
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

function verifySchema(): void {
  const schemaColumns = loadSchemaColumns();
  const missing = SQL_MAPPINGS.map((m) => m.db).filter((col) => !schemaColumns.has(col));
  if (missing.length > 0) {
    throw new Error(`Schema missing required columns: ${missing.join(", ")}`);
  }
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

function validateRows(
  rows: CourseEnrichmentEditRow[],
  headers: string[],
): EnrichmentValidationReport {
  const normalizedHeaders = new Set(headers.map((h) => h.trim().toLowerCase()));
  const missingColumns = REQUIRED_CSV_COLUMNS.filter(
    (column) => !normalizedHeaders.has(column),
  );

  const idCounts = new Map<string, number>();
  let emptyIds = 0;
  let changeNameToApplied = 0;
  let addressFilled = 0;
  let phoneFilled = 0;
  let homepageFilled = 0;
  let priceTextFilled = 0;
  let priceMinFilled = 0;
  let priceMaxFilled = 0;
  const emptyFinalNameRows: EnrichmentValidationReport["emptyFinalNameRows"] = [];
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
    if (row.price_text.trim()) priceTextFilled += 1;
    if (row.price_min.trim()) priceMinFilled += 1;
    if (row.price_max.trim()) priceMaxFilled += 1;

    const finalName = getFinalCourseName(row);
    if (!finalName) {
      emptyFinalNameRows.push({
        id,
        name: row.name,
        change_name_to: row.change_name_to,
      });
    }
  }

  const duplicateIds = [...idCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
  }
  if (emptyIds > 0) errors.push(`Empty id rows: ${emptyIds}`);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate ids: ${duplicateIds.join(", ")}`);
  }
  if (emptyFinalNameRows.length > 0) {
    errors.push(`Empty final name rows: ${emptyFinalNameRows.length}`);
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
    priceTextFilled,
    priceMinFilled,
    priceMaxFilled,
    emptyFinalNameRows,
    sqlColumns: SQL_MAPPINGS.map((m) => m.db),
    errors,
  };
}

function toUpdateRow(row: CourseEnrichmentEditRow): EnrichmentUpdateRow {
  return {
    id: row.id.trim(),
    finalName: getFinalCourseName(row),
    usesChangeNameTo: Boolean(row.change_name_to.trim()),
    address: row.address.trim(),
    phone: row.phone.trim(),
    homepageUrl: row.homepage_url.trim(),
    priceText: row.price_text.trim(),
    priceMin: parseOptionalInt(row.price_min),
    priceMax: parseOptionalInt(row.price_max),
    priceType: row.price_type.trim(),
  };
}

function valueForColumn(row: EnrichmentUpdateRow, dbColumn: string): string {
  switch (dbColumn) {
    case "name":
      return sqlString(row.finalName);
    case "address":
      return sqlString(row.address);
    case "phone":
      return sqlString(row.phone);
    case "homepage_url":
      return sqlString(row.homepageUrl);
    case "price_text":
      return sqlString(row.priceText);
    case "price_min":
      return sqlInt(row.priceMin);
    case "price_max":
      return sqlInt(row.priceMax);
    case "price_type":
      return sqlString(row.priceType);
    default:
      throw new Error(`Unsupported column: ${dbColumn}`);
  }
}

function buildValuesClause(rows: EnrichmentUpdateRow[]): string {
  return rows
    .map((row) => {
      const parts = [
        sqlString(row.id),
        ...SQL_MAPPINGS.map((m) => valueForColumn(row, m.db)),
      ];
      return `  (${parts.join(", ")})`;
    })
    .join(",\n");
}

function buildSetClause(mode: "safe" | "overwrite"): string {
  const lines: string[] = [];

  for (const mapping of SQL_MAPPINGS) {
    const col = mapping.db;
    const vCol = `v.${col}`;

    if (col === "name") {
      lines.push(`  ${col} = ${vCol}`);
      continue;
    }

    if (mode === "overwrite") {
      lines.push(`  ${col} = ${vCol}`);
      continue;
    }

    if (mapping.kind === "text") {
      lines.push(`  ${col} = COALESCE(NULLIF(${vCol}, ''), g.${col})`);
    } else {
      lines.push(`  ${col} = COALESCE(${vCol}, g.${col})`);
    }
  }

  if (loadSchemaColumns().has("updated_at")) {
    lines.push("  updated_at = NOW()");
  }

  return lines.join(",\n");
}

function buildUpdateSql(
  rows: EnrichmentUpdateRow[],
  mode: "safe" | "overwrite",
  title: string,
): string {
  if (rows.length === 0) {
    return `-- ${title}\n-- No rows to update.\n`;
  }

  const generatedAt = new Date().toISOString();
  const valueColumns = ["id", ...SQL_MAPPINGS.map((m) => m.db)];
  const policyNote =
    mode === "safe"
      ? "-- Policy: name always updated; other fields only when CSV value is non-empty (NULL for empty numerics)"
      : "-- Policy: CSV values applied as-is (empty string / NULL clears fields)";

  return `-- ${title}
-- Generated: ${generatedAt}
-- Source: data/enrichment/course_enrichment_edit.csv
-- Table: ${DB_TABLE}
-- Columns: ${valueColumns.join(", ")}
-- Excluded (never updated): ${EXCLUDED_FROM_SQL.join(", ")}
${policyNote}
-- Run manually in Supabase SQL Editor. Do not auto-execute.

UPDATE ${DB_TABLE} AS g
SET
${buildSetClause(mode)}
FROM (
  VALUES
${buildValuesClause(rows)}
) AS v(${valueColumns.join(", ")})
WHERE g.id = v.id;
`;
}

function buildReportMarkdown(
  report: EnrichmentValidationReport,
  previewCount: number,
  fullCount: number,
): string {
  return `# Supabase golf_courses enrichment update report

Generated: ${new Date().toISOString()}

## CSV validation

- Row count: **${report.rowCount}**
- Unique ids: **${report.uniqueIds}**
- Empty id rows: **${report.emptyIds}**
- Duplicate ids: **${report.duplicateIds.length}**
- Missing columns: **${report.missingColumns.length ? report.missingColumns.join(", ") : "none"}**
- change_name_to applied: **${report.changeNameToApplied}**
- address filled: **${report.addressFilled}**
- phone filled: **${report.phoneFilled}**
- homepage_url filled: **${report.homepageFilled}**
- price_text filled: **${report.priceTextFilled}**
- price_min filled: **${report.priceMinFilled}**
- price_max filled: **${report.priceMaxFilled}**
- Empty final name rows: **${report.emptyFinalNameRows.length}**

## SQL columns

- Included: **${report.sqlColumns.join(", ")}**
- Excluded by policy: **${EXCLUDED_FROM_SQL.join(", ")}**

## Generated files

- Preview (${previewCount} rows): \`data/enrichment/supabase_golf_courses_enrichment_update_preview.sql\`
- Full safe (${fullCount} rows): \`data/enrichment/supabase_golf_courses_enrichment_update.sql\`
- Full overwrite (${fullCount} rows): \`data/enrichment/supabase_golf_courses_enrichment_update_full_overwrite.sql\`

## Supabase run order

1. Run preview SQL and verify a few courses on the site
2. Run full safe SQL
3. Use full overwrite SQL only when you intentionally want empty CSV cells to clear DB values
`;
}

function printValidationReport(report: EnrichmentValidationReport): void {
  console.log("");
  console.log("=== course_enrichment_edit.csv validation (enrichment update) ===");
  console.log(`Row count              : ${report.rowCount}`);
  console.log(`Unique ids             : ${report.uniqueIds}`);
  console.log(`Empty id rows          : ${report.emptyIds}`);
  console.log(`Duplicate ids          : ${report.duplicateIds.length}`);
  console.log(`Missing columns        : ${report.missingColumns.length ? report.missingColumns.join(", ") : "none"}`);
  console.log(`change_name_to applied : ${report.changeNameToApplied}`);
  console.log(`address filled         : ${report.addressFilled}`);
  console.log(`phone filled           : ${report.phoneFilled}`);
  console.log(`homepage_url filled    : ${report.homepageFilled}`);
  console.log(`price_text filled      : ${report.priceTextFilled}`);
  console.log(`price_min filled       : ${report.priceMinFilled}`);
  console.log(`price_max filled       : ${report.priceMaxFilled}`);
  console.log(`Empty final name rows  : ${report.emptyFinalNameRows.length}`);
  console.log(`SQL columns            : ${report.sqlColumns.join(", ")}`);
  console.log(`Excluded from SQL      : ${EXCLUDED_FROM_SQL.join(", ")}`);
}

function main(): void {
  verifySchema();
  const { headers, rows } = loadEditRows();
  const report = validateRows(rows, headers);
  printValidationReport(report);

  if (report.errors.length > 0) {
    for (const error of report.errors) {
      console.error(`[error] ${error}`);
    }
    throw new Error("Validation failed — fix course_enrichment_edit.csv");
  }

  const updateRows = rows.map(toUpdateRow).filter((row) => row.id);
  const previewRows = updateRows.slice(0, PREVIEW_LIMIT);

  fs.writeFileSync(
    SQL_SAFE_OUT,
    buildUpdateSql(updateRows, "safe", "Safe enrichment update SQL (full)"),
    "utf8",
  );
  fs.writeFileSync(
    SQL_PREVIEW_OUT,
    buildUpdateSql(
      previewRows,
      "safe",
      `Safe enrichment update SQL (preview, first ${PREVIEW_LIMIT} rows)`,
    ),
    "utf8",
  );
  fs.writeFileSync(
    SQL_OVERWRITE_OUT,
    buildUpdateSql(
      updateRows,
      "overwrite",
      "Full overwrite enrichment update SQL (CSV empty clears fields)",
    ),
    "utf8",
  );
  fs.writeFileSync(
    REPORT_OUT,
    buildReportMarkdown(report, previewRows.length, updateRows.length),
    "utf8",
  );

  const priceTargets = updateRows.filter(
    (row) =>
      row.priceText.length > 0 ||
      row.priceMin !== null ||
      row.priceMax !== null,
  ).length;

  console.log("");
  console.log("=== Generated SQL files ===");
  console.log(`Preview (safe)     : ${SQL_PREVIEW_OUT} (${previewRows.length} rows)`);
  console.log(`Full (safe)        : ${SQL_SAFE_OUT} (${updateRows.length} rows)`);
  console.log(`Full overwrite     : ${SQL_OVERWRITE_OUT} (${updateRows.length} rows)`);
  console.log(`Report             : ${REPORT_OUT}`);
  console.log("");
  console.log("Update targets (non-empty CSV values):");
  console.log(`  name (all rows)  : ${updateRows.length}`);
  console.log(`  change_name_to   : ${updateRows.filter((r) => r.usesChangeNameTo).length}`);
  console.log(`  address          : ${updateRows.filter((r) => r.address).length}`);
  console.log(`  phone            : ${updateRows.filter((r) => r.phone).length}`);
  console.log(`  homepage_url     : ${updateRows.filter((r) => r.homepageUrl).length}`);
  console.log(`  price (any)      : ${priceTargets}`);
  console.log("");
  console.log("Supabase run order:");
  console.log("  1. supabase_golf_courses_enrichment_update_preview.sql");
  console.log("  2. verify a few courses on site");
  console.log("  3. supabase_golf_courses_enrichment_update.sql");
  console.log("  (optional) supabase_golf_courses_enrichment_update_full_overwrite.sql");
}

main();
