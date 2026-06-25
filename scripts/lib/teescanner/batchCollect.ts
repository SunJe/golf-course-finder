import type { Page } from "playwright";
import { StepScreenshotTracker } from "./debug";
import {
  collectSlotsFromDetailUrl,
  detectDetailNoAvailableSlots,
  openCourseDetailUrl,
} from "./courseDetailFlow";
import type { DayType } from "./dateSampling";
import {
  buildDetailUrl,
  buildDetailUrlTemplate,
  parseGolfclubSeqFromUrl,
} from "./detailUrl";
import { buildCourseMetaPartial } from "./courseMeta";
import { matchTeescannerCandidates } from "./matcher";
import { evaluateMatchStatus } from "./matchStatus";
import { formatWonForCsv } from "./priceParse";
import { resolveReviewAction } from "./reviewAction";
import {
  createTeescannerEmptyResult,
  createTeescannerFailOutcome,
} from "./search";
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
  detectTeescannerBlock,
  sleep,
} from "./access";

const PAGE_SETTLE_MS = 5000;

export interface BatchDateOutcome {
  roundDay: string;
  dayType: DayType;
  outcome: TeescannerScrapeOutcome;
  golfclubSeq: string;
  detailUrlTemplate: string;
  perDateDetailReload: boolean;
}

function withBatchMeta(
  outcome: TeescannerScrapeOutcome,
  meta: {
    golfclubSeq: string;
    detailUrlTemplate: string;
    perDateDetailReload: boolean;
  },
): TeescannerScrapeOutcome {
  return {
    ...outcome,
    result: {
      ...outcome.result,
      golfclub_seq: meta.golfclubSeq,
      detail_url_template: meta.detailUrlTemplate,
      per_date_detail_reload: meta.perDateDetailReload ? "true" : "false",
    },
  };
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
  if (pageText.includes(query) && hasGolfContent) return "candidate_collection_failed";
  return "no_search_candidates";
}

async function searchMatchCandidate(options: {
  page: Page;
  course: TeescannerInputRow;
  roundDay: string;
  shots: StepScreenshotTracker;
}): Promise<
  | {
      ok: true;
      usedQuery: string;
      candidate: TeescannerSearchCandidate;
      matchScore: number;
      confidence: import("./types").TeescannerConfidence;
      candidateCount: number;
      needsCheck: boolean;
      diagnostics: Partial<TeescannerScrapeDiagnostics>;
    }
  | { ok: false; outcome: TeescannerScrapeOutcome }
> {
  const { page, course, roundDay, shots } = options;
  const queries = [
    course.primary_search_term,
    course.fallback_search_term,
  ].filter((value, index, array) => value && array.indexOf(value) === index);
  const primaryQuery = queries[0] ?? (course.change_name_to || course.name);

  let allCandidates: TeescannerSearchCandidate[] = [];
  let usedQuery = primaryQuery;
  let searchAttempt: "primary" | "fallback" = "primary";
  let lastFlow: Awaited<ReturnType<typeof runTeescannerSearchFlow>> | null = null;

  for (let queryIndex = 0; queryIndex < queries.length; queryIndex += 1) {
    const query = queries[queryIndex] ?? primaryQuery;
    usedQuery = query;
    searchAttempt = queryIndex === 0 ? "primary" : "fallback";
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
        return {
          ok: false,
          outcome: createTeescannerFailOutcome(
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
          ),
        };
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
        return {
          ok: false,
          outcome: createTeescannerFailOutcome(
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
          ),
        };
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

  const baseDiagnostics: Partial<TeescannerScrapeDiagnostics> = {
    searchQuery: usedQuery,
    candidateCount: allCandidates.length,
    candidateTitles: allCandidates.map((item) => item.title),
    candidateRegions: allCandidates.map((item) => item.region),
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
    return {
      ok: false,
      outcome: createTeescannerFailOutcome(
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
      ),
    };
  }

  const match = matchTeescannerCandidates(course, allCandidates);
  const evaluation = evaluateMatchStatus({
    course,
    usedSearchTerm: usedQuery,
    searchAttempt,
    candidate: match.candidate,
    candidateCount: match.candidateCount,
    confidence: match.confidence,
  });

  const metaPartial = buildCourseMetaPartial(course, {
    usedSearchTerm: usedQuery,
    searchAttempt,
    candidate: match.candidate ?? allCandidates[0] ?? null,
    evaluation,
  });

  // Proceed to price crawl when a best candidate exists.
  // Ambiguous / low-confidence matches still collect prices; skip only when no candidate.
  if (!match.candidate) {
    const selected = allCandidates[0] ?? null;
    await shots.capture("failed");
    return {
      ok: false,
      outcome: createTeescannerFailOutcome(
        course,
        roundDay,
        usedQuery,
        "ambiguous_match",
        shots,
        {
          ...baseDiagnostics,
          selectedCandidate: selected?.title ?? "",
          matchScore: String(match.matchScore),
          confidence: match.confidence,
        },
        {
          status: "ambiguous_match",
          teescanner_found: "y",
          candidate_count: String(match.candidateCount),
          match_score: String(match.matchScore),
          confidence: match.confidence,
          matched_title: selected?.title ?? "",
          candidate_title: selected?.title ?? "",
          matched_region: selected?.region ?? "",
          candidate_region: selected?.candidate_region ?? "",
          candidate_subregion: selected?.candidate_subregion ?? "",
          candidate_type: selected?.candidate_type ?? "",
          matched_url: selected?.url ?? "",
          needs_check: "y",
          review_action: evaluation.reviewAction,
          ...metaPartial,
        },
      ),
    };
  }

  return {
    ok: true,
    usedQuery,
    searchAttempt,
    candidate: match.candidate,
    matchScore: match.matchScore,
    confidence: match.confidence,
    candidateCount: match.candidateCount,
    needsCheck: match.needsCheck,
    diagnostics: {
      ...baseDiagnostics,
      selectedCandidate: match.candidate.title,
      matchScore: String(match.matchScore),
      confidence: match.confidence,
    },
  };
}

function buildDetailOutcome(options: {
  course: TeescannerInputRow;
  roundDay: string;
  usedQuery: string;
  candidate: TeescannerSearchCandidate;
  matchScore: number;
  confidence: import("./types").TeescannerConfidence;
  candidateCount: number;
  needsCheck: boolean;
  detailResult: Awaited<ReturnType<typeof collectSlotsFromDetailUrl>>;
  shots: StepScreenshotTracker;
  golfclubSeq: string;
  detailUrlTemplate: string;
  perDateDetailReload: boolean;
  baseDiagnostics: Partial<TeescannerScrapeDiagnostics>;
}): TeescannerScrapeOutcome {
  const {
    course,
    roundDay,
    usedQuery,
    candidate,
    matchScore,
    confidence,
    candidateCount,
    needsCheck,
    detailResult,
    shots,
    golfclubSeq,
    detailUrlTemplate,
    perDateDetailReload,
    baseDiagnostics,
  } = options;

  const baseFields: Partial<TeescannerPriceResult> = {
    teescanner_found: "y",
    candidate_count: String(candidateCount),
    match_score: String(matchScore),
    confidence,
    matched_title: candidate.title,
    candidate_title: candidate.title,
    candidate_region: candidate.candidate_region,
    candidate_subregion: candidate.candidate_subregion,
    candidate_type: candidate.candidate_type,
    matched_region: candidate.region,
    matched_url: detailResult.detailUrl || candidate.url,
    detail_url: detailResult.detailUrl,
    golfclub_seq: golfclubSeq,
    detail_url_template: detailUrlTemplate,
    per_date_detail_reload: perDateDetailReload ? "true" : "false",
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
    needs_check: needsCheck ? "y" : "n",
    collected_at: new Date().toISOString(),
  };

  const dateValid =
    detailResult.selectedRoundDay === roundDay &&
    detailResult.urlRoundDay === roundDay &&
    !detailResult.dateMismatch;

  if (!detailResult.ok || !dateValid) {
    const errorReason =
      detailResult.errorReason ??
      (dateValid ? "matched_candidate_click_failed" : "round_day_not_selected");
    const partial = createTeescannerEmptyResult(course, roundDay, usedQuery, {
      ...baseFields,
      status: errorReason === "round_day_not_selected" ? "no_price" : "failed",
      error_reason: errorReason,
      screenshot_path: shots.latestPath(),
    });
    partial.review_action = resolveReviewAction(partial, confidence);
    return {
      blocked: errorReason === "blocked_detected",
      result: partial,
      diagnostics: { ...baseDiagnostics, reviewAction: partial.review_action },
    };
  }

  const pageText = detailResult.detailPageTextSample ?? "";
  if (detectTeescannerBlock(pageText)) {
    return createTeescannerFailOutcome(
      course,
      roundDay,
      usedQuery,
      "blocked_detected",
      shots,
      {
        ...baseDiagnostics,
        selectedCandidate: candidate.title,
        matchScore: String(matchScore),
        confidence,
        pageUrl: detailResult.detailUrl,
      },
      {
        status: "blocked",
        teescanner_found: "y",
        candidate_count: String(candidateCount),
        match_score: String(matchScore),
        confidence,
        matched_title: candidate.title,
        matched_region: candidate.region,
        matched_url: detailResult.detailUrl || candidate.url,
        needs_check: "y",
        ...baseFields,
      },
      true,
      "blocked_detected",
      pageText.slice(0, 200),
    );
  }

  const saleAmounts = detailResult.salePriceAmounts;
  const slotCount = detailResult.slotCardCount;
  const priceSnippet = detailResult.slotPriceTextsUnique.join(" | ");

  if (detectDetailNoAvailableSlots(pageText)) {
    const partial = createTeescannerEmptyResult(course, roundDay, usedQuery, {
      ...baseFields,
      status: "no_price",
      error_reason: "no_available_slots",
      price_source: "none",
      reservation_found: "n",
      slot_count: "0",
      screenshot_path: shots.latestPath(),
    });
    partial.review_action = resolveReviewAction(partial, confidence);
    return { blocked: false, result: partial, diagnostics: baseDiagnostics };
  }

  if (saleAmounts.length === 0) {
    const partial = createTeescannerEmptyResult(course, roundDay, usedQuery, {
      ...baseFields,
      status: "no_price",
      error_reason: "price_text_not_found",
      price_source: "none",
      reservation_found: slotCount > 0 ? "y" : "n",
      slot_count: String(slotCount),
      screenshot_path: shots.latestPath(),
    });
    partial.review_action = resolveReviewAction(partial, confidence);
    return { blocked: false, result: partial, diagnostics: baseDiagnostics };
  }

  const priceMin = Math.min(...saleAmounts);
  const priceMax = Math.max(...saleAmounts);
  const success = createTeescannerEmptyResult(course, roundDay, usedQuery, {
    ...baseFields,
    status: "success",
    error_reason: "",
    price_source: "slot_card",
    teescanner_found: "y",
    reservation_found: slotCount > 0 ? "y" : "n",
    slot_count: String(slotCount),
    price_text: priceSnippet,
    price_min: formatWonForCsv(priceMin),
    price_max: formatWonForCsv(priceMax),
    price_unit: "won",
    source_name: "teescanner",
    source_url: detailResult.detailUrl || buildHomeUrl(roundDay),
    screenshot_path: shots.latestPath(),
    needs_check: needsCheck ? "y" : "n",
  });
  success.review_action = resolveReviewAction(success, confidence);

  return {
    blocked: false,
    result: success,
    diagnostics: { ...baseDiagnostics, reviewAction: success.review_action },
  };
}

export async function scrapeTeescannerCourseBatchDates(options: {
  page: Page;
  course: TeescannerInputRow;
  dates: Array<{ roundDay: string; dayType: DayType }>;
  screenshotDir: string;
}): Promise<BatchDateOutcome[]> {
  const { page, course, dates, screenshotDir } = options;
  if (dates.length === 0) return [];

  const searchRoundDay = dates[0].roundDay;
  const shots = new StepScreenshotTracker(page, course.id, screenshotDir);
  const matchResult = await searchMatchCandidate({
    page,
    course,
    roundDay: searchRoundDay,
    shots,
  });

  if (!matchResult.ok) {
    return dates.map((sample) => ({
      roundDay: sample.roundDay,
      dayType: sample.dayType,
      outcome: withBatchMeta(matchResult.outcome, {
        golfclubSeq: "",
        detailUrlTemplate: "",
        perDateDetailReload: true,
      }),
      golfclubSeq: "",
      detailUrlTemplate: "",
      perDateDetailReload: true,
    }));
  }

  const {
    usedQuery,
    candidate,
    matchScore,
    confidence,
    candidateCount,
    needsCheck,
    diagnostics,
  } = matchResult;

  const detailOpen = await openCourseDetailUrl({ page, candidate, shots });
  const golfclubSeq =
    detailOpen.golfclubSeq || parseGolfclubSeqFromUrl(detailOpen.detailUrl);
  const detailUrlTemplate = golfclubSeq
    ? buildDetailUrlTemplate(golfclubSeq)
    : "";

  if (!detailOpen.ok || !golfclubSeq) {
    const failResult = buildDetailOutcome({
      course,
      roundDay: searchRoundDay,
      usedQuery,
      candidate,
      matchScore,
      confidence,
      candidateCount,
      needsCheck,
      detailResult: {
        ok: false,
        candidateClickSucceeded: detailOpen.ok,
        detailLoaded: detailOpen.detailLoaded,
        roundDaySelected: false,
        selectedRoundDay: "",
        detailUrl: detailOpen.detailUrl,
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
        errorReason: detailOpen.errorReason ?? "course_detail_not_loaded",
      },
      shots,
      golfclubSeq,
      detailUrlTemplate,
      perDateDetailReload: true,
      baseDiagnostics: diagnostics,
    });

    return dates.map((sample) => ({
      roundDay: sample.roundDay,
      dayType: sample.dayType,
      outcome: withBatchMeta(failResult, {
        golfclubSeq,
        detailUrlTemplate,
        perDateDetailReload: true,
      }),
      golfclubSeq,
      detailUrlTemplate,
      perDateDetailReload: true,
    }));
  }

  const outcomes: BatchDateOutcome[] = [];

  for (let index = 0; index < dates.length; index += 1) {
    const sample = dates[index];
    const dateShots = new StepScreenshotTracker(page, course.id, screenshotDir);
    const detailUrl = buildDetailUrl(golfclubSeq, sample.roundDay);

    const detailResult = await collectSlotsFromDetailUrl({
      page,
      detailUrl,
      roundDay: sample.roundDay,
      candidate,
      shots: dateShots,
    });

    const outcome = buildDetailOutcome({
      course,
      roundDay: sample.roundDay,
      usedQuery,
      candidate,
      matchScore,
      confidence,
      candidateCount,
      needsCheck,
      detailResult,
      shots: dateShots,
      golfclubSeq,
      detailUrlTemplate,
      perDateDetailReload: true,
      baseDiagnostics: diagnostics,
    });

    outcomes.push({
      roundDay: sample.roundDay,
      dayType: sample.dayType,
      outcome: withBatchMeta(outcome, {
        golfclubSeq,
        detailUrlTemplate,
        perDateDetailReload: true,
      }),
      golfclubSeq,
      detailUrlTemplate,
      perDateDetailReload: true,
    });

    if (outcome.blocked) break;
    if (index < dates.length - 1) {
      await sleep(2000);
    }
  }

  return outcomes;
}

export function printBatchCourseSummary(
  courseName: string,
  outcomes: BatchDateOutcome[],
): void {
  console.log(`[${courseName}]`);
  for (const item of outcomes) {
    const { result } = item.outcome;
    const price =
      result.price_min && result.price_max
        ? `${result.price_min}~${result.price_max}`
        : result.price_min || "empty";
    console.log(
      `  ${item.roundDay} ${item.dayType}: ${result.status} ${price}`,
    );
  }
}
