import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { rowsToCsv } from "./lib/csvUtils";
import {
  FAILED_CSV_PATH,
  REPORT_JSON_PATH,
  TABLE_NAME,
  UPLOAD_CSV_COLUMNS,
  createSupabaseClientFromEnv,
  getExcludedCsvColumns,
  loadSchemaColumns,
  loadUploadCsvRows,
  normalizeRowForSupabase,
} from "./lib/golfCoursesSupabaseUpload";

interface CliOptions {
  apply: boolean;
  overwriteAll: boolean;
  batchSize: number;
}

interface ApplyReport {
  mode: "dry-run" | "apply";
  overwriteAll: boolean;
  batchSize: number;
  uploadCsvRowCount: number;
  targetTable: string;
  upsertRowCount: number;
  nullOverwriteCounts: {
    price_min: number;
    price_max: number;
    price_text: number;
  };
  latLngNullRowCount: number;
  excludedColumns: string[];
  expectedFailedRowCount: number;
  applied: boolean;
  insertedCount: number;
  updatedCount: number;
  failedCount: number;
  verification: {
    supabaseRowCount: number | null;
    sampleComparisons: Array<{
      id: string;
      csvName: string;
      dbName: string | null;
      match: boolean;
    }>;
    priceNullCounts: {
      price_min: number;
      price_max: number;
      price_text: number;
    };
  } | null;
  generatedAt: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    apply: false,
    overwriteAll: false,
    batchSize: 100,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--apply") options.apply = true;
    else if (arg === "--overwrite-all") options.overwriteAll = true;
    else if (arg === "--batch-size" && argv[index + 1]) {
      const size = Number.parseInt(argv[index + 1], 10);
      if (Number.isFinite(size) && size > 0) {
        options.batchSize = Math.min(size, 100);
      }
      index += 1;
    }
  }

  return options;
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

async function fetchExistingIds(
  supabase: ReturnType<typeof createClient>,
  ids: string[],
): Promise<Set<string>> {
  const existing = new Set<string>();
  const idChunks = chunk(ids, 100);
  for (const idBatch of idChunks) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("id")
      .in("id", idBatch);
    if (error) {
      throw new Error(`Failed to fetch existing ids: ${error.message}`);
    }
    for (const row of data ?? []) {
      existing.add(row.id as string);
    }
  }
  return existing;
}

async function verifyAfterApply(
  supabase: ReturnType<typeof createClient>,
  csvRows: Record<string, string>[],
): Promise<ApplyReport["verification"]> {
  const { count, error: countError } = await supabase
    .from(TABLE_NAME)
    .select("*", { count: "exact", head: true });
  if (countError) {
    throw new Error(`Post-apply count failed: ${countError.message}`);
  }

  const sampleIds = csvRows.slice(0, 5).map((row) => row.id).filter(Boolean);
  const { data: sampleData, error: sampleError } = await supabase
    .from(TABLE_NAME)
    .select("id,name,price_min,price_max,price_text")
    .in("id", sampleIds);
  if (sampleError) {
    throw new Error(`Post-apply sample fetch failed: ${sampleError.message}`);
  }

  const dbById = new Map(
    (sampleData ?? []).map((row) => [row.id as string, row]),
  );
  const sampleComparisons = sampleIds.map((id) => {
    const csvRow = csvRows.find((row) => row.id === id);
    const dbRow = dbById.get(id);
    const csvName = csvRow?.name ?? "";
    const dbName = (dbRow?.name as string | undefined) ?? null;
    return {
      id,
      csvName,
      dbName,
      match: csvName === dbName,
    };
  });

  const { data: priceRows, error: priceError } = await supabase
    .from(TABLE_NAME)
    .select("price_min,price_max,price_text")
    .in(
      "id",
      csvRows.map((row) => row.id).filter(Boolean),
    );
  if (priceError) {
    throw new Error(`Post-apply price null check failed: ${priceError.message}`);
  }

  let priceMinNull = 0;
  let priceMaxNull = 0;
  let priceTextNull = 0;
  for (const row of priceRows ?? []) {
    if (row.price_min == null) priceMinNull += 1;
    if (row.price_max == null) priceMaxNull += 1;
    if (row.price_text == null || row.price_text === "") priceTextNull += 1;
  }

  return {
    supabaseRowCount: count ?? 0,
    sampleComparisons,
    priceNullCounts: {
      price_min: priceMinNull,
      price_max: priceMaxNull,
      price_text: priceTextNull,
    },
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const schemaColumns = loadSchemaColumns();
  const { headers, rows: csvRows } = loadUploadCsvRows();
  const excludedColumns = getExcludedCsvColumns(headers, schemaColumns);

  const normalized: Array<{
    payload: Record<string, unknown>;
    sourceRow: Record<string, string>;
    nullOverwrites: {
      price_min: boolean;
      price_max: boolean;
      price_text: boolean;
    };
    latLngNull: boolean;
    errors: string[];
  }> = [];

  const nullOverwriteCounts = { price_min: 0, price_max: 0, price_text: 0 };
  let latLngNullRowCount = 0;
  const failedRows: Record<string, string>[] = [];

  for (const row of csvRows) {
    const result = normalizeRowForSupabase(row, {
      overwriteAll: options.overwriteAll,
      schemaColumns,
    });
    if (result.errors.length > 0 || !result.payload.id) {
      failedRows.push({ ...row, _error: result.errors.join("; ") });
      continue;
    }
    if (result.latLngNull) latLngNullRowCount += 1;
    if (result.nullOverwrites.price_min) nullOverwriteCounts.price_min += 1;
    if (result.nullOverwrites.price_max) nullOverwriteCounts.price_max += 1;
    if (result.nullOverwrites.price_text) nullOverwriteCounts.price_text += 1;
    normalized.push({
      payload: result.payload,
      sourceRow: row,
      nullOverwrites: result.nullOverwrites,
      latLngNull: result.latLngNull,
      errors: result.errors,
    });
  }

  const report: ApplyReport = {
    mode: options.apply ? "apply" : "dry-run",
    overwriteAll: options.overwriteAll,
    batchSize: options.batchSize,
    uploadCsvRowCount: csvRows.length,
    targetTable: TABLE_NAME,
    upsertRowCount: normalized.length,
    nullOverwriteCounts,
    latLngNullRowCount,
    excludedColumns,
    expectedFailedRowCount: failedRows.length,
    applied: false,
    insertedCount: 0,
    updatedCount: 0,
    failedCount: failedRows.length,
    verification: null,
    generatedAt: new Date().toISOString(),
  };

  console.log("");
  console.log("=== Golf courses Supabase upload apply ===");
  console.log(`1. upload CSV row count     : ${report.uploadCsvRowCount}`);
  console.log(`2. target table             : ${report.targetTable}`);
  console.log(`3. overwriteAll             : ${report.overwriteAll}`);
  console.log(`4. upsert row count         : ${report.upsertRowCount}`);
  console.log(`5. null overwrite price_min : ${report.nullOverwriteCounts.price_min}`);
  console.log(`6. null overwrite price_max : ${report.nullOverwriteCounts.price_max}`);
  console.log(`7. null overwrite price_text: ${report.nullOverwriteCounts.price_text}`);
  console.log(`8. lat/lng null row count   : ${report.latLngNullRowCount}`);
  console.log(`9. excluded columns         : ${excludedColumns.join(", ") || "(none)"}`);
  console.log(`10. expected failed rows     : ${report.expectedFailedRowCount}`);

  const aliasSample = normalized
    .filter((item) => item.payload.seo_aliases != null)
    .slice(0, 3);
  if (aliasSample.length > 0) {
    console.log("");
    console.log("seo_aliases array conversion sample:");
    for (const item of aliasSample) {
      const raw = item.sourceRow.seo_aliases ?? "";
      console.log(
        `  ${item.payload.id} | csv="${raw.slice(0, 60)}${raw.length > 60 ? "…" : ""}" | db=${JSON.stringify(item.payload.seo_aliases)}`,
      );
    }
  }

  if (latLngNullRowCount > 0 && options.overwriteAll) {
    console.log("");
    console.error(
      `Refusing to apply: ${latLngNullRowCount} row(s) would null latitude/longitude (NOT NULL columns).`,
    );
    writeOutputs(report, failedRows);
    process.exitCode = 1;
    return;
  }

  if (!options.apply) {
    console.log("");
    console.log("Dry-run only. Re-run with --apply --overwrite-all to write to Supabase.");
    writeOutputs(report, failedRows);
    return;
  }

  const { url, serviceRoleKey } = createSupabaseClientFromEnv();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const allIds = normalized.map((item) => item.payload.id as string);
  const existingIds = await fetchExistingIds(supabase, allIds);

  let applyFailed = 0;
  const applyFailedRows: Record<string, string>[] = [...failedRows];

  for (const batch of chunk(normalized, options.batchSize)) {
    const payloads = batch.map((item) => item.payload);
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(payloads, { onConflict: "id" });

    if (error) {
      for (const item of batch) {
        const { error: rowError } = await supabase
          .from(TABLE_NAME)
          .upsert(item.payload, { onConflict: "id" });
        if (rowError) {
          applyFailed += 1;
          applyFailedRows.push({
            ...item.sourceRow,
            _error: rowError.message,
          });
        } else if (existingIds.has(item.payload.id as string)) {
          report.updatedCount += 1;
        } else {
          report.insertedCount += 1;
          existingIds.add(item.payload.id as string);
        }
      }
    } else {
      for (const item of batch) {
        if (existingIds.has(item.payload.id as string)) {
          report.updatedCount += 1;
        } else {
          report.insertedCount += 1;
          existingIds.add(item.payload.id as string);
        }
      }
    }
  }

  report.applied = true;
  report.failedCount = applyFailedRows.length;
  report.verification = await verifyAfterApply(supabase, csvRows);

  console.log("");
  console.log(`Inserted: ${report.insertedCount}`);
  console.log(`Updated:  ${report.updatedCount}`);
  console.log(`Failed:   ${report.failedCount}`);
  if (report.verification) {
    console.log(`Post-apply Supabase row count: ${report.verification.supabaseRowCount}`);
    console.log("Sample comparisons:");
    for (const sample of report.verification.sampleComparisons) {
      console.log(
        `  ${sample.id} | csv="${sample.csvName}" | db="${sample.dbName ?? ""}" | match=${sample.match}`,
      );
    }
    console.log(
      `Price null counts — min: ${report.verification.priceNullCounts.price_min}, max: ${report.verification.priceNullCounts.price_max}, text: ${report.verification.priceNullCounts.price_text}`,
    );
  }

  writeOutputs(report, applyFailedRows);
}

function writeOutputs(report: ApplyReport, failedRows: Record<string, string>[]): void {
  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true });
  fs.writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  if (failedRows.length > 0) {
    const headers = [...UPLOAD_CSV_COLUMNS, "_error"];
    const rows = failedRows.map((row) =>
      headers.map((header) => row[header] ?? ""),
    );
    fs.writeFileSync(
      FAILED_CSV_PATH,
      `\uFEFF${rowsToCsv(headers, rows)}`,
      "utf8",
    );
  } else if (fs.existsSync(FAILED_CSV_PATH)) {
    fs.unlinkSync(FAILED_CSV_PATH);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
