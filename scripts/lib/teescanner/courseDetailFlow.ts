import type { Locator, Page } from "playwright";
import type { StepScreenshotTracker } from "./debug";
import { extractSlotCardPrices } from "./slotExtract";
import { parseDateTabForSelectedDay } from "./dateTabParse";
import type { TeescannerErrorReason, TeescannerSearchCandidate } from "./types";
import { isRoundDayMismatch, parseRoundDayFromUrl } from "./urlRoundDay";
import { parseGolfclubSeqFromUrl } from "./detailUrl";
import {
  collectVisibleTeescannerText,
  detectTeescannerBlock,
  dismissTeescannerPopups,
  sleep,
} from "./access";

export type CandidateClickTarget =
  | "title"
  | "card"
  | "row"
  | "bounding_box"
  | "url_navigate";

export interface CourseDetailFlowResult {
  ok: boolean;
  candidateClickTarget?: CandidateClickTarget;
  candidateClickSucceeded: boolean;
  detailLoaded: boolean;
  roundDaySelected: boolean;
  selectedRoundDay: string;
  detailUrl: string;
  urlRoundDay: string;
  dateMismatch: boolean;
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
  slotCards: import("./slotExtract").SlotCardRecord[];
  slotCardRawTexts: string[];
  slotPriceTextsUnique: string[];
  salePriceAmounts: number[];
  originalPriceAmounts: number[];
  salePriceCandidates: string[];
  originalPriceCandidates: string[];
  slotPriceMode: import("./slotExtract").SlotPriceMode;
  excludedOriginalFromMinMax: boolean;
  errorReason?: TeescannerErrorReason;
  detailPageTextSample?: string;
}

const DETAIL_PAGE_SIGNALS = [
  "티타임",
  "리뷰",
  "골프장 소개",
  "블로그리뷰",
  "골프장 소식",
  "회원제",
  "대중제",
  "별점",
] as const;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

async function stableClick(locator: Locator): Promise<boolean> {
  try {
    if ((await locator.count()) === 0) return false;
    if (!(await locator.isVisible())) return false;
    await locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await sleep(500);
    await locator.click({ trial: true, timeout: 3000 }).catch(() => undefined);
    await locator.click({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function clickBoundingBoxCenter(
  page: Page,
  locator: Locator,
): Promise<boolean> {
  try {
    const box = await locator.boundingBox();
    if (!box) return false;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    return true;
  } catch {
    return false;
  }
}

function resolveClickTitles(candidate: TeescannerSearchCandidate): string[] {
  const titles = new Set<string>();
  const raw = candidate.rawText ?? "";

  const parenMatch = raw.match(
    /[\p{L}\p{N}]+(?:\([^)]+\))?/gu,
  );
  if (parenMatch) {
    for (const token of parenMatch) {
      if (
        token.includes(candidate.title) ||
        candidate.title.includes(token.replace(/\([^)]*\)/g, ""))
      ) {
        titles.add(token.trim());
      }
    }
  }

  if (raw) {
    const line = raw
      .split(/\n+/)
      .map((item) => item.trim())
      .find(
        (item) =>
          item.includes(candidate.title) &&
          !/골프장\s*선택|^\d+(?:\.\d+)?$/.test(item),
      );
    if (line) {
      const firstToken = line.split(/\s+/)[0]?.trim();
      if (firstToken) titles.add(firstToken);
    }
  }

  titles.add(candidate.title.trim());
  return [...titles].filter(Boolean);
}

function buildTitleLocators(
  page: Page,
  candidate: TeescannerSearchCandidate,
): Locator[] {
  const locators: Locator[] = [];
  const seen = new Set<string>();

  for (const title of resolveClickTitles(candidate)) {
    if (seen.has(title)) continue;
    seen.add(title);
    locators.push(page.getByText(title, { exact: true }).first());
    locators.push(
      page.getByText(title, { exact: false }).nth(candidate.candidateIndex ?? 0),
    );
  }

  return locators;
}

async function clickCandidateForDetail(
  page: Page,
  candidate: TeescannerSearchCandidate,
): Promise<{ clicked: boolean; target?: CandidateClickTarget }> {
  if (candidate.url) {
    await page.goto(candidate.url, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    return { clicked: true, target: "url_navigate" };
  }

  for (const titleLocator of buildTitleLocators(page, candidate)) {
    if (await stableClick(titleLocator)) {
      return { clicked: true, target: "title" };
    }
  }

  const titleLocator = page
    .getByText(candidate.title, { exact: false })
    .nth(candidate.candidateIndex ?? 0);
  const cardSelectors = [
    "xpath=ancestor::li[1]",
    "xpath=ancestor::*[@role='listitem'][1]",
    "xpath=ancestor::*[@role='option'][1]",
    "xpath=ancestor::article[1]",
    "xpath=ancestor::div[contains(@class,'item')][1]",
  ];

  for (const selector of cardSelectors) {
    const card = titleLocator.locator(selector).first();
    if ((await card.count()) > 0 && (await stableClick(card))) {
      return { clicked: true, target: "card" };
    }
  }

  if (await stableClick(titleLocator)) {
    return { clicked: true, target: "row" };
  }

  if (await clickBoundingBoxCenter(page, titleLocator)) {
    return { clicked: true, target: "bounding_box" };
  }

  return { clicked: false };
}

export async function verifyCourseDetailLoaded(
  page: Page,
  candidate: TeescannerSearchCandidate,
): Promise<boolean> {
  const bodyText = await page.locator("body").innerText();
  const signalCount = DETAIL_PAGE_SIGNALS.filter((signal) =>
    bodyText.includes(signal),
  ).length;
  if (signalCount < 2) return false;

  const titleNeedle = candidate.title.trim();
  const baseTitle = titleNeedle.replace(/\([^)]*\)/g, "").trim();
  if (titleNeedle && bodyText.includes(titleNeedle)) return true;
  if (baseTitle.length >= 2 && bodyText.includes(baseTitle)) return true;

  for (const title of resolveClickTitles(candidate)) {
    if (bodyText.includes(title)) return true;
  }

  return false;
}

function parseRoundDayParts(roundDay: string): {
  day: number;
  weekday: string;
} {
  const date = new Date(`${roundDay}T12:00:00`);
  return {
    day: date.getDate(),
    weekday: WEEKDAY_LABELS[date.getDay()],
  };
}

async function tryClickRoundDayButton(
  page: Page,
  day: number,
  weekday: string,
): Promise<boolean> {
  const patterns = [
    new RegExp(`${weekday}\\s*${day}`),
    new RegExp(`\\b${weekday}\\s*${day}\\b`),
    new RegExp(`\\b${day}\\b`),
  ];

  for (const pattern of patterns) {
    const matches = page.getByText(pattern);
    const count = await matches.count();
    for (let index = 0; index < Math.min(count, 6); index += 1) {
      const button = matches.nth(index);
      if (await stableClick(button)) return true;
    }
  }

  const dayOnly = page.getByText(String(day), { exact: true });
  const dayCount = await dayOnly.count();
  for (let index = 0; index < Math.min(dayCount, 6); index += 1) {
    const button = dayOnly.nth(index);
    if (await stableClick(button)) return true;
  }

  return false;
}

async function nudgeDateRowOnce(page: Page): Promise<void> {
  const nudgeSelectors = [
    '[class*="next"]',
    '[class*="Next"]',
    '[aria-label*="다음"]',
    'button:has-text(">")',
  ];

  for (const selector of nudgeSelectors) {
    const button = page.locator(selector).first();
    if ((await button.count()) > 0 && (await stableClick(button))) {
      await sleep(1000);
      return;
    }
  }
}

export async function selectRoundDayOnDetailPage(
  page: Page,
  roundDay: string,
  shots: StepScreenshotTracker,
): Promise<{ selected: boolean; selectedRoundDay: string }> {
  const { day, weekday } = parseRoundDayParts(roundDay);

  if (await tryClickRoundDayButton(page, day, weekday)) {
    await sleep(3000);
    await shots.capture("round_day_selected");
    return { selected: true, selectedRoundDay: roundDay };
  }

  await nudgeDateRowOnce(page);
  if (await tryClickRoundDayButton(page, day, weekday)) {
    await sleep(3000);
    await shots.capture("round_day_selected");
    return { selected: true, selectedRoundDay: roundDay };
  }

  return { selected: false, selectedRoundDay: "" };
}

export async function ensureTeetimeTab(
  page: Page,
  shots: StepScreenshotTracker,
): Promise<void> {
  const tab = page.getByText("티타임", { exact: true }).first();
  if ((await tab.count()) > 0 && (await tab.isVisible())) {
    await stableClick(tab).catch(() => undefined);
    await sleep(1000);
  }
  await shots.capture("teetime_tab_checked");
}

export function detectDetailNoAvailableSlots(pageText: string): boolean {
  if (/\d{1,2}:\d{2}/.test(pageText) && /\d{1,3}(?:,\d{3})+\s*원/.test(pageText)) {
    return false;
  }
  return /예약\s*가능한\s*티타임이\s*없|티타임이\s*없|검색\s*결과가\s*없|예약\s*가능한\s*시간이\s*없/i.test(
    pageText,
  );
}

export async function openCourseDetailUrl(options: {
  page: Page;
  candidate: TeescannerSearchCandidate;
  shots: StepScreenshotTracker;
}): Promise<{
  ok: boolean;
  detailUrl: string;
  golfclubSeq: string;
  detailLoaded: boolean;
  candidateClickTarget?: CandidateClickTarget;
  errorReason?: TeescannerErrorReason;
}> {
  const { page, candidate, shots } = options;
  const clickResult = await clickCandidateForDetail(page, candidate);
  if (!clickResult.clicked) {
    await shots.capture("failed");
    return {
      ok: false,
      detailUrl: "",
      golfclubSeq: "",
      detailLoaded: false,
      errorReason: "matched_candidate_click_failed",
    };
  }

  await shots.capture("candidate_title_clicked");
  await sleep(2000);

  const detailLoaded = await verifyCourseDetailLoaded(page, candidate);
  if (!detailLoaded) {
    await shots.capture("failed");
    return {
      ok: false,
      detailUrl: page.url(),
      golfclubSeq: parseGolfclubSeqFromUrl(page.url()),
      detailLoaded: false,
      candidateClickTarget: clickResult.target,
      errorReason: "course_detail_not_loaded",
    };
  }

  const detailUrl = page.url();
  await shots.capture("course_detail_loaded");
  return {
    ok: true,
    detailUrl,
    golfclubSeq: parseGolfclubSeqFromUrl(detailUrl),
    detailLoaded: true,
    candidateClickTarget: clickResult.target,
  };
}

export async function openCourseDetailAndCollectSlots(options: {
  page: Page;
  candidate: TeescannerSearchCandidate;
  roundDay: string;
  shots: StepScreenshotTracker;
}): Promise<CourseDetailFlowResult> {
  const { page, candidate, roundDay, shots } = options;
  const result: CourseDetailFlowResult = {
    ok: false,
    candidateClickSucceeded: false,
    detailLoaded: false,
    roundDaySelected: false,
    selectedRoundDay: "",
    detailUrl: "",
    urlRoundDay: "",
    dateMismatch: false,
    slotCardCount: 0,
    loadedSlotCardCount: 0,
    visibleSlotCardCount: 0,
    availableTeamCountFromDateTab: null,
    slotLoadComplete: false,
    slotScrollSteps: 0,
    slotCountBeforeScroll: 0,
    slotCountAfterScroll: 0,
    slotCountStableReason: "",
    priceScope: "",
    dateTabMatchConfidence: "",
    dateTabCardsSnapshot: "",
    selectedDateTabRawText: "",
    slotTimes: [],
    slotCards: [],
    slotCardRawTexts: [],
    slotPriceTextsUnique: [],
    salePriceAmounts: [],
    originalPriceAmounts: [],
    salePriceCandidates: [],
    originalPriceCandidates: [],
    slotPriceMode: "uncertain",
    excludedOriginalFromMinMax: false,
  };

  const clickResult = await clickCandidateForDetail(page, candidate);
  if (!clickResult.clicked) {
    result.errorReason = "matched_candidate_click_failed";
    await shots.capture("failed");
    return result;
  }

  result.candidateClickTarget = clickResult.target;
  result.candidateClickSucceeded = true;
  await shots.capture("candidate_title_clicked");
  await sleep(2000);

  result.detailLoaded = await verifyCourseDetailLoaded(page, candidate);
  if (!result.detailLoaded) {
    result.errorReason = "course_detail_not_loaded";
    await shots.capture("failed");
    return result;
  }

  result.detailUrl = page.url();
  await shots.capture("course_detail_loaded");

  await ensureTeetimeTab(page, shots);

  const roundDayResult = await selectRoundDayOnDetailPage(page, roundDay, shots);
  result.roundDaySelected = roundDayResult.selected;
  result.selectedRoundDay = roundDayResult.selectedRoundDay;

  if (!roundDayResult.selected) {
    result.errorReason = "round_day_not_visible";
    result.detailPageTextSample = (
      await page.locator("body").innerText()
    ).slice(0, 1500);
    await shots.capture("failed");
    return result;
  }

  const selectedDay = result.selectedRoundDay || roundDay;
  const dateTabParse = await parseDateTabForSelectedDay(page, selectedDay);
  result.availableTeamCountFromDateTab = dateTabParse.availableTeamCountFromDateTab;
  result.dateTabMatchConfidence = dateTabParse.matchConfidence;
  result.dateTabCardsSnapshot = dateTabParse.cardsSnapshot;
  result.selectedDateTabRawText = dateTabParse.selectedDateTabRawText;

  const slotExtraction = await extractSlotCardPrices(
    page,
    shots,
    selectedDay,
    dateTabParse,
  );
  result.detailUrl = page.url();
  result.urlRoundDay = parseRoundDayFromUrl(result.detailUrl);
  result.dateMismatch = isRoundDayMismatch(
    result.selectedRoundDay,
    result.urlRoundDay,
  );
  result.slotCardCount = slotExtraction.loadedSlotCardCount;
  result.loadedSlotCardCount = slotExtraction.loadedSlotCardCount;
  result.visibleSlotCardCount = slotExtraction.visibleSlotCardCount;
  result.availableTeamCountFromDateTab = slotExtraction.availableTeamCountFromDateTab;
  result.slotLoadComplete = slotExtraction.slotLoadComplete;
  result.slotScrollSteps = slotExtraction.slotScrollSteps;
  result.slotCountBeforeScroll = slotExtraction.slotCountBeforeScroll;
  result.slotCountAfterScroll = slotExtraction.slotCountAfterScroll;
  result.slotCountStableReason = slotExtraction.slotCountStableReason;
  result.priceScope = slotExtraction.priceScope;
  result.dateTabMatchConfidence = slotExtraction.dateTabMatchConfidence;
  result.dateTabCardsSnapshot = slotExtraction.dateTabCardsSnapshot;
  result.selectedDateTabRawText = slotExtraction.selectedDateTabRawText;
  result.slotTimes = slotExtraction.slotTimes;
  result.slotCards = slotExtraction.slotCards;
  result.slotCardRawTexts = slotExtraction.slotCardRawTexts;
  result.slotPriceTextsUnique = slotExtraction.slotPriceTextsUnique;
  result.salePriceAmounts = slotExtraction.salePriceAmounts;
  result.originalPriceAmounts = slotExtraction.originalPriceAmounts;
  result.salePriceCandidates = slotExtraction.salePriceCandidates;
  result.originalPriceCandidates = slotExtraction.originalPriceCandidates;
  result.slotPriceMode = slotExtraction.slotPriceMode;
  result.excludedOriginalFromMinMax = slotExtraction.excludedOriginalFromMinMax;
  result.detailPageTextSample = slotExtraction.areaText.slice(0, 1500);
  result.ok = true;
  return result;
}

export async function collectSlotsFromDetailUrl(options: {
  page: Page;
  detailUrl: string;
  roundDay: string;
  candidate: TeescannerSearchCandidate;
  shots: StepScreenshotTracker;
}): Promise<CourseDetailFlowResult> {
  const { page, detailUrl, roundDay, candidate, shots } = options;
  const result: CourseDetailFlowResult = {
    ok: false,
    candidateClickSucceeded: true,
    candidateClickTarget: "url_navigate",
    detailLoaded: false,
    roundDaySelected: false,
    selectedRoundDay: "",
    detailUrl: "",
    urlRoundDay: "",
    dateMismatch: false,
    slotCardCount: 0,
    loadedSlotCardCount: 0,
    visibleSlotCardCount: 0,
    availableTeamCountFromDateTab: null,
    slotLoadComplete: false,
    slotScrollSteps: 0,
    slotCountBeforeScroll: 0,
    slotCountAfterScroll: 0,
    slotCountStableReason: "",
    priceScope: "",
    dateTabMatchConfidence: "",
    dateTabCardsSnapshot: "",
    selectedDateTabRawText: "",
    slotTimes: [],
    slotCards: [],
    slotCardRawTexts: [],
    slotPriceTextsUnique: [],
    salePriceAmounts: [],
    originalPriceAmounts: [],
    salePriceCandidates: [],
    originalPriceCandidates: [],
    slotPriceMode: "uncertain",
    excludedOriginalFromMinMax: false,
  };

  try {
    await page.goto(detailUrl, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
  } catch {
    result.errorReason = "navigation_timeout";
    await shots.capture("failed");
    return result;
  }

  await sleep(2000);
  await dismissTeescannerPopups(page);
  await shots.capture("course_detail_loaded");

  const pageText = await page.locator("body").innerText();
  if (detectTeescannerBlock(pageText)) {
    result.errorReason = "blocked_detected";
    result.detailPageTextSample = pageText.slice(0, 1500);
    await shots.capture("failed");
    return result;
  }

  result.detailLoaded = await verifyCourseDetailLoaded(page, candidate);
  if (!result.detailLoaded) {
    result.errorReason = "course_detail_not_loaded";
    result.detailPageTextSample = pageText.slice(0, 1500);
    await shots.capture("failed");
    return result;
  }

  await ensureTeetimeTab(page, shots);

  result.detailUrl = page.url();
  result.urlRoundDay = parseRoundDayFromUrl(result.detailUrl);
  result.selectedRoundDay = result.urlRoundDay || roundDay;
  result.roundDaySelected = result.selectedRoundDay === roundDay;
  result.dateMismatch = isRoundDayMismatch(result.selectedRoundDay, result.urlRoundDay);

  if (!result.roundDaySelected || result.dateMismatch) {
    result.errorReason = "round_day_not_selected";
    result.detailPageTextSample = pageText.slice(0, 1500);
    await shots.capture("failed");
    return result;
  }

  const dateTabParse = await parseDateTabForSelectedDay(page, roundDay);
  result.availableTeamCountFromDateTab = dateTabParse.availableTeamCountFromDateTab;
  result.dateTabMatchConfidence = dateTabParse.matchConfidence;
  result.dateTabCardsSnapshot = dateTabParse.cardsSnapshot;
  result.selectedDateTabRawText = dateTabParse.selectedDateTabRawText;

  const slotExtraction = await extractSlotCardPrices(
    page,
    shots,
    roundDay,
    dateTabParse,
  );
  result.detailUrl = page.url();
  result.urlRoundDay = parseRoundDayFromUrl(result.detailUrl);
  result.selectedRoundDay = result.urlRoundDay || roundDay;
  result.dateMismatch = isRoundDayMismatch(result.selectedRoundDay, result.urlRoundDay);
  result.roundDaySelected =
    result.selectedRoundDay === roundDay && result.urlRoundDay === roundDay;

  if (!result.roundDaySelected || result.dateMismatch) {
    result.errorReason = "round_day_not_selected";
    result.detailPageTextSample = slotExtraction.areaText.slice(0, 1500);
    await shots.capture("failed");
    return result;
  }

  result.slotCardCount = slotExtraction.loadedSlotCardCount;
  result.loadedSlotCardCount = slotExtraction.loadedSlotCardCount;
  result.visibleSlotCardCount = slotExtraction.visibleSlotCardCount;
  result.availableTeamCountFromDateTab = slotExtraction.availableTeamCountFromDateTab;
  result.slotLoadComplete = slotExtraction.slotLoadComplete;
  result.slotScrollSteps = slotExtraction.slotScrollSteps;
  result.slotCountBeforeScroll = slotExtraction.slotCountBeforeScroll;
  result.slotCountAfterScroll = slotExtraction.slotCountAfterScroll;
  result.slotCountStableReason = slotExtraction.slotCountStableReason;
  result.priceScope = slotExtraction.priceScope;
  result.dateTabMatchConfidence = slotExtraction.dateTabMatchConfidence;
  result.dateTabCardsSnapshot = slotExtraction.dateTabCardsSnapshot;
  result.selectedDateTabRawText = slotExtraction.selectedDateTabRawText;
  result.slotTimes = slotExtraction.slotTimes;
  result.slotCards = slotExtraction.slotCards;
  result.slotCardRawTexts = slotExtraction.slotCardRawTexts;
  result.slotPriceTextsUnique = slotExtraction.slotPriceTextsUnique;
  result.salePriceAmounts = slotExtraction.salePriceAmounts;
  result.originalPriceAmounts = slotExtraction.originalPriceAmounts;
  result.salePriceCandidates = slotExtraction.salePriceCandidates;
  result.originalPriceCandidates = slotExtraction.originalPriceCandidates;
  result.slotPriceMode = slotExtraction.slotPriceMode;
  result.excludedOriginalFromMinMax = slotExtraction.excludedOriginalFromMinMax;
  result.detailPageTextSample = slotExtraction.areaText.slice(0, 1500);
  result.ok = true;
  return result;
}
