import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const EXPECTED_ROWS = 532;
const BUILDER = path.join(ROOT, "scripts/buildGolfCourseFullSetCsv.ts");
const TSX_CLI = path.join(ROOT, "node_modules/tsx/dist/cli.mjs");
const TRACKED_FULL_SET = path.join(
  ROOT,
  "data/enrichment/golf_courses_full_set.csv",
);
const TRACKED_UPLOAD = path.join(
  ROOT,
  "data/enrichment/golf_courses_supabase_upload.csv",
);
const TRACKED_INPUTS = [
  "data/enrichment/course_enrichment_edit.csv",
  "data/enrichment/course_links.csv",
  "data/golf_courses_import_geocoded_final.csv",
  "data/golf_courses_import.csv",
] as const;

const RUNTIME_FIELDS = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "latitude",
  "longitude",
  "course_type",
  "tags",
  "phone",
  "homepage_url",
  "hole_count",
  "difficulty",
  "price_min",
  "price_max",
  "price_text",
  "price_type",
  "change_name_to",
  "seo_aliases",
  "search_keywords",
] as const;

type CsvRecord = Record<string, string>;

function fail(message: string): never {
  throw new Error(`[golf-full-set-reproducibility] ${message}`);
}

function readRecords(filePath: string): CsvRecord[] {
  const { headers, rows } = parseCsv(readCsvWithEncodingGuess(filePath).content);
  return rows.map((cells) =>
    Object.fromEntries(
      headers.map((header, index) => [header, (cells[index] ?? "").trim()]),
    ),
  );
}

function digest(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function prepareInputRoot(inputRoot: string): void {
  fs.cpSync(path.join(ROOT, "scripts"), path.join(inputRoot, "scripts"), {
    recursive: true,
  });
  fs.cpSync(path.join(ROOT, "lib"), path.join(inputRoot, "lib"), {
    recursive: true,
  });
  for (const relativePath of TRACKED_INPUTS) {
    const source = path.join(ROOT, relativePath);
    const destination = path.join(inputRoot, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }
}

function runBuild(
  inputRoot: string,
  outputDir: string,
): { fullSet: string; upload: string } {
  fs.mkdirSync(outputDir, { recursive: true });
  const fullSet = path.join(outputDir, "golf_courses_full_set.csv");
  const upload = path.join(outputDir, "golf_courses_supabase_upload.csv");
  const isolatedBuilder = path.join(
    inputRoot,
    "scripts/buildGolfCourseFullSetCsv.ts",
  );
  const result = spawnSync(process.execPath, [TSX_CLI, isolatedBuilder], {
    cwd: inputRoot,
    env: {
      ...process.env,
      GOLF_FULL_SET_OUTPUT_PATH: fullSet,
      GOLF_SUPABASE_UPLOAD_OUTPUT_PATH: upload,
    },
    encoding: "utf8",
  });
  if (result.status !== 0) {
    fail(
      `builder failed (${result.status ?? "no status"})\n${result.stdout}\n${result.stderr}`,
    );
  }
  return { fullSet, upload };
}

function assertRows(filePath: string): CsvRecord[] {
  const rows = readRecords(filePath);
  if (rows.length !== EXPECTED_ROWS) {
    fail(`${path.basename(filePath)} has ${rows.length} rows; expected ${EXPECTED_ROWS}`);
  }
  const ids = rows.map((row) => row.id).filter(Boolean);
  const duplicateCount = ids.length - new Set(ids).size;
  if (ids.length !== EXPECTED_ROWS || duplicateCount !== 0) {
    fail(
      `${path.basename(filePath)} id check failed: ids=${ids.length}, duplicates=${duplicateCount}`,
    );
  }
  return rows;
}

function assertRuntimeParity(generatedPath: string): void {
  const expected = assertRows(TRACKED_UPLOAD);
  const generated = assertRows(generatedPath);
  const generatedById = new Map(generated.map((row) => [row.id, row]));
  const mismatches: string[] = [];

  for (const expectedRow of expected) {
    const actualRow = generatedById.get(expectedRow.id);
    if (!actualRow) {
      mismatches.push(`${expectedRow.id}: missing`);
      continue;
    }
    for (const field of RUNTIME_FIELDS) {
      if ((expectedRow[field] ?? "") !== (actualRow[field] ?? "")) {
        mismatches.push(`${expectedRow.id}.${field}`);
      }
    }
  }

  if (mismatches.length > 0) {
    fail(
      `runtime parity failed at ${mismatches.length} field(s): ${mismatches
        .slice(0, 20)
        .join(", ")}`,
    );
  }
}

function assertSame(label: string, left: string, right: string): void {
  const leftHash = digest(left);
  const rightHash = digest(right);
  if (leftHash !== rightHash) {
    fail(`${label} differs: ${leftHash} != ${rightHash}`);
  }
}

function main(): void {
  const builderSource = fs.readFileSync(BUILDER, "utf8");
  if (builderSource.includes("teescanner_price_course_summary.csv")) {
    fail("builder still references the ignored TeeScanner summary");
  }
  if (/new Date\s*\(/.test(builderSource)) {
    fail("builder contains a time-dependent new Date() fallback");
  }

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "golfmap-full-set-repro-"));
  const inputRoot = path.join(tempRoot, "input");
  const ignoredSummary = path.join(
    inputRoot,
    "data/enrichment/teescanner_price_course_summary.csv",
  );

  try {
    prepareInputRoot(inputRoot);
    const first = runBuild(inputRoot, path.join(tempRoot, "without-summary-1"));
    const second = runBuild(inputRoot, path.join(tempRoot, "without-summary-2"));

    assertRows(first.fullSet);
    assertRuntimeParity(first.upload);
    assertSame("tracked full-set parity", TRACKED_FULL_SET, first.fullSet);
    assertSame("tracked upload parity", TRACKED_UPLOAD, first.upload);
    assertSame("second full-set build", first.fullSet, second.fullSet);
    assertSame("second upload build", first.upload, second.upload);

    fs.writeFileSync(
      ignoredSummary,
      "id,overall_price_min,overall_price_max,review_action\n" +
        "gc-9b37cfc9caa8,1,999999,accept_price\n",
      "utf8",
    );
    const withSummary = runBuild(inputRoot, path.join(tempRoot, "with-summary"));
    assertSame("summary-present full-set build", first.fullSet, withSummary.fullSet);
    assertSame("summary-present upload build", first.upload, withSummary.upload);

    console.log("Golf full-set reproducibility check PASSED");
    console.log(`rows: ${EXPECTED_ROWS}, duplicate ids: 0`);
    console.log(`full-set sha256: ${digest(first.fullSet)}`);
    console.log(`upload sha256: ${digest(first.upload)}`);
    console.log("tracked-artifact parity: exact");
    console.log("runtime-field parity: exact");
    console.log("ignored-summary influence: none");
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

main();
