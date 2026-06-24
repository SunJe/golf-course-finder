import fs from "node:fs";
import path from "node:path";
import { rowsToCsv } from "./lib/csvUtils";
import { buildCourseSearchTerms } from "./lib/teescanner/courseEnrichment";
import { loadAllCourseRowsInCsvOrder } from "./lib/teescanner/targets";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_INPUT_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const OUTPUT_CSV = path.join(ROOT, "data/enrichment/teescanner_crawl_plan_audit.csv");
const OUTPUT_JSON = path.join(ROOT, "data/enrichment/teescanner_crawl_plan_audit.json");

type AuditRow = {
  row_index: string;
  id: string;
  name: string;
  change_name_to: string;
  primary_search_term: string;
  fallback_search_term: string;
  existing_price_min: string;
  existing_price_max: string;
  will_crawl: string;
  reason: string;
};

function parseArgs(argv: string[]): { inputCsv: string } {
  let inputCsv = DEFAULT_INPUT_CSV;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") {
      const value = argv[index + 1] ?? "";
      inputCsv = path.isAbsolute(value) ? value : path.join(ROOT, value);
      index += 1;
    }
  }
  return { inputCsv };
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(options.inputCsv)) {
    throw new Error(`Input CSV not found: ${options.inputCsv}`);
  }

  const courses = loadAllCourseRowsInCsvOrder(options.inputCsv);
  const auditRows: AuditRow[] = courses.map((course) => {
    const terms = buildCourseSearchTerms({
      name: course.name,
      changeNameTo: course.change_name_to,
    });
    const hasPrice =
      Boolean(course.price_min?.trim()) || Boolean(course.price_max?.trim());

    return {
      row_index: String(course.row_index ?? ""),
      id: course.id,
      name: course.name,
      change_name_to: course.change_name_to,
      primary_search_term: terms.primarySearchTerm,
      fallback_search_term: terms.fallbackSearchTerm,
      existing_price_min: course.price_min ?? "",
      existing_price_max: course.price_max ?? "",
      will_crawl: "yes",
      reason: hasPrice
        ? "included_in_csv_row_order_even_with_existing_price"
        : "included_in_csv_row_order",
    };
  });

  const headers = [
    "row_index",
    "id",
    "name",
    "change_name_to",
    "primary_search_term",
    "fallback_search_term",
    "existing_price_min",
    "existing_price_max",
    "will_crawl",
    "reason",
  ];

  fs.mkdirSync(path.dirname(OUTPUT_CSV), { recursive: true });
  fs.writeFileSync(
    OUTPUT_CSV,
    `\uFEFF${rowsToCsv(
      headers,
      auditRows.map((row) => headers.map((header) => row[header as keyof AuditRow] ?? "")),
    )}`,
    "utf8",
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    inputCsv: options.inputCsv,
    totalRows: auditRows.length,
    crawlOrder: "course_enrichment_edit.csv row order",
    priceMissingFilter: false,
    idSort: false,
    nameSort: false,
    withExistingPrice: auditRows.filter((row) => row.existing_price_min || row.existing_price_max)
      .length,
    withoutExistingPrice: auditRows.filter(
      (row) => !row.existing_price_min && !row.existing_price_max,
    ).length,
    sampleSearchTerms: auditRows.slice(0, 10).map((row) => ({
      row_index: row.row_index,
      name: row.name,
      primary_search_term: row.primary_search_term,
      fallback_search_term: row.fallback_search_term,
    })),
    geochangExample: auditRows.find((row) => row.name.includes("거창")),
  };

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(`Wrote ${auditRows.length} audit row(s).`);
  console.log(`CSV : ${OUTPUT_CSV}`);
  console.log(`JSON: ${OUTPUT_JSON}`);
}

main();
