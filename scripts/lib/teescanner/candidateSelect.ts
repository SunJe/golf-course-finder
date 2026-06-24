import type { Locator, Page } from "playwright";
import type { StepScreenshotTracker } from "./debug";
import type { TeescannerErrorReason, TeescannerSearchCandidate } from "./types";
import { sleep } from "./access";

export type CandidateClickTarget =
  | "button"
  | "title"
  | "bounding_box"
  | "url_navigate";

export interface CandidateSelectResult {
  ok: boolean;
  candidateClickTarget?: CandidateClickTarget;
  candidateClickSucceeded: boolean;
  candidateSelected: boolean;
  searchButtonFound: boolean;
  searchButtonClicked: boolean;
  errorReason?: TeescannerErrorReason;
  resultPageTextSample?: string;
}

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

async function waitForSpinnerGone(page: Page, maxMs = 8000): Promise<void> {
  const start = Date.now();
  const spinnerSelectors = [
    '[class*="loading"]',
    '[class*="spinner"]',
    '[class*="Loading"]',
    '[class*="Spinner"]',
    '[aria-busy="true"]',
  ];

  while (Date.now() - start < maxMs) {
    let visible = false;
    for (const selector of spinnerSelectors) {
      const locator = page.locator(selector).first();
      if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) {
        visible = true;
        break;
      }
    }
    if (!visible) return;
    await sleep(500);
  }
}

async function verifyCandidateSelected(
  page: Page,
  candidate: TeescannerSearchCandidate,
): Promise<boolean> {
  const bodyText = await page.locator("body").innerText();
  const titleNeedle = candidate.title.trim();
  if (titleNeedle && bodyText.includes(titleNeedle)) return true;
  if (candidate.region && bodyText.includes(candidate.region)) return true;
  return /검색|골프장\s*선택|상세검색/i.test(bodyText);
}

async function clickBottomSearchButton(page: Page): Promise<{
  found: boolean;
  clicked: boolean;
}> {
  const roleButtons = page.getByRole("button", { name: /^검색$/ });
  const roleCount = await roleButtons.count();
  if (roleCount > 0) {
    for (let index = roleCount - 1; index >= 0; index -= 1) {
      const button = roleButtons.nth(index);
      if (await stableClick(button)) {
        return { found: true, clicked: true };
      }
    }
    return { found: true, clicked: false };
  }

  const textButtons = page.getByText("검색", { exact: true });
  const textCount = await textButtons.count();
  if (textCount > 0) {
    for (let index = textCount - 1; index >= 0; index -= 1) {
      const button = textButtons.nth(index);
      if (await stableClick(button)) {
        return { found: true, clicked: true };
      }
    }
    return { found: true, clicked: false };
  }

  return { found: false, clicked: false };
}

export async function selectCandidateAndSearch(
  page: Page,
  candidate: TeescannerSearchCandidate,
  shots: StepScreenshotTracker,
): Promise<CandidateSelectResult> {
  const result: CandidateSelectResult = {
    ok: false,
    candidateClickSucceeded: false,
    candidateSelected: false,
    searchButtonFound: false,
    searchButtonClicked: false,
  };

  if (candidate.url) {
    await page.goto(candidate.url, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    result.candidateClickTarget = "url_navigate";
    result.candidateClickSucceeded = true;
    result.candidateSelected = true;
    await shots.capture("candidate_select_clicked");
    await shots.capture("candidate_selected");
  } else {
    const index = candidate.candidateIndex ?? 0;
    const selectTargets = [
      page.getByRole("button", { name: /골프장 선택/ }).nth(index),
      page.getByText("골프장 선택", { exact: true }).nth(index),
    ];

    let clicked = false;
    for (const target of selectTargets) {
      if (await stableClick(target)) {
        result.candidateClickTarget = "button";
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      const titleLocator = page
        .getByText(candidate.title, { exact: false })
        .first();
      if (await stableClick(titleLocator)) {
        result.candidateClickTarget = "title";
        clicked = true;
      }
    }

    if (!clicked) {
      const titleLocator = page
        .getByText(candidate.title, { exact: false })
        .first();
      if (await clickBoundingBoxCenter(page, titleLocator)) {
        result.candidateClickTarget = "bounding_box";
        clicked = true;
      }
    }

    if (!clicked) {
      result.errorReason = "matched_candidate_click_failed";
      await shots.capture("failed");
      return result;
    }

    result.candidateClickSucceeded = true;
    await shots.capture("candidate_select_clicked");
    await sleep(1000);
    result.candidateSelected = await verifyCandidateSelected(page, candidate);
    await shots.capture("candidate_selected");

    if (!result.candidateSelected) {
      result.errorReason = "matched_candidate_click_failed";
      return result;
    }
  }

  const searchButton = await clickBottomSearchButton(page);
  result.searchButtonFound = searchButton.found;
  result.searchButtonClicked = searchButton.clicked;

  if (!searchButton.clicked) {
    result.errorReason = "search_button_click_failed";
    await shots.capture("failed");
    return result;
  }

  await shots.capture("search_button_clicked");
  await sleep(5000);
  await waitForSpinnerGone(page, 8000);
  await shots.capture("results_loaded");

  result.resultPageTextSample = (
    await page.locator("body").innerText()
  ).slice(0, 1500);
  result.ok = true;
  return result;
}

export function detectNoAvailableSlots(pageText: string): boolean {
  if (/(\d{1,3}(?:,\d{3})+|\d{4,})\s*원/i.test(pageText)) {
    return false;
  }
  if (/티타임|예약\s*가능/i.test(pageText)) {
    return false;
  }
  return /예약\s*가능한\s*티타임이\s*없|티타임이\s*없|마감|품절|0\s*건|결과가\s*없|예약\s*가능한\s*시간이\s*없/i.test(
    pageText,
  );
}
