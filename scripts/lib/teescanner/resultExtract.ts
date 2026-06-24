import type { Page } from "playwright";
import {
  extractClassifiedPriceCandidates,
  isExcludedAreaText,
} from "./priceParse";
import type { PriceSource } from "./types";

export interface PriceExtractionResult {
  priceSource: PriceSource;
  filterPriceCandidates: string[];
  realPriceCandidates: string[];
  resultAreaText: string;
  slotAreaText: string;
}

const RESULT_AREA_SELECTORS = [
  '[class*="round"]',
  '[class*="reservation"]',
  '[class*="booking"]',
  '[class*="tee"]',
  '[class*="time"]',
  "main",
] as const;

const SLOT_CARD_SELECTORS = [
  '[class*="slot"]',
  '[class*="tee-time"]',
  '[class*="teetime"]',
  '[class*="timetable"]',
  '[class*="time-slot"]',
] as const;

async function collectTextsFromSelectors(
  page: Page,
  selectors: readonly string[],
): Promise<string[]> {
  const texts: string[] = [];
  const seen = new Set<string>();

  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const text = (await locator.nth(index).innerText().catch(() => "")).trim();
      if (!text || seen.has(text) || isExcludedAreaText(text)) continue;
      seen.add(text);
      texts.push(text);
    }
  }

  return texts;
}

function classifyFromText(
  text: string,
  source: PriceSource,
): Pick<
  PriceExtractionResult,
  "priceSource" | "filterPriceCandidates" | "realPriceCandidates"
> {
  const { realPriceCandidates, filterPriceCandidates } =
    extractClassifiedPriceCandidates(text);

  if (realPriceCandidates.length > 0) {
    return { priceSource: source, realPriceCandidates, filterPriceCandidates };
  }

  if (filterPriceCandidates.length > 0) {
    return {
      priceSource: "filter_only",
      realPriceCandidates,
      filterPriceCandidates,
    };
  }

  return {
    priceSource: "none",
    realPriceCandidates,
    filterPriceCandidates,
  };
}

function mergeClassified(
  primary: ReturnType<typeof classifyFromText>,
  secondary: ReturnType<typeof classifyFromText>,
): Pick<
  PriceExtractionResult,
  "priceSource" | "filterPriceCandidates" | "realPriceCandidates"
> {
  const realPriceCandidates = [
    ...new Set([
      ...primary.realPriceCandidates,
      ...secondary.realPriceCandidates,
    ]),
  ];
  const filterPriceCandidates = [
    ...new Set([
      ...primary.filterPriceCandidates,
      ...secondary.filterPriceCandidates,
    ]),
  ];

  if (realPriceCandidates.length > 0) {
    const priceSource =
      primary.realPriceCandidates.length > 0
        ? primary.priceSource
        : secondary.priceSource;
    return { priceSource, realPriceCandidates, filterPriceCandidates };
  }

  if (filterPriceCandidates.length > 0) {
    return {
      priceSource: "filter_only",
      realPriceCandidates,
      filterPriceCandidates,
    };
  }

  return {
    priceSource: "none",
    realPriceCandidates,
    filterPriceCandidates,
  };
}

export function extractPricesFromText(
  text: string,
  source: PriceSource = "body_fallback",
): PriceExtractionResult {
  const filteredLines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line && !isExcludedAreaText(line));
  const filteredText = filteredLines.join("\n");
  const classified = classifyFromText(filteredText, source);

  return {
    ...classified,
    resultAreaText: filteredText,
    slotAreaText: "",
  };
}

export async function extractPricesFromPage(
  page: Page,
): Promise<PriceExtractionResult> {
  const slotTexts = await collectTextsFromSelectors(page, SLOT_CARD_SELECTORS);
  const resultTexts = await collectTextsFromSelectors(
    page,
    RESULT_AREA_SELECTORS,
  );
  const slotAreaText = slotTexts.join("\n");
  const resultAreaText = resultTexts.join("\n");

  const slotClassified = slotAreaText
    ? classifyFromText(slotAreaText, "slot_card")
    : classifyFromText("", "none");
  const resultClassified = resultAreaText
    ? classifyFromText(resultAreaText, "result_card")
    : classifyFromText("", "none");

  const merged = mergeClassified(slotClassified, resultClassified);
  if (merged.realPriceCandidates.length > 0 || merged.filterPriceCandidates.length > 0) {
    return {
      ...merged,
      resultAreaText: resultAreaText || slotAreaText,
      slotAreaText,
    };
  }

  const bodyText = await page.locator("body").innerText();
  const fallback = extractPricesFromText(bodyText, "body_fallback");
  return {
    ...fallback,
    resultAreaText: fallback.resultAreaText || resultAreaText || bodyText,
    slotAreaText,
  };
}
