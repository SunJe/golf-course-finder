import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_ENRICHMENT_EDIT_HEADERS,
  COURSE_ENRICHMENT_UPLOAD_HEADERS,
  COURSE_PRICE_STATS_UPLOAD_HEADERS,
  rowToPriceStatsUploadRow,
  rowToUploadRow,
  validateEditRows,
  type CourseEnrichmentEditRow,
} from "../lib/enrichment/courseEnrichmentEdit";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const EDIT_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const UPLOAD_CSV = path.join(
  ROOT,
  "data/enrichment/course_enrichment_upload.csv",
);
const PRICE_STATS_CSV = path.join(
  ROOT,
  "data/enrichment/course_price_stats_upload.csv",
);
const SQL_OUT = path.join(ROOT, "data/enrichment/course_enrichment_update.sql");
const SQL_PREVIEW_OUT = path.join(
  ROOT,
  "data/enrichment/course_enrichment_update_preview.sql",
);
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");

const DB_TABLE = "public.golf_courses";
const DB_COLUMNS = {
  name: "name",
  phone: "phone",
  homepage: "homepage_url",
} as const;

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function isValidHttpUrl(value: string): boolean {
  return /^https?:\/\/.+/i.test(value.trim());
}

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[\d\s\-()+]+$/.test(trimmed);
}

function loadEditRows(): {
  headers: string[];
  rows: CourseEnrichmentEditRow[];
} {
  if (!fs.existsSync(EDIT_CSV)) {
    throw new Error(`Edit CSV not found: ${EDIT_CSV}`);
  }
  const encoding = readCsvWithEncodingGuess(EDIT_CSV);
  const parsed = parseCsv(encoding.content);
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

function verifyDbSchema(): void {
  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found: ${SCHEMA_PATH}`);
  }
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  for (const column of Object.values(DB_COLUMNS)) {
    if (!schema.includes(`${column} text`)) {
      throw new Error(
        `Schema verification failed: column "${column}" not found in ${SCHEMA_PATH}`,
      );
    }
  }
  console.log(
    `[schema] Confirmed ${DB_TABLE} columns: name, phone, homepage_url`,
  );
}

interface SqlUpdate {
  id: string;
  sql: string;
  needsCheck: boolean;
  confidence: string;
  originalName: string;
  changeNameTo: string;
}

function buildSqlUpdate(row: CourseEnrichmentEditRow): SqlUpdate | null {
  const assignments: string[] = [];
  const changeNameTo = row.change_name_to.trim();
  const phone = row.phone.trim();
  const homepage = row.homepage_url.trim();

  if (changeNameTo) {
    assignments.push(`  name = '${escapeSqlLiteral(changeNameTo)}'`);
  }
  if (phone && isValidPhone(phone)) {
    assignments.push(`  phone = '${escapeSqlLiteral(phone)}'`);
  }
  if (homepage && isValidHttpUrl(homepage)) {
    assignments.push(`  homepage_url = '${escapeSqlLiteral(homepage)}'`);
  }

  if (assignments.length === 0) return null;

  const warnings: string[] = [];
  if (row.needs_check === "y") warnings.push("needs_check: y");
  if (row.confidence === "low") warnings.push("confidence: low");

  const comment = [
    `-- ${warnings.join(" / ") || "ok"}`,
    `-- original_name: ${row.name}`,
    changeNameTo ? `-- change_name_to: ${changeNameTo}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const sql = `${comment}
update ${DB_TABLE}
set
${assignments.join(",\n")}
where id = '${escapeSqlLiteral(row.id)}';`;

  const needsCheck = row.needs_check === "y";

  return {
    id: row.id,
    sql,
    needsCheck,
    confidence: row.confidence,
    originalName: row.name,
    changeNameTo,
  };
}

function writeSqlFile(
  filePath: string,
  title: string,
  updates: SqlUpdate[],
): void {
  const header = `-- ${title}
-- Generated: ${new Date().toISOString()}
-- Table: ${DB_TABLE}
-- Fields: name (only when change_name_to set), phone, homepage_url
-- Excluded: booking_url, price, difficulty, avg_score
-- Run manually in Supabase SQL Editor. Do not auto-execute.

`;
  const body = updates.map((update) => update.sql).join("\n\n");
  fs.writeFileSync(filePath, `${header}${body}\n`, "utf8");
}

function printValidationReport(
  report: ReturnType<typeof validateEditRows>,
): void {
  console.log("");
  console.log("=== course_enrichment_edit.csv validation ===");
  console.log(`Rows                 : ${report.rowCount}`);
  console.log(`Unique ids           : ${report.uniqueIds}`);
  console.log(`change_name_to column: ${report.hasChangeNameToColumn ? "yes" : "NO"}`);
  console.log(`change_name_to filled: ${report.changeNameToFilled}`);
  console.log(`phone filled         : ${report.phoneFilled}`);
  console.log(`homepage filled      : ${report.homepageFilled}`);
  console.log(`price filled         : ${report.priceFilled}`);
  console.log(`Slash difficulty     : ${report.slashDifficulty.length}`);
  console.log(`Mojibake warnings    : ${report.mojibakeWarnings.length}`);

  if (report.difficultyInvalid.length > 0) {
    console.warn(
      `[warn] Non-numeric difficulty: ${report.difficultyInvalid.length} rows`,
    );
    for (const item of report.difficultyInvalid.slice(0, 5)) {
      console.warn(`[warn]   ${item.id} = "${item.value}"`);
    }
  }
  if (report.slashDifficulty.length > 0) {
    console.warn(
      `[warn] Slash difficulty (9/10): ${report.slashDifficulty.length} rows`,
    );
    for (const item of report.slashDifficulty.slice(0, 5)) {
      console.warn(`[warn]   ${item.id} = "${item.value}"`);
    }
  }
  if (report.avgScoreInvalid.length > 0) {
    console.warn(
      `[warn] Non-numeric avg_score: ${report.avgScoreInvalid.length} rows`,
    );
    for (const item of report.avgScoreInvalid.slice(0, 5)) {
      console.warn(`[warn]   ${item.id} = "${item.value}"`);
    }
  }

  if (report.mojibakeWarnings.length > 0) {
    for (const warning of report.mojibakeWarnings.slice(0, 10)) {
      console.warn(`[warn] ${warning}`);
    }
    if (report.mojibakeWarnings.length > 10) {
      console.warn(`[warn] ... and ${report.mojibakeWarnings.length - 10} more`);
    }
  }

  if (report.errors.length > 0) {
    for (const error of report.errors) {
      console.error(`[error] ${error}`);
    }
    throw new Error("Validation failed — fix course_enrichment_edit.csv");
  }
}

function main(): void {
  verifyDbSchema();
  const { headers, rows } = loadEditRows();
  const validation = validateEditRows(rows, headers);
  printValidationReport(validation);

  const uploadRows = rows.map((row) => rowToUploadRow(row));
  writeFileUtf8Bom(
    UPLOAD_CSV,
    rowsToCsv(
      [...COURSE_ENRICHMENT_UPLOAD_HEADERS],
      uploadRows.map((row) =>
        COURSE_ENRICHMENT_UPLOAD_HEADERS.map((header) => row[header] ?? ""),
      ),
      { crlf: true },
    ),
  );

  const priceStatsRows = rows.map((row) => rowToPriceStatsUploadRow(row));
  writeFileUtf8Bom(
    PRICE_STATS_CSV,
    rowsToCsv(
      [...COURSE_PRICE_STATS_UPLOAD_HEADERS],
      priceStatsRows.map((row) =>
        COURSE_PRICE_STATS_UPLOAD_HEADERS.map((header) => row[header] ?? ""),
      ),
      { crlf: true },
    ),
  );

  const sqlUpdates = rows
    .map((row) => buildSqlUpdate(row))
    .filter((update): update is SqlUpdate => Boolean(update));

  const flagged = sqlUpdates.filter((update) => update.needsCheck);

  writeSqlFile(
    SQL_OUT,
    "Full enrichment update SQL",
    [
      ...sqlUpdates.filter((u) => u.needsCheck || u.confidence === "low"),
      ...sqlUpdates.filter((u) => !u.needsCheck && u.confidence !== "low"),
    ],
  );

  const withRename = sqlUpdates.filter((u) => u.changeNameTo);
  const preferred = withRename.filter(
    (u) => !u.needsCheck && u.confidence !== "low",
  );
  const fallback = withRename.filter(
    (u) => u.needsCheck || u.confidence === "low",
  );
  const preview = [...preferred, ...fallback].slice(0, 20);

  writeSqlFile(SQL_PREVIEW_OUT, "Preview enrichment update SQL (max 20 rows)", preview);

  const nameApplied = uploadRows.filter(
    (row) => row.name !== row.original_name,
  ).length;

  console.log("");
  console.log("=== Generated files ===");
  console.log(`Upload CSV       : ${UPLOAD_CSV} (${uploadRows.length} rows)`);
  console.log(`Price/stats CSV  : ${PRICE_STATS_CSV} (${priceStatsRows.length} rows)`);
  console.log(`Full SQL         : ${SQL_OUT} (${sqlUpdates.length} updates)`);
  console.log(`Preview SQL      : ${SQL_PREVIEW_OUT} (${preview.length} updates)`);
  console.log(`Name via change_name_to: ${nameApplied} rows`);
  console.log(`SQL flagged (needs_check/low): ${flagged.length}`);
  console.log(`booking_url in SQL: no`);
  console.log(`price/stats in SQL: no`);
}

main();
