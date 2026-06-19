import fs from "node:fs";
import path from "node:path";
import { parseCsv, writeFileUtf8 } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();

const ENRICHMENT_CSV = path.join(ROOT, "data/enrichment/course_links.csv");
const FINAL_IMPORT_CSV = path.join(
  ROOT,
  "data/golf_courses_import_geocoded_final.csv",
);
const SQL_OUT = path.join(ROOT, "supabase/course_links_update.sql");
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");

const EXPECTED_HEADERS = [
  "id",
  "name",
  "homepage_url",
  "booking_url",
  "phone",
  "source_url",
  "note",
] as const;

const UPDATE_FIELDS = ["homepage_url", "booking_url", "phone"] as const;

type UpdateField = (typeof UPDATE_FIELDS)[number];

interface EnrichmentRow {
  id: string;
  name: string;
  homepage_url: string;
  booking_url: string;
  phone: string;
  source_url: string;
  note: string;
  lineNumber: number;
}

interface ValidationIssue {
  level: "error" | "warning";
  message: string;
}

function countHangul(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) count += 1;
  }
  return count;
}

function detectMojibake(text: string): string[] {
  if (!text.trim()) return [];
  const hints: string[] = [];
  if (/\uFFFD/.test(text) || /�/.test(text)) {
    hints.push("replacement character (�) detected");
  }
  if (/[ÃÂâ]/.test(text)) {
    hints.push("suspicious Latin-1 sequences (Ã/Â/â)");
  }
  if (
    /[ìíîïðêëã]/.test(text) &&
    countHangul(text) === 0 &&
    text.trim().length >= 3
  ) {
    hints.push("accented Latin without Hangul (possible CP949 misread as UTF-8)");
  }
  return hints;
}

function isValidHttpUrl(value: string): boolean {
  return /^https?:\/\/.+/i.test(value.trim());
}

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^[\d\s\-()+]+$/.test(trimmed);
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim();
}

function loadKnownCourseIds(): Set<string> {
  if (!fs.existsSync(FINAL_IMPORT_CSV)) {
    console.warn(
      `[warn] Final import CSV not found: ${FINAL_IMPORT_CSV}. Skipping id cross-check.`,
    );
    return new Set();
  }

  const encoding = readCsvWithEncodingGuess(FINAL_IMPORT_CSV);
  const parsed = parseCsv(encoding.content);
  const idIndex = parsed.headers.findIndex((h) => normalizeHeader(h) === "id");
  if (idIndex < 0) {
    console.warn("[warn] Could not find id column in final import CSV.");
    return new Set();
  }

  return new Set(parsed.rows.map((row) => row[idIndex]?.trim()).filter(Boolean));
}

function verifySchemaColumns(): void {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.warn(`[warn] Schema file not found: ${SCHEMA_PATH}`);
    return;
  }

  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  for (const column of UPDATE_FIELDS) {
    if (!schema.includes(`${column} text`)) {
      throw new Error(
        `Schema verification failed: column "${column}" not found in ${SCHEMA_PATH}. Do not proceed until schema is confirmed.`,
      );
    }
  }
  console.log(
    "[schema] Confirmed columns: phone, homepage_url, booking_url (no schema change required).",
  );
}

function rowToRecord(cells: string[], lineNumber: number): EnrichmentRow {
  const get = (index: number) => (cells[index] ?? "").trim();
  return {
    id: get(0),
    name: get(1),
    homepage_url: get(2),
    booking_url: get(3),
    phone: get(4),
    source_url: get(5),
    note: get(6),
    lineNumber,
  };
}

function validateRow(
  row: EnrichmentRow,
  seenIds: Set<string>,
  knownIds: Set<string>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!row.id) {
    issues.push({
      level: "error",
      message: `Line ${row.lineNumber}: id is required.`,
    });
    return issues;
  }

  if (seenIds.has(row.id)) {
    issues.push({
      level: "error",
      message: `Line ${row.lineNumber}: duplicate id "${row.id}".`,
    });
  }
  seenIds.add(row.id);

  if (knownIds.size > 0 && !knownIds.has(row.id)) {
    issues.push({
      level: "warning",
      message: `Line ${row.lineNumber}: id "${row.id}" not found in final import CSV (${knownIds.size} known ids).`,
    });
  }

  for (const field of ["name", "note"] as const) {
    for (const hint of detectMojibake(row[field])) {
      issues.push({
        level: "warning",
        message: `Line ${row.lineNumber}: ${field} — ${hint}`,
      });
    }
  }

  if (row.homepage_url && !isValidHttpUrl(row.homepage_url)) {
    issues.push({
      level: "error",
      message: `Line ${row.lineNumber}: homepage_url must start with http:// or https://`,
    });
  }

  if (row.booking_url && !isValidHttpUrl(row.booking_url)) {
    issues.push({
      level: "error",
      message: `Line ${row.lineNumber}: booking_url must start with http:// or https://`,
    });
  }

  if (row.phone && !isValidPhone(row.phone)) {
    issues.push({
      level: "error",
      message: `Line ${row.lineNumber}: phone contains invalid characters (allowed: digits, spaces, hyphens, parentheses, +).`,
    });
  }

  return issues;
}

function buildUpdateStatement(row: EnrichmentRow): string | null {
  const assignments: string[] = [];

  if (row.homepage_url) {
    assignments.push(
      `  homepage_url = '${escapeSqlLiteral(row.homepage_url.trim())}'`,
    );
  }
  if (row.booking_url) {
    assignments.push(
      `  booking_url = '${escapeSqlLiteral(row.booking_url.trim())}'`,
    );
  }
  if (row.phone) {
    assignments.push(`  phone = '${escapeSqlLiteral(row.phone.trim())}'`);
  }

  if (assignments.length === 0) return null;

  assignments.push("  updated_at = now()");

  const commentParts = [
    row.name ? `-- ${row.name}` : null,
    row.source_url ? `-- source: ${row.source_url}` : null,
    row.note ? `-- note: ${row.note}` : null,
  ].filter(Boolean);

  const comments = commentParts.length > 0 ? `${commentParts.join("\n")}\n` : "";

  return `${comments}update public.golf_courses
set
${assignments.join(",\n")}
where id = '${escapeSqlLiteral(row.id)}';`;
}

function main(): void {
  verifySchemaColumns();

  if (!fs.existsSync(ENRICHMENT_CSV)) {
    throw new Error(
      `Enrichment CSV not found: ${ENRICHMENT_CSV}\nCreate it from data/enrichment/README.md`,
    );
  }

  const encoding = readCsvWithEncodingGuess(ENRICHMENT_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map(normalizeHeader);

  if (headers.length === 0) {
    throw new Error("Enrichment CSV is empty.");
  }

  if (headers[0] !== "id") {
    throw new Error(
      `First header column must be "id" (got "${headers[0]}"). Check UTF-8 BOM / encoding.`,
    );
  }

  for (let i = 0; i < EXPECTED_HEADERS.length; i += 1) {
    if (headers[i] !== EXPECTED_HEADERS[i]) {
      throw new Error(
        `Invalid header at column ${i + 1}: expected "${EXPECTED_HEADERS[i]}", got "${headers[i] ?? ""}".`,
      );
    }
  }

  const knownIds = loadKnownCourseIds();
  const seenIds = new Set<string>();
  const allIssues: ValidationIssue[] = [];
  const statements: string[] = [];

  parsed.rows.forEach((cells, index) => {
    const row = rowToRecord(cells, index + 2);
    if (!row.id && !row.name && !row.homepage_url && !row.booking_url && !row.phone) {
      return;
    }

    allIssues.push(...validateRow(row, seenIds, knownIds));

    const statement = buildUpdateStatement(row);
    if (statement) statements.push(statement);
  });

  const errors = allIssues.filter((i) => i.level === "error");
  const warnings = allIssues.filter((i) => i.level === "warning");

  for (const issue of warnings) {
    console.warn(`[warn] ${issue.message}`);
  }

  if (errors.length > 0) {
    for (const issue of errors) {
      console.error(`[error] ${issue.message}`);
    }
    throw new Error(`Validation failed with ${errors.length} error(s).`);
  }

  const generatedAt = new Date().toISOString();
  const sqlBody =
    statements.length > 0
      ? statements.join("\n\n")
      : "-- No update statements (all rows have empty homepage_url, booking_url, and phone).";

  const sql = `-- GolfMap Korea — course link enrichment updates
-- Generated: ${generatedAt}
-- Source CSV: data/enrichment/course_links.csv
-- Regenerate: npm run generate:course-links-sql
--
-- Run manually in Supabase SQL Editor (do not use service_role in scripts).
-- Only non-empty homepage_url / booking_url / phone columns are updated.
--
${sqlBody}
`;

  writeFileUtf8(SQL_OUT, sql);

  console.log("");
  console.log("=== Course links SQL generation complete ===");
  console.log(`Input CSV : ${ENRICHMENT_CSV}`);
  console.log(`CSV encoding detected: ${encoding.encoding} (${encoding.confidence})`);
  console.log(`Output SQL: ${SQL_OUT}`);
  console.log(`Output encoding: UTF-8 (no BOM)`);
  console.log(`Update statements: ${statements.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Errors: ${errors.length}`);
}

main();
