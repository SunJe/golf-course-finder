import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csvUtils";
import { readCsvWithEncodingGuess } from "./encodingUtils";

export const NAVER_PRICE_CANDIDATE_HEADERS = [
  "id",
  "name",
  "address",
  "query",
  "source",
  "candidate_title",
  "candidate_address",
  "candidate_phone",
  "candidate_homepage_url",
  "candidate_price_text",
  "candidate_price_min",
  "candidate_price_max",
  "candidate_price_type",
  "candidate_confidence",
  "needs_review",
  "reason",
  "source_url",
  "collected_at",
] as const;

export const NAVER_PRICE_REVIEW_HEADERS = [
  "id",
  "name",
  "address",
  "candidate_title",
  "candidate_address",
  "candidate_phone",
  "candidate_homepage_url",
  "candidate_price_text",
  "candidate_price_min",
  "candidate_price_max",
  "candidate_price_type",
  "source_url",
  "confidence",
  "approve_phone",
  "approve_homepage",
  "approve_price",
  "review_phone",
  "review_homepage_url",
  "review_price_min",
  "review_price_max",
  "review_price_type",
  "review_note",
] as const;

export type PriceType = "green_fee" | "reservation_price" | "unknown";
export type ConfidenceLevel = "high" | "medium" | "low";
export type CandidateSource =
  | "naver_search"
  | "naver_place"
  | "naver_scrape"
  | "manual";

export interface CourseInput {
  id: string;
  name: string;
  address: string;
  region: string;
  city: string;
}

export interface NaverPriceCandidateRow {
  id: string;
  name: string;
  address: string;
  query: string;
  source: CandidateSource;
  candidate_title: string;
  candidate_address: string;
  candidate_phone: string;
  candidate_homepage_url: string;
  candidate_price_text: string;
  candidate_price_min: string;
  candidate_price_max: string;
  candidate_price_type: PriceType;
  candidate_confidence: ConfidenceLevel;
  needs_review: string;
  reason: string;
  source_url: string;
  collected_at: string;
}

export interface ParsedPrice {
  priceText: string;
  min?: number;
  max?: number;
  type: PriceType;
}

export interface NaverLocalSearchItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

const MOJIBAKE_PATTERNS = [/�/, /Ã/, /ì/, /í/, /ê/];

export function normalizeCsvHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim();
}

export function stripHtml(text: string): string {
  return text.replace(/<[^>]+>/g, "").trim();
}

export function stripMembershipSuffix(name: string): string {
  return name
    .replace(/\s*\((회원제|대중제|회원|public|private)\)\s*/gi, "")
    .trim();
}

export function normalizeForMatch(name: string): string {
  return stripMembershipSuffix(name)
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[·.\-_()（）[\]]/g, "")
    .replace(/컨트리클럽|countryclub/gi, "")
    .replace(/골프클럽/gi, "")
    .replace(/씨\.?씨\.?|c\.?c\.?/gi, "")
    .toLowerCase();
}

export function overlapRatio(a: string, b: string): number {
  if (!a || !b) return 0;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length > b.length ? a : b;
  if (longer.includes(shorter)) return shorter.length / longer.length;
  let matches = 0;
  for (let i = 0; i < shorter.length; i += 1) {
    if (shorter[i] === longer[i]) matches += 1;
  }
  return matches / longer.length;
}

export function buildNameVariants(name: string): string[] {
  const base = stripMembershipSuffix(name);
  const variants = new Set<string>();
  variants.add(base);

  if (/컨트리클럽/i.test(base)) {
    variants.add(base.replace(/컨트리클럽/gi, "CC"));
    variants.add(base.replace(/컨트리클럽/gi, "C.C"));
  }
  if (/\bCC\b|씨씨|c\.c/i.test(base)) {
    variants.add(base.replace(/\s*C\.?C\.?\s*/gi, "컨트리클럽"));
  }
  if (/골프클럽/i.test(base)) {
    variants.add(base.replace(/골프클럽/gi, "").trim());
  }

  if (base.length > 20) {
    const core = base
      .replace(/(골프클럽|컨트리클럽|CC|C\.C)$/gi, "")
      .trim();
    if (core.length >= 3) variants.add(core);
  }

  return [...variants].filter((value) => value.length > 0);
}

export function buildSearchQueries(course: CourseInput): string[] {
  const names = buildNameVariants(course.name);
  const primaryName = names[0] ?? course.name;
  const queries: string[] = [];

  for (const variant of names.slice(0, 2)) {
    queries.push(variant);
  }
  queries.push(`${primaryName} 네이버 예약`);
  queries.push(`${primaryName} 그린피`);
  queries.push(`${primaryName} 가격`);
  if (course.city.trim()) {
    queries.push(`${primaryName} ${course.city.trim()}`);
  }

  return [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
}

export function getNaverSearchUrl(query: string): string {
  return `https://search.naver.com/search.naver?where=nexearch&query=${encodeURIComponent(query)}`;
}

export function getNaverMapSearchUrl(query: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(query)}`;
}

export function parsePriceText(rawText: string): ParsedPrice {
  const priceText = rawText.trim();
  if (!priceText || /정보\s*없음|^없음$/i.test(priceText)) {
    return { priceText, type: "unknown" };
  }

  let type: PriceType = "unknown";
  if (/예약|예약가|네이버\s*예약|1인/i.test(priceText)) {
    type = "reservation_price";
  } else if (/그린피|green\s*fee/i.test(priceText)) {
    type = "green_fee";
  }

  const numberMatches = [
    ...priceText.matchAll(/(\d{1,3}(?:,\d{3})+|\d+)\s*(?:원|₩)?/g),
  ]
    .map((match) => Number.parseInt(match[1].replace(/,/g, ""), 10))
    .filter((value) => Number.isFinite(value) && value >= 10_000 && value <= 5_000_000);

  if (numberMatches.length === 0) {
    return { priceText, type };
  }
  if (numberMatches.length === 1) {
    return { priceText, min: numberMatches[0], max: numberMatches[0], type };
  }

  const min = Math.min(...numberMatches);
  const max = Math.max(...numberMatches);
  return { priceText, min, max, type };
}

function extractDistrictTokens(address: string): string[] {
  return address
    .split(/\s+/)
    .map((part) => part.replace(/[,\d].*$/, "").trim())
    .filter((part) => /(시|군|구)$/.test(part));
}

function addressesAlign(courseAddress: string, candidateAddress: string): boolean {
  if (!courseAddress.trim() || !candidateAddress.trim()) return false;
  const courseDistricts = extractDistrictTokens(courseAddress);
  const candidateDistricts = extractDistrictTokens(candidateAddress);
  if (courseDistricts.length === 0 || candidateDistricts.length === 0) return false;
  return courseDistricts.some((district) => candidateAddress.includes(district));
}

export function computeConfidence(
  course: CourseInput,
  candidate: {
    title: string;
    address: string;
    priceText: string;
    phone?: string;
    homepageUrl?: string;
  },
): { confidence: ConfidenceLevel; reason: string } {
  const normCourse = normalizeForMatch(course.name);
  const normTitle = normalizeForMatch(stripHtml(candidate.title));
  const titleOverlap = overlapRatio(normCourse, normTitle);
  const titleStrong =
    normCourse === normTitle ||
    normTitle.includes(normCourse) ||
    normCourse.includes(normTitle);
  const cityMatch =
    Boolean(course.city.trim()) && candidate.address.includes(course.city.trim());
  const districtMatch = addressesAlign(course.address, candidate.address);
  const priceClear =
    Boolean(candidate.priceText.trim()) &&
    !/정보\s*없음|^없음$/i.test(candidate.priceText);
  const hasContact =
    Boolean(candidate.phone?.trim()) ||
    Boolean(candidate.homepageUrl?.trim()) ||
    priceClear;

  if (titleStrong && (cityMatch || districtMatch) && hasContact) {
    return {
      confidence: "high",
      reason: "골프장명·주소(시/군/구) 일치, phone/homepage/price 후보 수집",
    };
  }
  if (titleStrong && (cityMatch || districtMatch)) {
    return {
      confidence: "high",
      reason: "골프장명·주소(시/군/구) 일치, 추가 필드 수동 확인 필요",
    };
  }
  if (titleOverlap >= 0.55 && hasContact) {
    return {
      confidence: "medium",
      reason: "이름 유사·phone/homepage/price 후보 있음, 주소 확인 약함",
    };
  }
  if (titleOverlap >= 0.55) {
    return {
      confidence: "medium",
      reason: "이름 유사, 주소·후보 필드 확인 필요",
    };
  }
  if (titleOverlap >= 0.3) {
    return {
      confidence: "low",
      reason: "이름 일부만 일치, 동명이인·블로그/광고 가능성",
    };
  }
  return {
    confidence: "low",
    reason: "source_url만 확보, 이름·주소 매칭 약함",
  };
}

export function candidateToCells(row: NaverPriceCandidateRow): string[] {
  return NAVER_PRICE_CANDIDATE_HEADERS.map((header) => row[header] ?? "");
}

export function rowCellsToCandidate(
  cells: string[],
  headers?: string[],
): NaverPriceCandidateRow {
  const getByHeader = (name: string): string => {
    if (!headers?.length) return "";
    const idx = headers.findIndex(
      (header) => normalizeCsvHeader(header) === name,
    );
    return idx >= 0 ? (cells[idx] ?? "").trim() : "";
  };

  const get = (name: (typeof NAVER_PRICE_CANDIDATE_HEADERS)[number]): string => {
    if (headers?.length) return getByHeader(name);
    const idx = NAVER_PRICE_CANDIDATE_HEADERS.indexOf(name);
    return idx >= 0 ? (cells[idx] ?? "").trim() : "";
  };

  const row = {} as NaverPriceCandidateRow;
  for (const header of NAVER_PRICE_CANDIDATE_HEADERS) {
    row[header] = get(header);
  }
  return row;
}

export function warnMojibakeInFields(fields: string[], context: string): void {
  for (const field of fields) {
    if (MOJIBAKE_PATTERNS.some((pattern) => pattern.test(field))) {
      console.warn(
        `[warn] mojibake suspected in ${context}: ${field.slice(0, 60)}`,
      );
    }
  }
}

export function loadCoursesFromImport(importCsvPath: string): CourseInput[] {
  if (!fs.existsSync(importCsvPath)) {
    throw new Error(`Import CSV not found: ${importCsvPath}`);
  }

  const encoding = readCsvWithEncodingGuess(importCsvPath);
  const parsed = parseCsv(encoding.content);
  const indexOf = (name: string) =>
    parsed.headers.findIndex((header) => normalizeCsvHeader(header) === name);

  const idIndex = indexOf("id");
  const nameIndex = indexOf("name");
  const addressIndex = indexOf("address");
  const regionIndex = indexOf("region");
  const cityIndex = indexOf("city");

  if (idIndex < 0 || nameIndex < 0) {
    throw new Error("Import CSV must include id and name columns.");
  }

  const courses: CourseInput[] = [];
  for (const row of parsed.rows) {
    const id = row[idIndex]?.trim() ?? "";
    if (!id) continue;
    courses.push({
      id,
      name: row[nameIndex]?.trim() ?? "",
      address: addressIndex >= 0 ? (row[addressIndex]?.trim() ?? "") : "",
      region: regionIndex >= 0 ? (row[regionIndex]?.trim() ?? "") : "",
      city: cityIndex >= 0 ? (row[cityIndex]?.trim() ?? "") : "",
    });
  }

  return courses;
}

export function loadCoursesFromCourseLinks(
  courseLinksPath: string,
  importCsvPath: string,
): CourseInput[] {
  const importCourses = loadCoursesFromImport(importCsvPath);
  const importById = new Map(importCourses.map((course) => [course.id, course]));

  if (!fs.existsSync(courseLinksPath)) {
    return importCourses;
  }

  const encoding = readCsvWithEncodingGuess(courseLinksPath);
  const parsed = parseCsv(encoding.content);
  const idIndex = parsed.headers.findIndex(
    (header) => normalizeCsvHeader(header) === "id",
  );
  const nameIndex = parsed.headers.findIndex(
    (header) => normalizeCsvHeader(header) === "name",
  );

  if (idIndex < 0) return importCourses;

  const courses: CourseInput[] = [];
  for (const row of parsed.rows) {
    const id = row[idIndex]?.trim() ?? "";
    if (!id) continue;
    const importCourse = importById.get(id);
    if (!importCourse) continue;
    courses.push({
      ...importCourse,
      name:
        nameIndex >= 0 && row[nameIndex]?.trim()
          ? row[nameIndex].trim()
          : importCourse.name,
    });
  }

  return courses.length > 0 ? courses : importCourses;
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function buildReviewRowsFromCandidates(
  candidates: NaverPriceCandidateRow[],
): string[][] {
  const bestById = new Map<string, NaverPriceCandidateRow>();

  for (const row of candidates) {
    if (!row.id) continue;
    const prev = bestById.get(row.id);
    if (!prev) {
      bestById.set(row.id, row);
      continue;
    }
    const prevRank = CONFIDENCE_RANK[prev.candidate_confidence] ?? 0;
    const nextRank = CONFIDENCE_RANK[row.candidate_confidence] ?? 0;
    if (nextRank > prevRank) {
      bestById.set(row.id, row);
    }
  }

  return [...bestById.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .map((row) => [
      row.id,
      row.name,
      row.address,
      row.candidate_title,
      row.candidate_address,
      row.candidate_phone,
      row.candidate_homepage_url,
      row.candidate_price_text,
      row.candidate_price_min,
      row.candidate_price_max,
      row.candidate_price_type,
      row.source_url,
      row.candidate_confidence,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
}

export async function searchNaverLocal(
  query: string,
  clientId: string,
  clientSecret: string,
): Promise<NaverLocalSearchItem[]> {
  const url = new URL("https://openapi.naver.com/v1/search/local.json");
  url.searchParams.set("query", query);
  url.searchParams.set("display", "5");
  url.searchParams.set("start", "1");
  url.searchParams.set("sort", "random");

  const response = await fetch(url.toString(), {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Naver Local Search failed (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as { items?: NaverLocalSearchItem[] };
  return data.items ?? [];
}

export function pickBestLocalItem(
  course: CourseInput,
  items: NaverLocalSearchItem[],
): NaverLocalSearchItem | null {
  if (items.length === 0) return null;

  let best: NaverLocalSearchItem | null = null;
  let bestScore = -1;

  for (const item of items) {
    const title = stripHtml(item.title);
    const normCourse = normalizeForMatch(course.name);
    const normTitle = normalizeForMatch(title);
    let score = overlapRatio(normCourse, normTitle) * 100;
    if (/골프|cc|컨트리/i.test(item.category)) score += 20;
    if (addressesAlign(course.address, item.roadAddress || item.address)) {
      score += 30;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  return best;
}
