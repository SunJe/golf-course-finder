import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csvUtils";
import { readCsvWithEncodingGuess } from "./encodingUtils";
import { isDifficultySlashFormat } from "../../lib/enrichment/difficultyUtils";
import { isApprovedFlag } from "./enrichmentCsvUtils";
import { normalizeCsvHeader } from "./naverPriceCandidates";
import { loadNaverPriceReviewCsv } from "./naverPriceReviewMerge";
import { getProjectRoot } from "./sourceRegistry";

const MOJIBAKE_PATTERNS = [/�/, /Ã/, /ì/, /í/, /ê/];

export interface EnrichmentFilePaths {
  candidates: string;
  review: string;
  courseLinks: string;
  priceOverrides: string;
  statsOverrides: string;
}

export interface EnrichmentStateReport {
  paths: EnrichmentFilePaths;
  candidateRowCount: number;
  candidateUniqueIds: number;
  reviewRowCount: number;
  reviewUniqueIds: number;
  nextOffset: number;
  approveFieldRows: number;
  reviewFieldRows: number;
  slashDifficultyCandidates: number;
  slashDifficultyReview: number;
  mojibakeWarnings: string[];
}

function countSlashDifficulty(
  filePath: string,
  columns: string[],
): number {
  if (!fs.existsSync(filePath)) return 0;
  const encoding = readCsvWithEncodingGuess(filePath);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  let count = 0;
  for (const cells of parsed.rows) {
    for (const column of columns) {
      const idx = headers.indexOf(column);
      if (idx < 0) continue;
      const value = (cells[idx] ?? "").trim();
      if (value && isDifficultySlashFormat(value)) {
        count += 1;
        break;
      }
    }
  }
  return count;
}

function scanMojibake(filePath: string, label: string): string[] {
  if (!fs.existsSync(filePath)) return [];
  const encoding = readCsvWithEncodingGuess(filePath);
  const warnings: string[] = [];
  if (MOJIBAKE_PATTERNS.some((pattern) => pattern.test(encoding.content.slice(0, 8000)))) {
    warnings.push(`${label}: mojibake pattern suspected`);
  }
  return warnings;
}

function countReviewValueRows(filePath: string): number {
  const rows = loadNaverPriceReviewCsv(filePath);
  return rows.filter(
    (row) =>
      row.review_phone.trim() ||
      row.review_homepage_url.trim() ||
      row.review_price_min.trim() ||
      row.review_price_max.trim() ||
      row.review_difficulty.trim() ||
      row.review_avg_score.trim() ||
      row.review_note.trim(),
  ).length;
}

export function getEnrichmentPaths(root = getProjectRoot()): EnrichmentFilePaths {
  const enrichment = path.join(root, "data/enrichment");
  return {
    candidates: path.join(enrichment, "naver_price_candidates.csv"),
    review: path.join(enrichment, "naver_price_review.csv"),
    courseLinks: path.join(enrichment, "course_links.csv"),
    priceOverrides: path.join(enrichment, "course_price_overrides.csv"),
    statsOverrides: path.join(enrichment, "course_stats_overrides.csv"),
  };
}

export function inspectEnrichmentState(root = getProjectRoot()): EnrichmentStateReport {
  const paths = getEnrichmentPaths(root);
  const candidateIds = new Set<string>();
  let candidateRowCount = 0;

  if (fs.existsSync(paths.candidates)) {
    const encoding = readCsvWithEncodingGuess(paths.candidates);
    const parsed = parseCsv(encoding.content);
    const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
    const idIndex = headers.indexOf("id");
    for (const cells of parsed.rows) {
      candidateRowCount += 1;
      const id = idIndex >= 0 ? (cells[idIndex] ?? "").trim() : "";
      if (id) candidateIds.add(id);
    }
  }

  const reviewRows = loadNaverPriceReviewCsv(paths.review);
  const reviewUniqueIds = new Set(reviewRows.map((row) => row.id).filter(Boolean));

  const approveFieldRows = reviewRows.filter(
    (row) =>
      isApprovedFlag(row.approve_phone) ||
      isApprovedFlag(row.approve_homepage) ||
      isApprovedFlag(row.approve_price) ||
      isApprovedFlag(row.approve_difficulty) ||
      isApprovedFlag(row.approve_avg_score),
  ).length;

  const mojibakeWarnings = [
    ...scanMojibake(paths.candidates, "naver_price_candidates.csv"),
    ...scanMojibake(paths.review, "naver_price_review.csv"),
  ];

  return {
    paths,
    candidateRowCount,
    candidateUniqueIds: candidateIds.size,
    reviewRowCount: reviewRows.length,
    reviewUniqueIds: reviewUniqueIds.size,
    nextOffset: candidateIds.size,
    approveFieldRows,
    reviewFieldRows: countReviewValueRows(paths.review),
    slashDifficultyCandidates: countSlashDifficulty(paths.candidates, [
      "candidate_difficulty",
    ]),
    slashDifficultyReview: countSlashDifficulty(paths.review, [
      "candidate_difficulty",
      "review_difficulty",
    ]),
    mojibakeWarnings,
  };
}

export function printEnrichmentStateReport(
  report: EnrichmentStateReport,
  label = "Enrichment state",
): void {
  console.log("");
  console.log(`=== ${label} ===`);
  console.log(`Candidate rows       : ${report.candidateRowCount}`);
  console.log(`Candidate unique ids : ${report.candidateUniqueIds}`);
  console.log(`Review rows          : ${report.reviewRowCount}`);
  console.log(`Review unique ids    : ${report.reviewUniqueIds}`);
  console.log(`Next offset (suggest): ${report.nextOffset}`);
  console.log(`approve_* rows       : ${report.approveFieldRows}`);
  console.log(`review_* filled rows : ${report.reviewFieldRows}`);
  console.log(
    `Slash difficulty (candidates): ${report.slashDifficultyCandidates}`,
  );
  console.log(`Slash difficulty (review)    : ${report.slashDifficultyReview}`);
  if (report.mojibakeWarnings.length > 0) {
    for (const warning of report.mojibakeWarnings) {
      console.warn(`[warn] ${warning}`);
    }
  } else {
    console.log("Mojibake warnings    : none");
  }
}
