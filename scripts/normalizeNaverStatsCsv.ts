import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8Bom } from "./lib/csvUtils";
import {
  COURSE_STATS_OVERRIDE_HEADERS,
  rowCellsToCourseStatsOverride,
  type CourseStatsOverrideRow,
} from "./lib/courseStatsOverrides";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  isDifficultySlashFormat,
  normalizeDifficultyField,
} from "./lib/difficultyUtils";
import {
  NAVER_PRICE_CANDIDATE_HEADERS,
  NAVER_PRICE_REVIEW_HEADERS,
  candidateToCells,
  normalizeCsvHeader,
  rowCellsToCandidate,
} from "./lib/naverPriceCandidates";
import { rowCellsToNaverPriceReview } from "./lib/naverPriceReviewMerge";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const CANDIDATES_CSV = path.join(
  ROOT,
  "data/enrichment/naver_price_candidates.csv",
);
const REVIEW_CSV = path.join(ROOT, "data/enrichment/naver_price_review.csv");
const STATS_OVERRIDES_CSV = path.join(
  ROOT,
  "data/enrichment/course_stats_overrides.csv",
);

function headerIndex(headers: string[], name: string): number {
  return headers.findIndex((header) => normalizeCsvHeader(header) === name);
}

function ensureHeader(headers: string[], name: string, afterName: string): string[] {
  if (headerIndex(headers, name) >= 0) return headers;
  const afterIdx = headerIndex(headers, afterName);
  if (afterIdx < 0) return [...headers, name];
  const next = [...headers];
  next.splice(afterIdx + 1, 0, name);
  return next;
}

function insertCellForHeader(
  cells: string[],
  headers: string[],
  name: string,
  afterName: string,
): string[] {
  if (headerIndex(headers, name) >= 0) return cells;
  const afterIdx = headerIndex(headers, afterName);
  if (afterIdx < 0) return cells;
  const next = [...cells];
  while (next.length < headers.length) next.push("");
  next.splice(afterIdx + 1, 0, "");
  return next;
}

function setCell(
  cells: string[],
  headers: string[],
  name: string,
  value: string,
): void {
  const idx = headerIndex(headers, name);
  if (idx >= 0) {
    cells[idx] = value;
  }
}

function getCell(cells: string[], headers: string[], name: string): string {
  const idx = headerIndex(headers, name);
  return idx >= 0 ? (cells[idx] ?? "").trim() : "";
}

function normalizeCandidatesFile(): number {
  if (!fs.existsSync(CANDIDATES_CSV)) {
    console.log("[skip] naver_price_candidates.csv not found");
    return 0;
  }

  const encoding = readCsvWithEncodingGuess(CANDIDATES_CSV);
  const parsed = parseCsv(encoding.content);
  let headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  headers = ensureHeader(headers, "candidate_difficulty_text", "candidate_difficulty");

  let changedRows = 0;
  const slashBefore = parsed.rows.filter((cells) =>
    isDifficultySlashFormat(getCell(cells, headers, "candidate_difficulty")),
  ).length;

  const rows = parsed.rows.map((cells) => {
    let padded = insertCellForHeader(
      cells,
      headers,
      "candidate_difficulty_text",
      "candidate_difficulty",
    );
    while (padded.length < headers.length) padded.push("");

    const current = getCell(padded, headers, "candidate_difficulty");
    const currentText = getCell(padded, headers, "candidate_difficulty_text");
    const normalized = normalizeDifficultyField(current, currentText);

    const rowChanged =
      normalized.difficulty !== current ||
      normalized.difficultyText !== currentText;
    if (rowChanged) changedRows += 1;

    setCell(padded, headers, "candidate_difficulty", normalized.difficulty);
    setCell(
      padded,
      headers,
      "candidate_difficulty_text",
      normalized.difficultyText,
    );
    return padded;
  });

  const outputRows = rows.map((cells) => {
    const row = rowCellsToCandidate(cells, headers);
    row.candidate_difficulty = getCell(cells, headers, "candidate_difficulty");
    row.candidate_difficulty_text = getCell(
      cells,
      headers,
      "candidate_difficulty_text",
    );
    return candidateToCells(row);
  });

  writeFileUtf8Bom(
    CANDIDATES_CSV,
    rowsToCsv([...NAVER_PRICE_CANDIDATE_HEADERS], outputRows, { crlf: true }),
  );

  console.log(`[candidates] slash-format before: ${slashBefore}`);
  console.log(`[candidates] rows changed: ${changedRows}`);
  return changedRows;
}

function normalizeReviewFile(): number {
  if (!fs.existsSync(REVIEW_CSV)) {
    console.log("[skip] naver_price_review.csv not found");
    return 0;
  }

  const encoding = readCsvWithEncodingGuess(REVIEW_CSV);
  const parsed = parseCsv(encoding.content);
  let headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  headers = ensureHeader(headers, "candidate_difficulty_text", "candidate_difficulty");

  let changedRows = 0;
  const slashBefore = parsed.rows.filter((cells) => {
    const candidate = getCell(cells, headers, "candidate_difficulty");
    const review = getCell(cells, headers, "review_difficulty");
    return (
      isDifficultySlashFormat(candidate) || isDifficultySlashFormat(review)
    );
  }).length;

  const rows = parsed.rows.map((cells) => {
    let padded = insertCellForHeader(
      cells,
      headers,
      "candidate_difficulty_text",
      "candidate_difficulty",
    );
    while (padded.length < headers.length) padded.push("");

    let rowChanged = false;

    const candidateDifficulty = getCell(padded, headers, "candidate_difficulty");
    const candidateText = getCell(padded, headers, "candidate_difficulty_text");
    const normalizedCandidate = normalizeDifficultyField(
      candidateDifficulty,
      candidateText,
    );
    if (
      normalizedCandidate.difficulty !== candidateDifficulty ||
      normalizedCandidate.difficultyText !== candidateText
    ) {
      rowChanged = true;
    }
    setCell(
      padded,
      headers,
      "candidate_difficulty",
      normalizedCandidate.difficulty,
    );
    setCell(
      padded,
      headers,
      "candidate_difficulty_text",
      normalizedCandidate.difficultyText,
    );

    const reviewDifficulty = getCell(padded, headers, "review_difficulty");
    const normalizedReview = normalizeDifficultyField(reviewDifficulty);
    if (normalizedReview.difficulty !== reviewDifficulty) {
      rowChanged = true;
    }
    setCell(padded, headers, "review_difficulty", normalizedReview.difficulty);

    if (rowChanged) changedRows += 1;
    return padded;
  });

  const orderedHeaders = [...NAVER_PRICE_REVIEW_HEADERS];
  if (!orderedHeaders.includes("candidate_difficulty_text")) {
    const idx = orderedHeaders.indexOf("candidate_difficulty");
    orderedHeaders.splice(idx + 1, 0, "candidate_difficulty_text");
  }

  const outputRows = rows.map((cells) =>
    orderedHeaders.map((header) => {
      if (header === "candidate_difficulty_text") {
        return getCell(cells, headers, "candidate_difficulty_text");
      }
      const row = rowCellsToNaverPriceReview(cells, headers);
      return row[header as keyof typeof row] ?? "";
    }),
  );

  writeFileUtf8Bom(
    REVIEW_CSV,
    rowsToCsv(orderedHeaders, outputRows, { crlf: true }),
  );

  console.log(`[review] slash-format before: ${slashBefore}`);
  console.log(`[review] rows changed: ${changedRows}`);
  return changedRows;
}

function normalizeStatsOverridesFile(): number {
  if (!fs.existsSync(STATS_OVERRIDES_CSV)) {
    console.log("[skip] course_stats_overrides.csv not found");
    return 0;
  }

  const encoding = readCsvWithEncodingGuess(STATS_OVERRIDES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));

  let changedRows = 0;
  const slashBefore = parsed.rows.filter((cells) =>
    isDifficultySlashFormat(getCell(cells, headers, "difficulty")),
  ).length;

  const rows = parsed.rows.map((cells) => {
    const current = getCell(cells, headers, "difficulty");
    const normalized = normalizeDifficultyField(current);
    if (normalized.difficulty !== current) changedRows += 1;
    setCell(cells, headers, "difficulty", normalized.difficulty);
    return cells;
  });

  const outputRows = rows.map((cells) => {
    const row = rowCellsToCourseStatsOverride(cells, headers);
    return courseStatsOverrideToCells(row);
  });

  writeFileUtf8Bom(
    STATS_OVERRIDES_CSV,
    rowsToCsv([...COURSE_STATS_OVERRIDE_HEADERS], outputRows, { crlf: true }),
  );

  console.log(`[stats overrides] slash-format before: ${slashBefore}`);
  console.log(`[stats overrides] rows changed: ${changedRows}`);
  return changedRows;
}

function courseStatsOverrideToCells(row: CourseStatsOverrideRow): string[] {
  return COURSE_STATS_OVERRIDE_HEADERS.map((header) => row[header] ?? "");
}

function main(): void {
  console.log("");
  console.log("=== Normalize Naver stats CSV (difficulty) ===");
  console.log("");

  const candidatesChanged = normalizeCandidatesFile();
  const reviewChanged = normalizeReviewFile();
  const statsChanged = normalizeStatsOverridesFile();

  console.log("");
  console.log("=== Done ===");
  console.log(
    `Total rows changed: ${candidatesChanged + reviewChanged + statsChanged}`,
  );
  console.log("Encoding: UTF-8 with BOM, CRLF");
}

main();
