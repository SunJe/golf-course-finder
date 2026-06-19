import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./csvUtils";
import { readCsvWithEncodingGuess } from "./encodingUtils";
import {
  COURSE_LINKS_HEADERS,
  courseLinksToCells,
  normalizeCsvHeader,
  rowCellsToCourseLinks,
  type CourseLinksRow,
} from "./courseLinksEnrichment";

export function loadCourseLinksCsv(filePath: string): CourseLinksRow[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Course links CSV not found: ${filePath}`);
  }
  const encoding = readCsvWithEncodingGuess(filePath);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  const idIndex = headers.indexOf("id");
  if (idIndex < 0) {
    throw new Error("course_links.csv must include id column.");
  }

  return parsed.rows.map((cells) => {
    const byHeader: string[] = COURSE_LINKS_HEADERS.map((name) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    });
    return rowCellsToCourseLinks(byHeader);
  });
}

export function writeCourseLinksCsv(filePath: string, rows: CourseLinksRow[]): void {
  const csvBody = rowsToCsv(
    [...COURSE_LINKS_HEADERS],
    rows.map(courseLinksToCells),
    { crlf: true },
  );
  writeFileUtf8Bom(filePath, csvBody);
}

export function verifyUtf8Bom(filePath: string): boolean {
  const written = fs.readFileSync(filePath);
  return (
    written.length >= 3 &&
    written[0] === 0xef &&
    written[1] === 0xbb &&
    written[2] === 0xbf
  );
}

const MOJIBAKE_PATTERNS = [/�/, /Ã/, /ì/, /í/, /ê/];

export function warnMojibakeInCsvFields(
  fields: string[],
  context: string,
): void {
  for (const field of fields) {
    if (MOJIBAKE_PATTERNS.some((pattern) => pattern.test(field))) {
      console.warn(
        `[warn] mojibake suspected in ${context}: ${field.slice(0, 60)}`,
      );
    }
  }
}

export function isApprovedFlag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "y" || normalized === "yes" || normalized === "true";
}

export function pickNonEmpty(...values: string[]): string {
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export function resolveEnrichmentPath(root: string, relative: string): string {
  return path.join(root, relative);
}
