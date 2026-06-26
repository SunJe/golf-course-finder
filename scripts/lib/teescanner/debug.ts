import path from "node:path";
import fs from "node:fs";
import type { Page } from "playwright";
import type { TeescannerPriceResult, TeescannerRunLogEntry, TeescannerScrapeOutcome } from "./types";
import {
  DEFAULT_RESULTS_CSV,
  DEFAULT_RUNLOG_PATH,
  DEFAULT_SCREENSHOT_DIR,
} from "./io";

export type ScreenshotStep =
  | "home_loaded"
  | "popup_dismissed"
  | "home_search_trigger_clicked"
  | "search_booking_loaded"
  | "readonly_search_trigger_clicked"
  | "keyword_overlay_opened"
  | "editable_keyword_input_found"
  | "query_typed"
  | "after_query_wait"
  | "search_input_found"
  | "after_search_query"
  | "candidates_collected"
  | "candidate_title_clicked"
  | "course_detail_loaded"
  | "teetime_tab_checked"
  | "round_day_selected"
  | "slot_cards_scrolled_into_view"
  | "candidate_select_clicked"
  | "candidate_selected"
  | "search_button_clicked"
  | "results_loaded"
  | "matched_candidate_opened"
  | "price_area_checked"
  | "failed";

export function makeScreenshotTimestamp(): string {
  const d = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

export async function saveStepScreenshot(
  page: Page,
  courseId: string,
  screenshotDir: string,
  step: ScreenshotStep | string,
  sessionTimestamp: string,
): Promise<string> {
  fs.mkdirSync(screenshotDir, { recursive: true });
  const filePath = path.join(
    screenshotDir,
    `${courseId}-${sessionTimestamp}-${step}.png`,
  );
  await page.screenshot({ path: filePath, fullPage: false }).catch(() => undefined);
  return filePath;
}

export class StepScreenshotTracker {
  readonly sessionTimestamp = makeScreenshotTimestamp();
  readonly steps: Record<string, string> = {};

  constructor(
    private readonly page: Page,
    private readonly courseId: string,
    private readonly screenshotDir: string,
    private readonly enabled = true,
  ) {}

  async capture(step: ScreenshotStep | string): Promise<string> {
    if (!this.enabled) return "";
    const filePath = await saveStepScreenshot(
      this.page,
      this.courseId,
      this.screenshotDir,
      step,
      this.sessionTimestamp,
    );
    this.steps[step] = filePath;
    return filePath;
  }

  async captureBlockOnly(): Promise<string> {
    const filePath = await saveStepScreenshot(
      this.page,
      this.courseId,
      this.screenshotDir,
      "blocked",
      this.sessionTimestamp,
    );
    this.steps.blocked = filePath;
    return filePath;
  }

  latestPath(): string {
    const values = Object.values(this.steps);
    return values[values.length - 1] ?? "";
  }
}

export function printWindowsRunHints(): void {
  console.log("");
  console.log("Windows CMD: do not use backslash (\\) line continuation.");
  console.log(
    "Run as one line: npm run collect:teescanner-price -- --round-day 2026-06-27 --target-name 비에이비스타 --limit 1 --gap-ms 180000 --jitter-ms 60000 --max-retries 0 --headful true",
  );
  console.log(
    "PowerShell multi-line: use backtick (`) at end of each line.",
  );
  console.log("");
}

export function printOutputPaths(
  resultsCsv = DEFAULT_RESULTS_CSV,
  runlogPath = DEFAULT_RUNLOG_PATH,
  screenshotDir = DEFAULT_SCREENSHOT_DIR,
): void {
  console.log("Check:");
  console.log(resultsCsv);
  console.log(runlogPath);
  console.log(`${screenshotDir}/`);
}

export function printCollectResult(outcome: TeescannerScrapeOutcome): void {
  const { result } = outcome;
  const d = outcome.diagnostics;

  console.log(`  status: ${result.status}`);
  if (result.error_reason) {
    console.log(`  reason: ${result.error_reason}`);
  }
  if (result.matched_title) {
    console.log(`  matched_title: ${result.matched_title}`);
  }
  if (result.matched_region) {
    console.log(`  matched_region: ${result.matched_region}`);
  }
  if (result.selected_round_day) {
    console.log(`  selected_round_day: ${result.selected_round_day}`);
  }
  if (result.date_tab_cards_snapshot) {
    console.log("  date_tab_cards:");
    for (const line of result.date_tab_cards_snapshot.split("\n")) {
      if (line.trim()) console.log(`    ${line.trim()}`);
    }
  }
  if (result.selected_date_tab_raw_text) {
    console.log(
      `  selected_date_tab_raw_text: ${result.selected_date_tab_raw_text.replace(/\n/g, " / ")}`,
    );
  }
  if (result.date_tab_match_confidence) {
    console.log(
      `  date_tab_match_confidence: ${result.date_tab_match_confidence}`,
    );
    if (result.date_tab_match_confidence === "none") {
      console.warn("  warning: selected date team count not found");
    }
  }
  if (result.url_round_day) {
    console.log(`  url_round_day: ${result.url_round_day}`);
  }
  if (result.date_mismatch) {
    console.log(`  date_mismatch: ${result.date_mismatch === "y"}`);
    if (result.date_mismatch === "y") {
      console.warn(
        `  warning: selected_round_day (${result.selected_round_day}) != url_round_day (${result.url_round_day})`,
      );
    }
  }
  if (result.slot_card_count) {
    console.log(`  loaded_slot_card_count: ${result.slot_card_count}`);
  }
  if (result.visible_slot_card_count) {
    console.log(`  visible_slot_card_count: ${result.visible_slot_card_count}`);
  }
  if (result.available_team_count_from_date_tab) {
    console.log(
      `  available_team_count_from_date_tab: ${result.available_team_count_from_date_tab}`,
    );
  } else if (result.date_tab_match_confidence === "none") {
    console.log("  available_team_count_from_date_tab: (empty)");
  }
  if (result.slot_scroll_steps) {
    console.log(`  slot_scroll_steps: ${result.slot_scroll_steps}`);
  }
  if (result.slot_load_complete) {
    console.log(`  slot_load_complete: ${result.slot_load_complete === "y"}`);
  }
  if (result.slot_count_before_scroll) {
    console.log(
      `  slot_count_before_scroll: ${result.slot_count_before_scroll}`,
    );
  }
  if (result.slot_count_after_scroll) {
    console.log(`  slot_count_after_scroll: ${result.slot_count_after_scroll}`);
  }
  if (result.slot_count_stable_reason) {
    console.log(`  slot_count_stable_reason: ${result.slot_count_stable_reason}`);
  }
  if (result.price_scope) {
    console.log(`  price_scope: ${result.price_scope}`);
    if (result.price_scope === "partial_day_slots") {
      console.warn("  warning: only partial slot cards were loaded");
    }
  }
  if (result.sale_price_candidates) {
    console.log(`  sale_price_candidates: ${result.sale_price_candidates}`);
  }
  if (result.original_price_candidates) {
    console.log(
      `  original_price_candidates: ${result.original_price_candidates}`,
    );
    console.warn(
      "  warning: original prices were excluded from price_min/price_max",
    );
  }
  if (result.slot_price_mode) {
    console.log(`  slot_price_mode: ${result.slot_price_mode}`);
  }
  if (result.price_source) {
    console.log(`  price_source: ${result.price_source}`);
  }
  if (result.price_min) {
    console.log(`  price: ${result.price_min}~${result.price_max}`);
  } else {
    console.log("  price: empty");
  }
  if (result.review_action) {
    console.log(`  review_action: ${result.review_action}`);
  }
  if (result.confidence) {
    console.log(`  confidence: ${result.confidence}`);
  }
  if (result.candidate_count) {
    console.log(`  candidate_count: ${result.candidate_count}`);
  }
  if (result.search_query) {
    console.log(`  search_query: ${result.search_query}`);
  }
  if (result.detail_url) {
    console.log(`  detail_url: ${result.detail_url}`);
  }
  if (result.screenshot_path) {
    console.log(`  screenshot: ${result.screenshot_path}`);
  }
  if (d?.screenshotSteps) {
    const steps = Object.keys(d.screenshotSteps).join(", ");
    if (steps) console.log(`  screenshot_steps: ${steps}`);
  }
}

export function resultToRunLog(
  outcome: TeescannerScrapeOutcome,
  rowId: string,
  courseName: string,
): TeescannerRunLogEntry {
  const d = outcome.diagnostics;
  return {
    timestamp: new Date().toISOString(),
    rowId,
    courseName,
    step: "collect",
    status: outcome.result.status,
    blockDetected: outcome.blocked,
    screenshotPath: outcome.result.screenshot_path,
    errorMessage: outcome.result.error_reason,
    searchQuery: outcome.result.search_query,
    candidateCount: d?.candidateCount ?? Number(outcome.result.candidate_count || 0),
    candidateTitles: d?.candidateTitles ?? [],
    candidateRegions: d?.candidateRegions ?? [],
    candidateRawTextSample: d?.candidateRawTextSample ?? "",
    selectedCandidate: d?.selectedCandidate ?? outcome.result.matched_title,
    matchScore: d?.matchScore ?? outcome.result.match_score,
    confidence: d?.confidence ?? outcome.result.confidence,
    priceTextCandidates: d?.priceTextCandidates ?? [],
    filterPriceCandidates: d?.filterPriceCandidates ?? [],
    priceSource: d?.priceSource,
    screenshotSteps: d?.screenshotSteps ?? {},
    pageUrl: d?.pageUrl ?? outcome.result.matched_url,
    pageTextSample: d?.pageTextSample ?? "",
    candidateClickTarget: d?.candidateClickTarget,
    candidateClickSucceeded: d?.candidateClickSucceeded,
    candidateSelected: d?.candidateSelected,
    searchButtonFound: d?.searchButtonFound,
    searchButtonClicked: d?.searchButtonClicked,
    resultPageTextSample: d?.resultPageTextSample,
    detailUrl: d?.detailUrl ?? outcome.result.detail_url,
    selectedRoundDay: d?.selectedRoundDay ?? outcome.result.selected_round_day,
    urlRoundDay: d?.urlRoundDay ?? outcome.result.url_round_day,
    dateMismatch:
      d?.dateMismatch ?? outcome.result.date_mismatch === "y",
    slotCardCount: d?.slotCardCount ?? Number(outcome.result.slot_card_count || 0),
    visibleSlotCardCount:
      d?.visibleSlotCardCount ??
      Number(outcome.result.visible_slot_card_count || 0),
    loadedSlotCardCount:
      d?.loadedSlotCardCount ?? Number(outcome.result.slot_card_count || 0),
    availableTeamCountFromDateTab:
      d?.availableTeamCountFromDateTab ??
      (outcome.result.available_team_count_from_date_tab
        ? Number(outcome.result.available_team_count_from_date_tab)
        : null),
    slotLoadComplete:
      d?.slotLoadComplete ?? outcome.result.slot_load_complete === "y",
    slotScrollSteps:
      d?.slotScrollSteps ??
      Number(outcome.result.slot_scroll_steps || 0),
    slotCountBeforeScroll:
      d?.slotCountBeforeScroll ??
      Number(outcome.result.slot_count_before_scroll || 0),
    slotCountAfterScroll:
      d?.slotCountAfterScroll ??
      Number(outcome.result.slot_count_after_scroll || 0),
    slotCountStableReason:
      d?.slotCountStableReason ?? outcome.result.slot_count_stable_reason,
    priceScope: d?.priceScope ?? outcome.result.price_scope,
    dateTabMatchConfidence:
      d?.dateTabMatchConfidence ?? outcome.result.date_tab_match_confidence,
    dateTabCardsSnapshot:
      d?.dateTabCardsSnapshot ?? outcome.result.date_tab_cards_snapshot,
    selectedDateTabRawText:
      d?.selectedDateTabRawText ?? outcome.result.selected_date_tab_raw_text,
    slotTimes:
      d?.slotTimes ??
      (outcome.result.slot_times ? outcome.result.slot_times.split(" | ") : []),
    slotCardRawTexts: d?.slotCardRawTexts,
    slotCards: d?.slotCards,
    slotPriceTextsUnique:
      d?.slotPriceTextsUnique ??
      (outcome.result.slot_price_texts
        ? outcome.result.slot_price_texts.split(" | ")
        : []),
    salePriceCandidates:
      d?.salePriceCandidates ??
      (outcome.result.sale_price_candidates
        ? outcome.result.sale_price_candidates.split(" | ")
        : []),
    originalPriceCandidates:
      d?.originalPriceCandidates ??
      (outcome.result.original_price_candidates
        ? outcome.result.original_price_candidates.split(" | ")
        : []),
    slotPriceMode: d?.slotPriceMode ?? outcome.result.slot_price_mode,
    excludedOriginalFromMinMax: d?.excludedOriginalFromMinMax,
    reviewAction: d?.reviewAction ?? outcome.result.review_action,
  };
}
