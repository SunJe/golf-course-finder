import { parseCsv } from "../csvUtils";
import { readCsvWithEncodingGuess } from "../encodingUtils";

const CHANGE_NAME_COLUMN_ALIASES = new Set([
  "change_name_to",
  "changenameto",
  "changename",
  "changed_name",
  "canonical_name",
  "search_name",
]);

export type CourseEnrichmentRow = {
  rowIndex: number;
  id: string;
  name: string;
  changeNameTo: string;
  address: string;
  priceMin: string;
  priceMax: string;
  raw: string[];
};

function normalizeHeaderKey(value: string): string {
  return value.toLowerCase().replace(/[\s_\-]/g, "");
}

export function findChangeNameColumnIndex(headers: string[]): number {
  for (let index = 0; index < headers.length; index += 1) {
    const key = normalizeHeaderKey(headers[index] ?? "");
    if (CHANGE_NAME_COLUMN_ALIASES.has(key)) return index;
  }
  return headers.indexOf("change_name_to");
}

export function getCell(
  headers: string[],
  row: string[],
  key: string,
): string {
  const index = headers.indexOf(key);
  return index >= 0 ? (row[index] ?? "").trim() : "";
}

export function loadCourseEnrichmentRows(csvPath: string): {
  headers: string[];
  rows: CourseEnrichmentRow[];
} {
  const content = readCsvWithEncodingGuess(csvPath).content;
  const { headers, rows } = parseCsv(content);
  const changeIndex = findChangeNameColumnIndex(headers);

  const parsed = rows
    .map((row, index) => {
      const id = getCell(headers, row, "id");
      const name = getCell(headers, row, "name");
      if (!id || !name) return null;

      return {
        rowIndex: index + 1,
        id,
        name,
        changeNameTo:
          changeIndex >= 0 ? (row[changeIndex] ?? "").trim() : "",
        address: getCell(headers, row, "address"),
        priceMin: getCell(headers, row, "price_min"),
        priceMax: getCell(headers, row, "price_max"),
        raw: row,
      } satisfies CourseEnrichmentRow;
    })
    .filter((row): row is CourseEnrichmentRow => row != null);

  return { headers, rows: parsed };
}

export function stripGolfCourseSuffix(input: string): string {
  return input
    .replace(/\((?:회원제|퍼블릭|대중제|일반|예약제|public|member|P|M)\)/gi, "")
    .replace(/\([^)]*(?:대중제|회원제|퍼블릭|대중형|회원)[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\s*(?:골프\s*클럽\s*&\s*리조트|골프클럽&리조트|골프클럽앤리조트|골프\s*클럽\s*앤\s*리조트)$/i,
      "",
    )
    .replace(/\s*(?:컨트리클럽|골프클럽|골프\s*클럽|골프장|리조트)$/i, "")
    .replace(/\s*(?:C\.?C\.?|G\.?C\.?)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCourseName(name: string): string {
  return stripGolfCourseSuffix(name)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export type CourseSearchTerms = {
  sourceName: string;
  primarySearchTerm: string;
  fallbackSearchTerm: string;
  searchTerms: string[];
};

export function buildCourseSearchTerms(input: {
  name: string;
  changeNameTo: string;
}): CourseSearchTerms {
  const name = input.name.trim();
  const changeNameTo = input.changeNameTo.trim();
  const sourceName = changeNameTo || name;
  const primarySearchTerm = stripGolfCourseSuffix(sourceName);
  const fallbackSearchTerm = name;

  const searchTerms = [primarySearchTerm, sourceName, name]
    .map((value) => value.trim())
    .filter((value, index, array) => value && array.indexOf(value) === index);

  return {
    sourceName,
    primarySearchTerm,
    fallbackSearchTerm,
    searchTerms,
  };
}

export function buildTeescannerSearchQueries(course: {
  name: string;
  change_name_to: string;
}): string[] {
  const { primarySearchTerm, fallbackSearchTerm } = buildCourseSearchTerms({
    name: course.name,
    changeNameTo: course.change_name_to,
  });
  const queries = [primarySearchTerm, fallbackSearchTerm].filter(
    (value, index, array) => value && array.indexOf(value) === index,
  );
  return queries;
}
