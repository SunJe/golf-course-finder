import fs from "node:fs";
import { parseCsv } from "./csvUtils";
import { readCsvWithEncodingGuess } from "./encodingUtils";
import {
  NAVER_PRICE_REVIEW_HEADERS,
  normalizeCsvHeader,
  type NaverPriceCandidateRow,
  type PreservedReviewFields,
} from "./naverPriceCandidates";
import { parseDifficultyRaw } from "./difficultyUtils";
import { isApprovedFlag } from "./enrichmentCsvUtils";

export interface NaverPriceReviewRow {
  id: string;
  name: string;
  address: string;
  candidate_title: string;
  candidate_address: string;
  candidate_phone: string;
  candidate_homepage_url: string;
  candidate_price_text: string;
  candidate_price_min: string;
  candidate_price_max: string;
  candidate_price_type: string;
  candidate_difficulty: string;
  candidate_difficulty_text: string;
  candidate_avg_score: string;
  candidate_reservation_prices_text: string;
  source_url: string;
  confidence: string;
  approve_phone: string;
  approve_homepage: string;
  approve_price: string;
  approve_difficulty: string;
  approve_avg_score: string;
  review_phone: string;
  review_homepage_url: string;
  review_price_min: string;
  review_price_max: string;
  review_price_type: string;
  review_difficulty: string;
  review_avg_score: string;
  review_note: string;
  review_status: string;
  phone_status: string;
  homepage_status: string;
  price_status: string;
  difficulty_status: string;
  avg_score_status: string;
  reviewed_at: string;
  reviewer_note: string;
}

export function rowCellsToNaverPriceReview(
  cells: string[],
  headers: string[],
): NaverPriceReviewRow {
  const get = (name: string): string => {
    const idx = headers.findIndex(
      (header) => normalizeCsvHeader(header) === name,
    );
    return idx >= 0 ? (cells[idx] ?? "").trim() : "";
  };

  const row = {} as NaverPriceReviewRow;
  for (const header of NAVER_PRICE_REVIEW_HEADERS) {
    row[header] = get(header);
  }
  return row;
}

export function loadNaverPriceReviewCsv(filePath: string): NaverPriceReviewRow[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const encoding = readCsvWithEncodingGuess(filePath);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));

  return parsed.rows
    .map((cells) => rowCellsToNaverPriceReview(cells, headers))
    .filter((row) => row.id);
}

export function loadPreservedReviewFields(
  filePath: string,
): Map<string, PreservedReviewFields> {
  const map = new Map<string, PreservedReviewFields>();
  for (const row of loadNaverPriceReviewCsv(filePath)) {
    map.set(row.id, {
      approve_phone: row.approve_phone,
      approve_homepage: row.approve_homepage,
      approve_price: row.approve_price,
      approve_difficulty: row.approve_difficulty,
      approve_avg_score: row.approve_avg_score,
      review_phone: row.review_phone,
      review_homepage_url: row.review_homepage_url,
      review_price_min: row.review_price_min,
      review_price_max: row.review_price_max,
      review_price_type: row.review_price_type,
      review_difficulty: row.review_difficulty,
      review_avg_score: row.review_avg_score,
      review_note: row.review_note,
      review_status: row.review_status,
      phone_status: row.phone_status,
      homepage_status: row.homepage_status,
      price_status: row.price_status,
      difficulty_status: row.difficulty_status,
      avg_score_status: row.avg_score_status,
      reviewed_at: row.reviewed_at,
      reviewer_note: row.reviewer_note,
    });
  }
  return map;
}

export function resolveApprovedPhone(row: NaverPriceReviewRow): string {
  if (!isApprovedFlag(row.approve_phone)) return "";
  return row.review_phone.trim() || row.candidate_phone.trim();
}

export function resolveApprovedHomepage(row: NaverPriceReviewRow): string {
  if (!isApprovedFlag(row.approve_homepage)) return "";
  return row.review_homepage_url.trim() || row.candidate_homepage_url.trim();
}

export function resolveApprovedPriceFields(row: NaverPriceReviewRow): {
  price_text: string;
  price_min: string;
  price_max: string;
  price_type: string;
  source_url: string;
  note: string;
} | null {
  if (!isApprovedFlag(row.approve_price)) return null;

  const price_min =
    row.review_price_min.trim() || row.candidate_price_min.trim();
  const price_max =
    row.review_price_max.trim() || row.candidate_price_max.trim();
  const price_type =
    row.review_price_type.trim() || row.candidate_price_type.trim() || "unknown";
  const price_text =
    row.candidate_reservation_prices_text.trim() ||
    row.review_note.trim();

  if (!price_text && !price_min && !price_max) {
    return null;
  }

  return {
    price_text,
    price_min,
    price_max,
    price_type,
    source_url: row.source_url.trim(),
    note: row.review_note.trim(),
  };
}

export function resolveApprovedStatsFields(row: NaverPriceReviewRow): {
  difficulty: string;
  avg_score: string;
  reservation_prices_text: string;
  source_url: string;
  note: string;
} | null {
  const difficultyApproved = isApprovedFlag(row.approve_difficulty);
  const avgScoreApproved = isApprovedFlag(row.approve_avg_score);

  if (!difficultyApproved && !avgScoreApproved) return null;

  const rawDifficulty = difficultyApproved
    ? row.review_difficulty.trim() || row.candidate_difficulty.trim()
    : "";
  const difficulty = rawDifficulty
    ? parseDifficultyRaw(rawDifficulty).difficulty
    : "";
  const avg_score = avgScoreApproved
    ? row.review_avg_score.trim() || row.candidate_avg_score.trim()
    : "";
  const reservation_prices_text =
    row.candidate_reservation_prices_text.trim();

  if (!difficulty && !avg_score && !reservation_prices_text) {
    return null;
  }

  return {
    difficulty,
    avg_score,
    reservation_prices_text,
    source_url: row.source_url.trim(),
    note: row.review_note.trim(),
  };
}

/** @deprecated use NaverPriceReviewRow */
export type { NaverPriceCandidateRow };
