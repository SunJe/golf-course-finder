import type { Locator, Page } from "playwright";
import type { StepScreenshotTracker } from "./debug";
import { sleep } from "./access";
import { isFilterOnlyPriceLine } from "./priceParse";
import {
  loadAllVisibleSlotCardsForSelectedDay,
  resolvePriceScope,
} from "./slotLoadScan";

const SLOT_CARD_SELECTORS = [
  '[class*="slot"]',
  '[class*="tee-time"]',
  '[class*="teetime"]',
  '[class*="timetable"]',
  '[class*="time-slot"]',
  '[class*="reservation"]',
  '[class*="booking"]',
  '[class*="item"]',
  "li",
] as const;

const TIME_PATTERN = /\b([01]?\d|2[0-3]):[0-5]\d\b/;
const COMMA_WON_PATTERN = /\d{1,3}(?:,\d{3})+\s*원/g;
const CARD_CONTEXT_PATTERN = /(4인|캐디|할인|미지정)/i;

export type SlotPriceMode = "payable_only" | "mixed_original_sale" | "uncertain";

export interface SlotCardRecord {
  slotTime: string;
  slotRawText: string;
  salePrices: number[];
  originalPrices: number[];
  payablePrice: number | null;
  priceElementsCount: number;
  visible: boolean;
  uncertain: boolean;
}

export interface SlotCardExtraction {
  slotCardCount: number;
  loadedSlotCardCount: number;
  visibleSlotCardCount: number;
  availableTeamCountFromDateTab: number | null;
  slotLoadComplete: boolean;
  slotScrollSteps: number;
  slotCountBeforeScroll: number;
  slotCountAfterScroll: number;
  slotCountStableReason: string;
  priceScope: string;
  dateTabMatchConfidence: string;
  dateTabCardsSnapshot: string;
  selectedDateTabRawText: string;
  slotTimes: string[];
  slotCards: SlotCardRecord[];
  slotCardRawTexts: string[];
  slotPriceTextsUnique: string[];
  salePriceAmounts: number[];
  originalPriceAmounts: number[];
  salePriceCandidates: string[];
  originalPriceCandidates: string[];
  slotPriceMode: SlotPriceMode;
  excludedOriginalFromMinMax: boolean;
  areaText: string;
}

interface CardPriceElement {
  amount: number;
  strikethrough: boolean;
}

interface CollectedCard {
  locator: Locator | null;
  rawText: string;
  visible: boolean;
}

function formatWonDisplay(amount: number): string {
  return `${amount.toLocaleString("en-US")}원`;
}

function parseWonAmount(text: string): number | null {
  const match = text.match(/(\d{1,3}(?:,\d{3})+|\d{4,})\s*원/);
  if (!match) return null;
  const value = Number.parseInt(match[1].replace(/,/g, ""), 10);
  if (!Number.isFinite(value) || value < 30_000 || value > 5_000_000) {
    return null;
  }
  return value;
}

function extractPriceAmountsFromRawText(rawText: string): number[] {
  const amounts: number[] = [];
  for (const match of rawText.matchAll(COMMA_WON_PATTERN)) {
    const token = match[0];
    if (isFilterOnlyPriceLine(token)) continue;
    const value = parseWonAmount(token);
    if (value != null) amounts.push(value);
  }
  return [...new Set(amounts)].sort((a, b) => a - b);
}

function isSlotCardLike(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 10) return false;
  if (!TIME_PATTERN.test(trimmed)) return false;
  if (!CARD_CONTEXT_PATTERN.test(trimmed)) return false;
  if (!/\d{1,3}(?:,\d{3})+\s*원/.test(trimmed)) return false;
  if (isFilterOnlyPriceLine(trimmed)) return false;
  const timeCount = (trimmed.match(TIME_PATTERN) ?? []).length;
  if (timeCount > 2) return false;
  return true;
}

function splitMultiTimeCard(rawText: string): string[] {
  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    if (TIME_PATTERN.test(line) && buffer.length > 0) {
      chunks.push(buffer.join("\n"));
      buffer = [line];
    } else {
      buffer.push(line);
    }
  }
  if (buffer.length > 0) chunks.push(buffer.join("\n"));

  return chunks.filter((chunk) => {
    const amounts = extractPriceAmountsFromRawText(chunk);
    return TIME_PATTERN.test(chunk) && amounts.length > 0 && CARD_CONTEXT_PATTERN.test(chunk);
  });
}

async function isVisibleCard(locator: Locator): Promise<boolean> {
  try {
    if ((await locator.count()) === 0) return false;
    if (!(await locator.isVisible())) return false;
    const box = await locator.boundingBox();
    if (!box) return false;
    return box.width > 0 && box.height > 0;
  } catch {
    return false;
  }
}

async function readCardPriceElements(card: Locator): Promise<CardPriceElement[]> {
  return card.evaluate((root) => {
    const wonRe = /^(\d{1,3}(?:,\d{3})+)\s*원$/;
    const results: CardPriceElement[] = [];
    const elements = root.querySelectorAll("*");

    for (const el of elements) {
      const text = (el.textContent ?? "").trim();
      const match = text.match(wonRe);
      if (!match) continue;

      let hasChildPrice = false;
      for (const child of el.children) {
        if (wonRe.test((child.textContent ?? "").trim())) {
          hasChildPrice = true;
          break;
        }
      }
      if (hasChildPrice) continue;

      const style = window.getComputedStyle(el);
      let strikethrough = (style.textDecorationLine ?? "").includes("line-through");
      if (!strikethrough) {
        let node: Element | null = el;
        while (node && node !== root) {
          const parentStyle = window.getComputedStyle(node);
          if ((parentStyle.textDecorationLine ?? "").includes("line-through")) {
            strikethrough = true;
            break;
          }
          node = node.parentElement;
        }
      }

      const amount = Number.parseInt(match[1].replace(/,/g, ""), 10);
      if (!Number.isFinite(amount)) continue;
      results.push({ amount, strikethrough });
    }

    return results;
  });
}

function classifyFromRawHeuristic(amounts: number[]): {
  salePrices: number[];
  originalPrices: number[];
  payablePrice: number | null;
  uncertain: boolean;
} {
  if (amounts.length === 0) {
    return {
      salePrices: [],
      originalPrices: [],
      payablePrice: null,
      uncertain: true,
    };
  }

  if (amounts.length === 1) {
    return {
      salePrices: [amounts[0]],
      originalPrices: [],
      payablePrice: amounts[0],
      uncertain: false,
    };
  }

  const min = amounts[0];
  const max = amounts[amounts.length - 1];
  return {
    salePrices: [min],
    originalPrices: max !== min ? [max] : [],
    payablePrice: min,
    uncertain: false,
  };
}

function mergeWithCssAuxiliary(
  rawText: string,
  priceElements: CardPriceElement[],
): {
  salePrices: number[];
  originalPrices: number[];
  payablePrice: number | null;
  uncertain: boolean;
} {
  const amounts = extractPriceAmountsFromRawText(rawText);

  if (amounts.length === 0) {
    return {
      salePrices: [],
      originalPrices: [],
      payablePrice: null,
      uncertain: true,
    };
  }

  const cssOriginal = [
    ...new Set(priceElements.filter((item) => item.strikethrough).map((item) => item.amount)),
  ];
  const cssSale = [
    ...new Set(priceElements.filter((item) => !item.strikethrough).map((item) => item.amount)),
  ];

  let salePrices = classifyFromRawHeuristic(amounts).salePrices;
  let originalPrices = classifyFromRawHeuristic(amounts).originalPrices;

  if (cssOriginal.length > 0) {
    originalPrices = [...new Set([...originalPrices, ...cssOriginal])].sort(
      (a, b) => a - b,
    );
    const saleFromAmounts = amounts.filter((amount) => !cssOriginal.includes(amount));
    if (saleFromAmounts.length > 0) {
      salePrices = [Math.min(...saleFromAmounts)];
    }
  }

  if (salePrices.length === 0 && amounts.length >= 2) {
    salePrices = [Math.min(...amounts)];
    originalPrices = [Math.max(...amounts)];
  } else if (salePrices.length === 0 && amounts.length === 1) {
    if (cssOriginal.includes(amounts[0])) {
      originalPrices = [amounts[0]];
      salePrices = [];
    } else {
      salePrices = [amounts[0]];
    }
  } else if (salePrices.length === 0 && cssSale.length > 0) {
    salePrices = [Math.min(...cssSale)];
  }

  if (
    salePrices.length === 1 &&
    originalPrices.includes(salePrices[0]!) &&
    amounts.length >= 2
  ) {
    salePrices = amounts.filter((amount) => !originalPrices.includes(amount));
  }

  originalPrices = originalPrices.filter((amount) => !salePrices.includes(amount));

  const payablePrice =
    salePrices.length > 0 ? Math.min(...salePrices) : null;

  return {
    salePrices: [...new Set(salePrices)].sort((a, b) => a - b),
    originalPrices: [...new Set(originalPrices)].sort((a, b) => a - b),
    payablePrice,
    uncertain: salePrices.length === 0,
  };
}

function resolveSlotPriceMode(cards: SlotCardRecord[]): SlotPriceMode {
  if (cards.length === 0) return "uncertain";

  const hasSale = cards.some((card) => card.salePrices.length > 0);
  const hasUncertain = cards.some((card) => card.uncertain);
  const hasMixed = cards.some(
    (card) => card.salePrices.length > 0 && card.originalPrices.length > 0,
  );

  if (!hasSale || hasUncertain) return "uncertain";
  if (hasMixed) return "mixed_original_sale";
  return "payable_only";
}

function cardKey(rawText: string): string {
  const time = rawText.match(TIME_PATTERN)?.[0] ?? "";
  const amounts = extractPriceAmountsFromRawText(rawText).join(",");
  return `${time}|${amounts}|${rawText.slice(0, 80)}`;
}

async function findCardContainer(timeLocator: Locator): Promise<Locator> {
  const selectors = [
    "xpath=ancestor::li[1]",
    "xpath=ancestor::*[@role='listitem'][1]",
    "xpath=ancestor::article[1]",
    "xpath=ancestor::div[contains(@class,'item')][1]",
    "xpath=ancestor::div[1]",
  ];

  for (const selector of selectors) {
    const container = timeLocator.locator(selector);
    if ((await container.count()) > 0) {
      const text = (await container.innerText().catch(() => "")).trim();
      const amounts = extractPriceAmountsFromRawText(text);
      if (TIME_PATTERN.test(text) && amounts.length > 0) {
        return container;
      }
    }
  }

  return timeLocator.locator("xpath=ancestor::div[1]").first();
}

async function collectSlotCards(page: Page): Promise<CollectedCard[]> {
  const collected: CollectedCard[] = [];
  const seen = new Set<string>();

  const pushCard = async (locator: Locator | null, rawText: string) => {
    const chunks = splitMultiTimeCard(rawText);
    const texts = chunks.length > 0 ? chunks : isSlotCardLike(rawText) ? [rawText] : [];

    for (const chunk of texts) {
      if (!isSlotCardLike(chunk) && extractPriceAmountsFromRawText(chunk).length === 0) {
        continue;
      }
      const key = cardKey(chunk);
      if (seen.has(key)) continue;
      seen.add(key);

      const visible = locator ? await isVisibleCard(locator) : false;
      collected.push({ locator, rawText: chunk, visible });
    }
  };

  for (const selector of SLOT_CARD_SELECTORS) {
    const locator = page.locator(selector);
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const card = locator.nth(index);
      const rawText = (await card.innerText().catch(() => "")).trim();
      if (!rawText) continue;
      if (!TIME_PATTERN.test(rawText) && !CARD_CONTEXT_PATTERN.test(rawText)) continue;
      await pushCard(card, rawText);
    }
  }

  const timeLocator = page.locator("text=/\\b([01]?\\d|2[0-3]):[0-5]\\d\\b/");
  const timeCount = await timeLocator.count();
  for (let index = 0; index < timeCount; index += 1) {
    const timeEl = timeLocator.nth(index);
    try {
      if (!(await timeEl.isVisible())) continue;
      const container = await findCardContainer(timeEl);
      const rawText = (await container.innerText().catch(() => "")).trim();
      if (!rawText) continue;
      await pushCard(container, rawText);
    } catch {
      /* try next time anchor */
    }
  }

  return collected;
}

export async function collectSlotCardsForCount(page: Page): Promise<number> {
  const cards = await collectSlotCards(page);
  return cards.length;
}

export async function prepareSlotCardsViewport(
  page: Page,
  shots?: StepScreenshotTracker,
): Promise<void> {
  const teeArea = page.locator("main").first();
  if ((await teeArea.count()) > 0) {
    await teeArea.scrollIntoViewIfNeeded().catch(() => undefined);
  }

  await page.mouse.wheel(0, 400);
  await sleep(1500);

  const firstTime = page.locator("text=/\\b([01]?\\d|2[0-3]):[0-5]\\d\\b/").first();
  if ((await firstTime.count()) > 0) {
    await firstTime.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.mouse.wheel(0, 300);
    await sleep(1000);
  }

  if (shots) {
    await shots.capture("slot_cards_scrolled_into_view");
  }
}

export async function extractSlotCardPrices(
  page: Page,
  shots?: StepScreenshotTracker,
  selectedRoundDay?: string,
  dateTab?: import("./dateTabParse").DateTabParseResult,
): Promise<SlotCardExtraction> {
  const loadScan = await loadAllVisibleSlotCardsForSelectedDay(page, shots, {
    selectedRoundDay,
    dateTab,
  });

  const collected = await collectSlotCards(page);
  const slotCards: SlotCardRecord[] = [];

  for (const card of collected) {
    const priceElements = card.locator
      ? await readCardPriceElements(card.locator).catch(() => [])
      : [];
    const classified = mergeWithCssAuxiliary(card.rawText, priceElements);
    const slotTime = card.rawText.match(TIME_PATTERN)?.[0] ?? "";

    slotCards.push({
      slotTime,
      slotRawText: card.rawText.slice(0, 400),
      salePrices: classified.salePrices,
      originalPrices: classified.originalPrices,
      payablePrice: classified.payablePrice,
      priceElementsCount: Math.max(
        priceElements.length,
        extractPriceAmountsFromRawText(card.rawText).length,
      ),
      visible: card.visible,
      uncertain: classified.uncertain,
    });
  }

  const uniqueSaleAmounts = [
    ...new Set(slotCards.flatMap((card) => card.salePrices)),
  ].sort((a, b) => a - b);
  const uniqueOriginalAmounts = [
    ...new Set(slotCards.flatMap((card) => card.originalPrices)),
  ].sort((a, b) => a - b);

  const bodyText = await page.locator("body").innerText();
  const loadedCount = slotCards.length;
  const visibleCount = slotCards.filter((card) => card.visible).length;
  const availableTeamCount = loadScan.availableTeamCountFromDateTab;
  const slotLoadComplete =
    availableTeamCount != null
      ? loadedCount >= availableTeamCount
      : loadScan.slotLoadComplete;
  const priceScope = resolvePriceScope(
    slotLoadComplete,
    availableTeamCount,
    loadedCount,
  );

  return {
    slotCardCount: loadedCount,
    loadedSlotCardCount: loadedCount,
    visibleSlotCardCount: visibleCount,
    availableTeamCountFromDateTab: availableTeamCount,
    slotLoadComplete,
    slotScrollSteps: loadScan.slotScrollSteps,
    slotCountBeforeScroll: loadScan.slotCountBeforeScroll,
    slotCountAfterScroll: loadedCount,
    slotCountStableReason: loadScan.slotCountStableReason,
    priceScope,
    dateTabMatchConfidence: loadScan.dateTabMatchConfidence,
    dateTabCardsSnapshot: loadScan.dateTabCardsSnapshot,
    selectedDateTabRawText: loadScan.selectedDateTabRawText,
    slotTimes: [...new Set(slotCards.map((card) => card.slotTime).filter(Boolean))],
    slotCards,
    slotCardRawTexts: slotCards.map((card) => card.slotRawText),
    slotPriceTextsUnique: uniqueSaleAmounts.map(formatWonDisplay),
    salePriceAmounts: uniqueSaleAmounts,
    originalPriceAmounts: uniqueOriginalAmounts,
    salePriceCandidates: uniqueSaleAmounts.map(String),
    originalPriceCandidates: uniqueOriginalAmounts.map(String),
    slotPriceMode: resolveSlotPriceMode(slotCards),
    excludedOriginalFromMinMax: uniqueOriginalAmounts.length > 0,
    areaText: slotCards.map((card) => card.slotRawText).join("\n\n") || bodyText,
  };
}
