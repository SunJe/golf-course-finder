import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { rowsToCsv } from "./lib/csvUtils";
import {
  BACKUP_DIR,
  TABLE_NAME,
  createSupabaseClientFromEnv,
} from "./lib/golfCoursesSupabaseUpload";

const PAGE_SIZE = 1000;

function collectHeaders(rows: Record<string, unknown>[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      keys.add(key);
    }
  }
  const sorted = [...keys].sort();
  const withoutId = sorted.filter((key) => key !== "id");
  return withoutId.length === sorted.length ? sorted : ["id", ...withoutId];
}

async function fetchAllRows(
  supabase: ReturnType<typeof createClient>,
): Promise<Record<string, unknown>[]> {
  const allRows: Record<string, unknown>[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Backup fetch failed at offset ${from}: ${error.message}`);
    }
    if (!data || data.length === 0) break;
    allRows.push(...(data as Record<string, unknown>[]));
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return allRows;
}

function formatCell(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    if (value.length === 0) return "{}";
    return `{${value.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(",")}}`;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

async function main(): Promise<void> {
  const { url, serviceRoleKey } = createSupabaseClientFromEnv();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("");
  console.log("=== Supabase golf_courses backup ===");
  console.log(`table: ${TABLE_NAME}`);

  const rows = await fetchAllRows(supabase);
  console.log(`fetched: ${rows.length} row(s)`);

  const headers = collectHeaders(rows);
  console.log(`columns: ${headers.length}`);

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(BACKUP_DIR, `golf_courses_backup_${stamp}.csv`);

  const csvRows = rows.map((row) =>
    headers.map((column) => formatCell(row[column])),
  );
  fs.writeFileSync(
    backupPath,
    `\uFEFF${rowsToCsv(headers, csvRows)}`,
    "utf8",
  );

  console.log(`backup written: ${backupPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
