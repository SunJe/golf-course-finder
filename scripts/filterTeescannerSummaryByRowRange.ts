import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { SUMMARY_HEADERS } from "./lib/teescanner/batchIo";
import { loadCourseEnrichmentRows } from "./lib/teescanner/courseEnrichment";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();

function parseArgs(argv: string[]): {
  startRow: number;
  endRow: number;
  excludeIds: Set<string>;
  inputPath: string;
  outputPath: string;
} {
  let startRow = 1;
  let endRow = Number.MAX_SAFE_INTEGER;
  const excludeIds = new Set<string>();
  let inputPath = path.join(ROOT, "data/enrichment/teescanner_price_course_summary.csv");
  let outputPath = path.join(ROOT, "data/enrichment/teescanner_price_upload_filtered.csv");

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--start-row") startRow = Number.parseInt(argv[++i] ?? "", 10);
    else if (arg === "--end-row") endRow = Number.parseInt(argv[++i] ?? "", 10);
    else if (arg === "--exclude-id") excludeIds.add(argv[++i] ?? "");
    else if (arg === "--input") {
      const value = argv[++i] ?? "";
      inputPath = path.isAbsolute(value) ? value : path.join(ROOT, value);
    } else if (arg === "--output") {
      const value = argv[++i] ?? "";
      outputPath = path.isAbsolute(value) ? value : path.join(ROOT, value);
    }
  }

  return { startRow, endRow, excludeIds, inputPath, outputPath };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const masterCsv = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
  const { rows: masterRows } = loadCourseEnrichmentRows(masterCsv);

  const targetIds = new Set(
    masterRows
      .filter(
        (row) =>
          row.rowIndex >= options.startRow &&
          row.rowIndex <= options.endRow &&
          !options.excludeIds.has(row.id),
      )
      .map((row) => row.id),
  );

  const { headers, rows } = parseCsv(fs.readFileSync(options.inputPath, "utf8"));
  const idIndex = headers.indexOf("id");
  const filtered = rows.filter((cells) => targetIds.has((cells[idIndex] ?? "").trim()));

  const body = rowsToCsv(
    [...SUMMARY_HEADERS],
    filtered.map((cells) =>
      SUMMARY_HEADERS.map((header) => {
        const index = headers.indexOf(header);
        return index >= 0 ? (cells[index] ?? "").trim() : "";
      }),
    ),
  );

  writeFileUtf8Bom(options.outputPath, body);
  console.log(
    `Wrote ${filtered.length} row(s) for rows ${options.startRow}-${options.endRow} → ${options.outputPath}`,
  );
}

main();
