import fs from "node:fs";
import path from "node:path";
import {
  normalizeCsvHeader,
  parseCsv,
  readCsvWithBom,
  rowsToCsv,
  writeFileUtf8Bom,
} from "@/lib/enrichment/csvUtils";
import {
  emptyReviewItem,
  NAVER_PRICE_REVIEW_HEADERS,
  NAVER_REVIEW_STATUS_HEADERS,
  type NaverReviewItem,
} from "@/lib/enrichment/naverReviewTypes";

const REVIEW_CSV = path.join(
  process.cwd(),
  "data/enrichment/naver_price_review.csv",
);
const CANDIDATES_CSV = path.join(
  process.cwd(),
  "data/enrichment/naver_price_candidates.csv",
);
const IMPORT_CSV = path.join(
  process.cwd(),
  "data/golf_courses_import_geocoded_final.csv",
);

function loadCsvRecords(filePath: string): {
  headers: string[];
  records: Record<string, string>[];
} {
  if (!fs.existsSync(filePath)) {
    return { headers: [], records: [] };
  }
  const parsed = parseCsv(readCsvWithBom(filePath));
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  const records = parsed.rows.map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? "").trim();
    });
    return record;
  });
  return { headers, records };
}

function ensureStatusHeaders(headers: string[]): string[] {
  const next = [...headers];
  for (const header of NAVER_REVIEW_STATUS_HEADERS) {
    if (!next.includes(header)) {
      next.push(header);
    }
  }
  return next;
}

function loadImportCourses(): Array<{ id: string; name: string; address: string }> {
  if (!fs.existsSync(IMPORT_CSV)) {
    return [];
  }
  const parsed = parseCsv(readCsvWithBom(IMPORT_CSV));
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  const idIndex = headers.indexOf("id");
  const nameIndex = headers.indexOf("name");
  const addressIndex = headers.indexOf("address");
  if (idIndex < 0) return [];

  return parsed.rows
    .map((cells) => ({
      id: (cells[idIndex] ?? "").trim(),
      name: nameIndex >= 0 ? (cells[nameIndex] ?? "").trim() : "",
      address: addressIndex >= 0 ? (cells[addressIndex] ?? "").trim() : "",
    }))
    .filter((course) => course.id);
}

function recordToReviewItem(
  record: Record<string, string>,
  course: { id: string; name: string; address: string },
  candidateMeta?: Record<string, string>,
): NaverReviewItem {
  const base = emptyReviewItem(course.id, course.name, course.address);
  const merged: NaverReviewItem = { ...base };

  for (const header of NAVER_PRICE_REVIEW_HEADERS) {
    if (record[header]?.trim()) {
      merged[header] = record[header].trim();
    }
  }

  merged.id = course.id;
  merged.name = record.name?.trim() || course.name;
  merged.address = record.address?.trim() || course.address;
  merged.query_variant = candidateMeta?.query_variant?.trim() ?? "";
  merged.matched_query = candidateMeta?.matched_query?.trim() ?? "";

  if (!merged.review_status.trim()) merged.review_status = "pending";
  if (!merged.phone_status.trim()) merged.phone_status = "pending";
  if (!merged.homepage_status.trim()) merged.homepage_status = "pending";
  if (!merged.price_status.trim()) merged.price_status = "pending";
  if (!merged.difficulty_status.trim()) merged.difficulty_status = "pending";
  if (!merged.avg_score_status.trim()) merged.avg_score_status = "pending";

  return merged;
}

export function loadNaverReviewItems(): {
  items: NaverReviewItem[];
  headers: string[];
} {
  const courses = loadImportCourses();
  const { headers: reviewHeaders, records: reviewRecords } =
    loadCsvRecords(REVIEW_CSV);
  const { records: candidateRecords } = loadCsvRecords(CANDIDATES_CSV);

  const reviewById = new Map(reviewRecords.map((record) => [record.id, record]));
  const candidateById = new Map(
    candidateRecords.map((record) => [record.id, record]),
  );

  const headers = ensureStatusHeaders(
    reviewHeaders.length > 0 ? reviewHeaders : [...NAVER_PRICE_REVIEW_HEADERS],
  );

  const items = courses.map((course) => {
    const review = reviewById.get(course.id) ?? {};
    const candidate = candidateById.get(course.id);
    if (!review.id && candidate) {
      Object.assign(review, {
        id: candidate.id,
        name: candidate.name,
        address: candidate.address,
        candidate_title: candidate.candidate_title,
        candidate_address: candidate.candidate_address,
        candidate_phone: candidate.candidate_phone,
        candidate_homepage_url: candidate.candidate_homepage_url,
        candidate_price_text: candidate.candidate_price_text,
        candidate_price_min: candidate.candidate_price_min,
        candidate_price_max: candidate.candidate_price_max,
        candidate_price_type: candidate.candidate_price_type,
        candidate_difficulty: candidate.candidate_difficulty,
        candidate_difficulty_text: candidate.candidate_difficulty_text,
        candidate_avg_score: candidate.candidate_avg_score,
        candidate_reservation_prices_text: candidate.candidate_reservation_prices_text,
        source_url: candidate.source_url,
        confidence: candidate.candidate_confidence,
      });
    }
    return recordToReviewItem(review, course, candidate);
  });

  return { items, headers };
}

export function saveNaverReviewItem(
  updated: NaverReviewItem,
  knownHeaders: string[],
): void {
  const { headers: fileHeaders, records } = loadCsvRecords(REVIEW_CSV);
  const headers = ensureStatusHeaders(
    fileHeaders.length > 0 ? fileHeaders : knownHeaders,
  );

  const rowRecord: Record<string, string> = { ...updated };
  for (const header of headers) {
    rowRecord[header] = String(rowRecord[header] ?? "").trim();
  }

  const index = records.findIndex((record) => record.id === updated.id);
  if (index >= 0) {
    records[index] = { ...records[index], ...rowRecord };
  } else {
    records.push(rowRecord);
  }

  records.sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "", "ko"),
  );

  const matrix = records.map((record) =>
    headers.map((header) => record[header] ?? ""),
  );
  writeFileUtf8Bom(REVIEW_CSV, rowsToCsv(headers, matrix, { crlf: true }));
}

export function getReviewCsvPath(): string {
  return REVIEW_CSV;
}
