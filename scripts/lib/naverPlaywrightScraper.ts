import type { CourseInput, ParsedPrice, PriceType, SearchQueryVariant } from "./naverPriceCandidates";
import {
  buildSearchQueryVariants,
  computeConfidence,
  getNaverSearchUrl,
  normalizeForMatch,
  overlapRatio,
  parsePriceText,
  stripMembershipSuffix,
} from "./naverPriceCandidates";
import {
  parseDifficultyRaw,
  type ParsedDifficulty,
} from "./difficultyUtils";

export interface ScrapeExtractResult {
  pageTitle: string;
  bodyText: string;
  candidateTitle: string;
  candidateAddress: string;
  candidatePhone: string;
  candidateHomepageUrl: string;
  candidatePriceText: string;
  candidatePriceMin: string;
  candidatePriceMax: string;
  candidatePriceType: PriceType;
  candidateDifficulty: string;
  candidateDifficultyText: string;
  candidateAvgScore: string;
  candidateReservationPricesText: string;
  reasonNotes: string[];
}

export interface ScrapePageOptions {
  query: string;
  headful: boolean;
  timeoutMs: number;
}

const LANDLINE_PHONE =
  /(?:02|0[3-6]\d|070)[-\s]?\d{3,4}[-\s]?\d{4}/g;

const PRICE_LINE =
  /(?:그린피|예약|예약가|주중|주말|1인|₩|\d{1,3}(?:,\d{3})+\s*원|\d+\s*원)/;

const NAVER_HOST_BLOCK =
  /(?:search\.naver|map\.naver|blog\.naver|cafe\.naver|m\.blog\.naver|place\.naver|booking\.naver|smartstore\.naver)/i;

const BOOKING_URL_HINT = /(?:booking|reserve|reservation|예약)/i;

export function buildScrapeSearchQueries(course: CourseInput): SearchQueryVariant[] {
  return buildSearchQueryVariants(course);
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("010")) return "";
  if (digits.length === 10 && digits.startsWith("02")) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return raw.trim();
}

export function extractPhonesFromText(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(LANDLINE_PHONE)) {
    const normalized = normalizePhone(match[0]);
    if (normalized && !normalized.startsWith("010")) {
      found.add(normalized);
    }
  }
  return [...found];
}

export function pickBestPhone(phones: string[]): string {
  if (phones.length === 0) return "";
  const scored = phones.map((phone) => {
    let score = 0;
    if (/^02-/.test(phone)) score += 2;
    if (/^0[3-6]\d-/.test(phone)) score += 3;
    if (/^070-/.test(phone)) score += 1;
    return { phone, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.phone ?? "";
}

export function isHomepageCandidate(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) return false;
    if (NAVER_HOST_BLOCK.test(parsed.hostname)) return false;
    if (BOOKING_URL_HINT.test(parsed.href)) return false;
    if (/\.(jpg|jpeg|png|gif|webp|svg|pdf)(\?|$)/i.test(parsed.pathname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function extractHomepageUrlsFromText(text: string): string[] {
  const urls = new Set<string>();
  const pattern = /https?:\/\/[^\s"'<>)\]]+/gi;
  for (const match of text.matchAll(pattern)) {
    const cleaned = match[0].replace(/[.,;]+$/, "");
    if (isHomepageCandidate(cleaned)) {
      urls.add(cleaned);
    }
  }
  return [...urls];
}

export function pickBestHomepage(urls: string[]): { url: string; ambiguous: boolean } {
  if (urls.length === 0) return { url: "", ambiguous: false };
  if (urls.length === 1) return { url: urls[0], ambiguous: false };
  const official = urls.find((u) =>
    /official|www\.|\.co\.kr|\.com/i.test(u),
  );
  if (official) return { url: official, ambiguous: true };
  return { url: urls[0], ambiguous: true };
}

export function extractPriceLinesFromText(text: string): ParsedPrice[] {
  const results: ParsedPrice[] = [];
  const seen = new Set<string>();

  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 120) continue;
    if (!PRICE_LINE.test(trimmed)) continue;
    const parsed = parsePriceText(trimmed);
    if (!parsed.priceText || seen.has(parsed.priceText)) continue;
    if (parsed.min === undefined && !/\d{1,3}(?:,\d{3})+\s*원|\d+\s*원|₩/.test(trimmed)) {
      continue;
    }
    if (trimmed.length > 80 && parsed.min === undefined) continue;
    seen.add(parsed.priceText);
    results.push(parsed);
  }

  if (results.length === 0) {
    const blockMatch = text.match(
      /(?:그린피|예약가|예약|주중|주말|1인)[^\n]{0,40}(?:\d{1,3}(?:,\d{3})+|\d+)\s*원/g,
    );
    if (blockMatch) {
      for (const fragment of blockMatch.slice(0, 5)) {
        const parsed = parsePriceText(fragment.trim());
        if (parsed.priceText && !seen.has(parsed.priceText)) {
          seen.add(parsed.priceText);
          results.push(parsed);
        }
      }
    }
  }

  return results;
}

export function pickBestPrice(prices: ParsedPrice[]): ParsedPrice {
  if (prices.length === 0) {
    return { priceText: "", type: "unknown" };
  }

  const scored = prices.map((p) => {
    let score = 0;
    if (/그린피/i.test(p.priceText)) score += 4;
    if (/예약|1인/i.test(p.priceText)) score += 3;
    if (/주중|주말/i.test(p.priceText)) score += 2;
    if (p.min !== undefined) score += 2;
    return { p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.p ?? prices[0];
}

function extractLabeledLine(text: string, label: string): string {
  const lines = text.split(/\n/).map((line) => line.trim());
  const index = lines.findIndex((line) => line === label);
  if (index >= 0 && lines[index + 1]) {
    return lines[index + 1].trim();
  }
  return "";
}

/** 네이버 플레이스 카드 — 코스 난이도 (예: 2.3/10 → difficulty `2.3`) */
export function extractCourseDifficulty(text: string): ParsedDifficulty {
  const lines = text.split(/\n/).map((line) => line.trim());
  let raw = "";

  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i] === "코스 난이도" || lines[i] === "코스난이도") {
      for (let j = i + 1; j <= i + 4 && j < lines.length; j += 1) {
        const match = lines[j].match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
        if (match) {
          raw = `${match[1]}/${match[2]}`;
          break;
        }
      }
      if (raw) break;
    }
  }

  if (!raw) {
    const inline = text.match(
      /코스\s*난이도[\s\S]{0,80}?(\d+(?:\.\d+)?)\s*\/\s*(\d+)/,
    );
    if (inline) raw = `${inline[1]}/${inline[2]}`;
  }

  if (!raw) {
    return { difficulty: "", difficultyText: "" };
  }

  return parseDifficultyRaw(raw);
}

/** 네이버 플레이스 — 평균 스코어/타수 */
export function extractAverageScore(text: string): string {
  const lines = text.split(/\n/).map((line) => line.trim());

  for (let i = 0; i < lines.length; i += 1) {
    if (/^평균\s*(스코어|타수)$/.test(lines[i])) {
      for (let j = i + 1; j <= i + 4 && j < lines.length; j += 1) {
        const value = lines[j].replace(/\s/g, "");
        if (/^\d{2,3}$/.test(value)) return value;
      }
    }
  }

  const match = text.match(/평균\s*(?:스코어|타수)[\s\S]{0,60}?(\d{2,3})/);
  return match ? match[1] : "";
}

const GREEN_FEE_MIN = 80_000;
const GREEN_FEE_MAX = 800_000;

function parseWonAmount(raw: string): number | null {
  const value = Number.parseInt(raw.replace(/,/g, ""), 10);
  if (!Number.isFinite(value)) return null;
  if (value < GREEN_FEE_MIN || value > GREEN_FEE_MAX) return null;
  return value;
}

/** 네이버 예약 패널 그린피/예약가 숫자 추출 (패널에 금액 없으면 빈 배열) */
export function extractNaverReservationPrices(text: string): number[] {
  const lines = text.split(/\n/).map((line) => line.trim());
  const amounts = new Set<number>();
  let inReservationSection = false;

  for (const line of lines) {
    if (/네이버\s*예약/.test(line)) {
      inReservationSection = true;
    }
    if (
      inReservationSection &&
      /^(방문자\s*리뷰|편의|날씨|홈페이지|전화번호|주소|영업시간|코스\s*난이도|평균\s*스코어)$/.test(
        line,
      )
    ) {
      break;
    }

    if (inReservationSection) {
      for (const match of line.matchAll(/(\d{1,3}(?:,\d{3})+)\s*원/g)) {
        const amount = parseWonAmount(match[1]);
        if (amount !== null) amounts.add(amount);
      }
    }
  }

  if (amounts.size === 0) {
    const reservationBlock = text.split(/네이버\s*예약/i).slice(1).join("\n");
    const scanText = reservationBlock.slice(0, 2500);
    for (const match of scanText.matchAll(/(\d{1,3}(?:,\d{3})+)\s*원/g)) {
      const amount = parseWonAmount(match[1]);
      if (amount !== null) amounts.add(amount);
    }
  }

  return [...amounts].sort((a, b) => a - b);
}

export function formatReservationPricesText(amounts: number[]): string {
  if (amounts.length === 0) return "";
  const formatted = amounts.map(
    (amount) => `${amount.toLocaleString("ko-KR")}원`,
  );
  return `네이버 예약: ${formatted.join("; ")}`;
}

export function buildPriceFromReservationAmounts(
  amounts: number[],
): ParsedPrice {
  if (amounts.length === 0) {
    return { priceText: "", type: "unknown" };
  }
  const priceText = formatReservationPricesText(amounts);
  const min = amounts[0];
  const max = amounts[amounts.length - 1];
  return {
    priceText,
    min,
    max: min === max ? min : max,
    type: "reservation_price",
  };
}

function extractTitleFromBody(bodyText: string, courseName: string): string {
  const lines = bodyText.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.length > 60 || line.length < 3) continue;
    if (/검색 결과|네이버|저장|길찾기|공유|더보기/.test(line)) continue;
    const normLine = normalizeForMatch(line);
    const normCourse = normalizeForMatch(courseName);
    if (
      normLine.includes(normCourse.slice(0, 4)) ||
      normCourse.includes(normLine.slice(0, 4))
    ) {
      return line;
    }
  }
  return courseName;
}

function extractTitleFromPageTitle(pageTitle: string, courseName: string): string {
  const cleaned = pageTitle
    .replace(/\s*:\s*네이버\s*검색\s*$/, "")
    .replace(/\s*-\s*네이버\s*$/, "")
    .trim();
  if (cleaned && cleaned.length <= 80) return cleaned;
  return courseName;
}

function extractAddressFromText(text: string, course: CourseInput): string {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i] === "주소" && lines[i + 1]) {
      const addr = lines[i + 1].replace(/지도$/, "").trim();
      if (addr.length >= 8) return addr;
    }
  }
  for (const line of lines) {
    if (line.length > 120) continue;
    if (/(시|군|구)\s/.test(line) && /\d/.test(line)) {
      if (course.city && line.includes(course.city)) return line;
      if (course.address && overlapRatio(course.address, line) > 0.3) {
        return line;
      }
    }
  }
  for (const line of lines) {
    if (
      course.city &&
      line.includes(course.city) &&
      /(로|길|읍|면|동)\s*\d/.test(line)
    ) {
      return line.slice(0, 120);
    }
  }
  return "";
}

export function extractFromPageContent(
  pageTitle: string,
  bodyText: string,
  course: CourseInput,
): ScrapeExtractResult {
  const reasonNotes: string[] = [];
  const compactText = bodyText.replace(/\s+/g, " ").slice(0, 8000);

  const candidateTitle =
    extractTitleFromBody(bodyText, course.name) ||
    extractTitleFromPageTitle(pageTitle, course.name);
  const candidateAddress = extractAddressFromText(bodyText, course);

  const phones = extractPhonesFromText(compactText);
  const labeledPhone = extractLabeledLine(bodyText, "전화번호");
  const candidatePhone = pickBestPhone([
    ...phones,
    ...(labeledPhone ? [normalizePhone(labeledPhone)] : []),
  ].filter(Boolean));
  if (phones.length > 1 && candidatePhone) {
    reasonNotes.push(`phone candidates: ${phones.length}`);
  }

  const homepageUrls = extractHomepageUrlsFromText(compactText);
  const labeledHomepage = extractLabeledLine(bodyText, "홈페이지");
  if (labeledHomepage && isHomepageCandidate(labeledHomepage)) {
    homepageUrls.unshift(labeledHomepage);
  }
  const { url: candidateHomepageUrl, ambiguous } = pickBestHomepage(homepageUrls);
  if (ambiguous) reasonNotes.push("homepage ambiguous");
  if (homepageUrls.length === 0) reasonNotes.push("homepage not found");

  const reservationAmounts = extractNaverReservationPrices(bodyText);
  const reservationPricesText = formatReservationPricesText(reservationAmounts);
  const reservationPrice = buildPriceFromReservationAmounts(reservationAmounts);

  const parsedDifficulty = extractCourseDifficulty(bodyText);
  const candidateAvgScore = extractAverageScore(bodyText);

  if (reservationAmounts.length > 0) {
    reasonNotes.push(`reservation prices: ${reservationAmounts.length}`);
  } else {
    reasonNotes.push("naver reservation price not found");
  }
  if (parsedDifficulty.difficulty || parsedDifficulty.difficultyText) {
    reasonNotes.push(
      `difficulty: ${parsedDifficulty.difficultyText || parsedDifficulty.difficulty}`,
    );
  }

  return {
    pageTitle,
    bodyText: compactText.slice(0, 500),
    candidateTitle,
    candidateAddress,
    candidatePhone,
    candidateHomepageUrl,
    candidatePriceText: reservationPrice.priceText,
    candidatePriceMin:
      reservationPrice.min !== undefined ? String(reservationPrice.min) : "",
    candidatePriceMax:
      reservationPrice.max !== undefined ? String(reservationPrice.max) : "",
    candidatePriceType: reservationPrice.type,
    candidateDifficulty: parsedDifficulty.difficulty,
    candidateDifficultyText: parsedDifficulty.difficultyText,
    candidateAvgScore,
    candidateReservationPricesText: reservationPricesText,
    reasonNotes,
  };
}

export function scoreScrapeExtract(
  course: CourseInput,
  extract: ScrapeExtractResult,
): number {
  const normCourse = normalizeForMatch(course.name);
  const normTitle = normalizeForMatch(extract.candidateTitle);
  let score = overlapRatio(normCourse, normTitle) * 100;
  if (extract.candidateAddress && course.address) {
    if (extract.candidateAddress.includes(course.city)) score += 20;
  }
  if (extract.candidatePhone) score += 10;
  if (extract.candidateHomepageUrl) score += 8;
  if (extract.candidateReservationPricesText) score += 15;
  if (extract.candidateDifficulty) score += 5;
  return score;
}

export interface ScrapeAttemptResult {
  query: string;
  queryVariant: string;
  attemptedQueries: string;
  sourceUrl: string;
  extract: ScrapeExtractResult;
  score: number;
}

export async function scrapeNaverSearchWithPlaywright(
  course: CourseInput,
  options: {
    headful: boolean;
    timeoutMs: number;
    queries?: SearchQueryVariant[];
  },
): Promise<ScrapeAttemptResult | null> {
  const { chromium } = await import("playwright");
  const queryVariants = options.queries ?? buildScrapeSearchQueries(course);
  const attemptedQueries = queryVariants.map((entry) => entry.query).join(" | ");

  const browser = await chromium.launch({ headless: !options.headful });
  try {
    const context = await browser.newContext({
      locale: "ko-KR",
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    let best: ScrapeAttemptResult | null = null;

    for (const { query, queryVariant } of queryVariants) {
      const sourceUrl = getNaverSearchUrl(query);
      try {
        await page.goto(sourceUrl, {
          waitUntil: "domcontentloaded",
          timeout: options.timeoutMs,
        });
        await page.waitForTimeout(1500);

        const pageTitle = await page.title();
        let bodyText = "";

        const regionSelectors = [
          "#main_pack",
          ".sp_nreview",
          ".place_section",
          ".api_subject_bx",
          "#place-app-root",
        ];
        for (const selector of regionSelectors) {
          const el = page.locator(selector).first();
          if ((await el.count()) > 0) {
            const text = await el.innerText().catch(() => "");
            if (text && text.length > bodyText.length) {
              bodyText = text;
            }
          }
        }
        if (!bodyText || bodyText.length < 200) {
          bodyText = await page.locator("body").innerText().catch(() => "");
        }

        if (!bodyText.trim()) continue;

        const extract = extractFromPageContent(pageTitle, bodyText, course);
        const score = scoreScrapeExtract(course, extract);
        const attempt: ScrapeAttemptResult = {
          query,
          queryVariant,
          attemptedQueries,
          sourceUrl,
          extract,
          score,
        };

        if (!best || score > best.score) {
          best = attempt;
        }
        if (score >= 80) break;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.warn(`[scrape warn] query="${query}": ${message}`);
      }
    }

    await context.close();
    return best;
  } finally {
    await browser.close();
  }
}

export function buildScrapeCandidateRow(
  course: CourseInput,
  attempt: ScrapeAttemptResult,
  collectedAt: string,
): import("./naverPriceCandidates").NaverPriceCandidateRow {
  const { extract, query, queryVariant, attemptedQueries, sourceUrl } = attempt;
  const { confidence, reason } = computeConfidence(course, {
    title: extract.candidateTitle,
    address: extract.candidateAddress,
    priceText: extract.candidateReservationPricesText,
    phone: extract.candidatePhone,
    homepageUrl: extract.candidateHomepageUrl,
  });

  const reasonParts = [reason, ...extract.reasonNotes];
  if (!extract.candidateReservationPricesText) {
    reasonParts.push("naver reservation price not found — price fields left empty");
  }

  return {
    id: course.id,
    name: course.name,
    address: course.address,
    query,
    query_variant: queryVariant,
    attempted_queries: attemptedQueries,
    matched_query: query,
    source: "naver_scrape",
    candidate_title: extract.candidateTitle,
    candidate_address: extract.candidateAddress,
    candidate_phone: extract.candidatePhone,
    candidate_homepage_url: extract.candidateHomepageUrl,
    candidate_price_text: extract.candidatePriceText,
    candidate_price_min: extract.candidatePriceMin,
    candidate_price_max: extract.candidatePriceMax,
    candidate_price_type: extract.candidatePriceType,
    candidate_difficulty: extract.candidateDifficulty,
    candidate_difficulty_text: extract.candidateDifficultyText,
    candidate_avg_score: extract.candidateAvgScore,
    candidate_reservation_prices_text: extract.candidateReservationPricesText,
    candidate_confidence: confidence,
    needs_review: "true",
    reason: reasonParts.join("; "),
    source_url: sourceUrl,
    collected_at: collectedAt,
  };
}
