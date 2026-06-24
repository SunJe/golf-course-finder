import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { SUMMARY_HEADERS, type SummaryRow } from "./lib/teescanner/batchIo";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_INPUT = path.join(
  ROOT,
  "data/enrichment/teescanner_price_course_summary.csv",
);
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");
const SQL_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_teescanner_price_update.sql",
);
const PREVIEW_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_teescanner_price_update_preview.csv",
);
const REPORT_OUT = path.join(
  ROOT,
  "data/enrichment/supabase_teescanner_price_update_report.json",
);

const DB_TABLE = "public.golf_courses";
const PRICE_TYPE = "reservation_reference";

interface ReportJson {
  input: string;
  totalRows: number;
  acceptPriceRows: number;
  manualReviewRows: number;
  ignoredRows: number;
  rowsWithSql: number;
  rowsSkipped: number;
  includeManualReview: boolean;
  missingColumns: string[];
  invalidRows: Array<{ id: string; name: string; reason: string }>;
  generatedAt: string;
}

interface SqlRow {
  summary: SummaryRow;
  priceMin: number;
  priceMax: number;
  priceText: string;
  skipReason?: string;
}

function parseArgs(argv: string[]): {
  inputPath: string;
  includeManualReview: boolean;
} {
  let inputPath = DEFAULT_INPUT;
  let includeManualReview = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input" && argv[index + 1]) {
      inputPath = path.isAbsolute(argv[index + 1])
        ? argv[index + 1]
        : path.join(ROOT, argv[index + 1]);
      index += 1;
    } else if (arg === "--include-manual-review") {
      includeManualReview = true;
    }
  }

  return { inputPath, includeManualReview };
}

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlString(value: string): string {
  return `'${escapeSqlLiteral(value)}'`;
}

function loadSchemaColumns(): Set<string> {
  const schema = fs.readFileSync(SCHEMA_PATH, "utf8");
  const match = schema.match(
    /create table if not exists public\.golf_courses\s*\(([\s\S]*?)\);/i,
  );
  if (!match) throw new Error("Could not parse golf_courses table from schema.sql");
  const columns = new Set<string>();
  for (const line of match[1].split("\n")) {
    const colMatch = line.match(/^\s+([a-z_][a-z0-9_]*)\s+/i);
    if (colMatch) columns.add(colMatch[1]);
  }
  return columns;
}

function loadSummaryRows(inputPath: string): SummaryRow[] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input CSV not found: ${inputPath}`);
  }
  const content = readCsvWithEncodingGuess(inputPath).content;
  const { headers, rows } = parseCsv(content);
  return rows.map((cells) => {
    const row = {} as SummaryRow;
    for (const header of SUMMARY_HEADERS) {
      const index = headers.indexOf(header);
      row[header] = index >= 0 ? (cells[index] ?? "").trim() : "";
    }
    return row;
  });
}

function formatWon(value: number): string {
  return `${value.toLocaleString("ko-KR")}원`;
}

function buildPriceText(priceMin: number, priceMax: number): string {
  if (priceMax > priceMin) {
    return `티스캐너 예약가 기준 ${formatWon(priceMin)}~${formatWon(priceMax)}`;
  }
  return `티스캐너 예약가 기준 ${formatWon(priceMin)}`;
}

function toSqlRow(summary: SummaryRow, includeManualReview: boolean): SqlRow | null {
  if (summary.review_action === "ignore_filter_only") {
    return { summary, priceMin: 0, priceMax: 0, priceText: "", skipReason: "ignore_filter_only" };
  }

  const allowed =
    summary.review_action === "accept_price" ||
    (includeManualReview && summary.review_action === "manual_review");

  if (!allowed) {
    return {
      summary,
      priceMin: 0,
      priceMax: 0,
      priceText: "",
      skipReason: `review_action:${summary.review_action || "unknown"}`,
    };
  }

  const priceMin = Number.parseInt(summary.overall_price_min, 10);
  const priceMax = Number.parseInt(
    summary.overall_price_max || summary.overall_price_min,
    10,
  );

  if (!Number.isFinite(priceMin) || priceMin <= 0) {
    return {
      summary,
      priceMin: 0,
      priceMax: 0,
      priceText: "",
      skipReason: "missing_price_min",
    };
  }

  const resolvedMax = Number.isFinite(priceMax) && priceMax >= priceMin ? priceMax : priceMin;
  return {
    summary,
    priceMin,
    priceMax: resolvedMax,
    priceText: buildPriceText(priceMin, resolvedMax),
  };
}

function buildBulkSql(
  rows: SqlRow[],
  schemaColumns: Set<string>,
  missingColumns: string[],
): string {
  const valueRows = rows.filter((row) => !row.skipReason);
  if (valueRows.length === 0) return "-- No UPDATE statements generated.\n";

  const assignments: string[] = [];
  if (schemaColumns.has("price_min")) assignments.push("  price_min = COALESCE(v.price_min, g.price_min)");
  if (schemaColumns.has("price_max")) assignments.push("  price_max = COALESCE(v.price_max, g.price_max)");
  if (schemaColumns.has("price_text")) {
    assignments.push("  price_text = COALESCE(NULLIF(v.price_text, ''), g.price_text)");
  }
  if (schemaColumns.has("price_type")) {
    assignments.push("  price_type = COALESCE(NULLIF(v.price_type, ''), g.price_type)");
  }
  if (schemaColumns.has("price_source_url")) {
    assignments.push(
      "  price_source_url = COALESCE(NULLIF(v.detail_url, ''), g.price_source_url)",
    );
  }
  if (schemaColumns.has("price_updated_at")) {
    assignments.push("  price_updated_at = NOW()");
  }
  if (schemaColumns.has("updated_at")) {
    assignments.push("  updated_at = NOW()");
  }

  const valueAliases = ["id", "price_min", "price_max", "price_text", "price_type", "detail_url"];
  const valuesClause = valueRows
    .map((row) => {
      return `  (${[
        sqlString(row.summary.id),
        row.priceMin,
        row.priceMax,
        sqlString(row.priceText),
        sqlString(PRICE_TYPE),
        sqlString(row.summary.detail_url),
      ].join(", ")})`;
    })
    .join(",\n");

  return `UPDATE ${DB_TABLE} AS g
SET
${assignments.join(",\n")}
FROM (
  VALUES
${valuesClause}
) AS v(${valueAliases.join(", ")})
WHERE g.id = v.id;
`;
}

function main(): void {
  const { inputPath, includeManualReview } = parseArgs(process.argv.slice(2));
  const schemaColumns = loadSchemaColumns();
  const optionalColumns = [
    "note",
    "confidence",
    "needs_check",
    "price_source",
    "price_scope",
    "last_price_checked_at",
  ];
  const requiredColumns = [
    "price_min",
    "price_max",
    "price_text",
    "price_type",
    "price_source_url",
  ];
  const missingColumns = [
    ...optionalColumns.filter((column) => !schemaColumns.has(column)),
    ...requiredColumns.filter((column) => !schemaColumns.has(column)),
  ].filter((column, index, array) => array.indexOf(column) === index);

  const summaries = loadSummaryRows(inputPath);
  const sqlRows = summaries.map((summary) => toSqlRow(summary, includeManualReview));
  const invalidRows = sqlRows
    .filter((row) => row.skipReason && row.skipReason !== "ignore_filter_only")
    .map((row) => ({
      id: row.summary.id,
      name: row.summary.name,
      reason: row.skipReason ?? "unknown",
    }));

  const generatedAt = new Date().toISOString();
  const header = `-- teescanner_price_course_summary.csv → ${DB_TABLE}
-- Generated: ${generatedAt}
-- Input: ${path.relative(ROOT, inputPath)}
-- Policy: bulk UPDATE via VALUES. accept_price only${includeManualReview ? " (+ manual_review via --include-manual-review)" : ""}.
-- Missing DB columns (not updated): ${missingColumns.length ? missingColumns.join(", ") : "none"}
-- Run manually in Supabase SQL Editor. Do not auto-execute.

`;

  const body = buildBulkSql(sqlRows, schemaColumns, missingColumns);
  fs.mkdirSync(path.dirname(SQL_OUT), { recursive: true });
  fs.writeFileSync(SQL_OUT, `${header}${body}`, "utf8");

  const previewHeaders = [
    "id",
    "name",
    "review_action",
    "overall_price_min",
    "overall_price_max",
    "price_text",
    "detail_url",
    "skip_reason",
  ];
  const previewRows = sqlRows.map((row) => [
    row.summary.id,
    row.summary.name,
    row.summary.review_action,
    row.summary.overall_price_min,
    row.summary.overall_price_max,
    row.skipReason ? "" : row.priceText,
    row.summary.detail_url,
    row.skipReason ?? "",
  ]);
  fs.writeFileSync(
    PREVIEW_OUT,
    `\uFEFF${rowsToCsv(previewHeaders, previewRows)}`,
    "utf8",
  );

  const report: ReportJson = {
    input: path.relative(ROOT, inputPath).replace(/\\/g, "/"),
    totalRows: summaries.length,
    acceptPriceRows: summaries.filter((row) => row.review_action === "accept_price").length,
    manualReviewRows: summaries.filter((row) => row.review_action === "manual_review").length,
    ignoredRows: summaries.filter((row) => row.review_action === "ignore_filter_only").length,
    rowsWithSql: sqlRows.filter((row) => !row.skipReason).length,
    rowsSkipped: sqlRows.filter((row) => row.skipReason).length,
    includeManualReview,
    missingColumns,
    invalidRows,
    generatedAt,
  };
  fs.writeFileSync(REPORT_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("");
  console.log("=== supabase_teescanner_price_update SQL ===");
  console.log(`Input             : ${inputPath}`);
  console.log(`Total rows        : ${report.totalRows}`);
  console.log(`Accept price rows : ${report.acceptPriceRows}`);
  console.log(`Manual review rows: ${report.manualReviewRows}`);
  console.log(`Rows with SQL     : ${report.rowsWithSql}`);
  console.log(`Rows skipped      : ${report.rowsSkipped}`);
  console.log(`Missing columns   : ${missingColumns.length ? missingColumns.join(", ") : "none"}`);
  console.log(`SQL file          : ${SQL_OUT}`);
  console.log(`Preview CSV       : ${PREVIEW_OUT}`);
  console.log(`Report JSON       : ${REPORT_OUT}`);
}

main();
