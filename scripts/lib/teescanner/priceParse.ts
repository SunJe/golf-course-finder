import { parsePriceText } from "../naverPriceCandidates";

/** CSV 저장용 — 원(won) 단위 정수 */
export function parseTeescannerPriceText(rawText: string): {
  priceText: string;
  priceMin: number | null;
  priceMax: number | null;
  unit: "won";
} {
  const priceText = rawText.trim();
  if (!priceText) {
    return { priceText: "", priceMin: null, priceMax: null, unit: "won" };
  }

  const parsed = parsePriceText(priceText);
  if (parsed.min != null) {
    return {
      priceText,
      priceMin: parsed.min,
      priceMax: parsed.max ?? parsed.min,
      unit: "won",
    };
  }

  const amounts = new Set<number>();

  for (const match of priceText.matchAll(
    /(\d+(?:\.\d+)?)\s*~\s*(\d+(?:\.\d+)?)\s*만\s*원?/gi,
  )) {
    const low = Number.parseFloat(match[1]);
    const high = Number.parseFloat(match[2]);
    if (Number.isFinite(low) && low > 0) amounts.add(Math.round(low * 10_000));
    if (Number.isFinite(high) && high > 0) amounts.add(Math.round(high * 10_000));
  }

  for (const match of priceText.matchAll(/(\d+(?:\.\d+)?)\s*만\s*원?/gi)) {
    const man = Number.parseFloat(match[1]);
    if (Number.isFinite(man) && man > 0) {
      amounts.add(Math.round(man * 10_000));
    }
  }

  for (const match of priceText.matchAll(/(\d{1,3}(?:,\d{3})+|\d{4,})\s*원/g)) {
    const value = Number.parseInt(match[1].replace(/,/g, ""), 10);
    if (Number.isFinite(value) && value >= 10_000 && value <= 5_000_000) {
      amounts.add(value);
    }
  }

  const sorted = [...amounts].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { priceText, priceMin: null, priceMax: null, unit: "won" };
  }

  return {
    priceText,
    priceMin: sorted[0],
    priceMax: sorted[sorted.length - 1],
    unit: "won",
  };
}

export function formatWonForCsv(value: number | null): string {
  if (value == null) return "";
  return String(value);
}

export const FILTER_ONLY_LITERALS = [
  "그린피",
  "~9만원",
  "9~15만원",
  "15~20만원",
  "20만원~",
  "7~12시",
  "12시~4시",
  "새벽",
  "오전",
  "오후",
  "야간",
] as const;

export const EXCLUDE_AREA_KEYWORDS = [
  "조건으로 검색",
  "지역",
  "인원",
  "시간대",
  "그린피",
  "접기",
  "초기화",
  "검색",
  "쿠폰",
  "라운드하고",
] as const;

export const REAL_PRICE_CONTEXT_KEYWORDS = [
  "예약",
  "티타임",
  "시간",
  "홀",
  "카트",
  "캐디",
  "잔여",
  "팀",
  "코스",
] as const;

const FILTER_RANGE_PATTERNS = [
  /~\s*\d+(?:\.\d+)?\s*만\s*원?/i,
  /\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*만\s*원?/i,
  /\d+(?:\.\d+)?\s*만\s*원?\s*~/i,
  /~\s*\d+(?:\.\d+)?\s*만/i,
  /\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*만/i,
] as const;

const COMMA_WON_PATTERN = /\d{1,3}(?:,\d{3})+\s*원/;
const PRICE_HINT_PATTERN =
  /(\d{1,3}(?:,\d{3})+|\d+)\s*원|만\s*원|~\s*\d|그린피|₩/i;

export function isFilterRangePrice(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return FILTER_RANGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function hasCommaWonPrice(text: string): boolean {
  return COMMA_WON_PATTERN.test(text);
}

export function hasRealPriceContext(text: string): boolean {
  return REAL_PRICE_CONTEXT_KEYWORDS.some((keyword) => text.includes(keyword));
}

export function isExcludedAreaText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;

  const excludeHits = EXCLUDE_AREA_KEYWORDS.filter((keyword) =>
    trimmed.includes(keyword),
  ).length;

  if (excludeHits === 0) return false;
  if (hasCommaWonPrice(trimmed) && hasRealPriceContext(trimmed)) return false;
  if (/예약\s*가능|티타임|잔여\s*\d+\s*팀/i.test(trimmed)) return false;

  return excludeHits >= 2 || trimmed.length < 80;
}

export function isFilterOnlyPriceLine(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (isFilterRangePrice(trimmed)) return true;

  if (FILTER_ONLY_LITERALS.some((literal) => trimmed === literal)) return true;

  if (
    FILTER_ONLY_LITERALS.some((literal) => trimmed.includes(literal)) &&
    !hasCommaWonPrice(trimmed)
  ) {
    return true;
  }

  return false;
}

export function isRealPriceLine(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || isExcludedAreaText(trimmed)) return false;
  if (!PRICE_HINT_PATTERN.test(trimmed)) return false;
  if (isFilterOnlyPriceLine(trimmed)) return false;
  if (!hasRealPriceContext(trimmed)) return false;

  if (hasCommaWonPrice(trimmed)) return true;

  if (/\d{4,}\s*원/.test(trimmed) && hasRealPriceContext(trimmed)) return true;

  return false;
}

export type PriceLineClass = "filter_only" | "real" | "none";

export function classifyPriceLine(text: string): PriceLineClass {
  if (isRealPriceLine(text)) return "real";
  if (isFilterOnlyPriceLine(text)) return "filter_only";
  return "none";
}

export function extractClassifiedPriceCandidates(text: string): {
  realPriceCandidates: string[];
  filterPriceCandidates: string[];
} {
  const lines = text.split(/\n+/);
  const realPriceCandidates: string[] = [];
  const filterPriceCandidates: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const classification = classifyPriceLine(trimmed);
    if (classification === "real") {
      realPriceCandidates.push(trimmed);
    } else if (classification === "filter_only") {
      filterPriceCandidates.push(trimmed);
    }
  }

  return {
    realPriceCandidates: [...new Set(realPriceCandidates)].slice(0, 20),
    filterPriceCandidates: [...new Set(filterPriceCandidates)].slice(0, 20),
  };
}

export function extractPriceSnippets(pageText: string): string {
  return extractPriceCandidates(pageText).join(" | ");
}

export function extractPriceCandidates(pageText: string): string[] {
  return extractClassifiedPriceCandidates(pageText).realPriceCandidates;
}

export function countReservationSlots(pageText: string): number {
  const timeSlots = pageText.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/g) ?? [];
  const teamSlots = pageText.match(/\d+\s*팀/g) ?? [];
  return Math.max(timeSlots.length, teamSlots.length);
}
