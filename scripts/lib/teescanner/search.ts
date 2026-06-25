import type { Page } from "playwright";
import { StepScreenshotTracker } from "./debug";
import {
  detectDetailNoAvailableSlots,
  openCourseDetailAndCollectSlots,
} from "./courseDetailFlow";
import { matchTeescannerCandidates } from "./matcher";
import {
  formatWonForCsv,
} from "./priceParse";
import { resolveReviewAction } from "./reviewAction";
import { runTeescannerSearchFlow } from "./searchFlow";
import type {
  TeescannerErrorReason,
  TeescannerInputRow,
  TeescannerPriceResult,
  TeescannerScrapeDiagnostics,
  TeescannerScrapeOutcome,
  TeescannerSearchCandidate,
} from "./types";
import {
  buildHomeUrl,
  collectVisibleTeescannerText,
  detectTeescannerBlock,
  sleep,
} from "./access";

const PAGE_SETTLE_MS = 5000;

import { buildTeescannerSearchQueries } from "./courseEnrichment";

export { buildTeescannerSearchQueries };
function emptyResult(
  course: TeescannerInputRow,
  roundDay: string,
  searchQuery: string,
  partial: Partial<TeescannerPriceResult> = {},
): TeescannerPriceResult {
  return {
    id: course.id,
    name: course.name,
    change_name_to: course.change_name_to,
    address: course.address,
    source_row_index: String(course.row_index ?? ""),
    primary_search_term: course.primary_search_term,
    fallback_search_term: course.fallback_search_term,
    used_search_term: searchQuery,
    search_attempt: "",
    search_query: searchQuery,
    round_day: roundDay,
    matched_title: "",
    candidate_title: "",
    candidate_region: "",
    candidate_subregion: "",
    candidate_type: "",
    matched_region: "",
    match_status: "",
    review_reason: "",
    suggested_change_name_to: "",
    matched_url: "",
    candidate_count: "0",
    match_score: "",
    confidence: "",
    teescanner_found: "n",
    reservation_found: "n",
    slot_count: "0",
    price_text: "",
    price_min: "",
    price_max: "",
    price_unit: "won",
    price_source: "none",
    detail_url: "",
    golfclub_seq: "",
    detail_url_template: "",
    per_date_detail_reload: "",
    selected_round_day: "",
    url_round_day: "",
    date_mismatch: "n",
    slot_card_count: "0",
    visible_slot_card_count: "0",
    available_team_count_from_date_tab: "",
    slot_load_complete: "",
    slot_scroll_steps: "",
    slot_count_before_scroll: "",
    slot_count_after_scroll: "",
    slot_count_stable_reason: "",
    price_scope: "",
    date_tab_match_confidence: "",
    date_tab_cards_snapshot: "",
    selected_date_tab_raw_text: "",
    slot_times: "",
    slot_price_texts: "",
    sale_price_candidates: "",
    original_price_candidates: "",
    slot_price_mode: "uncertain",
    review_action: "manual_review",
    source_name: "teescanner",
    source_url: "",
    status: "failed",
    needs_check: "y",
    error_reason: "",
    collected_at: new Date().toISOString(),
    screenshot_path: "",
    ...partial,
  };
}

function buildDiagnostics(
  partial: Partial<TeescannerScrapeDiagnostics>,
): TeescannerScrapeDiagnostics {
  return { ...partial };
}

function classifyEmptyCandidates(
  query: string,
  pageText: string,
  searchReached: boolean,
): TeescannerErrorReason {
  if (!searchReached) return "candidate_collection_failed";

  if (/0\s*건|결과가\s*없|검색된\s*골프장이\s*없|일치하는\s*골프장이\s*없/i.test(pageText)) {
    return "no_search_candidates";
  }

  const hasSearchUi = /검색\s*결과|자동완성|연관\s*검색/i.test(pageText);
  const hasGolfContent = /골프|cc|gc|컨트리|퍼블릭/i.test(pageText);
  if (hasSearchUi && hasGolfContent) return "candidate_collection_failed";
  if (pageText.includes(query) && hasGolfContent) {
    return "candidate_collection_failed";
  }

  return "no_search_candidates";
}

function failOutcome(
  course: TeescannerInputRow,
  roundDay: string,
  searchQuery: string,
  errorReason: TeescannerErrorReason,
  shots: StepScreenshotTracker,
  diagnostics: Partial<TeescannerScrapeDiagnostics>,
  partial: Partial<TeescannerPriceResult> = {},
  blocked = false,
  blockReason?: string,
  blockDetectedText?: string,
): TeescannerScrapeOutcome {
  return {
    blocked,
    blockReason,
    blockDetectedText,
    diagnostics: buildDiagnostics({
      screenshotSteps: shots.steps,
      searchQuery,
      ...diagnostics,
    }),
    result: emptyResult(course, roundDay, searchQuery, {
      status: blocked ? "blocked" : partial.status ?? "failed",
      error_reason: blocked ? "blocked_detected" : errorReason,
      screenshot_path: shots.latestPath(),
      ...partial,
    }),
  };
}

export function createTeescannerEmptyResult(
  course: TeescannerInputRow,
  roundDay: string,
  searchQuery: string,
  partial: Partial<TeescannerPriceResult> = {},
): TeescannerPriceResult {
  return emptyResult(course, roundDay, searchQuery, partial);
}

export function createTeescannerFailOutcome(
  course: TeescannerInputRow,
  roundDay: string,
  searchQuery: string,
  errorReason: TeescannerErrorReason,
  shots: StepScreenshotTracker,
  diagnostics: Partial<TeescannerScrapeDiagnostics>,
  partial: Partial<TeescannerPriceResult> = {},
  blocked = false,
  blockReason?: string,
  blockDetectedText?: string,
): TeescannerScrapeOutcome {
  return failOutcome(
    course,
    roundDay,
    searchQuery,
    errorReason,
    shots,
    diagnostics,
    partial,
    blocked,
    blockReason,
    blockDetectedText,
  );
}

export async function scrapeTeescannerCourse(options: {
  page: Page;
  course: TeescannerInputRow;
  roundDay: string;
  screenshotDir: string;
}): Promise<TeescannerScrapeOutcome> {
  const { page, course, roundDay, screenshotDir } = options;
  const shots = new StepScreenshotTracker(page, course.id, screenshotDir);
  const queries = buildTeescannerSearchQueries(course);
  const primaryQuery = queries[0] ?? (course.change_name_to || course.name);

  let allCandidates: TeescannerSearchCandidate[] = [];
  let usedQuery = primaryQuery;
  let lastFlow:
    | Awaited<ReturnType<typeof runTeescannerSearchFlow>>
    | null = null;

  for (const query of queries) {
    usedQuery = query;
    const flow = await runTeescannerSearchFlow({
      page,
      query,
      roundDay,
      shots,
      waitMs: PAGE_SETTLE_MS,
    });
    lastFlow = flow;

    if (!flow.ok) {
      if (flow.errorReason === "blocked_detected") {
        await shots.capture("failed");
        return failOutcome(
          course,
          roundDay,
          usedQuery,
          "blocked_detected",
          shots,
          {
            candidateCount: 0,
            pageTextSample: flow.pageTextSample,
            pageUrl: flow.pageUrl,
          },
          { status: "blocked", needs_check: "y" },
          true,
          flow.searchState,
          flow.pageTextSample,
        );
      }

      const fatalInputErrors = new Set<TeescannerErrorReason>([
        "search_input_not_found",
        "editable_search_input_not_found",
        "keyword_overlay_not_opened",
        "navigation_timeout",
        "browser_context_evaluate_error",
      ]);
      if (fatalInputErrors.has(flow.errorReason!)) {
        await shots.capture("failed");
        return failOutcome(
          course,
          roundDay,
          usedQuery,
          flow.errorReason!,
          shots,
          {
            candidateCount: 0,
            pageTextSample: flow.pageTextSample,
            pageUrl: flow.pageUrl,
          },
        );
      }
      await sleep(2000);
      continue;
    }

    if (flow.candidates.length > 0) {
      allCandidates = flow.candidates;
      break;
    }
    await sleep(2000);
  }

  const candidateTitles = allCandidates.map((item) => item.title);
  const candidateRegions = allCandidates.map((item) => item.region);
  const baseDiagnostics: Partial<TeescannerScrapeDiagnostics> = {
    searchQuery: usedQuery,
    candidateCount: allCandidates.length,
    candidateTitles,
    candidateRegions,
    candidateRawTextSample: lastFlow?.candidateRawTextSample ?? "",
    screenshotSteps: shots.steps,
    pageUrl: lastFlow?.pageUrl ?? page.url(),
    pageTextSample: lastFlow?.pageTextSample ?? "",
  };

  if (allCandidates.length === 0) {
    await shots.capture("failed");
    const pageText = lastFlow?.pageTextSample ?? "";
    const searchReached = lastFlow?.ok === true;
    const emptyReason = classifyEmptyCandidates(usedQuery, pageText, searchReached);
    const status =
      emptyReason === "candidate_collection_failed" ? "failed" : "not_on_teescanner";

    return failOutcome(
      course,
      roundDay,
      usedQuery,
      emptyReason,
      shots,
      baseDiagnostics,
      {
        status,
        teescanner_found: "n",
        needs_check: emptyReason === "candidate_collection_failed" ? "y" : "n",
        candidate_count: "0",
      },
    );
  }

  const match = matchTeescannerCandidates(course, allCandidates);
  if (!match.candidate) {
    await shots.capture("failed");
    return failOutcome(
      course,
      roundDay,
      usedQuery,
      "ambiguous_match",
      shots,
      {
        ...baseDiagnostics,
        selectedCandidate: candidateTitles[0] ?? "",
        matchScore: String(match.matchScore),
        confidence: match.confidence,
      },
      {
        status: "ambiguous_match",
        teescanner_found: "y",
        candidate_count: String(match.candidateCount),
        match_score: String(match.matchScore),
        confidence: match.confidence,
        matched_title: candidateTitles[0] ?? "",
        matched_region: candidateRegions[0] ?? "",
        matched_url: "",
        needs_check: "y",
      },
    );
  }

  let detailResult: Awaited<ReturnType<typeof openCourseDetailAndCollectSlots>>;
  try {
    detailResult = await openCourseDetailAndCollectSlots({
      page,
      candidate: match.candidate,
      roundDay,
      shots,
    });
  } catch {
    await shots.capture("failed");
    return failOutcome(
      course,
      roundDay,
      usedQuery,
      "matched_candidate_click_failed",
      shots,
      {
        ...baseDiagnostics,
        selectedCandidate: match.candidate.title,
        matchScore: String(match.matchScore),
        confidence: match.confidence,
      },
      {
        teescanner_found: "y",
        candidate_count: String(match.candidateCount),
        match_score: String(match.matchScore),
        confidence: match.confidence,
        matched_title: match.candidate.title,
        matched_region: match.candidate.region,
        matched_url: match.candidate.url,
        needs_check: match.needsCheck ? "y" : "n",
      },
    );
  }

  const detailDiagnostics = {
    ...baseDiagnostics,
    selectedCandidate: match.candidate.title,
    matchScore: String(match.matchScore),
    confidence: match.confidence,
    candidateClickTarget: detailResult.candidateClickTarget,
    candidateClickSucceeded: detailResult.candidateClickSucceeded,
    candidateSelected: detailResult.detailLoaded,
    detailUrl: detailResult.detailUrl,
    selectedRoundDay: detailResult.selectedRoundDay,
    urlRoundDay: detailResult.urlRoundDay,
    dateMismatch: detailResult.dateMismatch,
    slotCardCount: detailResult.slotCardCount,
    visibleSlotCardCount: detailResult.visibleSlotCardCount,
    loadedSlotCardCount: detailResult.loadedSlotCardCount,
    availableTeamCountFromDateTab: detailResult.availableTeamCountFromDateTab,
    slotLoadComplete: detailResult.slotLoadComplete,
    slotScrollSteps: detailResult.slotScrollSteps,
    slotCountBeforeScroll: detailResult.slotCountBeforeScroll,
    slotCountAfterScroll: detailResult.slotCountAfterScroll,
    slotCountStableReason: detailResult.slotCountStableReason,
    priceScope: detailResult.priceScope,
    dateTabMatchConfidence: detailResult.dateTabMatchConfidence,
    dateTabCardsSnapshot: detailResult.dateTabCardsSnapshot,
    selectedDateTabRawText: detailResult.selectedDateTabRawText,
    slotTimes: detailResult.slotTimes,
    slotCards: detailResult.slotCards,
    slotCardRawTexts: detailResult.slotCardRawTexts,
    slotPriceTextsUnique: detailResult.slotPriceTextsUnique,
    salePriceCandidates: detailResult.salePriceCandidates,
    originalPriceCandidates: detailResult.originalPriceCandidates,
    slotPriceMode: detailResult.slotPriceMode,
    excludedOriginalFromMinMax: detailResult.excludedOriginalFromMinMax,
    priceTextCandidates: detailResult.slotPriceTextsUnique,
    priceSource: "none" as const,
    resultPageTextSample: detailResult.detailPageTextSample,
  };

  const baseResultFields: Partial<TeescannerPriceResult> = {
    teescanner_found: "y",
    candidate_count: String(match.candidateCount),
    match_score: String(match.matchScore),
    confidence: match.confidence,
    matched_title: match.candidate.title,
    matched_region: match.candidate.region,
    matched_url: detailResult.detailUrl || match.candidate.url,
    detail_url: detailResult.detailUrl,
    selected_round_day: detailResult.selectedRoundDay || roundDay,
    url_round_day: detailResult.urlRoundDay,
    date_mismatch: detailResult.dateMismatch ? "y" : "n",
    slot_card_count: String(detailResult.loadedSlotCardCount),
    visible_slot_card_count: String(detailResult.visibleSlotCardCount),
    available_team_count_from_date_tab:
      detailResult.availableTeamCountFromDateTab != null
        ? String(detailResult.availableTeamCountFromDateTab)
        : "",
    slot_load_complete: detailResult.slotLoadComplete ? "y" : "n",
    slot_scroll_steps: String(detailResult.slotScrollSteps),
    slot_count_before_scroll: String(detailResult.slotCountBeforeScroll),
    slot_count_after_scroll: String(detailResult.slotCountAfterScroll),
    slot_count_stable_reason: detailResult.slotCountStableReason,
    price_scope: detailResult.priceScope,
    date_tab_match_confidence: detailResult.dateTabMatchConfidence,
    date_tab_cards_snapshot: detailResult.dateTabCardsSnapshot,
    selected_date_tab_raw_text: detailResult.selectedDateTabRawText,
    slot_times: detailResult.slotTimes.join(" | "),
    slot_price_texts: detailResult.slotPriceTextsUnique.join(" | "),
    sale_price_candidates: detailResult.salePriceCandidates.join(" | "),
    original_price_candidates: detailResult.originalPriceCandidates.join(" | "),
    slot_price_mode: detailResult.slotPriceMode,
    needs_check: match.needsCheck ? "y" : "n",
  };

  if (!detailResult.ok) {
    const errorReason =
      detailResult.errorReason ?? "matched_candidate_click_failed";
    const status =
      errorReason === "round_day_not_visible" ? "no_price" : "failed";
    const partial = emptyResult(course, roundDay, usedQuery, {
      ...baseResultFields,
      status,
    });
    await shots.capture("failed");
    return failOutcome(
      course,
      roundDay,
      usedQuery,
      errorReason,
      shots,
      {
        ...detailDiagnostics,
        reviewAction: resolveReviewAction(partial, match.confidence),
      },
      {
        ...baseResultFields,
        status,
        review_action: resolveReviewAction(partial, match.confidence),
      },
    );
  }

  const pageText =
    detailResult.detailPageTextSample ||
    (await collectVisibleTeescannerText(page)) ||
    (await page.locator("body").innerText());
  if (detectTeescannerBlock(pageText)) {
    await shots.capture("failed");
    return failOutcome(
      course,
      roundDay,
      usedQuery,
      "blocked_detected",
      shots,
      {
        ...baseDiagnostics,
        selectedCandidate: match.candidate.title,
        matchScore: String(match.matchScore),
        confidence: match.confidence,
        pageUrl: page.url(),
      },
      {
        status: "blocked",
        teescanner_found: "y",
        candidate_count: String(match.candidateCount),
        match_score: String(match.matchScore),
        confidence: match.confidence,
        matched_title: match.candidate.title,
        matched_region: match.candidate.region,
        matched_url: page.url() || match.candidate.url,
        needs_check: "y",
      },
      true,
      "blocked_detected",
      pageText.slice(0, 200),
    );
  }

  const saleAmounts = detailResult.salePriceAmounts;
  const priceSnippet = detailResult.slotPriceTextsUnique.join(" | ");
  await shots.capture("price_area_checked");
  const slotCount = detailResult.slotCardCount;
  const sourceUrl =
    detailResult.detailUrl ||
    page.url() ||
    match.candidate.url ||
    buildHomeUrl(roundDay);
  const priceSource = saleAmounts.length > 0 ? "slot_card" : "none";
  const priceMin =
    saleAmounts.length > 0 ? Math.min(...saleAmounts) : null;
  const priceMax =
    saleAmounts.length > 0 ? Math.max(...saleAmounts) : null;

  const priceDiagnostics = {
    ...detailDiagnostics,
    priceTextCandidates: detailResult.slotPriceTextsUnique,
    salePriceCandidates: detailResult.salePriceCandidates,
    originalPriceCandidates: detailResult.originalPriceCandidates,
    slotCardRawTexts: detailResult.slotCardRawTexts,
    slotCards: detailResult.slotCards,
    slotPriceMode: detailResult.slotPriceMode,
    excludedOriginalFromMinMax: detailResult.excludedOriginalFromMinMax,
    priceSource,
    pageUrl: sourceUrl,
    pageTextSample: pageText.slice(0, 1500),
  };

  const noSlots = detectDetailNoAvailableSlots(pageText);
  if (noSlots) {
    const partial = emptyResult(course, roundDay, usedQuery, {
      ...baseResultFields,
      status: "no_price",
      price_source: "none",
      reservation_found: "n",
      slot_count: "0",
    });
    await shots.capture("failed");
    return failOutcome(
      course,
      roundDay,
      usedQuery,
      "no_available_slots",
      shots,
      {
        ...priceDiagnostics,
        reviewAction: resolveReviewAction(partial, match.confidence),
      },
      {
        ...baseResultFields,
        status: "no_price",
        price_source: "none",
        reservation_found: "n",
        slot_count: "0",
        review_action: resolveReviewAction(partial, match.confidence),
      },
    );
  }

  if (saleAmounts.length === 0) {
    const partial = emptyResult(course, roundDay, usedQuery, {
      ...baseResultFields,
      status: "no_price",
      price_source: "none",
      reservation_found: slotCount > 0 ? "y" : "n",
      slot_count: String(slotCount),
    });
    await shots.capture("failed");
    return failOutcome(
      course,
      roundDay,
      usedQuery,
      "price_text_not_found",
      shots,
      {
        ...priceDiagnostics,
        reviewAction: resolveReviewAction(partial, match.confidence),
      },
      {
        ...baseResultFields,
        status: "no_price",
        price_source: "none",
        reservation_found: slotCount > 0 ? "y" : "n",
        slot_count: String(slotCount),
        review_action: resolveReviewAction(partial, match.confidence),
      },
    );
  }

  if (priceMin == null || priceMax == null) {
    const partial = emptyResult(course, roundDay, usedQuery, {
      ...baseResultFields,
      status: "no_price",
      price_source: "slot_card",
      price_text: priceSnippet,
      reservation_found: slotCount > 0 ? "y" : "n",
      slot_count: String(slotCount),
    });
    await shots.capture("failed");
    return failOutcome(
      course,
      roundDay,
      usedQuery,
      "price_parse_failed",
      shots,
      {
        ...priceDiagnostics,
        reviewAction: resolveReviewAction(partial, match.confidence),
      },
      {
        ...baseResultFields,
        status: "no_price",
        price_source: "slot_card",
        price_text: priceSnippet,
        reservation_found: slotCount > 0 ? "y" : "n",
        slot_count: String(slotCount),
        review_action: resolveReviewAction(partial, match.confidence),
      },
    );
  }

  const successResult = emptyResult(course, roundDay, usedQuery, {
    status: "success",
    price_source: "slot_card",
    teescanner_found: "y",
    reservation_found: slotCount > 0 ? "y" : "n",
    slot_count: String(slotCount),
    candidate_count: String(match.candidateCount),
    match_score: String(match.matchScore),
    confidence: match.confidence,
    matched_title: match.candidate.title,
    matched_region: match.candidate.region,
    matched_url: sourceUrl,
    detail_url: detailResult.detailUrl,
    selected_round_day: detailResult.selectedRoundDay || roundDay,
    url_round_day: detailResult.urlRoundDay,
    date_mismatch: detailResult.dateMismatch ? "y" : "n",
    slot_card_count: String(detailResult.loadedSlotCardCount),
    visible_slot_card_count: String(detailResult.visibleSlotCardCount),
    available_team_count_from_date_tab:
      detailResult.availableTeamCountFromDateTab != null
        ? String(detailResult.availableTeamCountFromDateTab)
        : "",
    slot_load_complete: detailResult.slotLoadComplete ? "y" : "n",
    slot_scroll_steps: String(detailResult.slotScrollSteps),
    slot_count_before_scroll: String(detailResult.slotCountBeforeScroll),
    slot_count_after_scroll: String(detailResult.slotCountAfterScroll),
    slot_count_stable_reason: detailResult.slotCountStableReason,
    price_scope: detailResult.priceScope,
    date_tab_match_confidence: detailResult.dateTabMatchConfidence,
    date_tab_cards_snapshot: detailResult.dateTabCardsSnapshot,
    selected_date_tab_raw_text: detailResult.selectedDateTabRawText,
    slot_times: detailResult.slotTimes.join(" | "),
    slot_price_texts: detailResult.slotPriceTextsUnique.join(" | "),
    sale_price_candidates: detailResult.salePriceCandidates.join(" | "),
    original_price_candidates: detailResult.originalPriceCandidates.join(" | "),
    slot_price_mode: detailResult.slotPriceMode,
    price_text: priceSnippet,
    price_min: formatWonForCsv(priceMin),
    price_max: formatWonForCsv(priceMax),
    price_unit: "won",
    needs_check: match.needsCheck ? "y" : "n",
    screenshot_path: shots.latestPath(),
    error_reason: "",
    review_action: "",
  });
  successResult.review_action = resolveReviewAction(
    successResult,
    match.confidence,
  );

  return {
    blocked: false,
    diagnostics: buildDiagnostics({
      ...priceDiagnostics,
      reviewAction: successResult.review_action,
    }),
    result: successResult,
  };
}
