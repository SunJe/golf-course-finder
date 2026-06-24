import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { parseCsv } from "./lib/csvUtils";
import { loadEnvLocal } from "./lib/envUtils";
import {
  DEFAULT_SUMMARY_CSV,
  SUMMARY_HEADERS,
  type SummaryRow,
} from "./lib/teescanner/batchIo";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const PRICE_TYPE = "reservation_reference";

interface CliOptions {
  confirm: boolean;
  acceptOnly: boolean;
  includeManualReview: boolean;
  inputPath: string;
  dryRun: boolean;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value === "") return fallback;
  const normalized = value.toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return fallback;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    confirm: false,
    acceptOnly: true,
    includeManualReview: false,
    inputPath: DEFAULT_SUMMARY_CSV,
    dryRun: true,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--confirm") options.confirm = true;
    else if (arg === "--accept-only") options.acceptOnly = true;
    else if (arg === "--include-manual-review") options.includeManualReview = true;
    else if (arg === "--input" && argv[index + 1]) {
      const value = argv[index + 1];
      options.inputPath = path.isAbsolute(value) ? value : path.join(ROOT, value);
      index += 1;
    } else if (arg === "--apply") {
      options.dryRun = false;
    }
  }

  if (options.confirm) options.dryRun = false;
  return options;
}

function loadSummaryRows(inputPath: string): SummaryRow[] {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input CSV not found: ${inputPath}`);
  }
  const { headers, rows } = parseCsv(fs.readFileSync(inputPath, "utf8"));
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

function isEligible(summary: SummaryRow, options: CliOptions): boolean {
  if (summary.review_action === "ignore_filter_only") return false;
  if (summary.review_action === "accept_price") return true;
  if (options.includeManualReview && summary.review_action === "manual_review") {
    return true;
  }
  if (options.acceptOnly) return false;
  return summary.review_action === "manual_review";
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(options.inputPath)) {
    console.error(`Input CSV not found: ${options.inputPath}`);
    process.exitCode = 1;
    return;
  }

  if (!options.confirm) {
    console.error("Refusing to apply without --confirm.");
    console.error("Default mode is dry-run preview only.");
    options.dryRun = true;
  }

  const summaries = loadSummaryRows(options.inputPath);
  const targets = summaries.filter((summary) => isEligible(summary, options));

  console.log("");
  console.log("=== TeeScanner price Supabase apply ===");
  console.log(`mode           : ${options.dryRun ? "dry-run" : "apply"}`);
  console.log(`acceptOnly     : ${options.acceptOnly}`);
  console.log(`eligible rows  : ${targets.length}`);

  for (const summary of targets.slice(0, 20)) {
    const priceMin = Number.parseInt(summary.overall_price_min, 10);
    const priceMax = Number.parseInt(
      summary.overall_price_max || summary.overall_price_min,
      10,
    );
    console.log(
      `  ${summary.id} | ${summary.name} | ${summary.review_action} | ${priceMin}~${priceMax}`,
    );
  }
  if (targets.length > 20) {
    console.log(`  ... and ${targets.length - 20} more`);
  }

  if (options.dryRun) {
    console.log("");
    console.log("Dry-run only. Re-run with --confirm --apply to write to Supabase.");
    return;
  }

  const env = loadEnvLocal(ROOT);
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let updated = 0;
  for (const summary of targets) {
    const priceMin = Number.parseInt(summary.overall_price_min, 10);
    const priceMax = Number.parseInt(
      summary.overall_price_max || summary.overall_price_min,
      10,
    );
    if (!Number.isFinite(priceMin) || priceMin <= 0) continue;

    const resolvedMax =
      Number.isFinite(priceMax) && priceMax >= priceMin ? priceMax : priceMin;

    const payload = {
      price_min: priceMin,
      price_max: resolvedMax,
      price_text: buildPriceText(priceMin, resolvedMax),
      price_type: PRICE_TYPE,
      price_source_url: summary.detail_url || null,
      price_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("golf_courses")
      .update(payload)
      .eq("id", summary.id);

    if (error) {
      throw new Error(`Update failed for ${summary.id}: ${error.message}`);
    }
    updated += 1;
  }

  console.log(`Updated ${updated} row(s) in Supabase.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
