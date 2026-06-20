import type { Frame, Page } from "playwright";
import { normalizeCourseNameForMapSearch } from "../../../lib/mapSearchName";
import {
  extractCourseDifficulty,
  extractFromPageContent,
} from "../naverPlaywrightScraper";
import { getNaverMapSearchUrl } from "../naverPriceCandidates";
import { addressesLikelyMismatch, titlesLikelyMismatch } from "../mismatchUtils";
import {
  confidenceFromMatch,
  isAllowedGolfCategory,
  isClubhouseCategory,
  isLimitedContactMode,
  pickBestPlaceCandidate,
  pickTopNonGolfCandidate,
  nameSimilarity,
  type ScoredPlaceCandidate,
} from "./placeMatcher";
import { applySwapToScrapedFields } from "./scoreSwap";
import {
  type AccessCircuitBreaker,
  type GotoRateLimiter,
  isAccessBlockedNote,
  isAccessBlockedText,
} from "./accessControl";
import {
  DETAIL_FIELD_LABELS,
  NAVER_MAP_BASE,
  PLACE_LINK_PATTERN,
  RESERVATION_SELECTORS,
  TAB_LABELS,
  TEXT_PATTERNS,
} from "./selectors";
import type {
  CandidateOpenMode,
  EnrichmentInputRow,
  NaverMapEnrichmentRow,
  PlaceCandidate,
  SearchStrategy,
} from "./types";
import { emptyEnrichmentRow } from "./types";

const GREEN_FEE_MIN = 80_000;
const GREEN_FEE_MAX = 800_000;

export const FAILURE_REASONS = {
  click: "failed_to_click_place_candidate",
  iframe: "failed_to_load_entry_iframe",
  detail: "failed_to_read_place_detail",
  titleResearch: "failed_to_open_detail_by_title_research",
  titleResearchMismatch: "title_research_mismatch",
} as const;

export type ClickFailureReason =
  | typeof FAILURE_REASONS.click
  | typeof FAILURE_REASONS.iframe;

interface ClickResult {
  success: boolean;
  failureReason?: ClickFailureReason;
}

export function isRetryableFailureNote(note: string, mismatchReason: string): boolean {
  if (isAccessBlockedNote(note, mismatchReason)) return false;
  const combined = `${note} ${mismatchReason}`.toLowerCase();
  if (combined.includes(FAILURE_REASONS.detail)) return false;
  if (combined.includes(FAILURE_REASONS.titleResearchMismatch)) return false;
  if (combined.includes("category_not_golf_course")) return false;
  if (combined.includes("no golf or clubhouse")) return false;
  return (
    combined.includes(FAILURE_REASONS.click) ||
    combined.includes("failed to click") ||
    combined.includes(FAILURE_REASONS.iframe) ||
    combined.includes(FAILURE_REASONS.titleResearch) ||
    combined.includes("failed to load entry") ||
    combined.includes("place detail panel did not open")
  );
}

export interface ScraperOptions {
  headful: boolean;
  slowMs: number;
  timeoutMs: number;
  addressFirst: boolean;
  maxRetries: number;
  /** row당 검색 1회만 (주소 > change_name > name 중 하나) */
  singleSearchPerRow: boolean;
  /** true면 예약 탭/가격/캘린더 클릭 안 함 (기본) */
  skipReservation: boolean;
  /** address 후보 진입: click=카드 클릭, research=후보 title 재검색 */
  candidateOpenMode: CandidateOpenMode;
  circuitBreaker?: AccessCircuitBreaker;
  gotoRateLimiter?: GotoRateLimiter;
}

export interface RowDiagnostics {
  candidateCount: number;
  selectedTitle: string;
  selectedCategory: string;
  detailEntered: boolean;
  blockDetectedAt?: string;
}

export interface ScrapeRunResult {
  row: NaverMapEnrichmentRow;
  diagnostics: RowDiagnostics;
}

function emptyPriceFields(): Partial<NaverMapEnrichmentRow> {
  return {
    reservation_available: "",
    scraped_price_text: "",
    scraped_price_min: "",
    scraped_price_max: "",
    scraped_price_type: "",
    scraped_price_checked_at: "",
  };
}

export interface ScrapeContext {
  page: Page;
  searchFrame: Frame | null;
  entryFrame: Frame | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanPhone(value: string): string {
  return value.replace(/복사$/, "").trim();
}

function normalizeAddress(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function referenceNames(row: EnrichmentInputRow): string[] {
  const names = [row.change_name_to, row.name].filter(Boolean);
  return [...new Set(names)];
}

function parseWonAmount(raw: string): number | null {
  const value = Number.parseInt(raw.replace(/,/g, ""), 10);
  if (!Number.isFinite(value)) return null;
  if (value < GREEN_FEE_MIN || value > GREEN_FEE_MAX) return null;
  return value;
}

function extractPricesFromText(text: string): number[] {
  const amounts = new Set<number>();
  for (const match of text.matchAll(/(?:1인\s*)?(\d{1,3}(?:,\d{3})+)\s*원/g)) {
    const amount = parseWonAmount(match[1]);
    if (amount !== null) amounts.add(amount);
  }
  return [...amounts].sort((a, b) => a - b);
}

/** 평균 스코어 — 소수점 포함 (예: 93.7) */
export function extractMapAverageScore(text: string): string {
  const lines = text.split(/\n/).map((line) => line.trim());

  for (let i = 0; i < lines.length; i += 1) {
    if (/^평균\s*(스코어|타수)$/.test(lines[i])) {
      for (let j = i + 1; j <= i + 4 && j < lines.length; j += 1) {
        const value = lines[j].replace(/\s/g, "");
        if (/^\d{2,3}(?:\.\d+)?$/.test(value)) return value;
      }
    }
  }

  const match = text.match(/평균\s*(?:스코어|타수)[\s\S]{0,60}?(\d{2,3}(?:\.\d+)?)/);
  return match ? match[1] : "";
}

async function getPanelFrame(page: Page): Promise<Frame> {
  const searchIframe = page.frame({ name: "searchIframe" });
  if (searchIframe) return searchIframe;
  return page.mainFrame();
}

async function waitForEntryFrame(page: Page, timeoutMs: number): Promise<Frame | null> {
  return waitForPlaceDetailReady(page, timeoutMs);
}

function hasDetailReadySignals(text: string): boolean {
  return (
    text.includes(DETAIL_FIELD_LABELS.phone) ||
    text.includes(DETAIL_FIELD_LABELS.homepage) ||
    /홈\s*\n|코스·홀|평균\s*스코어|평균\s*타수|퍼블릭골프장|회원제골프장|컨트리클럽/.test(text)
  );
}

async function findPlaceDetailFrame(page: Page): Promise<Frame | null> {
  const entryIframe = page.frame({ name: "entryIframe" });
  if (entryIframe) {
    const hasContent = await entryIframe
      .locator("body")
      .innerText({ timeout: 3000 })
      .then((text) => text.length > 80)
      .catch(() => false);
    if (hasContent) return entryIframe;
  }
  for (const frame of page.frames()) {
    const url = frame.url();
    if (/pcmap\.place\.naver\.com\/(place|golfcourse)\/\d+/i.test(url)) {
      const hasContent = await frame
        .locator("body")
        .innerText({ timeout: 3000 })
        .then((text) => text.length > 80)
        .catch(() => false);
      if (hasContent) return frame;
    }
  }
  const searchIframe = page.frame({ name: "searchIframe" });
  if (searchIframe) {
    const text = await searchIframe
      .locator("body")
      .innerText({ timeout: 3000 })
      .catch(() => "");
    if (
      text.length > 150 &&
      (hasDetailReadySignals(text) || /전화번호|홈페이지|평균/.test(text))
    ) {
      return searchIframe;
    }
  }
  return null;
}

/** entryIframe / 상세 신호 polling (최대 timeoutMs) */
async function waitForPlaceDetailReady(page: Page, timeoutMs: number): Promise<Frame | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const frame = await findPlaceDetailFrame(page);
    if (frame) {
      const text = await frame.locator("body").innerText({ timeout: 3000 }).catch(() => "");
      if (text.length > 150 && (hasDetailReadySignals(text) || /전화번호|홈페이지|평균/.test(text))) {
        return frame;
      }
      if (text.length > 400) {
        return frame;
      }
    }
    await sleep(500);
  }
  return null;
}

async function refreshFrames(page: Page): Promise<ScrapeContext> {
  await sleep(400);
  const searchFrame = await getPanelFrame(page);
  const entryFrame = await waitForEntryFrame(page, 1200);
  return { page, searchFrame, entryFrame };
}

async function waitForPanel(page: Page, slowMs: number): Promise<ScrapeContext> {
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  await sleep(Math.max(slowMs, 800));
  return refreshFrames(page);
}

async function waitForAddressPlacesSection(page: Page, timeoutMs: number): Promise<boolean> {
  try {
    await page
      .getByText(TEXT_PATTERNS.addressPlacesSection)
      .first()
      .waitFor({ timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

function inferCategoryFromTitle(title: string): string {
  if (/클럽하우스/i.test(title)) return "클럽하우스";
  return "";
}

function normalizePlaceCandidate(title: string, category: string): PlaceCandidate {
  const trimmedTitle = title.trim();
  let cat = category.trim();
  if (!cat) {
    cat = inferCategoryFromTitle(trimmedTitle);
  }
  return { title: trimmedTitle, category: cat };
}

function parseAddressPlacesSection(text: string): PlaceCandidate[] {
  const startMatch = text.match(/이\s*주소의\s*장소\s*\d*/);
  if (!startMatch || startMatch.index === undefined) return [];

  const start = startMatch.index;
  const endMarkers = ["가볼만한 곳", "정보수정 제안", "패널 접기"];
  let end = text.length;
  for (const marker of endMarkers) {
    const idx = text.indexOf(marker, start);
    if (idx >= 0) end = Math.min(end, idx);
  }

  const section = text.slice(start, end);
  const lines = section
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== "더보기" && !/^이\s*주소의\s*장소/.test(line));

  const candidates: PlaceCandidate[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const title = lines[i];
    if (!title || title.length < 2) continue;
    const category = lines[i + 1] ?? "";
    if (category && category.length <= 20 && !/\d/.test(category)) {
      candidates.push(normalizePlaceCandidate(title, category));
      i += 1;
    } else {
      candidates.push(normalizePlaceCandidate(title, ""));
    }
  }
  return candidates;
}

function parseNameSearchList(text: string): PlaceCandidate[] {
  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const candidates: PlaceCandidate[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.length > 50 || line.length < 2) continue;
    if (/^(검색|저장|길찾기|예약|출발|도착|더보기|펼치기|접기)$/i.test(line)) {
      continue;
    }

    const next = lines[i + 1] ?? "";
    const looksLikeCategory =
      /골프|cc|클럽|양식|은행|카페|연습|코스|하우스/i.test(next) &&
      next.length <= 24;

    if (looksLikeCategory) {
      const key = `${line}::${next}`;
      if (!seen.has(key)) {
        seen.add(key);
        candidates.push({ title: line, category: next });
      }
      i += 1;
    }
  }

  return candidates;
}

async function collectBlockCheckTexts(page: Page): Promise<string> {
  const parts: string[] = [];
  parts.push(await page.locator("body").innerText().catch(() => ""));
  const panelFrame = await getPanelFrame(page);
  parts.push(await panelFrame.locator("body").innerText().catch(() => ""));
  const entryIframe = page.frame({ name: "entryIframe" });
  if (entryIframe) {
    parts.push(await entryIframe.locator("body").innerText().catch(() => ""));
  }
  for (const frame of page.frames()) {
    if (/pcmap\.place\.naver\.com/i.test(frame.url())) {
      parts.push(await frame.locator("body").innerText().catch(() => ""));
    }
  }
  return parts.join("\n");
}

async function detectBlockers(
  page: Page,
  _frame: Frame | null,
  circuitBreaker: AccessCircuitBreaker | undefined,
  stage: string,
): Promise<string | null> {
  const combined = await collectBlockCheckTexts(page);
  if (!isAccessBlockedText(combined)) return null;

  let reason = "access blocked — row skipped";
  if (TEXT_PATTERNS.captcha.test(combined) || TEXT_PATTERNS.excessiveAccess.test(combined)) {
    reason = "과도한 접근 / CAPTCHA — batch stop";
  } else if (TEXT_PATTERNS.loginRequired.test(combined)) {
    reason = "login required — row skipped";
  }

  const staged = `${reason} [stage:${stage}]`;
  circuitBreaker?.trip(staged);
  return staged;
}

async function navigateToSearch(
  page: Page,
  query: string,
  slowMs: number,
  options: Pick<ScraperOptions, "gotoRateLimiter" | "circuitBreaker">,
): Promise<string | null> {
  await options.gotoRateLimiter?.waitBeforeGoto();
  const url = getNaverMapSearchUrl(query);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await waitForPanel(page, slowMs);
  const panelFrame = await getPanelFrame(page);
  return detectBlockers(page, panelFrame, options.circuitBreaker, "address_search");
}

async function readPanelText(frame: Frame): Promise<string> {
  return frame.locator("body").innerText({ timeout: 15_000 }).catch(() => "");
}

async function extractPlaceLinksFromFrame(
  frame: Frame,
): Promise<Array<{ title: string; placeUrl: string }>> {
  const links = await frame.evaluate((placePatternSource) => {
    const placePattern = new RegExp(placePatternSource);
    return [...document.querySelectorAll('a[href*="/place/"]')]
      .slice(0, 20)
      .map((a) => ({
        title: (a.textContent ?? "").trim().slice(0, 80),
        href: a.getAttribute("href") ?? "",
      }))
      .filter((item) => placePattern.test(item.href) && item.title.length >= 2);
  }, PLACE_LINK_PATTERN.source);

  return links.map((link) => ({
    title: link.title,
    placeUrl: link.href.startsWith("http") ? link.href : `${NAVER_MAP_BASE}${link.href}`,
  }));
}

function mergePlaceUrlsIntoCandidates(
  candidates: PlaceCandidate[],
  links: Array<{ title: string; placeUrl: string }>,
): PlaceCandidate[] {
  return candidates.map((candidate) => {
    if (candidate.placeUrl) return candidate;
    let bestUrl = "";
    let bestScore = 0;
    for (const link of links) {
      const score = nameSimilarity(candidate.title, link.title);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = link.placeUrl;
      }
    }
    if (bestScore >= 0.75 && bestUrl) {
      return { ...candidate, placeUrl: bestUrl };
    }
    return candidate;
  });
}

async function extractSearchListCandidates(page: Page, frame: Frame): Promise<PlaceCandidate[]> {
  const text = await readPanelText(frame);
  const fromText = parseNameSearchList(text);
  if (fromText.length > 0) {
    const links = await extractPlaceLinksFromFrame(frame);
    return mergePlaceUrlsIntoCandidates(fromText, links);
  }

  const links = await extractPlaceLinksFromFrame(frame);
  return links.map((link) => ({
    title: link.title,
    category: "",
    placeUrl: link.placeUrl,
  }));
}

async function extractAddressPlaceCandidates(page: Page, frame: Frame): Promise<PlaceCandidate[]> {
  const text = await readPanelText(frame);
  const fromText = parseAddressPlacesSection(text);
  const links = await extractPlaceLinksFromFrame(frame);
  return mergePlaceUrlsIntoCandidates(fromText, links);
}

function normalizeClickText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

/** 파싱된 장소명 ↔ 화면 표시명 띄어쓰기 차이 대응 */
function titleClickVariants(title: string): string[] {
  const variants = new Set<string>([title]);
  const spaced = title
    .replace(/([가-힣a-zA-Z0-9])(컨트리클럽|클럽하우스|골프장|골프클럽)/gu, "$1 $2")
    .replace(/([가-힣a-zA-Z0-9])(CC|GC)/gi, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (spaced !== title) variants.add(spaced);
  variants.add(title.replace(/\s+/g, ""));
  return [...variants];
}

async function waitForPlaceDetail(page: Page, slowMs: number): Promise<boolean> {
  await page.waitForURL(/\/place\//, { timeout: 15_000 }).catch(() => undefined);
  await sleep(slowMs);
  const frame = await waitForPlaceDetailReady(page, 15_000);
  return Boolean(frame) || page.url().includes("/place/");
}

async function tryClickLocator(
  page: Page,
  locator: ReturnType<Page["getByText"]>,
  slowMs: number,
): Promise<boolean> {
  if ((await locator.count()) === 0) return false;
  await locator.click({ timeout: 12_000 }).catch(() => undefined);
  return waitForPlaceDetail(page, slowMs);
}

async function clickByNormalizedPlaceLink(
  page: Page,
  title: string,
  slowMs: number,
): Promise<boolean> {
  const target = normalizeClickText(title);
  if (target.length < 2) return false;

  const linkIndex = await page.evaluate((targetNorm) => {
    const norm = (value: string) =>
      value
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^\p{L}\p{N}]/gu, "");
    const matches = (a: string, b: string) => {
      if (!a || !b) return false;
      if (a === b) return true;
      const shorter = a.length <= b.length ? a : b;
      const longer = a.length <= b.length ? b : a;
      return shorter.length >= 4 && longer.includes(shorter);
    };

    const links = [...document.querySelectorAll('a[href*="/place/"]')];
    for (let i = 0; i < links.length; i += 1) {
      const text = norm((links[i].textContent ?? "").trim());
      if (matches(text, targetNorm)) return i;
    }
    return -1;
  }, target);

  if (linkIndex < 0) return false;

  const link = page.locator('a[href*="/place/"]').nth(linkIndex);
  await link.click({ timeout: 12_000 }).catch(() => undefined);
  return waitForPlaceDetail(page, slowMs);
}

async function openPlaceDetailByUrl(
  page: Page,
  placeUrl: string,
  slowMs: number,
  gotoRateLimiter?: GotoRateLimiter,
): Promise<boolean> {
  await gotoRateLimiter?.waitBeforeGoto();
  await page.goto(placeUrl, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  await sleep(slowMs);
  const frame = await waitForPlaceDetailReady(page, 18_000);
  if (frame) return true;
  return page.url().includes("/place/");
}

async function performCandidateClick(
  page: Page,
  candidate: PlaceCandidate,
  slowMs: number,
  gotoRateLimiter?: GotoRateLimiter,
): Promise<boolean> {
  const title = candidate.title.trim();
  if (!title) return false;

  if (candidate.placeUrl) {
    if (await openPlaceDetailByUrl(page, candidate.placeUrl, slowMs, gotoRateLimiter)) {
      return true;
    }
  }

  for (const variant of titleClickVariants(title)) {
    if (await tryClickLocator(page, page.getByText(variant, { exact: true }).first(), slowMs)) {
      return true;
    }
    if (await tryClickLocator(page, page.getByText(variant).first(), slowMs)) {
      return true;
    }
  }

  if (await clickByNormalizedPlaceLink(page, title, slowMs)) {
    return true;
  }

  if (candidate.placeUrl) {
    return openPlaceDetailByUrl(page, candidate.placeUrl, slowMs, gotoRateLimiter);
  }

  return false;
}

async function clickPlaceCandidate(
  page: Page,
  candidate: PlaceCandidate,
  slowMs: number,
  gotoRateLimiter?: GotoRateLimiter,
): Promise<ClickResult> {
  let clicked = await performCandidateClick(page, candidate, slowMs, gotoRateLimiter);
  if (!clicked) {
    return { success: false, failureReason: FAILURE_REASONS.click };
  }

  let frame = await waitForPlaceDetailReady(page, 15_000);
  if (!frame && !page.url().includes("/place/")) {
    clicked = await performCandidateClick(page, candidate, slowMs, gotoRateLimiter);
    if (!clicked) {
      return { success: false, failureReason: FAILURE_REASONS.click };
    }
    frame = await waitForPlaceDetailReady(page, 15_000);
  }

  if (!frame && !page.url().includes("/place/")) {
    return { success: false, failureReason: FAILURE_REASONS.iframe };
  }

  return { success: true };
}

async function readEntryText(entryFrame: Frame | null, page: Page): Promise<string> {
  const framesToTry: Frame[] = [];
  if (entryFrame) framesToTry.push(entryFrame);
  const entryByName = page.frame({ name: "entryIframe" });
  if (entryByName && !framesToTry.includes(entryByName)) framesToTry.push(entryByName);
  for (const frame of page.frames()) {
    if (/pcmap\.place\.naver\.com\/(place|golfcourse)\/\d+/i.test(frame.url())) {
      if (!framesToTry.includes(frame)) framesToTry.push(frame);
    }
  }
  const searchIframe = page.frame({ name: "searchIframe" });
  if (searchIframe && !framesToTry.includes(searchIframe)) framesToTry.push(searchIframe);

  for (const frame of framesToTry) {
    const text = await frame.locator("body").innerText().catch(() => "");
    if (text.trim().length > 50) return text;
  }
  return page.locator("body").innerText().catch(() => "");
}

function extractLabeledValue(text: string, label: string): string {
  const lines = text.split(/\n/).map((line) => line.trim());
  const index = lines.findIndex((line) => line === label);
  if (index >= 0 && lines[index + 1]) {
    return lines[index + 1].replace(/복사$/, "").trim();
  }
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith(label) && lines[i].length > label.length) {
      return lines[i].slice(label.length).replace(/복사$/, "").trim();
    }
  }
  return "";
}

async function clickTab(frame: Frame | null, page: Page, label: string): Promise<boolean> {
  const targets: Array<Frame | Page> = [];
  if (frame) targets.push(frame);
  targets.push(page);

  for (const target of targets) {
    const locator = target.locator(
      `a:has-text("${label}"), button:has-text("${label}"), [role="tab"]:has-text("${label}")`,
    );
    const count = await locator.count();
    for (let i = 0; i < count; i += 1) {
      const item = locator.nth(i);
      const text = (await item.innerText().catch(() => "")).trim();
      if (text === label || text.startsWith(label)) {
        await item.click({ timeout: 8000 }).catch(() => undefined);
        return true;
      }
    }
  }
  return false;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isWeekday(date: Date): boolean {
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function findTargetDates(from: Date): { weekday: Date; weekend: Date } {
  let weekday: Date | null = null;
  let weekend: Date | null = null;

  for (let offset = 1; offset <= 21; offset += 1) {
    const candidate = addDays(from, offset);
    if (!weekday && isWeekday(candidate)) weekday = candidate;
    if (!weekend && isWeekend(candidate)) weekend = candidate;
    if (weekday && weekend) break;
  }

  return {
    weekday: weekday ?? addDays(from, 1),
    weekend: weekend ?? addDays(from, 6 - from.getDay()),
  };
}

async function scrollPriceList(frame: Frame | null, page: Page): Promise<void> {
  const targets: Array<Frame | Page> = frame ? [frame, page] : [page];
  for (const target of targets) {
    for (const selector of RESERVATION_SELECTORS.scrollContainer) {
      const container = target.locator(selector).first();
      if ((await container.count()) === 0) continue;
      for (let i = 0; i < 4; i += 1) {
        await container.evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        }).catch(() => undefined);
        await sleep(400);
      }
      return;
    }
  }
}

async function clickCalendarDay(
  frame: Frame | null,
  page: Page,
  targetDate: Date,
): Promise<boolean> {
  const dayNum = String(targetDate.getDate());
  const targets: Array<Frame | Page> = frame ? [frame, page] : [page];

  for (const target of targets) {
    const buttons = target.locator(RESERVATION_SELECTORS.calendarDay);
    const count = await buttons.count();
    for (let i = 0; i < count; i += 1) {
      const button = buttons.nth(i);
      const text = (await button.innerText().catch(() => "")).trim();
      const disabled = await button.isDisabled().catch(() => true);
      const ariaDisabled = await button.getAttribute("aria-disabled");
      if (disabled || ariaDisabled === "true") continue;
      if (text === dayNum || text.startsWith(dayNum)) {
        await button.click({ timeout: 8000 }).catch(() => undefined);
        await sleep(900);
        return true;
      }
    }

    const byText = target.getByText(dayNum, { exact: true }).first();
    if ((await byText.count()) > 0) {
      await byText.click({ timeout: 8000 }).catch(() => undefined);
      await sleep(900);
      return true;
    }
  }
  return false;
}

async function collectPricesForDate(
  frame: Frame | null,
  page: Page,
  targetDate: Date,
  slowMs: number,
): Promise<number[]> {
  const clicked = await clickCalendarDay(frame, page, targetDate);
  if (!clicked) return [];
  await sleep(slowMs);
  await scrollPriceList(frame, page);
  const text = await readEntryText(frame, page);
  return extractPricesFromText(text);
}

async function collectReservationPrices(
  entryFrame: Frame | null,
  page: Page,
  slowMs: number,
): Promise<{
  available: boolean;
  min?: number;
  max?: number;
  priceText: string;
  checkedAt: string;
}> {
  const bodyBefore = await readEntryText(entryFrame, page);
  const hasReservationTab =
    bodyBefore.includes(TAB_LABELS.reservation) ||
    /예\s*약/.test(bodyBefore);

  if (!hasReservationTab) {
    return { available: false, priceText: "", checkedAt: "" };
  }

  const clicked = await clickTab(entryFrame, page, TAB_LABELS.reservation);
  if (!clicked) {
    return { available: false, priceText: "", checkedAt: "" };
  }
  await sleep(slowMs);

  const now = new Date();
  const targets = findTargetDates(now);
  const weekdayPrices = await collectPricesForDate(
    entryFrame,
    page,
    targets.weekday,
    slowMs,
  );
  const weekendPrices = await collectPricesForDate(
    entryFrame,
    page,
    targets.weekend,
    slowMs,
  );

  const allPrices = [...weekdayPrices, ...weekendPrices];
  if (allPrices.length === 0) {
    const fallbackText = await readEntryText(entryFrame, page);
    const fallbackPrices = extractPricesFromText(fallbackText);
    if (fallbackPrices.length === 0) {
      return { available: true, priceText: "", checkedAt: now.toISOString() };
    }
    const min = fallbackPrices[0];
    const max = fallbackPrices[fallbackPrices.length - 1];
    return {
      available: true,
      min,
      max,
      priceText: `weekday~weekend: ${min.toLocaleString("ko-KR")}~${max.toLocaleString("ko-KR")}원`,
      checkedAt: now.toISOString(),
    };
  }

  const weekdayMin =
    weekdayPrices.length > 0 ? weekdayPrices[0] : Math.min(...allPrices);
  const weekendMax =
    weekendPrices.length > 0
      ? weekendPrices[weekendPrices.length - 1]
      : Math.max(...allPrices);

  const priceText = [
    weekdayPrices.length > 0
      ? `weekday min (${targets.weekday.getMonth() + 1}/${targets.weekday.getDate()}): ${weekdayMin.toLocaleString("ko-KR")}원`
      : "",
    weekendPrices.length > 0
      ? `weekend max (${targets.weekend.getMonth() + 1}/${targets.weekend.getDate()}): ${weekendMax.toLocaleString("ko-KR")}원`
      : "",
  ]
    .filter(Boolean)
    .join("; ");

  return {
    available: true,
    min: weekdayMin,
    max: weekendMax,
    priceText,
    checkedAt: now.toISOString(),
  };
}

async function waitForDetailContent(
  frame: Frame | null,
  page: Page,
  timeoutMs: number,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let best = "";
  while (Date.now() < deadline) {
    const text = await readEntryText(frame, page);
    if (text.includes(DETAIL_FIELD_LABELS.phone) || text.includes(DETAIL_FIELD_LABELS.homepage)) {
      return text;
    }
    if (text.length > best.length) best = text;
    await sleep(500);
  }
  return best;
}

async function scrapePlaceDetails(
  entryFrame: Frame | null,
  page: Page,
  row: EnrichmentInputRow,
  slowMs: number,
  skipReservation: boolean,
): Promise<Partial<NaverMapEnrichmentRow>> {
  const frame = entryFrame ?? (await waitForEntryFrame(page, 18_000));
  let bodyText = await waitForDetailContent(frame, page, 18_000);

  if (!bodyText.includes(DETAIL_FIELD_LABELS.phone)) {
    await clickTab(frame, page, TAB_LABELS.home);
    await sleep(Math.max(600, slowMs / 2));
    bodyText = await readEntryText(frame, page);
  }

  if (!extractMapAverageScore(bodyText) && !extractCourseDifficulty(bodyText).difficulty) {
    await clickTab(frame, page, TAB_LABELS.courseHole);
    await sleep(Math.max(600, slowMs / 2));
    const courseText = await readEntryText(frame, page);
    if (courseText.length > bodyText.length / 2) {
      bodyText = `${bodyText}\n${courseText}`;
    }
  }
  const pageTitle = await page.title();
  const courseInput = {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.address.split(/\s+/)[0] ?? "",
  };
  const extracted = extractFromPageContent(pageTitle, bodyText, courseInput);

  const avgScore = extractMapAverageScore(bodyText) || extracted.candidateAvgScore;
  const difficultyParsed = extractCourseDifficulty(bodyText);
  const difficulty = difficultyParsed.difficulty;
  const difficultyText = difficultyParsed.difficultyText;

  const phone = cleanPhone(
    extracted.candidatePhone ||
      extractLabeledValue(bodyText, DETAIL_FIELD_LABELS.phone),
  );
  const homepage =
    extracted.candidateHomepageUrl ||
    extractLabeledValue(bodyText, DETAIL_FIELD_LABELS.homepage);
  const matchedAddress =
    extracted.candidateAddress ||
    extractLabeledValue(bodyText, DETAIL_FIELD_LABELS.address);

  if (skipReservation) {
    return {
      scraped_phone: phone,
      scraped_homepage_url: homepage,
      scraped_avg_score: avgScore,
      scraped_difficulty: difficulty,
      scraped_difficulty_text: difficultyText,
      matched_address: matchedAddress,
      ...emptyPriceFields(),
    };
  }

  const reservation = await collectReservationPrices(frame, page, slowMs);

  return {
    scraped_phone: phone,
    scraped_homepage_url: homepage,
    scraped_avg_score: avgScore,
    scraped_difficulty: difficulty,
    scraped_difficulty_text: difficultyText,
    matched_address: matchedAddress,
    reservation_available: reservation.available ? "y" : "n",
    scraped_price_text: reservation.priceText,
    scraped_price_min:
      reservation.min !== undefined ? String(reservation.min) : "",
    scraped_price_max:
      reservation.max !== undefined ? String(reservation.max) : "",
    scraped_price_type: reservation.available && reservation.min ? "naver_reservation" : "",
    scraped_price_checked_at: reservation.checkedAt,
  };
}

async function scrapeContactOnly(
  entryFrame: Frame | null,
  page: Page,
  slowMs: number,
): Promise<Partial<NaverMapEnrichmentRow>> {
  const frame = entryFrame ?? (await waitForEntryFrame(page, 18_000));
  let bodyText = await waitForDetailContent(frame, page, 18_000);

  if (!bodyText.includes(DETAIL_FIELD_LABELS.phone)) {
    await clickTab(frame, page, TAB_LABELS.home);
    await sleep(Math.max(600, slowMs / 2));
    bodyText = await readEntryText(frame, page);
  }

  const extracted = extractFromPageContent("", bodyText, {
    id: "",
    name: "",
    address: "",
    city: "",
  });

  const phone = cleanPhone(
    extracted.candidatePhone || extractLabeledValue(bodyText, DETAIL_FIELD_LABELS.phone),
  );
  const homepage =
    extracted.candidateHomepageUrl ||
    extractLabeledValue(bodyText, DETAIL_FIELD_LABELS.homepage);
  const matchedAddress = extractLabeledValue(bodyText, DETAIL_FIELD_LABELS.address);

  return {
    scraped_phone: phone,
    scraped_homepage_url: homepage,
    matched_address: matchedAddress,
    scraped_avg_score: "",
    scraped_difficulty: "",
    scraped_difficulty_text: "",
    ...emptyPriceFields(),
  };
}

function resolveSuccessStrategy(
  baseStrategy: SearchStrategy,
  candidate: ScoredPlaceCandidate,
): SearchStrategy {
  if (isLimitedContactMode(candidate)) return "clubhouse_fallback";
  return baseStrategy;
}

interface MatchAttemptResult {
  success: boolean;
  strategy: SearchStrategy | "";
  searchQuery: string;
  researchQuery?: string;
  candidate: ScoredPlaceCandidate | null;
  candidates: PlaceCandidate[];
  rejectedCandidate: PlaceCandidate | null;
  note: string;
  blocked?: boolean;
}

type ScrapeAccessOptions = Pick<
  ScraperOptions,
  "gotoRateLimiter" | "circuitBreaker"
>;

function blockedMatchResult(
  searchQuery: string,
  note: string,
): MatchAttemptResult {
  return emptyMatchResult({
    strategy: "failed",
    searchQuery,
    note,
    blocked: true,
  });
}

async function checkPageBlocked(
  page: Page,
  access: ScrapeAccessOptions,
  stage: string,
): Promise<string | null> {
  const panelFrame = await getPanelFrame(page);
  return detectBlockers(page, panelFrame, access.circuitBreaker, stage);
}

function buildCategorySkippedRow(
  row: EnrichmentInputRow,
  searchQuery: string,
  rejected: PlaceCandidate,
  candidates: PlaceCandidate[],
  extraNotes: string[],
): NaverMapEnrichmentRow {
  const output = emptyEnrichmentRow(row);
  output.search_strategy = "skipped";
  output.search_query = searchQuery;
  output.matched_title = rejected.title;
  output.matched_category = rejected.category;
  output.confidence = "low";
  output.needs_check = "y";
  output.mismatch_reason = "category_not_golf_course";
  const candidateSummary =
    candidates.length > 0
      ? `candidates: ${candidates.map((c) => `${c.title}/${c.category}`).join(" | ")}`
      : "";
  output.note = [
    `category_not_golf_course: ${rejected.title} / ${rejected.category}`,
    candidateSummary,
    ...extraNotes,
  ]
    .filter(Boolean)
    .join("; ");
  return output;
}

function emptyMatchResult(partial: Partial<MatchAttemptResult> = {}): MatchAttemptResult {
  return {
    success: false,
    strategy: "",
    searchQuery: "",
    candidate: null,
    candidates: [],
    rejectedCandidate: null,
    note: "",
    ...partial,
  };
}

function extractPlaceMetaFromDetail(
  bodyText: string,
  pageTitle: string,
): { title: string; category: string; address: string } {
  const address = extractLabeledValue(bodyText, DETAIL_FIELD_LABELS.address);
  const lines = bodyText
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = 0; i < Math.min(lines.length, 20); i += 1) {
    const line = lines[i];
    if (isAllowedGolfCategory(line) || isClubhouseCategory(line)) {
      const titleCandidate = lines[i - 1] ?? "";
      if (titleCandidate && titleCandidate.length >= 2 && titleCandidate.length <= 50) {
        return { title: titleCandidate, category: line, address };
      }
      return { title: titleCandidate || line, category: line, address };
    }
  }

  let title = pageTitle
    .replace(/\s*:\s*네이버\s*지도.*$/i, "")
    .replace(/\s*-\s*네이버\s*지도.*$/i, "")
    .trim();
  if (!title || title === "네이버 지도") {
    title = lines.find((line) => line.length >= 2 && line.length <= 40) ?? "";
  }

  let category = "";
  for (const line of lines.slice(0, 15)) {
    if (isAllowedGolfCategory(line) || isClubhouseCategory(line)) {
      category = line;
      break;
    }
  }
  if (!category && title) category = inferCategoryFromTitle(title);

  return { title, category, address };
}

async function tryDirectPlaceDetailPanel(
  page: Page,
  row: EnrichmentInputRow,
  searchQuery: string,
  strategy: SearchStrategy,
  slowMs: number,
): Promise<MatchAttemptResult | null> {
  await sleep(Math.max(400, slowMs / 3));
  const entryFrame = await waitForPlaceDetailReady(page, 15_000);
  const bodyText = await readEntryText(entryFrame, page);
  if (!hasDetailReadySignals(bodyText)) return null;

  const meta = extractPlaceMetaFromDetail(bodyText, await page.title());
  if (!meta.title.trim()) return null;

  const candidate = normalizePlaceCandidate(meta.title, meta.category);
  if (meta.address) candidate.address = meta.address;

  const scored = pickBestPlaceCandidate([candidate], referenceNames(row), row.address);
  if (scored) {
    return {
      success: true,
      strategy: resolveSuccessStrategy(strategy, scored),
      searchQuery,
      candidate: scored,
      candidates: [candidate],
      rejectedCandidate: null,
      note: "name search direct detail panel",
    };
  }

  if (
    !isAllowedGolfCategory(candidate.category) &&
    !isClubhouseCategory(candidate.category)
  ) {
    return emptyMatchResult({
      strategy: "skipped",
      searchQuery,
      candidates: [candidate],
      rejectedCandidate: candidate,
      note: `category_not_golf_course: ${candidate.title} / ${candidate.category} (direct detail panel)`,
    });
  }

  return null;
}

async function openDetailByTitleResearch(
  page: Page,
  row: EnrichmentInputRow,
  addressCandidate: ScoredPlaceCandidate,
  addressQuery: string,
  addressCandidates: PlaceCandidate[],
  slowMs: number,
  access: ScrapeAccessOptions,
): Promise<MatchAttemptResult> {
  const researchQuery = addressCandidate.title.trim();
  if (!researchQuery) {
    return emptyMatchResult({
      searchQuery: addressQuery,
      candidate: addressCandidate,
      candidates: addressCandidates,
      note: FAILURE_REASONS.titleResearch,
    });
  }

  const blocker = await navigateToSearch(page, researchQuery, slowMs, access);
  if (blocker) return blockedMatchResult(addressQuery, blocker);

  const postBlock = await checkPageBlocked(page, access, "title_research");
  if (postBlock) return blockedMatchResult(addressQuery, postBlock);

  await sleep(Math.max(400, slowMs / 3));
  let entryFrame = await waitForPlaceDetailReady(page, 18_000);
  if (!entryFrame) {
    await sleep(slowMs);
    entryFrame = await waitForPlaceDetailReady(page, 12_000);
  }

  const bodyText = await readEntryText(entryFrame, page);
  const pageTitle = await page.title();
  const urlHasPlace = page.url().includes("/place/");

  if (
    !entryFrame &&
    !urlHasPlace &&
    bodyText.length < 100 &&
    !hasDetailReadySignals(bodyText)
  ) {
    return emptyMatchResult({
      searchQuery: addressQuery,
      researchQuery,
      candidate: addressCandidate,
      candidates: addressCandidates,
      note: FAILURE_REASONS.titleResearch,
    });
  }

  const meta = extractPlaceMetaFromDetail(bodyText, pageTitle);
  const detailTitle = meta.title.trim() || researchQuery;
  const detailCategory = meta.category.trim() || addressCandidate.category;
  const detailAddress = meta.address.trim();

  if (!isAllowedGolfCategory(detailCategory) && !isClubhouseCategory(detailCategory)) {
    const rejected = normalizePlaceCandidate(detailTitle, detailCategory);
    return emptyMatchResult({
      searchQuery: addressQuery,
      researchQuery,
      candidate: addressCandidate,
      candidates: addressCandidates,
      rejectedCandidate: rejected,
      note: `${FAILURE_REASONS.titleResearchMismatch}: excluded category ${detailCategory || "unknown"}`,
    });
  }

  const sim = nameSimilarity(addressCandidate.title, detailTitle);
  if (sim < 0.45 && titlesLikelyMismatch(addressCandidate.title, detailTitle)) {
    return emptyMatchResult({
      searchQuery: addressQuery,
      researchQuery,
      candidate: addressCandidate,
      candidates: addressCandidates,
      note: `${FAILURE_REASONS.titleResearchMismatch}: detail title "${detailTitle}" differs from candidate "${addressCandidate.title}"`,
    });
  }

  if (
    row.address.trim() &&
    detailAddress &&
    addressesLikelyMismatch(row.address, detailAddress)
  ) {
    return emptyMatchResult({
      searchQuery: addressQuery,
      researchQuery,
      candidate: addressCandidate,
      candidates: addressCandidates,
      note: `${FAILURE_REASONS.titleResearchMismatch}: detail address "${detailAddress}" vs CSV "${row.address}"`,
    });
  }

  return {
    success: true,
    strategy: resolveSuccessStrategy("address_title_research", addressCandidate),
    searchQuery: addressQuery,
    researchQuery,
    candidate: addressCandidate,
    candidates: addressCandidates,
    rejectedCandidate: null,
    note: "address candidate title re-search (no card click)",
  };
}

async function openAddressCandidateDetail(
  page: Page,
  row: EnrichmentInputRow,
  best: ScoredPlaceCandidate,
  addressQuery: string,
  candidates: PlaceCandidate[],
  slowMs: number,
  access: ScrapeAccessOptions,
  candidateOpenMode: CandidateOpenMode,
): Promise<MatchAttemptResult> {
  if (candidateOpenMode === "research") {
    return openDetailByTitleResearch(
      page,
      row,
      best,
      addressQuery,
      candidates,
      slowMs,
      access,
    );
  }

  const clickResult = await clickPlaceCandidate(
    page,
    best,
    slowMs,
    access.gotoRateLimiter,
  );
  if (!clickResult.success) {
    return emptyMatchResult({
      searchQuery: addressQuery,
      candidate: best,
      candidates,
      note: clickResult.failureReason ?? FAILURE_REASONS.click,
    });
  }

  const postBlock = await checkPageBlocked(page, access, "click_place");
  if (postBlock) return blockedMatchResult(addressQuery, postBlock);

  let entryFrame = await waitForPlaceDetailReady(page, 18_000);
  if (!entryFrame) {
    await sleep(slowMs);
    entryFrame = await waitForPlaceDetailReady(page, 10_000);
  }
  const previewText = await readEntryText(entryFrame, page);
  if (
    !entryFrame &&
    !page.url().includes("/place/") &&
    previewText.length < 150 &&
    !hasDetailReadySignals(previewText)
  ) {
    return emptyMatchResult({
      searchQuery: addressQuery,
      candidate: best,
      candidates,
      note: FAILURE_REASONS.iframe,
    });
  }

  return {
    success: true,
    strategy: resolveSuccessStrategy("address_place", best),
    searchQuery: addressQuery,
    candidate: best,
    candidates,
    rejectedCandidate: null,
    note: isLimitedContactMode(best)
      ? "골프장 category 후보가 없어 클럽하우스에서 연락처만 수집"
      : "",
  };
}

async function tryAddressSearch(
  page: Page,
  row: EnrichmentInputRow,
  slowMs: number,
  access: ScrapeAccessOptions,
  candidateOpenMode: CandidateOpenMode,
): Promise<MatchAttemptResult> {
  const address = normalizeAddress(row.address);
  if (!address) {
    return emptyMatchResult({ note: "empty address" });
  }

  const blocker = await navigateToSearch(page, address, slowMs, access);
  if (blocker) return blockedMatchResult(address, blocker);

  const panelFrame = await getPanelFrame(page);
  const hasSection = await waitForAddressPlacesSection(page, 15_000);
  let ctx = await refreshFrames(page);
  const bodyText = await readPanelText(panelFrame);

  if (!hasSection && !TEXT_PATTERNS.addressPlacesSection.test(bodyText)) {
    const listCandidates = await extractSearchListCandidates(page, panelFrame);
    const best = pickBestPlaceCandidate(listCandidates, referenceNames(row), row.address);
    if (best) {
      const opened = await openAddressCandidateDetail(
        page,
        row,
        best,
        address,
        listCandidates,
        slowMs,
        access,
        candidateOpenMode,
      );
      if (opened.success) {
        return {
          ...opened,
          note: isLimitedContactMode(best)
            ? "clubhouse limited contact fallback (address search list)"
            : opened.note || "address search list fallback",
        };
      }
      return emptyMatchResult({
        searchQuery: address,
        researchQuery: opened.researchQuery,
        candidate: best,
        candidates: listCandidates,
        rejectedCandidate: opened.rejectedCandidate,
        note: opened.note || "no golf or clubhouse category in address search list",
      });
    }
    return emptyMatchResult({
      searchQuery: address,
      candidates: listCandidates,
      rejectedCandidate: pickTopNonGolfCandidate(listCandidates, referenceNames(row)),
      note: "no golf or clubhouse category in address search list",
    });
  }

  const candidates = await extractAddressPlaceCandidates(page, panelFrame);
  const best = pickBestPlaceCandidate(candidates, referenceNames(row), row.address);
  if (!best) {
    return emptyMatchResult({
      searchQuery: address,
      candidates,
      rejectedCandidate: pickTopNonGolfCandidate(candidates, referenceNames(row)),
      note: "no golf or clubhouse category in address places",
    });
  }

  const opened = await openAddressCandidateDetail(
    page,
    row,
    best,
    address,
    candidates,
    slowMs,
    access,
    candidateOpenMode,
  );
  if (!opened.success) {
    return emptyMatchResult({
      searchQuery: address,
      researchQuery: opened.researchQuery,
      candidate: best,
      candidates,
      rejectedCandidate: opened.rejectedCandidate,
      note: opened.note,
    });
  }

  return {
    ...opened,
    note: isLimitedContactMode(best)
      ? "골프장 category 후보가 없어 클럽하우스에서 연락처만 수집"
      : opened.note,
  };
}

async function tryNameSearch(
  page: Page,
  row: EnrichmentInputRow,
  query: string,
  strategy: SearchStrategy,
  slowMs: number,
  access: ScrapeAccessOptions,
): Promise<MatchAttemptResult> {
  const normalized = normalizeCourseNameForMapSearch(query);
  if (!normalized) {
    return emptyMatchResult({ searchQuery: query, note: "empty name query" });
  }

  const blocker = await navigateToSearch(page, normalized, slowMs, access);
  if (blocker) return blockedMatchResult(normalized, blocker);

  const panelFrame = await getPanelFrame(page);

  const direct = await tryDirectPlaceDetailPanel(page, row, normalized, strategy, slowMs);
  if (direct?.success) return direct;
  if (direct?.strategy === "skipped" && direct.rejectedCandidate) {
    return direct;
  }

  const candidates = await extractSearchListCandidates(page, panelFrame);
  const best = pickBestPlaceCandidate(candidates, referenceNames(row), row.address);
  if (!best) {
    return emptyMatchResult({
      searchQuery: normalized,
      candidates,
      rejectedCandidate: pickTopNonGolfCandidate(candidates, referenceNames(row)),
      note: "no golf or clubhouse category in name search",
    });
  }

  const clickResult = await clickPlaceCandidate(
    page,
    best,
    slowMs,
    access.gotoRateLimiter,
  );
  if (!clickResult.success) {
    return emptyMatchResult({
      searchQuery: normalized,
      candidate: best,
      candidates,
      note: clickResult.failureReason ?? FAILURE_REASONS.click,
    });
  }

  const postBlock = await checkPageBlocked(page, access, "click_place");
  if (postBlock) return blockedMatchResult(normalized, postBlock);

  const after = await refreshFrames(page);
  if (!after.entryFrame && !page.url().includes("/place/")) {
    return emptyMatchResult({
      searchQuery: normalized,
      candidate: best,
      candidates,
      note: FAILURE_REASONS.iframe,
    });
  }

  return {
    success: true,
    strategy: resolveSuccessStrategy(strategy, best),
    searchQuery: normalized,
    candidate: best,
    candidates,
    rejectedCandidate: null,
    note: isLimitedContactMode(best)
      ? "골프장 category 후보가 없어 클럽하우스에서 연락처만 수집"
      : "",
  };
}

function buildMismatchAssessment(
  row: EnrichmentInputRow,
  result: NaverMapEnrichmentRow,
): { needs_check: string; mismatch_reason: string } {
  const reasons: string[] = [];
  let needsCheck = "n";

  if (result.confidence === "low") {
    reasons.push("low confidence");
    needsCheck = "y";
  }

  if (
    row.address.trim() &&
    result.matched_address.trim() &&
    addressesLikelyMismatch(row.address, result.matched_address)
  ) {
    reasons.push("address region mismatch");
    needsCheck = "y";
  }

  if (
    titlesLikelyMismatch(row.name, result.matched_title) &&
    titlesLikelyMismatch(row.change_name_to || row.name, result.matched_title)
  ) {
    reasons.push("title differs from course name");
    if (result.confidence !== "high") needsCheck = "y";
  }

  if (
    result.search_strategy !== "address_place" &&
    result.search_strategy !== "address_title_research" &&
    row.address.trim()
  ) {
    reasons.push(`fallback used: ${result.search_strategy}`);
    if (result.confidence !== "high") needsCheck = "y";
  }

  return {
    needs_check: needsCheck,
    mismatch_reason: reasons.join("; "),
  };
}

function buildAccessBlockedRow(
  row: EnrichmentInputRow,
  note: string,
): NaverMapEnrichmentRow {
  const output = emptyEnrichmentRow(row);
  output.search_strategy = "failed";
  output.search_query = "";
  output.note = note;
  output.mismatch_reason = "circuit_breaker";
  output.confidence = "low";
  output.needs_check = "y";
  return output;
}

export async function scrapeEnrichmentRow(
  row: EnrichmentInputRow,
  browserContext: import("playwright").BrowserContext,
  options: ScraperOptions,
): Promise<ScrapeRunResult> {
  const output = emptyEnrichmentRow(row);
  const page = await browserContext.newPage();
  const notes: string[] = [];
  const diagnostics: RowDiagnostics = {
    candidateCount: 0,
    selectedTitle: "",
    selectedCategory: "",
    detailEntered: false,
  };
  const access: ScrapeAccessOptions = {
    gotoRateLimiter: options.gotoRateLimiter,
    circuitBreaker: options.circuitBreaker,
  };

  const finish = (row: NaverMapEnrichmentRow): ScrapeRunResult => ({
    row,
    diagnostics,
  });

  try {
    let match: MatchAttemptResult | null = null;
    let lastRejected: PlaceCandidate | null = null;
    let lastSearchQuery = "";

    if (options.singleSearchPerRow) {
      if (options.addressFirst && row.address.trim()) {
        match = await tryAddressSearch(
          page,
          row,
          options.slowMs,
          access,
          options.candidateOpenMode,
        );
      } else if (row.change_name_to.trim()) {
        match = await tryNameSearch(
          page,
          row,
          row.change_name_to,
          "change_name_fallback",
          options.slowMs,
          access,
        );
      } else {
        match = await tryNameSearch(
          page,
          row,
          row.name,
          "name_fallback",
          options.slowMs,
          access,
        );
      }
      if (match.rejectedCandidate) lastRejected = match.rejectedCandidate;
      if (match.searchQuery) lastSearchQuery = match.searchQuery;
      if (!match.success && match.note) notes.push(match.note);
    } else if (options.addressFirst && row.address.trim()) {
      match = await tryAddressSearch(
        page,
        row,
        options.slowMs,
        access,
        options.candidateOpenMode,
      );
      if (match.rejectedCandidate) lastRejected = match.rejectedCandidate;
      if (match.searchQuery) lastSearchQuery = match.searchQuery;
      if (!match.success && match.note) notes.push(match.note);
    }

    if (!options.singleSearchPerRow && !match?.success) {
      if (row.change_name_to.trim()) {
        match = await tryNameSearch(
          page,
          row,
          row.change_name_to,
          "change_name_fallback",
          options.slowMs,
          access,
        );
        if (match.rejectedCandidate) lastRejected = match.rejectedCandidate;
        if (match.searchQuery) lastSearchQuery = match.searchQuery;
        if (!match.success && match.note) notes.push(`change_name: ${match.note}`);
      }
    }

    if (!options.singleSearchPerRow && !match?.success) {
      match = await tryNameSearch(
        page,
        row,
        row.name,
        "name_fallback",
        options.slowMs,
        access,
      );
      if (match.rejectedCandidate) lastRejected = match.rejectedCandidate;
      if (match.searchQuery) lastSearchQuery = match.searchQuery;
      if (!match.success && match.note) notes.push(`name: ${match.note}`);
    }

    if (match?.blocked || options.circuitBreaker?.tripped) {
      const stageMatch = match?.note.match(/\[stage:([^\]]+)\]/);
      diagnostics.blockDetectedAt = stageMatch?.[1] ?? "search";
      return finish(
        buildAccessBlockedRow(
          row,
          match?.note || options.circuitBreaker?.reason || "access blocked",
        ),
      );
    }

    diagnostics.candidateCount = match?.candidates.length ?? 0;

    if (!match?.success || !match.candidate) {
      if (match?.strategy === "skipped" && match.rejectedCandidate) {
        diagnostics.selectedTitle = match.rejectedCandidate.title;
        diagnostics.selectedCategory = match.rejectedCandidate.category;
        return finish(
          buildCategorySkippedRow(
            row,
            match.searchQuery || lastSearchQuery,
            match.rejectedCandidate,
            match.candidates ?? [],
            notes,
          ),
        );
      }

      const clickOrPanelFailed = notes.some((n) => isRetryableFailureNote(n, ""));
      if (lastRejected && !clickOrPanelFailed) {
        diagnostics.selectedTitle = lastRejected.title;
        diagnostics.selectedCategory = lastRejected.category;
        return finish(
          buildCategorySkippedRow(
            row,
            lastSearchQuery,
            lastRejected,
            match?.candidates ?? [],
            notes,
          ),
        );
      }
      output.search_strategy = match?.strategy || "failed";
      output.search_query = match?.searchQuery || lastSearchQuery;
      output.note = notes.join("; ") || match?.note || "all search strategies failed";
      output.mismatch_reason = clickOrPanelFailed ? notes.join("; ") : "";
      output.confidence = "low";
      output.needs_check = "y";
      if (match?.candidate) {
        diagnostics.selectedTitle = match.candidate.title;
        diagnostics.selectedCategory = match.candidate.category;
      }
      return finish(output);
    }

    diagnostics.selectedTitle = match.candidate.title;
    diagnostics.selectedCategory = match.candidate.category;

    const ctx = await refreshFrames(page);
    let entryFrame = await waitForPlaceDetailReady(page, 20_000);
    if (!entryFrame) {
      await sleep(options.slowMs);
      entryFrame = await waitForPlaceDetailReady(page, 12_000);
    }
    const placeUrl = page.url().includes("/place/") ? page.url() : "";

    let previewText = await readEntryText(entryFrame ?? ctx.entryFrame, page);
    if (previewText.length < 100) {
      await sleep(options.slowMs);
      entryFrame = (await waitForPlaceDetailReady(page, 12_000)) ?? entryFrame;
      previewText = await readEntryText(entryFrame ?? ctx.entryFrame, page);
    }

    if (
      previewText.length < 100 &&
      !hasDetailReadySignals(previewText) &&
      match.candidate.placeUrl
    ) {
      await openPlaceDetailByUrl(
        page,
        match.candidate.placeUrl,
        options.slowMs,
        options.gotoRateLimiter,
      );
      entryFrame = (await waitForPlaceDetailReady(page, 18_000)) ?? entryFrame;
      previewText = await readEntryText(entryFrame, page);
    }

    diagnostics.detailEntered =
      Boolean(entryFrame ?? ctx.entryFrame) ||
      hasDetailReadySignals(previewText) ||
      previewText.length > 200;

    const detailBlock = await checkPageBlocked(page, access, "detail_read");
    if (detailBlock || isAccessBlockedText(previewText)) {
      diagnostics.blockDetectedAt = "detail_read";
      return finish(
        buildAccessBlockedRow(
          row,
          detailBlock || `과도한 접근 / CAPTCHA — batch stop [stage:detail_read]`,
        ),
      );
    }

    const details = isLimitedContactMode(match.candidate)
      ? await scrapeContactOnly(entryFrame ?? ctx.entryFrame, page, options.slowMs)
      : await scrapePlaceDetails(
          entryFrame ?? ctx.entryFrame,
          page,
          row,
          options.slowMs,
          options.skipReservation,
        );

    const hasAnyDetail =
      Boolean(details.scraped_phone?.trim()) ||
      Boolean(details.scraped_homepage_url?.trim()) ||
      Boolean(details.scraped_avg_score?.trim()) ||
      Boolean(details.scraped_difficulty?.trim());

    const detailEmpty = !isLimitedContactMode(match.candidate) && !hasAnyDetail;

    const contactEmpty =
      isLimitedContactMode(match.candidate) &&
      !details.scraped_phone?.trim() &&
      !details.scraped_homepage_url?.trim();

    if (detailEmpty || contactEmpty) {
      output.search_strategy = "failed";
      output.search_query = match.searchQuery;
      output.matched_title = match.candidate.title;
      output.matched_category = match.candidate.category;
      output.note = [notes.join("; "), FAILURE_REASONS.detail].filter(Boolean).join("; ");
      output.mismatch_reason = FAILURE_REASONS.detail;
      output.confidence = "low";
      output.needs_check = "y";
      diagnostics.blockDetectedAt = diagnostics.blockDetectedAt ?? "detail_read";
      return finish(output);
    }

    output.search_strategy = match.strategy;
    output.search_query = match.searchQuery;
    output.research_query = match.researchQuery ?? "";
    output.matched_title = match.candidate.title;
    output.matched_category = match.candidate.category;
    output.matched_place_url = placeUrl;
    Object.assign(output, details);

    if (!output.matched_address && row.address.trim()) {
      output.matched_address = row.address;
    }

    output.confidence = confidenceFromMatch({
      searchStrategy: match.strategy,
      tier: match.candidate.tier,
      referenceNames: referenceNames(row),
      matchedTitle: output.matched_title,
      matchedAddress: output.matched_address,
      courseAddress: row.address,
    });

    if (match.strategy === "clubhouse_fallback") {
      output.needs_check = "y";
      output.mismatch_reason = "golf_category_not_found_used_clubhouse";
    }

    if (match.candidates.length > 1) {
      notes.push(
        `candidates: ${match.candidates.map((c) => `${c.title}/${c.category}`).join(" | ")}`,
      );
    }
    if (match.note) notes.push(match.note);

    if (match.strategy !== "clubhouse_fallback") {
      const mismatch = buildMismatchAssessment(row, output);
      output.needs_check = mismatch.needs_check;
      output.mismatch_reason = mismatch.mismatch_reason;
    }
    if (notes.length > 0) {
      output.note = notes.join("; ");
    }

    const swapped = applySwapToScrapedFields({
      scraped_avg_score: output.scraped_avg_score,
      scraped_difficulty: output.scraped_difficulty,
      note: output.note,
    });
    output.scraped_avg_score = swapped.scraped_avg_score;
    output.scraped_difficulty = swapped.scraped_difficulty;
    output.note = swapped.note;

    return finish(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    output.note = `error: ${message}${notes.length ? `; ${notes.join("; ")}` : ""}`;
    output.search_strategy = "failed";
    output.confidence = "low";
    output.needs_check = "y";
    return finish(output);
  } finally {
    await page.close().catch(() => undefined);
  }
}

export async function scrapeEnrichmentRowWithRetry(
  row: EnrichmentInputRow,
  browserContext: import("playwright").BrowserContext,
  options: ScraperOptions,
): Promise<ScrapeRunResult> {
  let lastRun = await scrapeEnrichmentRow(row, browserContext, options);
  let last = lastRun.row;
  if (
    isAccessBlockedNote(last.note, last.mismatch_reason) ||
    options.circuitBreaker?.tripped
  ) {
    return lastRun;
  }
  if (
    last.search_strategy !== "failed" &&
    last.search_strategy !== "skipped" &&
    last.matched_title
  ) {
    return lastRun;
  }
  if (!isRetryableFailureNote(last.note, last.mismatch_reason)) {
    return lastRun;
  }

  for (let retry = 0; retry < options.maxRetries; retry += 1) {
    if (options.circuitBreaker?.tripped) break;
    await sleep(options.slowMs * 2);
    lastRun = await scrapeEnrichmentRow(row, browserContext, options);
    last = lastRun.row;
    if (
      isAccessBlockedNote(last.note, last.mismatch_reason) ||
      options.circuitBreaker?.tripped
    ) {
      return lastRun;
    }
    if (
      last.search_strategy !== "failed" &&
      last.search_strategy !== "skipped" &&
      last.matched_title
    ) {
      last.note = `${last.note ? `${last.note}; ` : ""}retry ${retry + 1} succeeded`.trim();
      lastRun.row = last;
      return lastRun;
    }
    if (!isRetryableFailureNote(last.note, last.mismatch_reason)) {
      return lastRun;
    }
  }

  return lastRun;
}

export async function createNaverMapBrowser(headful: boolean) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: !headful });
  const context = await browser.newContext({
    locale: "ko-KR",
    viewport: { width: 1400, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  });
  return { browser, context };
}
