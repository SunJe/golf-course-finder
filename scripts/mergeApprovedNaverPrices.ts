import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_PRICE_OVERRIDE_HEADERS,
  coursePriceOverrideToCells,
  rowCellsToCoursePriceOverride,
  type CoursePriceOverrideRow,
} from "./lib/coursePriceOverrides";
import {
  resolveEnrichmentPath,
  verifyUtf8Bom,
  warnMojibakeInCsvFields,
} from "./lib/enrichmentCsvUtils";
import {
  loadNaverPriceReviewCsv,
  resolveApprovedPriceFields,
} from "./lib/naverPriceReviewMerge";
import { normalizeCsvHeader } from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const REVIEW_CSV = resolveEnrichmentPath(
  ROOT,
  "data/enrichment/naver_price_review.csv",
);
const OVERRIDES_CSV = resolveEnrichmentPath(
  ROOT,
  "data/enrichment/course_price_overrides.csv",
);

interface CliOptions {
  overwrite: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  return { overwrite: argv.includes("--overwrite") };
}

function loadExistingOverrides(): Map<string, CoursePriceOverrideRow> {
  const map = new Map<string, CoursePriceOverrideRow>();
  if (!fs.existsSync(OVERRIDES_CSV)) return map;

  const encoding = readCsvWithEncodingGuess(OVERRIDES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));

  for (const cells of parsed.rows) {
    const row = rowCellsToCoursePriceOverride(cells, headers);
    if (!row.id) continue;
    map.set(row.id, row);
  }

  return map;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const reviewRows = loadNaverPriceReviewCsv(REVIEW_CSV);
  const overridesById = loadExistingOverrides();

  let merged = 0;
  let skippedExisting = 0;
  let skippedNoData = 0;

  for (const review of reviewRows) {
    const approved = resolveApprovedPriceFields(review);
    if (!approved) continue;

    const existing = overridesById.get(review.id);
    if (existing && !options.overwrite) {
      const hasValues =
        existing.price_text.trim() ||
        existing.price_min.trim() ||
        existing.price_max.trim();
      if (hasValues) {
        skippedExisting += 1;
        continue;
      }
    }

    if (!approved.price_text && !approved.price_min && !approved.price_max) {
      skippedNoData += 1;
      continue;
    }

    const row: CoursePriceOverrideRow = {
      id: review.id,
      name: review.name,
      price_text: approved.price_text,
      price_min: approved.price_min,
      price_max: approved.price_max,
      price_type: approved.price_type,
      source_url: approved.source_url,
      source: "naver",
      checked_at: new Date().toISOString(),
      note: approved.note,
    };

    overridesById.set(review.id, row);
    merged += 1;

    warnMojibakeInCsvFields(
      [row.name, row.price_text, row.note],
      review.id,
    );
  }

  const outputRows = [...overridesById.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "ko"),
  );

  const csvBody = rowsToCsv(
    [...COURSE_PRICE_OVERRIDE_HEADERS],
    outputRows.map(coursePriceOverrideToCells),
    { crlf: true },
  );
  writeFileUtf8Bom(OVERRIDES_CSV, csvBody);

  const hasBom = verifyUtf8Bom(OVERRIDES_CSV);

  console.log("");
  console.log("=== Merge approved Naver prices → course_price_overrides.csv ===");
  console.log(`Review rows read     : ${reviewRows.length}`);
  console.log(`Price rows merged    : ${merged}`);
  console.log(`Skip (existing)      : ${skippedExisting}`);
  console.log(`Skip (no price data) : ${skippedNoData}`);
  console.log(`Total override rows  : ${outputRows.length}`);
  console.log(`Overwrite mode       : ${options.overwrite ? "yes" : "no"}`);
  console.log(`Output               : ${OVERRIDES_CSV}`);
  console.log(`Encoding             : UTF-8 with BOM (${hasBom ? "verified" : "missing"})`);
  console.log(`Line endings         : CRLF`);
  console.log(`DB reflect           : not performed (overrides file only)`);
}

main();
