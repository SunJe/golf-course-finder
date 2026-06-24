import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_ENRICHMENT_EDIT_HEADERS,
  isNumericField,
  type CourseEnrichmentEditRow,
} from "../lib/enrichment/courseEnrichmentEdit";
import { hasValidDifficulty } from "../lib/difficulty";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_INPUT = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");
const SQL_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_course_enrichment_update.sql",
);
const REPORT_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_course_enrichment_update_report.json",
);
const PREVIEW_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_course_enrichment_update_preview.csv",
);

const DB_TABLE = "public.golf_courses";
const PLAIN_INTEGER = /^(\d+)$/;
const CONFIDENCE_VALUES = new Set(["high", "medium", "low"]);
const DIFFICULTY_TEXT_TOKENS = new Set([
  "easy",
  "normal",
  "hard",
  "beginner",
  "baekdori",
  "medium",
  "쉬움",
  "보통",
  "어려움",
  "낮음",
  "중간",
  "높음",
  "입문",
  "초보",
  "상급",
]);

type ColumnKind = "text" | "int" | "float" | "bool";

interface ValueColumn {
  /** Alias in VALUES / v.* */
  alias: string;
  /** Target DB column */
  dbColumn: string;
  kind: ColumnKind;
  csvField: keyof CourseEnrichmentEditRow | "source_url";
}

const VALUE_COLUMNS: ValueColumn[] = [
  { alias: "change_name_to", dbColumn: "name", kind: "text", csvField: "change_name_to" },
  { alias: "address", dbColumn: "address", kind: "text", csvField: "address" },
  { alias: "phone", dbColumn: "phone", kind: "text", csvField: "phone" },
  { alias: "homepage_url", dbColumn: "homepage_url", kind: "text", csvField: "homepage_url" },
  { alias: "price_text", dbColumn: "price_text", kind: "text", csvField: "price_text" },
  { alias: "price_min", dbColumn: "price_min", kind: "int", csvField: "price_min" },
  { alias: "price_max", dbColumn: "price_max", kind: "int", csvField: "price_max" },
  { alias: "price_type", dbColumn: "price_type", kind: "text", csvField: "price_type" },
  { alias: "difficulty", dbColumn: "difficulty", kind: "text", csvField: "difficulty" },
  { alias: "avg_score", dbColumn: "avg_score", kind: "float", csvField: "avg_score" },
  { alias: "confidence", dbColumn: "confidence", kind: "text", csvField: "confidence" },
  { alias: "needs_check", dbColumn: "needs_check", kind: "bool", csvField: "needs_check" },
  { alias: "note", dbColumn: "note", kind: "text", csvField: "note" },
];

const PREVIEW_HEADERS = [
  "id",
  "name",
  "updates",
  "new_name",
  "address",
  "phone",
  "homepage_url",
  "price_text",
  "price_min",
  "price_max",
  "price_type",
  "difficulty",
  "avg_score",
  "confidence",
  "needs_check",
  "note",
  "source_url",
  "skip_reason",
  "warnings",
] as const;

interface ReportJson {
  input: string;
  totalRows: number;
  rowsWithUpdates: number;
  rowsSkipped: number;
  priceRows: number;
  difficultyRows: number;
  avgScoreRows: number;
  metadataRows: number;
  nameChangeRows: number;
  addressRows: number;
  phoneRows: number;
  homepageRows: number;
  missingColumns: string[];
  invalidRows: Array<{ id: string; name: string; reason: string }>;
  warnings: string[];
  generatedAt: string;
}

interface ParsedRow {
  id: string;
  name: string;
  changeNameTo: string;
  address: string;
  phone: string;
  homepageUrl: string;
  priceText: string;
  priceMin: number | null;
  priceMax: number | null;
  priceType: string;
  difficulty: string;
  avgScore: number | null;
  confidence: string;
  needsCheck: boolean | null;
  note: string;
  sourceUrl: string;
  warnings: string[];
  skipReason: string;
  flags: {
    hasPrice: boolean;
    hasDifficulty: boolean;
    hasAvgScore: boolean;
    hasMetadata: boolean;
    hasNameChange: boolean;
    hasAddress: boolean;
    hasPhone: boolean;
    hasHomepage: boolean;
    hasAnyUpdate: boolean;
  };
}

function parseArgs(argv: string[]): { inputPath: string } {
  let inputPath = DEFAULT_INPUT;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      inputPath = path.isAbsolute(argv[index + 1])
        ? argv[index + 1]
        : path.join(ROOT, argv[index + 1]);
      index += 1;
    }
  }
  return { inputPath };
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlString(value: string): string {
  return `'${escapeSqlLiteral(value)}'`;
}

function sqlInt(value: number | null): string {
  return value === null ? "NULL" : String(value);
}

function sqlFloat(value: number | null): string {
  return value === null ? "NULL" : String(value);
}

function sqlBool(value: boolean | null): string {
  if (value === null) return "NULL";
  return value ? "true" : "false";
}

function parsePriceInteger(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  if (!PLAIN_INTEGER.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseFloatValue(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNeedsCheck(value: string): boolean | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  if (["y", "yes", "true", "1"].includes(trimmed)) return true;
  if (["n", "no", "false", "0"].includes(trimmed)) return false;
  return null;
}

function isAcceptableDifficulty(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (hasValidDifficulty(trimmed) && isNumericField(trimmed)) return true;
  if (hasValidDifficulty(trimmed)) {
    const lower = trimmed.toLowerCase();
    if (DIFFICULTY_TEXT_TOKENS.has(lower)) return true;
    if (/[가-힣]/.test(trimmed)) return true;
  }
  return false;
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

function resolveActiveColumns(schemaColumns: Set<string>): {
  valueColumns: ValueColumn[];
  missingColumns: string[];
  sourceUrlDbColumn: string | null;
} {
  const missingColumns: string[] = [];
  const valueColumns = VALUE_COLUMNS.filter((column) => {
    if (schemaColumns.has(column.dbColumn)) return true;
    missingColumns.push(column.dbColumn);
    return false;
  });

  let sourceUrlDbColumn: string | null = null;
  if (schemaColumns.has("price_source_url")) {
    sourceUrlDbColumn = "price_source_url";
  } else if (schemaColumns.has("source_url")) {
    sourceUrlDbColumn = "source_url";
  } else {
    missingColumns.push("price_source_url");
  }

  return {
    valueColumns,
    missingColumns: [...new Set(missingColumns)],
    sourceUrlDbColumn,
  };
}

function loadEditRows(inputPath: string): CourseEnrichmentEditRow[] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input CSV not found: ${inputPath}`);
  }
  const encoding = readCsvWithEncodingGuess(inputPath);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));

  return parsed.rows.map((cells) => {
    const row = {} as CourseEnrichmentEditRow;
    for (const header of COURSE_ENRICHMENT_EDIT_HEADERS) {
      const idx = headers.indexOf(header);
      row[header] = idx >= 0 ? (cells[idx] ?? "").trim() : "";
    }
    return row;
  });
}

function parseRow(row: CourseEnrichmentEditRow): ParsedRow {
  const warnings: string[] = [];
  const flags = {
    hasPrice: false,
    hasDifficulty: false,
    hasAvgScore: false,
    hasMetadata: false,
    hasNameChange: false,
    hasAddress: false,
    hasPhone: false,
    hasHomepage: false,
    hasAnyUpdate: false,
  };

  const id = row.id.trim();
  if (!id) {
    return {
      id: "",
      name: row.name,
      changeNameTo: "",
      address: "",
      phone: "",
      homepageUrl: "",
      priceText: "",
      priceMin: null,
      priceMax: null,
      priceType: "",
      difficulty: "",
      avgScore: null,
      confidence: "",
      needsCheck: null,
      note: "",
      sourceUrl: "",
      warnings,
      skipReason: "empty_id",
      flags,
    };
  }

  const changeNameTo = row.change_name_to.trim();
  const address = row.address.trim();
  const phone = row.phone.trim();
  const homepageUrl = row.homepage_url.trim();
  const priceText = row.price_text.trim();
  const priceType = row.price_type.trim();
  const difficulty = row.difficulty.trim();
  const confidence = row.confidence.trim();
  const note = row.note.trim();
  const sourceUrl = row.source_url.trim();

  let priceMin: number | null = null;
  let priceMax: number | null = null;

  if (row.price_min.trim()) {
    priceMin = parsePriceInteger(row.price_min);
    if (priceMin == null) {
      return {
        id,
        name: row.name,
        changeNameTo,
        address,
        phone,
        homepageUrl,
        priceText,
        priceMin: null,
        priceMax: null,
        priceType,
        difficulty,
        avgScore: null,
        confidence,
        needsCheck: null,
        note,
        sourceUrl,
        warnings,
        skipReason: "invalid_price_min",
        flags,
      };
    }
  }

  if (row.price_max.trim()) {
    priceMax = parsePriceInteger(row.price_max);
    if (priceMax == null) {
      return {
        id,
        name: row.name,
        changeNameTo,
        address,
        phone,
        homepageUrl,
        priceText,
        priceMin,
        priceMax: null,
        priceType,
        difficulty,
        avgScore: null,
        confidence,
        needsCheck: null,
        note,
        sourceUrl,
        warnings,
        skipReason: "invalid_price_max",
        flags,
      };
    }
  }

  if (priceMin != null && priceMax != null && priceMin > priceMax) {
    return {
      id,
      name: row.name,
      changeNameTo,
      address,
      phone,
      homepageUrl,
      priceText,
      priceMin,
      priceMax,
      priceType,
      difficulty,
      avgScore: null,
      confidence,
      needsCheck: null,
      note,
      sourceUrl,
      warnings,
      skipReason: "price_min_gt_price_max",
      flags,
    };
  }

  let avgScore: number | null = null;
  if (row.avg_score.trim()) {
    avgScore = parseFloatValue(row.avg_score);
    if (avgScore == null) {
      warnings.push(`invalid avg_score: ${row.avg_score.trim()}`);
    }
  }

  let needsCheck: boolean | null = parseNeedsCheck(row.needs_check);
  if (row.needs_check.trim() && needsCheck == null) {
    warnings.push(`invalid needs_check: ${row.needs_check.trim()}`);
    needsCheck = null;
  }

  if (difficulty) {
    if (!isAcceptableDifficulty(difficulty)) {
      warnings.push(`unexpected difficulty value: ${difficulty}`);
    }
    flags.hasDifficulty = true;
    flags.hasAnyUpdate = true;
  }

  if (changeNameTo) {
    flags.hasNameChange = true;
    flags.hasAnyUpdate = true;
  }
  if (address) {
    flags.hasAddress = true;
    flags.hasAnyUpdate = true;
  }
  if (phone) {
    flags.hasPhone = true;
    flags.hasAnyUpdate = true;
  }
  if (homepageUrl) {
    flags.hasHomepage = true;
    flags.hasAnyUpdate = true;
  }
  if (priceText || priceMin != null || priceMax != null || priceType || sourceUrl) {
    flags.hasPrice = true;
    flags.hasAnyUpdate = true;
  }
  if (avgScore != null) {
    flags.hasAvgScore = true;
    flags.hasAnyUpdate = true;
  }
  if (confidence || note || needsCheck != null) {
    flags.hasMetadata = true;
    flags.hasAnyUpdate = true;
  }

  if (confidence && !CONFIDENCE_VALUES.has(confidence.toLowerCase())) {
    warnings.push(`unexpected confidence value: ${confidence}`);
  }

  return {
    id,
    name: row.name,
    changeNameTo,
    address,
    phone,
    homepageUrl,
    priceText,
    priceMin,
    priceMax,
    priceType,
    difficulty,
    avgScore,
    confidence,
    needsCheck,
    note,
    sourceUrl,
    warnings,
    skipReason: flags.hasAnyUpdate ? "" : "no_updates",
    flags,
  };
}

function valueForColumn(parsed: ParsedRow, column: ValueColumn): string {
  switch (column.csvField) {
    case "change_name_to":
      return sqlString(parsed.changeNameTo);
    case "address":
      return sqlString(parsed.address);
    case "phone":
      return sqlString(parsed.phone);
    case "homepage_url":
      return sqlString(parsed.homepageUrl);
    case "price_text":
      return sqlString(parsed.priceText);
    case "price_min":
      return sqlInt(parsed.priceMin);
    case "price_max":
      return sqlInt(parsed.priceMax);
    case "price_type":
      return sqlString(parsed.priceType);
    case "difficulty":
      return sqlString(parsed.difficulty);
    case "avg_score":
      return sqlFloat(parsed.avgScore);
    case "confidence":
      return sqlString(parsed.confidence);
    case "needs_check":
      return sqlBool(parsed.needsCheck);
    case "note":
      return sqlString(parsed.note);
    default:
      throw new Error(`Unsupported csv field: ${column.csvField}`);
  }
}

function buildValuesRow(
  parsed: ParsedRow,
  valueColumns: ValueColumn[],
  sourceUrlDbColumn: string | null,
): string {
  const parts = [sqlString(parsed.id)];
  for (const column of valueColumns) {
    parts.push(valueForColumn(parsed, column));
  }
  if (sourceUrlDbColumn) {
    parts.push(sqlString(parsed.sourceUrl));
  }
  return `  (${parts.join(", ")})`;
}

function buildSetClause(
  valueColumns: ValueColumn[],
  sourceUrlDbColumn: string | null,
  schemaColumns: Set<string>,
): string {
  const lines: string[] = [];

  for (const column of valueColumns) {
    const vCol = `v.${column.alias}`;
    const gCol = `g.${column.dbColumn}`;

    if (column.dbColumn === "name") {
      lines.push(`  ${column.dbColumn} = COALESCE(NULLIF(${vCol}, ''), ${gCol})`);
      continue;
    }

    if (column.kind === "text") {
      lines.push(`  ${column.dbColumn} = COALESCE(NULLIF(${vCol}, ''), ${gCol})`);
    } else if (column.kind === "bool") {
      lines.push(`  ${column.dbColumn} = COALESCE(${vCol}, ${gCol})`);
    } else {
      lines.push(`  ${column.dbColumn} = COALESCE(${vCol}, ${gCol})`);
    }
  }

  if (sourceUrlDbColumn) {
    lines.push(
      `  ${sourceUrlDbColumn} = COALESCE(NULLIF(v.source_url, ''), g.${sourceUrlDbColumn})`,
    );
  }

  if (schemaColumns.has("price_updated_at")) {
    const priceSignals = [
      "NULLIF(v.price_text, '') IS NOT NULL",
      "v.price_min IS NOT NULL",
      "v.price_max IS NOT NULL",
      "NULLIF(v.price_type, '') IS NOT NULL",
    ];
    if (sourceUrlDbColumn) {
      priceSignals.push("NULLIF(v.source_url, '') IS NOT NULL");
    }
    lines.push(
      `  price_updated_at = CASE WHEN ${priceSignals.join(" OR ")} THEN NOW() ELSE g.price_updated_at END`,
    );
  }

  if (schemaColumns.has("updated_at")) {
    lines.push("  updated_at = NOW()");
  }

  return lines.join(",\n");
}

function buildBulkUpdateSql(
  rows: ParsedRow[],
  valueColumns: ValueColumn[],
  sourceUrlDbColumn: string | null,
  schemaColumns: Set<string>,
  inputPath: string,
  missingColumns: string[],
): string {
  if (rows.length === 0) {
    return "-- No UPDATE statements generated.\n";
  }

  const generatedAt = new Date().toISOString();
  const valueAliases = ["id", ...valueColumns.map((c) => c.alias)];
  if (sourceUrlDbColumn) valueAliases.push("source_url");

  const sqlColumns = [
    ...valueColumns.map((c) => c.dbColumn),
    ...(sourceUrlDbColumn ? [sourceUrlDbColumn] : []),
  ];

  return `-- course_enrichment_edit.csv → ${DB_TABLE}
-- Generated: ${generatedAt}
-- Input: ${path.relative(ROOT, inputPath)}
-- Policy: single bulk UPDATE via VALUES. Empty CSV cells do not overwrite DB (COALESCE).
-- Name: only updated when change_name_to is non-empty.
-- Internal-only DB fields (not shown in public UI): difficulty, avg_score, confidence, needs_check, note
-- SQL columns: ${sqlColumns.join(", ")}
-- Missing DB columns (skipped in SQL): ${missingColumns.length ? missingColumns.join(", ") : "none"}
-- Run manually in Supabase SQL Editor. Do not auto-execute.

UPDATE ${DB_TABLE} AS g
SET
${buildSetClause(valueColumns, sourceUrlDbColumn, schemaColumns)}
FROM (
  VALUES
${rows.map((row) => buildValuesRow(row, valueColumns, sourceUrlDbColumn)).join(",\n")}
) AS v(${valueAliases.join(", ")})
WHERE g.id = v.id;
`;
}

function buildPreviewRow(parsed: ParsedRow): Record<(typeof PREVIEW_HEADERS)[number], string> {
  const updates: string[] = [];
  if (parsed.flags.hasNameChange) updates.push("name");
  if (parsed.flags.hasAddress) updates.push("address");
  if (parsed.flags.hasPhone) updates.push("phone");
  if (parsed.flags.hasHomepage) updates.push("homepage_url");
  if (parsed.priceText) updates.push("price_text");
  if (parsed.priceMin != null) updates.push("price_min");
  if (parsed.priceMax != null) updates.push("price_max");
  if (parsed.priceType) updates.push("price_type");
  if (parsed.flags.hasDifficulty) updates.push("difficulty");
  if (parsed.flags.hasAvgScore) updates.push("avg_score");
  if (parsed.confidence) updates.push("confidence");
  if (parsed.needsCheck != null) updates.push("needs_check");
  if (parsed.note) updates.push("note");
  if (parsed.sourceUrl) updates.push("price_source_url");

  return {
    id: parsed.id,
    name: parsed.name,
    updates: updates.join(" | "),
    new_name: parsed.changeNameTo,
    address: parsed.address,
    phone: parsed.phone,
    homepage_url: parsed.homepageUrl,
    price_text: parsed.priceText,
    price_min: parsed.priceMin == null ? "" : String(parsed.priceMin),
    price_max: parsed.priceMax == null ? "" : String(parsed.priceMax),
    price_type: parsed.priceType,
    difficulty: parsed.difficulty,
    avg_score: parsed.avgScore == null ? "" : String(parsed.avgScore),
    confidence: parsed.confidence,
    needs_check:
      parsed.needsCheck == null ? "" : parsed.needsCheck ? "true" : "false",
    note: parsed.note,
    source_url: parsed.sourceUrl,
    skip_reason: parsed.skipReason,
    warnings: parsed.warnings.join(" | "),
  };
}

function main(): void {
  const { inputPath } = parseArgs(process.argv.slice(2));
  const schemaColumns = loadSchemaColumns();
  const { valueColumns, missingColumns, sourceUrlDbColumn } =
    resolveActiveColumns(schemaColumns);
  const rawRows = loadEditRows(inputPath);

  const parsedRows = rawRows.map(parseRow);
  const invalidRows: ReportJson["invalidRows"] = [];
  const globalWarnings: string[] = [
    ...new Set(missingColumns.map((column) => `db_column_missing:${column}`)),
  ];

  let rowsWithUpdates = 0;
  let rowsSkipped = 0;
  let priceRows = 0;
  let difficultyRows = 0;
  let avgScoreRows = 0;
  let metadataRows = 0;
  let nameChangeRows = 0;
  let addressRows = 0;
  let phoneRows = 0;
  let homepageRows = 0;

  const updateRows: ParsedRow[] = [];
  const previewRows: string[][] = [];

  for (const parsed of parsedRows) {
    previewRows.push(
      PREVIEW_HEADERS.map((header) => buildPreviewRow(parsed)[header] ?? ""),
    );

    if (parsed.skipReason) {
      rowsSkipped += 1;
      if (parsed.skipReason !== "no_updates" && parsed.skipReason !== "empty_id") {
        invalidRows.push({
          id: parsed.id,
          name: parsed.name,
          reason: parsed.skipReason,
        });
      }
      continue;
    }

    updateRows.push(parsed);
    rowsWithUpdates += 1;
    if (parsed.flags.hasPrice) priceRows += 1;
    if (parsed.flags.hasDifficulty) difficultyRows += 1;
    if (parsed.flags.hasAvgScore) avgScoreRows += 1;
    if (parsed.flags.hasMetadata) metadataRows += 1;
    if (parsed.flags.hasNameChange) nameChangeRows += 1;
    if (parsed.flags.hasAddress) addressRows += 1;
    if (parsed.flags.hasPhone) phoneRows += 1;
    if (parsed.flags.hasHomepage) homepageRows += 1;

    for (const warning of parsed.warnings) {
      globalWarnings.push(`${parsed.id}: ${warning}`);
    }
  }

  const generatedAt = new Date().toISOString();
  const sql = buildBulkUpdateSql(
    updateRows,
    valueColumns,
    sourceUrlDbColumn,
    schemaColumns,
    inputPath,
    missingColumns,
  );

  fs.mkdirSync(path.dirname(SQL_OUT), { recursive: true });
  fs.writeFileSync(SQL_OUT, sql, "utf8");

  const report: ReportJson = {
    input: path.relative(ROOT, inputPath).replace(/\\/g, "/"),
    totalRows: rawRows.length,
    rowsWithUpdates,
    rowsSkipped,
    priceRows,
    difficultyRows,
    avgScoreRows,
    metadataRows,
    nameChangeRows,
    addressRows,
    phoneRows,
    homepageRows,
    missingColumns,
    invalidRows,
    warnings: globalWarnings,
    generatedAt,
  };
  fs.writeFileSync(REPORT_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  fs.writeFileSync(
    PREVIEW_OUT,
    `\uFEFF${rowsToCsv([...PREVIEW_HEADERS], previewRows)}`,
    "utf8",
  );

  console.log("");
  console.log("=== supabase_course_enrichment_update SQL ===");
  console.log(`Input              : ${inputPath}`);
  console.log(`Total rows         : ${rawRows.length}`);
  console.log(`Rows with updates  : ${rowsWithUpdates}`);
  console.log(`Rows skipped       : ${rowsSkipped}`);
  console.log(`Price rows         : ${priceRows}`);
  console.log(`Difficulty rows    : ${difficultyRows}`);
  console.log(`Avg score rows     : ${avgScoreRows}`);
  console.log(`Metadata rows      : ${metadataRows}`);
  console.log(`Name change rows   : ${nameChangeRows}`);
  console.log(`Invalid rows       : ${invalidRows.length}`);
  console.log(
    `Missing DB columns : ${missingColumns.length ? missingColumns.join(", ") : "none"}`,
  );
  console.log(`SQL file           : ${SQL_OUT}`);
  console.log(`Report JSON        : ${REPORT_OUT}`);
  console.log(`Preview CSV        : ${PREVIEW_OUT}`);
  console.log("");
  console.log("Apply via Supabase Dashboard → SQL Editor (review SQL first).");
}

main();
