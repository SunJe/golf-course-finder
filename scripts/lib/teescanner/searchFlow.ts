import { collectSearchCandidatesWithLocators } from "./candidateCollect";
import type { Locator, Page } from "playwright";
import { StepScreenshotTracker } from "./debug";
import type { TeescannerErrorReason, TeescannerSearchCandidate } from "./types";
import {
  buildHomeUrl,
  collectVisibleTeescannerText,
  detectTeescannerBlock,
  dismissTeescannerPopups,
  sleep,
} from "./access";

const UI_WAIT_MS = 1000;
const AFTER_TYPE_MS = 1500;
const AFTER_ENTER_MS = 2000;

const EDITABLE_INPUT_SELECTORS = [
  'input[placeholder*="골프장명 또는 지역명 검색"]:not([readonly])',
  'input[placeholder*="골프장명"]:not([readonly])',
  'input[placeholder*="지역명 검색"]:not([readonly])',
  'input[type="search"]:not([readonly])',
  'input[type="text"]:not([readonly])',
] as const;

const HOME_SEARCH_TRIGGER_TEXTS = [
  "티스캐너 제휴 골프장 검색",
  "제휴 골프장 검색",
] as const;

const RECOMMENDATION_NOISE =
  /MD\s*추천|메가딜|쿠폰\s*증정|\d+\s*팀|가까운\s*골프장|국내\/해외\s*투어|달력|새벽|오전|오후|야간/i;

async function collectSearchCandidates(
  page: Page,
  query: string,
): Promise<{ candidates: TeescannerSearchCandidate[]; rawTextSample: string }> {
  try {
    const result = await collectSearchCandidatesWithLocators(page, query);
    const filtered = result.candidates.filter(
      (candidate) => !RECOMMENDATION_NOISE.test(candidate.title),
    );
    return {
      candidates: filtered,
      rawTextSample: result.rawTextSample,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/__name|page\.evaluate|evaluate:/i.test(message)) {
      throw Object.assign(new Error(message), {
        teescannerErrorReason: "browser_context_evaluate_error" as const,
      });
    }
    throw error;
  }
}

export interface SearchFlowResult {
  ok: boolean;
  errorReason?: TeescannerErrorReason;
  candidates: TeescannerSearchCandidate[];
  candidateRawTextSample: string;
  pageTextSample: string;
  pageUrl: string;
  searchState: string;
}

export interface SearchFlowContext {
  page: Page;
  query: string;
  roundDay: string;
  shots: StepScreenshotTracker;
  waitMs: number;
}

async function isEditableSearchInput(locator: Locator): Promise<boolean> {
  try {
    if (!(await locator.isVisible())) return false;
    if (!(await locator.isEnabled())) return false;
    if (!(await locator.isEditable())) return false;
    const readonly = await locator.getAttribute("readonly");
    if (readonly !== null && readonly !== "false") return false;
    const placeholder = (await locator.getAttribute("placeholder")) ?? "";
    const name = (await locator.getAttribute("name")) ?? "";
    if (/password|비밀번호|아이디|email/i.test(`${placeholder} ${name}`)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function findEditableKeywordInput(page: Page): Promise<Locator | null> {
  for (const selector of EDITABLE_INPUT_SELECTORS) {
    const locator = page.locator(selector).first();
    if (await isEditableSearchInput(locator)) return locator;
  }

  for (const pattern of [
    /골프장명 또는 지역명 검색/,
    /골프장명/,
    /지역명 검색/,
  ]) {
    const locator = page.getByPlaceholder(pattern).first();
    if (await isEditableSearchInput(locator)) return locator;
  }

  const inputs = page.locator("input");
  const count = await inputs.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = inputs.nth(index);
    if (await isEditableSearchInput(candidate)) {
      const placeholder = (await candidate.getAttribute("placeholder")) ?? "";
      if (/골프|지역|검색/i.test(placeholder)) return candidate;
    }
  }

  return null;
}

async function findReadonlySearchTrigger(page: Page): Promise<Locator | null> {
  const byPlaceholder = page
    .getByPlaceholder(/골프장 또는 지역으로 검색하기/)
    .first();
  try {
    if (await byPlaceholder.isVisible({ timeout: 500 })) return byPlaceholder;
  } catch {
    /* try next */
  }

  const byName = page.locator('input[name="search_name"][readonly]').first();
  try {
    if (await byName.isVisible({ timeout: 500 })) return byName;
  } catch {
    /* not found */
  }

  return null;
}

async function waitForSearchBookingScreen(page: Page): Promise<void> {
  await Promise.race([
    page.waitForURL(/\/search\/booking/, { timeout: 5000 }).catch(() => null),
    page
      .getByText(/상세검색|골프장 검색/)
      .first()
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => null),
    page
      .getByPlaceholder(/골프장 또는 지역으로 검색하기/)
      .first()
      .waitFor({ state: "visible", timeout: 5000 })
      .catch(() => null),
  ]);
  await sleep(UI_WAIT_MS);
}

async function clickHomeSearchTrigger(page: Page): Promise<boolean> {
  for (const text of HOME_SEARCH_TRIGGER_TEXTS) {
    try {
      const trigger = page.getByText(text, { exact: false }).first();
      if (await trigger.isVisible({ timeout: 1000 })) {
        await trigger.click({ timeout: 5000 });
        return true;
      }
    } catch {
      /* try next */
    }
  }

  try {
    const placeholderTrigger = page
      .getByPlaceholder(/제휴 골프장 검색|골프장 검색/)
      .first();
    if (await placeholderTrigger.isVisible({ timeout: 1000 })) {
      await placeholderTrigger.click({ timeout: 5000 });
      return true;
    }
  } catch {
    /* not found */
  }

  return false;
}

function failResult(
  ctx: SearchFlowContext,
  errorReason: TeescannerErrorReason,
  searchState: string,
  partial: Partial<SearchFlowResult> = {},
): SearchFlowResult {
  return {
    ok: false,
    errorReason,
    candidates: [],
    candidateRawTextSample: "",
    pageTextSample: partial.pageTextSample ?? "",
    pageUrl: ctx.page.url(),
    searchState,
    ...partial,
  };
}

export async function runTeescannerSearchFlow(
  ctx: SearchFlowContext,
): Promise<SearchFlowResult> {
  const { page, query, roundDay, shots, waitMs } = ctx;

  try {
    await page.goto(buildHomeUrl(roundDay), {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
  } catch {
    return failResult(ctx, "navigation_timeout", "home_goto_failed");
  }

  await sleep(waitMs);
  await shots.capture("home_loaded");

  const initialText = await collectVisibleTeescannerText(page);
  if (detectTeescannerBlock(initialText)) {
    return failResult(ctx, "blocked_detected", "home_blocked", {
      pageTextSample: initialText.slice(0, 1500),
    });
  }

  const popup = await dismissTeescannerPopups(page);
  if (popup.popupDetected) {
    await shots.capture("popup_dismissed");
  }

  const postPopupText = await collectVisibleTeescannerText(page);
  if (detectTeescannerBlock(postPopupText)) {
    return failResult(ctx, "blocked_detected", "post_popup_blocked", {
      pageTextSample: postPopupText.slice(0, 1500),
    });
  }

  let editable = await findEditableKeywordInput(page);
  if (editable) {
    await shots.capture("editable_keyword_input_found");
  } else {
    const homeClicked = await clickHomeSearchTrigger(page);
    if (!homeClicked) {
      return failResult(ctx, "search_input_not_found", "home_search_trigger_missing", {
        pageTextSample: postPopupText.slice(0, 1500),
      });
    }
    await shots.capture("home_search_trigger_clicked");

    await waitForSearchBookingScreen(page);
    await shots.capture("search_booking_loaded");

    const readonlyTrigger = await findReadonlySearchTrigger(page);
    if (!readonlyTrigger) {
      editable = await findEditableKeywordInput(page);
      if (!editable) {
        return failResult(ctx, "search_input_not_found", "readonly_trigger_missing", {
          pageTextSample: (await collectVisibleTeescannerText(page)).slice(0, 1500),
        });
      }
    } else {
      await readonlyTrigger.click({ timeout: 5000 });
      await sleep(UI_WAIT_MS);
      await shots.capture("readonly_search_trigger_clicked");

      editable = await findEditableKeywordInput(page);
      if (!editable) {
        return failResult(ctx, "keyword_overlay_not_opened", "overlay_not_opened", {
          pageTextSample: (await collectVisibleTeescannerText(page)).slice(0, 1500),
        });
      }
      await shots.capture("keyword_overlay_opened");
    }
  }

  if (!editable) {
    return failResult(ctx, "editable_search_input_not_found", "editable_missing", {
      pageTextSample: (await collectVisibleTeescannerText(page)).slice(0, 1500),
    });
  }

  await shots.capture("editable_keyword_input_found");

  await editable.click({ timeout: 5000 });
  await sleep(300);
  await editable.fill("");
  await sleep(200);
  await editable.fill(query);
  await sleep(AFTER_TYPE_MS);
  await shots.capture("query_typed");

  await editable.press("Enter").catch(() => undefined);
  await sleep(AFTER_ENTER_MS);
  await shots.capture("after_query_wait");

  const postTypeText = await collectVisibleTeescannerText(page);
  if (detectTeescannerBlock(postTypeText)) {
    return failResult(ctx, "blocked_detected", "post_query_blocked", {
      pageTextSample: postTypeText.slice(0, 1500),
    });
  }

  let collection;
  try {
    collection = await collectSearchCandidates(page, query);
  } catch (error) {
    const reason =
      typeof error === "object" &&
      error !== null &&
      "teescannerErrorReason" in error
        ? (error as { teescannerErrorReason: TeescannerErrorReason })
            .teescannerErrorReason
        : "unknown_error";
    await shots.capture("failed");
    return failResult(ctx, reason, "candidate_collection_error", {
      pageTextSample: postTypeText.slice(0, 1500),
    });
  }
  await shots.capture("candidates_collected");

  return {
    ok: true,
    candidates: collection.candidates,
    candidateRawTextSample: collection.rawTextSample,
    pageTextSample: postTypeText.slice(0, 1500),
    pageUrl: page.url(),
    searchState: "candidates_collected",
  };
}

export async function verifyTeescannerSearchUi(
  page: Page,
  roundDay: string,
  waitMs: number,
): Promise<boolean> {
  await page.goto(buildHomeUrl(roundDay), {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  await sleep(waitMs);
  await dismissTeescannerPopups(page);

  if (await findEditableKeywordInput(page)) return true;

  if (!(await clickHomeSearchTrigger(page))) return false;
  await waitForSearchBookingScreen(page);

  if (await findEditableKeywordInput(page)) return true;
  if (await findReadonlySearchTrigger(page)) return true;

  return false;
}
