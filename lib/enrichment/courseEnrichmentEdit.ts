import { isDifficultySlashFormat } from "./difficultyUtils";

export const COURSE_ENRICHMENT_EDIT_HEADERS = [
  "id",
  "name",
  "change_name_to",
  "address",
  "phone",
  "homepage_url",
  "price_text",
  "price_min",
  "price_max",
  "price_type",
  "difficulty",
  "avg_score",
  "source_url",
  "confidence",
  "needs_check",
  "note",
] as const;

export type CourseEnrichmentEditHeader =
  (typeof COURSE_ENRICHMENT_EDIT_HEADERS)[number];

export type CourseEnrichmentEditRow = Record<CourseEnrichmentEditHeader, string>;

export const COURSE_ENRICHMENT_UPLOAD_HEADERS = [
  "id",
  "name",
  "original_name",
  "change_name_to",
  "address",
  "phone",
  "homepage_url",
  "price_text",
  "price_min",
  "price_max",
  "price_type",
  "difficulty",
  "avg_score",
  "source_url",
  "confidence",
  "needs_check",
  "note",
] as const;

export const COURSE_PRICE_STATS_UPLOAD_HEADERS = [
  "id",
  "name",
  "price_text",
  "price_min",
  "price_max",
  "price_type",
  "difficulty",
  "avg_score",
  "source_url",
  "confidence",
  "needs_check",
  "note",
] as const;

/** Final display/upload name: change_name_to when set, otherwise name. */
export function getFinalCourseName(row: {
  name: string;
  change_name_to?: string;
}): string {
  const renamed = (row.change_name_to ?? "").trim();
  if (renamed) return renamed;
  return (row.name ?? "").trim();
}

const PLAIN_NUMBER = /^(\d+(?:\.\d+)?)$/;

export function isNumericField(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  return PLAIN_NUMBER.test(trimmed);
}

export interface EditCsvValidationReport {
  rowCount: number;
  uniqueIds: number;
  duplicateIds: string[];
  emptyIds: number;
  hasChangeNameToColumn: boolean;
  changeNameToFilled: number;
  phoneFilled: number;
  homepageFilled: number;
  priceFilled: number;
  difficultyInvalid: Array<{ id: string; value: string }>;
  avgScoreInvalid: Array<{ id: string; value: string }>;
  slashDifficulty: Array<{ id: string; value: string }>;
  mojibakeWarnings: string[];
  errors: string[];
}

function countHangul(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) count += 1;
  }
  return count;
}

function detectMojibake(text: string): string[] {
  if (!text.trim()) return [];
  const hints: string[] = [];
  if (/\uFFFD/.test(text)) {
    hints.push("replacement character");
  }
  if (/[ÃÂâ]/.test(text)) {
    hints.push("Latin-1 mojibake");
  }
  if (
    /[ìíîïðêëã]/.test(text) &&
    countHangul(text) === 0 &&
    text.trim().length >= 3
  ) {
    hints.push("accented Latin without Hangul");
  }
  return hints;
}

export function validateEditRows(
  rows: CourseEnrichmentEditRow[],
  headers: string[],
): EditCsvValidationReport {
  const normalizedHeaders = headers.map((header) => header.trim().toLowerCase());
  const hasChangeNameToColumn = normalizedHeaders.includes("change_name_to");
  const idCounts = new Map<string, number>();
  const duplicateIds: string[] = [];
  let emptyIds = 0;
  let changeNameToFilled = 0;
  let phoneFilled = 0;
  let homepageFilled = 0;
  let priceFilled = 0;
  const difficultyInvalid: Array<{ id: string; value: string }> = [];
  const avgScoreInvalid: Array<{ id: string; value: string }> = [];
  const slashDifficulty: Array<{ id: string; value: string }> = [];
  const mojibakeWarnings: string[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const id = row.id.trim();
    if (!id) {
      emptyIds += 1;
      continue;
    }

    idCounts.set(id, (idCounts.get(id) ?? 0) + 1);

    if (row.change_name_to.trim()) changeNameToFilled += 1;
    if (row.phone.trim()) phoneFilled += 1;
    if (row.homepage_url.trim()) homepageFilled += 1;
    if (row.price_text.trim() || row.price_min.trim() || row.price_max.trim()) {
      priceFilled += 1;
    }

    if (!isNumericField(row.difficulty)) {
      difficultyInvalid.push({ id, value: row.difficulty });
    }
    if (isDifficultySlashFormat(row.difficulty)) {
      slashDifficulty.push({ id, value: row.difficulty });
    }
    if (!isNumericField(row.avg_score)) {
      avgScoreInvalid.push({ id, value: row.avg_score });
    }

    for (const hint of detectMojibake(row.name)) {
      mojibakeWarnings.push(`${id} name: ${hint}`);
    }
    for (const hint of detectMojibake(row.change_name_to)) {
      mojibakeWarnings.push(`${id} change_name_to: ${hint}`);
    }
  }

  for (const [id, count] of idCounts.entries()) {
    if (count > 1) duplicateIds.push(id);
  }

  if (!hasChangeNameToColumn) {
    errors.push("Missing required column: change_name_to");
  }
  if (emptyIds > 0) {
    errors.push(`Empty id rows: ${emptyIds}`);
  }
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate ids: ${duplicateIds.join(", ")}`);
  }

  return {
    rowCount: rows.length,
    uniqueIds: idCounts.size,
    duplicateIds,
    emptyIds,
    hasChangeNameToColumn,
    changeNameToFilled,
    phoneFilled,
    homepageFilled,
    priceFilled,
    difficultyInvalid,
    avgScoreInvalid,
    slashDifficulty,
    mojibakeWarnings,
    errors,
  };
}

export function rowToUploadRow(
  row: CourseEnrichmentEditRow,
): Record<(typeof COURSE_ENRICHMENT_UPLOAD_HEADERS)[number], string> {
  return {
    id: row.id,
    name: getFinalCourseName(row),
    original_name: row.name,
    change_name_to: row.change_name_to,
    address: row.address,
    phone: row.phone,
    homepage_url: row.homepage_url,
    price_text: row.price_text,
    price_min: row.price_min,
    price_max: row.price_max,
    price_type: row.price_type,
    difficulty: row.difficulty,
    avg_score: row.avg_score,
    source_url: row.source_url,
    confidence: row.confidence,
    needs_check: row.needs_check,
    note: row.note,
  };
}

export function rowToPriceStatsUploadRow(
  row: CourseEnrichmentEditRow,
): Record<(typeof COURSE_PRICE_STATS_UPLOAD_HEADERS)[number], string> {
  return {
    id: row.id,
    name: getFinalCourseName(row),
    price_text: row.price_text,
    price_min: row.price_min,
    price_max: row.price_max,
    price_type: row.price_type,
    difficulty: row.difficulty,
    avg_score: row.avg_score,
    source_url: row.source_url,
    confidence: row.confidence,
    needs_check: row.needs_check,
    note: row.note,
  };
}
