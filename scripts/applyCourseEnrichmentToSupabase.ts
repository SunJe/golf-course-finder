import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { loadEnvLocal } from "./lib/envUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_ENRICHMENT_EDIT_HEADERS,
  type CourseEnrichmentEditRow,
} from "../lib/enrichment/courseEnrichmentEdit";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_INPUT = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");

interface CliOptions {
  confirm: boolean;
  dryRun: boolean;
  inputPath: string;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    confirm: false,
    dryRun: true,
    inputPath: DEFAULT_INPUT,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--confirm") {
      options.confirm = true;
      options.dryRun = false;
    } else if (arg === "--input" && argv[index + 1]) {
      const value = argv[index + 1];
      options.inputPath = path.isAbsolute(value) ? value : path.join(ROOT, value);
      index += 1;
    }
  }

  return options;
}

function loadRows(inputPath: string): CourseEnrichmentEditRow[] {
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

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.confirm) {
    console.error("Refusing to apply without --confirm.");
    console.error("Generate SQL first and apply via Supabase SQL Editor.");
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync(options.inputPath)) {
    throw new Error(`Input CSV not found: ${options.inputPath}`);
  }

  loadEnvLocal(ROOT);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const rows = loadRows(options.inputPath).filter((row) => row.id.trim());
  console.log(`Prepared ${rows.length} enrichment row(s) from ${options.inputPath}`);
  console.log("Direct Supabase apply is disabled by default policy.");
  console.log("Use data/enrichment/supabase_course_enrichment_update.sql in SQL Editor instead.");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("[apply:course-enrichment-supabase] Failed:", error);
  process.exit(1);
});
