import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  COURSE_LINKS_HEADERS,
  courseLinksToCells,
  normalizeCsvHeader,
  rowCellsToCourseLinks,
  type CourseLinksRow,
} from "./lib/courseLinksEnrichment";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const FINAL_IMPORT_CSV = path.join(
  ROOT,
  "data/golf_courses_import_geocoded_final.csv",
);
const ENRICHMENT_CSV = path.join(ROOT, "data/enrichment/course_links.csv");

function loadFinalImportCourses(): { id: string; name: string }[] {
  if (!fs.existsSync(FINAL_IMPORT_CSV)) {
    throw new Error(`Final import CSV not found: ${FINAL_IMPORT_CSV}`);
  }

  const encoding = readCsvWithEncodingGuess(FINAL_IMPORT_CSV);
  const parsed = parseCsv(encoding.content);
  const idIndex = parsed.headers.findIndex((h) => normalizeCsvHeader(h) === "id");
  const nameIndex = parsed.headers.findIndex(
    (h) => normalizeCsvHeader(h) === "name",
  );

  if (idIndex < 0 || nameIndex < 0) {
    throw new Error("Final import CSV must include id and name columns.");
  }

  const courses: { id: string; name: string }[] = [];
  for (const row of parsed.rows) {
    const id = row[idIndex]?.trim() ?? "";
    const name = row[nameIndex]?.trim() ?? "";
    if (!id) continue;
    courses.push({ id, name });
  }

  return courses;
}

function loadExistingEnrichment(): Map<string, CourseLinksRow> {
  const map = new Map<string, CourseLinksRow>();
  if (!fs.existsSync(ENRICHMENT_CSV)) return map;

  const encoding = readCsvWithEncodingGuess(ENRICHMENT_CSV);
  const parsed = parseCsv(encoding.content);

  for (const cells of parsed.rows) {
    const row = rowCellsToCourseLinks(cells);
    if (!row.id) continue;
    map.set(row.id, row);
  }

  return map;
}

function main(): void {
  const importCourses = loadFinalImportCourses();
  const existing = loadExistingEnrichment();
  const importIdSet = new Set(importCourses.map((course) => course.id));

  let preservedValueRows = 0;
  let newlyAddedRows = 0;

  for (const [id, row] of existing) {
    if (!importIdSet.has(id)) {
      console.warn(
        `[warn] Existing enrichment id "${id}" not found in final import CSV — row will be omitted.`,
      );
    }
  }

  const outputRows: CourseLinksRow[] = importCourses.map(({ id, name }) => {
    const prev = existing.get(id);
    if (prev) {
      const hasValues =
        prev.homepage_url ||
        prev.booking_url ||
        prev.phone ||
        prev.source_url ||
        prev.note;
      if (hasValues) preservedValueRows += 1;
      return {
        id,
        name,
        homepage_url: prev.homepage_url,
        booking_url: prev.booking_url,
        phone: prev.phone,
        source_url: prev.source_url,
        note: prev.note,
      };
    }
    newlyAddedRows += 1;
    return {
      id,
      name,
      homepage_url: "",
      booking_url: "",
      phone: "",
      source_url: "",
      note: "",
    };
  });

  if (outputRows.length !== importCourses.length) {
    throw new Error("Internal error: output row count mismatch.");
  }

  const csvBody = rowsToCsv(
    [...COURSE_LINKS_HEADERS],
    outputRows.map(courseLinksToCells),
    { crlf: true },
  );
  writeFileUtf8Bom(ENRICHMENT_CSV, csvBody);

  const written = fs.readFileSync(ENRICHMENT_CSV);
  const hasBom =
    written.length >= 3 &&
    written[0] === 0xef &&
    written[1] === 0xbb &&
    written[2] === 0xbf;

  console.log("");
  console.log("=== Course links template generation complete ===");
  console.log(`Source import: ${FINAL_IMPORT_CSV}`);
  console.log(`Output CSV   : ${ENRICHMENT_CSV}`);
  console.log(`Import courses: ${importCourses.length}`);
  console.log(`Output rows   : ${outputRows.length}`);
  console.log(`Header + rows : ${outputRows.length + 1} lines`);
  console.log(`Preserved rows with values: ${preservedValueRows}`);
  console.log(`New blank rows added     : ${newlyAddedRows}`);
  console.log(`Encoding: UTF-8 with BOM (${hasBom ? "verified" : "missing"})`);
  console.log(`Line endings: CRLF`);
}

main();
