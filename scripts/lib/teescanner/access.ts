import fs from "node:fs";
import path from "node:path";
import { chromium, type Browser, type Locator, type Page } from "playwright";
import { verifyTeescannerSearchUi } from "./searchFlow";
import type {
  DismissPopupResult,
  TeescannerAccessCheckResult,
} from "./types";
import { DEFAULT_SCREENSHOT_DIR } from "./io";

export const TEESCANNER_BASE = "https://www.teescanner.com";

export const TEESCANNER_BLOCK_PHRASES: Array<{
  pattern: RegExp;
  reason: string;
  label: string;
}> = [
  { pattern: /접근이\s*제한|접근\s*제한/i, reason: "access_restricted", label: "접근이 제한" },
  {
    pattern: /비정상적인\s*접근|비정상\s*접근/i,
    reason: "abnormal_access",
    label: "비정상적인 접근",
  },
  {
    pattern: /자동화된\s*접근/i,
    reason: "automated_access",
    label: "자동화된 접근",
  },
  { pattern: /보안\s*확인/i, reason: "security_check", label: "보안 확인" },
  { pattern: /captcha/i, reason: "captcha", label: "CAPTCHA" },
  { pattern: /로봇/i, reason: "robot_check", label: "로봇" },
  { pattern: /과도한\s*요청/i, reason: "excessive_requests", label: "과도한 요청" },
  {
    pattern: /서비스\s*이용\s*제한|이용이\s*제한/i,
    reason: "service_restricted",
    label: "서비스 이용 제한",
  },
  { pattern: /요청이\s*많습니다/i, reason: "too_many_requests", label: "요청이 많습니다" },
  { pattern: /잠시\s*후\s*다시/i, reason: "retry_later", label: "잠시 후 다시 시도" },
];

const LOGIN_REQUIRED_PATTERNS = [
  /로그인\s*후\s*이용/i,
  /회원\s*전용/i,
  /로그인이\s*필요/i,
];

const POPUP_DISMISS_LABELS = [
  "오늘 하루 보지 않기",
  "하루 보지 않기",
  "오늘 그만 보기",
  "나중에",
  "닫기",
  "확인",
] as const;

const SEARCH_PLACEHOLDER_PATTERNS = [
  /골프장/,
  /검색/,
  /지역/,
  /골프장명/,
  /제휴/,
  /티스캐너/,
];

const SEARCH_TRIGGER_TEXTS = [
  "티스캐너 제휴 골프장 검색",
  "골프장 또는 지역으로 검색하기",
  "제휴 골프장 검색",
] as const;

export const SEARCH_INPUT_SELECTORS = [
  'input[placeholder*="골프장"]',
  'input[placeholder*="검색"]',
  'input[placeholder*="지역"]',
  'input[placeholder*="제휴"]',
  'input[type="search"]',
  '[role="searchbox"]',
  "input.search-input",
  "header input[type='text']",
  "header input",
];

const EXCLUDED_INPUT_PATTERN =
  /password|email|비밀번호|아이디|전화|휴대폰|coupon|쿠폰/i;

export function buildHomeUrl(roundDay: string): string {
  return `${TEESCANNER_BASE}/home?roundDay=${encodeURIComponent(roundDay)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function tomorrowDateString(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function detectTeescannerBlock(text: string): {
  blocked: true;
  reason: string;
  matchedText: string;
} | null {
  for (const phrase of TEESCANNER_BLOCK_PHRASES) {
    const match = text.match(phrase.pattern);
    if (match) {
      return {
        blocked: true,
        reason: phrase.reason,
        matchedText: match[0] || phrase.label,
      };
    }
  }
  return null;
}

export function detectLoginRequired(text: string, url: string): boolean {
  if (/\/login|\/signin|\/member/i.test(url)) return true;
  return LOGIN_REQUIRED_PATTERNS.some((pattern) => pattern.test(text));
}

export async function collectVisibleTeescannerText(page: Page): Promise<string> {
  return page.locator("body").innerText().catch(() => "");
}

export async function createTeescannerBrowser(headless: boolean): Promise<Browser> {
  return chromium.launch({
    headless,
    slowMo: headless ? 0 : 50,
  });
}

async function isSearchLikeInput(locator: Locator): Promise<boolean> {
  try {
    if (!(await locator.isVisible())) return false;
    const readonly = await locator.getAttribute("readonly");
    if (readonly !== null && readonly !== "false") return false;
    if (!(await locator.isEditable())) return false;
    const placeholder = (await locator.getAttribute("placeholder")) ?? "";
    const name = (await locator.getAttribute("name")) ?? "";
    const ariaLabel = (await locator.getAttribute("aria-label")) ?? "";
    const type = (await locator.getAttribute("type")) ?? "";
    const role = (await locator.getAttribute("role")) ?? "";
    const combined = `${placeholder} ${name} ${ariaLabel}`;
    if (EXCLUDED_INPUT_PATTERN.test(combined)) return false;
    if (type === "search" || role === "searchbox") return true;
    return SEARCH_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(combined));
  } catch {
    return false;
  }
}

export async function findSearchInput(page: Page): Promise<Locator | null> {
  for (const pattern of SEARCH_PLACEHOLDER_PATTERNS) {
    const locator = page.getByPlaceholder(pattern).first();
    try {
      if (await isSearchLikeInput(locator)) return locator;
    } catch {
      /* try next */
    }
  }

  for (const selector of SEARCH_INPUT_SELECTORS) {
    const locator = page.locator(selector);
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const candidate = locator.nth(index);
      try {
        await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
        if (await isSearchLikeInput(candidate)) return candidate;
      } catch {
        /* try next */
      }
    }
  }

  const textboxes = page.getByRole("textbox");
  const textboxCount = await textboxes.count();
  for (let index = 0; index < textboxCount; index += 1) {
    const candidate = textboxes.nth(index);
    try {
      await candidate.scrollIntoViewIfNeeded().catch(() => undefined);
      if (await isSearchLikeInput(candidate)) return candidate;
    } catch {
      /* try next */
    }
  }

  return null;
}

async function clickSearchTrigger(page: Page): Promise<boolean> {
  for (const text of SEARCH_TRIGGER_TEXTS) {
    try {
      const trigger = page.getByText(text, { exact: false }).first();
      if (await trigger.isVisible({ timeout: 1000 })) {
        await trigger.click({ timeout: 5000 });
        await sleep(1500);
        return true;
      }
    } catch {
      /* try next trigger */
    }
  }

  try {
    const searchLink = page.getByRole("link", { name: /^검색$/ }).first();
    if (await searchLink.isVisible({ timeout: 1000 })) {
      await searchLink.click({ timeout: 5000 });
      await sleep(2000);
      return true;
    }
  } catch {
    /* no search nav */
  }

  try {
    const searchHref = page.locator('a[href*="search"]').first();
    if (await searchHref.isVisible({ timeout: 1000 })) {
      await searchHref.click({ timeout: 5000 });
      await sleep(2000);
      return true;
    }
  } catch {
    /* no search href */
  }

  return false;
}

/** 팝업 처리 후 검색 UI를 열고 실제 입력창을 찾는다. */
export async function resolveSearchInput(page: Page): Promise<Locator | null> {
  let input = await findSearchInput(page);
  if (input) return input;

  const clicked = await clickSearchTrigger(page);
  if (clicked) {
    input = await findSearchInput(page);
    if (input) return input;
  }

  return null;
}

export async function dismissTeescannerPopups(page: Page): Promise<DismissPopupResult> {
  await sleep(1500);

  const visibleText = await collectVisibleTeescannerText(page);
  if (detectTeescannerBlock(visibleText)) {
    return {
      popupDetected: false,
      popupAction: "skipped_blocked",
      clickedText: "",
    };
  }

  for (const label of POPUP_DISMISS_LABELS) {
    try {
      const button = page.getByRole("button", { name: label }).first();
      if (await button.isVisible({ timeout: 800 })) {
        await button.click({ timeout: 3000 });
        await sleep(1000);
        console.warn(`[teescanner] popup dismissed via button: ${label}`);
        return {
          popupDetected: true,
          popupAction: "clicked",
          clickedText: label,
        };
      }
    } catch {
      /* try next label */
    }

    try {
      const textTarget = page.getByText(label, { exact: false }).first();
      if (await textTarget.isVisible({ timeout: 800 })) {
        await textTarget.click({ timeout: 3000 });
        await sleep(1000);
        console.warn(`[teescanner] popup dismissed via text: ${label}`);
        return {
          popupDetected: true,
          popupAction: "clicked",
          clickedText: label,
        };
      }
    } catch {
      /* try next label */
    }
  }

  const closeSelectors = [
    'button:has-text("×")',
    'button:has-text("X")',
    '[aria-label="닫기"]',
    '[aria-label="Close"]',
    '[aria-label="close"]',
  ];

  for (const selector of closeSelectors) {
    try {
      const closeButton = page.locator(selector).first();
      if (await closeButton.isVisible({ timeout: 500 })) {
        await closeButton.click({ timeout: 2000 });
        await sleep(1000);
        console.warn(`[teescanner] popup dismissed via close control: ${selector}`);
        return {
          popupDetected: true,
          popupAction: "clicked",
          clickedText: "×",
        };
      }
    } catch {
      console.warn(`[teescanner] popup close attempt failed: ${selector}`);
    }
  }

  return {
    popupDetected: false,
    popupAction: "not_found",
    clickedText: "",
  };
}

export async function saveAccessCheckDebug(
  page: Page,
  screenshotDir: string = DEFAULT_SCREENSHOT_DIR,
): Promise<{
  screenshotPath: string;
  pageTextSample: string;
  pageUrl: string;
}> {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "_");
  const screenshotPath = path.join(
    screenshotDir,
    `access-check-${timestamp}.png`,
  );
  await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => undefined);

  const pageText = await collectVisibleTeescannerText(page);
  return {
    screenshotPath,
    pageTextSample: pageText.slice(0, 1500),
    pageUrl: page.url(),
  };
}

export async function prepareTeescannerHomePage(
  page: Page,
  roundDay: string,
  waitMs: number,
): Promise<{
  blocked: { reason: string; matchedText: string } | null;
  popup: DismissPopupResult;
}> {
  await page.goto(buildHomeUrl(roundDay), {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await sleep(waitMs);

  let visibleText = await collectVisibleTeescannerText(page);
  let block = detectTeescannerBlock(visibleText);
  if (block) {
    return {
      blocked: { reason: block.reason, matchedText: block.matchedText },
      popup: {
        popupDetected: false,
        popupAction: "skipped_blocked",
        clickedText: "",
      },
    };
  }

  const popup = await dismissTeescannerPopups(page);

  visibleText = await collectVisibleTeescannerText(page);
  block = detectTeescannerBlock(visibleText);
  if (block) {
    return {
      blocked: { reason: block.reason, matchedText: block.matchedText },
      popup,
    };
  }

  return { blocked: null, popup };
}

export async function runTeescannerAccessCheck(options: {
  roundDay: string;
  headless: boolean;
  waitMs: number;
  screenshotDir?: string;
}): Promise<TeescannerAccessCheckResult> {
  let browser: Browser | null = null;
  const screenshotDir = options.screenshotDir ?? DEFAULT_SCREENSHOT_DIR;

  try {
    browser = await createTeescannerBrowser(options.headless);
    const page = await browser.newPage();

    const prepared = await prepareTeescannerHomePage(
      page,
      options.roundDay,
      options.waitMs,
    );

    if (prepared.blocked) {
      const debug = await saveAccessCheckDebug(page, screenshotDir);
      return {
        status: "blocked",
        reason: prepared.blocked.reason,
        matchedText: prepared.blocked.matchedText,
        searchInputFound: false,
        popupDetected: prepared.popup.popupDetected,
        popupAction: prepared.popup.popupAction,
        clickedText: prepared.popup.clickedText,
        screenshotPath: debug.screenshotPath,
        pageUrl: debug.pageUrl,
        pageTextSample: debug.pageTextSample,
      };
    }

    const searchInputFound = await verifyTeescannerSearchUi(
      page,
      options.roundDay,
      options.waitMs,
    );
    if (!searchInputFound) {
      const debug = await saveAccessCheckDebug(page, screenshotDir);
      return {
        status: "error",
        reason: "search_input_not_found",
        message: "Search input not found on TeeScanner home page.",
        searchInputFound: false,
        popupDetected: prepared.popup.popupDetected,
        popupAction: prepared.popup.popupAction,
        clickedText: prepared.popup.clickedText,
        screenshotPath: debug.screenshotPath,
        pageUrl: debug.pageUrl,
        pageTextSample: debug.pageTextSample,
      };
    }

    return {
      status: "ok",
      reason: "home_accessible",
      searchInputFound: true,
      popupDetected: prepared.popup.popupDetected,
      popupAction: prepared.popup.popupAction,
      clickedText: prepared.popup.clickedText,
      pageUrl: page.url(),
    };
  } catch (error) {
    return {
      status: "error",
      reason: "network_or_browser_error",
      message: error instanceof Error ? error.message : String(error),
      searchInputFound: false,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
  }
}
