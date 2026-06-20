import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_ENRICHMENT_EDIT_HEADERS,
  type CourseEnrichmentEditRow,
} from "../lib/enrichment/courseEnrichmentEdit";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const EDIT_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const SQL_OUT = path.join(ROOT, "data/enrichment/course_price_update.sql");
const SQL_PREVIEW_OUT = path.join(
  ROOT,
  "data/enrichment/course_price_update_preview.sql",
);

const DB_TABLE = "public.golf_courses";
const PLAIN_INTEGER = /^(\d+)$/;

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function parsePriceInteger(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, "");
  if (!trimmed) return null;
  if (!PLAIN_INTEGER.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function hasAnyPrice(row: CourseEnrichmentEditRow): boolean {
  return Boolean(
    row.price_text.trim() || row.price_min.trim() || row.price_max.trim(),
  );
}

function normalizePriceType(value: string): string {
  const trimmed = value.trim();
  if (trimmed) return trimmed;
  return "unknown";
}

function loadEditRows(): CourseEnrichmentEditRow[] {
  if (!fs.existsSync(EDIT_CSV)) {
    throw new Error(`Edit CSV not found: ${EDIT_CSV}`);
  }
  const encoding = readCsvWithEncodingGuess(EDIT_CSV);
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

interface PriceSqlRow {
  id: string;
  sql: string;
  priceMin: number | null;
  priceMax: number | null;
  priceType: string;
}

function buildPriceUpdate(row: CourseEnrichmentEditRow): {
  update: PriceSqlRow | null;
  invalidReason?: string;
} {
  if (!hasAnyPrice(row)) {
    return { update: null };
  }

  const priceMin = parsePriceInteger(row.price_min);
  const priceMax = parsePriceInteger(row.price_max);

  if (row.price_min.trim() && priceMin == null) {
    return { update: null, invalidReason: `invalid price_min "${row.price_min}"` };
  }
  if (row.price_max.trim() && priceMax == null) {
    return { update: null, invalidReason: `invalid price_max "${row.price_max}"` };
  }

  const assignments: string[] = [];
  if (row.price_text.trim()) {
    assignments.push(`  price_text = '${escapeSqlLiteral(row.price_text.trim())}'`);
  }
  if (priceMin != null) {
    assignments.push(`  price_min = ${priceMin}`);
  }
  if (priceMax != null) {
    assignments.push(`  price_max = ${priceMax}`);
  }

  const priceType = normalizePriceType(row.price_type);
  assignments.push(`  price_type = '${escapeSqlLiteral(priceType)}'`);

  const sourceUrl = row.source_url.trim();
  if (sourceUrl) {
    assignments.push(`  price_source_url = '${escapeSqlLiteral(sourceUrl)}'`);
  }

  assignments.push("  price_updated_at = now()");

  const warnings: string[] = [];
  if (row.needs_check === "y") warnings.push("needs_check: y");
  if (row.confidence === "low") warnings.push("confidence: low");

  const comment = [
    `-- ${warnings.join(" / ") || "ok"}`,
    `-- name: ${row.name}`,
  ].join("\n");

  const sql = `${comment}
update ${DB_TABLE}
set
${assignments.join(",\n")}
where id = '${escapeSqlLiteral(row.id)}';`;

  return {
    update: {
      id: row.id,
      sql,
      priceMin,
      priceMax,
      priceType,
    },
  };
}

function writeSqlFile(filePath: string, title: string, updates: PriceSqlRow[]): void {
  const header = `-- ${title}
-- Generated: ${new Date().toISOString()}
-- Table: ${DB_TABLE}
-- Fields: price_text, price_min, price_max, price_type, price_source_url, price_updated_at
-- Excluded: booking_url, difficulty, avg_score
-- Run manually in Supabase SQL Editor. Do not auto-execute.

`;
  const body = updates.map((update) => update.sql).join("\n\n");
  fs.writeFileSync(filePath, `${header}${body}\n`, "utf8");
}

function main(): void {
  const rows = loadEditRows();
  const invalidRows: Array<{ id: string; name: string; reason: string }> = [];
  const updates: PriceSqlRow[] = [];

  for (const row of rows) {
    const result = buildPriceUpdate(row);
    if (result.invalidReason) {
      invalidRows.push({
        id: row.id,
        name: row.name,
        reason: result.invalidReason,
      });
      continue;
    }
    if (result.update) updates.push(result.update);
  }

  const preview = updates.slice(0, 20);
  writeSqlFile(SQL_PREVIEW_OUT, "Preview price update SQL (max 20 rows)", preview);
  writeSqlFile(SQL_OUT, "Full price update SQL", updates);

  const typeCounts = new Map<string, number>();
  let minOfMins = Infinity;
  let maxOfMins = -Infinity;
  let minOfMaxs = Infinity;
  let maxOfMaxs = -Infinity;

  for (const update of updates) {
    typeCounts.set(update.priceType, (typeCounts.get(update.priceType) ?? 0) + 1);
    if (update.priceMin != null) {
      minOfMins = Math.min(minOfMins, update.priceMin);
      maxOfMins = Math.max(maxOfMins, update.priceMin);
    }
    if (update.priceMax != null) {
      minOfMaxs = Math.min(minOfMaxs, update.priceMax);
      maxOfMaxs = Math.max(maxOfMaxs, update.priceMax);
    }
  }

  console.log("");
  console.log("=== course_price_update SQL ===");
  console.log(`Source CSV     : ${EDIT_CSV}`);
  console.log(`Price rows     : ${updates.length}`);
  console.log(`Preview SQL    : ${preview.length} updates → ${SQL_PREVIEW_OUT}`);
  console.log(`Full SQL       : ${updates.length} updates → ${SQL_OUT}`);
  console.log(`Invalid rows   : ${invalidRows.length}`);
  console.log(`booking_url    : excluded`);

  if (invalidRows.length > 0) {
    console.log("");
    console.log("Invalid price rows:");
    for (const item of invalidRows.slice(0, 10)) {
      console.warn(`  [warn] ${item.id} ${item.name}: ${item.reason}`);
    }
    if (invalidRows.length > 10) {
      console.warn(`  [warn] ... and ${invalidRows.length - 10} more`);
    }
  }

  console.log("");
  console.log("price_type distribution:");
  for (const [type, count] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }

  if (updates.length > 0) {
    console.log("");
    console.log(
      `price_min range: ${minOfMins === Infinity ? "n/a" : minOfMins.toLocaleString()} ~ ${maxOfMins === -Infinity ? "n/a" : maxOfMins.toLocaleString()}`,
    );
    console.log(
      `price_max range: ${minOfMaxs === Infinity ? "n/a" : minOfMaxs.toLocaleString()} ~ ${maxOfMaxs === -Infinity ? "n/a" : maxOfMaxs.toLocaleString()}`,
    );
  }
}

main();
