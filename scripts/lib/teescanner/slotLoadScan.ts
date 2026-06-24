import type { Page } from "playwright";
import type { StepScreenshotTracker } from "./debug";
import { sleep } from "./access";
import { collectSlotCardsForCount, prepareSlotCardsViewport } from "./slotExtract";
import {
  parseDateTabForSelectedDay,
  type DateTabMatchConfidence,
} from "./dateTabParse";
export type SlotCountStableReason =
  | "reached_available_count"
  | "stable_after_scroll"
  | "max_scroll_steps_reached"
  | "no_scroll_container"
  | "unknown";

export type PriceScope =
  | "loaded_slots"
  | "complete_day_slots"
  | "partial_day_slots";

export interface SlotLoadScanOptions {
  scrollStepPx?: number;
  scrollWaitMs?: number;
  maxScrollSteps?: number;
  stableThreshold?: number;
  selectedRoundDay?: string;
  dateTab?: import("./dateTabParse").DateTabParseResult;
}

export interface SlotLoadScanResult {
  slotCountBeforeScroll: number;
  slotCountAfterScroll: number;
  slotScrollSteps: number;
  slotLoadComplete: boolean;
  slotCountStableReason: SlotCountStableReason;
  availableTeamCountFromDateTab: number | null;
  dateTabMatchConfidence: DateTabMatchConfidence;
  dateTabCardsSnapshot: string;
  selectedDateTabRawText: string;
  priceScope: PriceScope;
}

const DEFAULT_OPTIONS = {
  scrollStepPx: 700,
  scrollWaitMs: 2500,
  maxScrollSteps: 8,
  stableThreshold: 2,
} as const;

export function resolvePriceScope(
  slotLoadComplete: boolean,
  availableTeamCount: number | null,
  loadedSlotCardCount: number,
): PriceScope {
  if (slotLoadComplete) return "complete_day_slots";
  if (availableTeamCount != null && loadedSlotCardCount < availableTeamCount) {
    return "partial_day_slots";
  }
  if (availableTeamCount == null) return "loaded_slots";
  return "partial_day_slots";
}

async function scrollSlotListDown(page: Page, stepPx: number): Promise<boolean> {
  const containers = [
    page.locator("main").first(),
    page.locator('[class*="tee"]').first(),
    page.locator('[class*="time"]').first(),
    page.locator('[class*="slot"]').first(),
  ];

  for (const container of containers) {
    if ((await container.count()) === 0) continue;
    try {
      await container.scrollIntoViewIfNeeded().catch(() => undefined);
      await page.mouse.wheel(0, stepPx);
      return true;
    } catch {
      /* try next container */
    }
  }

  const lastTime = page.locator("text=/\\b([01]?\\d|2[0-3]):[0-5]\\d\\b/").last();
  if ((await lastTime.count()) > 0) {
    await lastTime.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.mouse.wheel(0, stepPx);
    return true;
  }

  return false;
}

export async function loadAllVisibleSlotCardsForSelectedDay(
  page: Page,
  shots?: StepScreenshotTracker,
  options: SlotLoadScanOptions = {},
): Promise<SlotLoadScanResult> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const dateTab =
    options.dateTab ??
    (config.selectedRoundDay != null && config.selectedRoundDay.length > 0
      ? await parseDateTabForSelectedDay(page, config.selectedRoundDay)
      : {
          cards: [],
          availableTeamCountFromDateTab: null,
          matchConfidence: "none" as const,
          selectedDateTabRawText: "",
          cardsSnapshot: "",
        });
  const availableTeamCount = dateTab.availableTeamCountFromDateTab;

  await prepareSlotCardsViewport(page, shots);

  const slotCountBeforeScroll = await collectSlotCardsForCount(page);
  let currentCount = slotCountBeforeScroll;
  let scrollSteps = 0;
  let stableRounds = 0;
  let stableReason: SlotCountStableReason = "unknown";

  const canScroll = await scrollSlotListDown(page, 0);
  if (!canScroll && slotCountBeforeScroll === 0) {
    return {
      slotCountBeforeScroll,
      slotCountAfterScroll: 0,
      slotScrollSteps: 0,
      slotLoadComplete: false,
      slotCountStableReason: "no_scroll_container",
      availableTeamCountFromDateTab: availableTeamCount,
      dateTabMatchConfidence: dateTab.matchConfidence,
      dateTabCardsSnapshot: dateTab.cardsSnapshot,
      selectedDateTabRawText: dateTab.selectedDateTabRawText,
      priceScope: resolvePriceScope(false, availableTeamCount, 0),
    };
  }

  if (
    availableTeamCount != null &&
    slotCountBeforeScroll >= availableTeamCount
  ) {
    return {
      slotCountBeforeScroll,
      slotCountAfterScroll: slotCountBeforeScroll,
      slotScrollSteps: 0,
      slotLoadComplete: true,
      slotCountStableReason: "reached_available_count",
      availableTeamCountFromDateTab: availableTeamCount,
      dateTabMatchConfidence: dateTab.matchConfidence,
      dateTabCardsSnapshot: dateTab.cardsSnapshot,
      selectedDateTabRawText: dateTab.selectedDateTabRawText,
      priceScope: "complete_day_slots",
    };
  }

  while (scrollSteps < config.maxScrollSteps) {
    if (availableTeamCount != null && currentCount >= availableTeamCount) {
      stableReason = "reached_available_count";
      break;
    }

    const scrolled = await scrollSlotListDown(page, config.scrollStepPx);
    if (!scrolled) {
      stableReason = "no_scroll_container";
      break;
    }

    await sleep(config.scrollWaitMs);
    scrollSteps += 1;

    const newCount = await collectSlotCardsForCount(page);
    if (newCount > currentCount) {
      currentCount = newCount;
      stableRounds = 0;
    } else {
      stableRounds += 1;
      if (stableRounds >= config.stableThreshold) {
        stableReason = "stable_after_scroll";
        break;
      }
    }
  }

  if (stableReason === "unknown" && scrollSteps >= config.maxScrollSteps) {
    stableReason = "max_scroll_steps_reached";
  }

  await page.mouse.wheel(0, 200);
  await sleep(1000);
  currentCount = await collectSlotCardsForCount(page);

  const slotLoadComplete =
    availableTeamCount != null
      ? currentCount >= availableTeamCount
      : false;

  if (slotLoadComplete && stableReason === "unknown") {
    stableReason = "reached_available_count";
  }

  if (shots) {
    await shots.capture("slot_list_fully_scrolled");
  }

  return {
    slotCountBeforeScroll,
    slotCountAfterScroll: currentCount,
    slotScrollSteps: scrollSteps,
    slotLoadComplete,
    slotCountStableReason: stableReason,
    availableTeamCountFromDateTab: availableTeamCount,
    dateTabMatchConfidence: dateTab.matchConfidence,
    dateTabCardsSnapshot: dateTab.cardsSnapshot,
    selectedDateTabRawText: dateTab.selectedDateTabRawText,
    priceScope: resolvePriceScope(
      slotLoadComplete,
      availableTeamCount,
      currentCount,
    ),
  };
}
