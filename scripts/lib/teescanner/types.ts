export type TeescannerResultStatus =
  | "success"
  | "not_on_teescanner"
  | "ambiguous_match"
  | "no_price"
  | "no_available_slots"
  | "blocked"
  | "failed"
  | "skipped";

export type TeescannerConfidence = "high" | "medium" | "low";

export type PriceSource =
  | "result_card"
  | "slot_card"
  | "body_fallback"
  | "filter_only"
  | "none";

export interface TeescannerInputRow {
  id: string;
  name: string;
  change_name_to: string;
  address: string;
}

export interface TeescannerSearchCandidate {
  title: string;
  region: string;
  url: string;
  candidateIndex: number;
  rawText?: string;
  rating?: string;
}

export interface TeescannerMatchResult {
  candidate: TeescannerSearchCandidate | null;
  confidence: TeescannerConfidence;
  matchScore: number;
  candidateCount: number;
  needsCheck: boolean;
}

export interface TeescannerPriceResult {
  id: string;
  name: string;
  change_name_to: string;
  address: string;
  search_query: string;
  round_day: string;
  matched_title: string;
  matched_region: string;
  matched_url: string;
  candidate_count: string;
  match_score: string;
  confidence: string;
  teescanner_found: string;
  reservation_found: string;
  slot_count: string;
  price_text: string;
  price_min: string;
  price_max: string;
  price_unit: string;
  price_source: string;
  detail_url: string;
  golfclub_seq: string;
  detail_url_template: string;
  per_date_detail_reload: string;
  selected_round_day: string;
  url_round_day: string;
  date_mismatch: string;
  slot_card_count: string;
  visible_slot_card_count: string;
  available_team_count_from_date_tab: string;
  slot_load_complete: string;
  slot_scroll_steps: string;
  slot_count_before_scroll: string;
  slot_count_after_scroll: string;
  slot_count_stable_reason: string;
  price_scope: string;
  date_tab_match_confidence: string;
  date_tab_cards_snapshot: string;
  selected_date_tab_raw_text: string;
  slot_times: string;
  slot_price_texts: string;
  sale_price_candidates: string;
  original_price_candidates: string;
  slot_price_mode: string;
  review_action: string;
  source_name: string;
  source_url: string;
  status: TeescannerResultStatus;
  needs_check: string;
  error_reason: string;
  collected_at: string;
  screenshot_path: string;
}

export type PopupAction = "clicked" | "not_found" | "failed" | "skipped_blocked";

export interface DismissPopupResult {
  popupDetected: boolean;
  popupAction: PopupAction;
  clickedText: string;
}

export interface TeescannerRunLogEntry {
  timestamp: string;
  rowId: string;
  courseName: string;
  step: string;
  status: string;
  delayUsedMs?: number;
  blockDetected: boolean;
  screenshotPath?: string;
  errorMessage?: string;
  popupDetected?: boolean;
  popupAction?: PopupAction;
  clickedText?: string;
  searchInputFound?: boolean;
  pageUrl?: string;
  pageTextSample?: string;
  searchQuery?: string;
  candidateCount?: number;
  candidateTitles?: string[];
  candidateRegions?: string[];
  candidateRawTextSample?: string;
  selectedCandidate?: string;
  matchScore?: string;
  confidence?: string;
  priceTextCandidates?: string[];
  filterPriceCandidates?: string[];
  priceSource?: PriceSource;
  screenshotSteps?: Record<string, string>;
  candidateClickTarget?: string;
  candidateClickSucceeded?: boolean;
  candidateSelected?: boolean;
  searchButtonFound?: boolean;
  searchButtonClicked?: boolean;
  resultPageTextSample?: string;
  detailUrl?: string;
  selectedRoundDay?: string;
  urlRoundDay?: string;
  dateMismatch?: boolean;
  slotCardCount?: number;
  visibleSlotCardCount?: number;
  loadedSlotCardCount?: number;
  availableTeamCountFromDateTab?: number | null;
  slotLoadComplete?: boolean;
  slotScrollSteps?: number;
  slotCountBeforeScroll?: number;
  slotCountAfterScroll?: number;
  slotCountStableReason?: string;
  priceScope?: string;
  dateTabMatchConfidence?: string;
  dateTabCardsSnapshot?: string;
  selectedDateTabRawText?: string;
  slotTimes?: string[];
  slotCardRawTexts?: string[];
  slotPriceTextsUnique?: string[];
  slotCards?: Array<{
    slotTime: string;
    salePrices: number[];
    originalPrices: number[];
    payablePrice: number | null;
    uncertain: boolean;
  }>;
  salePriceCandidates?: string[];
  originalPriceCandidates?: string[];
  slotPriceMode?: string;
  excludedOriginalFromMinMax?: boolean;
  reviewAction?: string;
}

export interface TeescannerBlockedState {
  timestamp: string;
  reason: string;
  detectedText: string;
  screenshotPath: string;
}

export interface WriteTeescannerBlockedStateInput {
  reason: string;
  detectedText?: string;
  screenshotPath?: string;
  timestamp?: string;
}

export interface TeescannerAccessCheckResult {
  status: "ok" | "blocked" | "error";
  reason: string;
  matchedText?: string;
  searchInputFound?: boolean;
  message?: string;
  popupDetected?: boolean;
  popupAction?: PopupAction;
  clickedText?: string;
  screenshotPath?: string;
  pageUrl?: string;
  pageTextSample?: string;
}

export interface TeescannerScrapeOutcome {
  result: TeescannerPriceResult;
  blocked: boolean;
  blockReason?: string;
  blockDetectedText?: string;
  diagnostics?: TeescannerScrapeDiagnostics;
}

export type TeescannerErrorReason =
  | "search_input_not_found"
  | "popup_dismissed_but_search_input_not_found"
  | "readonly_search_input_fill_attempted"
  | "editable_search_input_not_found"
  | "keyword_overlay_not_opened"
  | "no_search_candidates"
  | "candidate_collection_failed"
  | "ambiguous_match"
  | "matched_candidate_click_failed"
  | "course_detail_not_loaded"
  | "round_day_not_visible"
  | "round_day_not_selected"
  | "search_button_click_failed"
  | "no_available_slots"
  | "price_filter_only"
  | "price_area_not_found"
  | "price_text_not_found"
  | "price_parse_failed"
  | "blocked_detected"
  | "navigation_timeout"
  | "browser_context_evaluate_error"
  | "unknown_error";

export interface TeescannerScrapeDiagnostics {
  searchQuery?: string;
  candidateCount?: number;
  candidateTitles?: string[];
  candidateRegions?: string[];
  candidateRawTextSample?: string;
  selectedCandidate?: string;
  matchScore?: string;
  confidence?: string;
  priceTextCandidates?: string[];
  filterPriceCandidates?: string[];
  priceSource?: PriceSource;
  screenshotSteps?: Record<string, string>;
  pageUrl?: string;
  pageTextSample?: string;
  popupDismissed?: boolean;
  candidateClickTarget?: string;
  candidateClickSucceeded?: boolean;
  candidateSelected?: boolean;
  searchButtonFound?: boolean;
  searchButtonClicked?: boolean;
  resultPageTextSample?: string;
  detailUrl?: string;
  selectedRoundDay?: string;
  urlRoundDay?: string;
  dateMismatch?: boolean;
  slotCardCount?: number;
  visibleSlotCardCount?: number;
  loadedSlotCardCount?: number;
  availableTeamCountFromDateTab?: number | null;
  slotLoadComplete?: boolean;
  slotScrollSteps?: number;
  slotCountBeforeScroll?: number;
  slotCountAfterScroll?: number;
  slotCountStableReason?: string;
  priceScope?: string;
  dateTabMatchConfidence?: string;
  dateTabCardsSnapshot?: string;
  selectedDateTabRawText?: string;
  slotTimes?: string[];
  slotCardRawTexts?: string[];
  slotPriceTextsUnique?: string[];
  slotCards?: Array<{
    slotTime: string;
    salePrices: number[];
    originalPrices: number[];
    payablePrice: number | null;
    uncertain: boolean;
  }>;
  salePriceCandidates?: string[];
  originalPriceCandidates?: string[];
  slotPriceMode?: string;
  excludedOriginalFromMinMax?: boolean;
  reviewAction?: string;
}
