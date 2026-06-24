import type { TeescannerConfidence, TeescannerPriceResult } from "./types";

export type ReviewAction =
  | "accept_price"
  | "manual_review"
  | "ignore_filter_only"
  | "not_on_source";

function isTruthyFlag(value: string): boolean {
  return value === "y" || value === "true";
}

export function resolveReviewAction(
  result: TeescannerPriceResult,
  confidence: TeescannerConfidence,
): ReviewAction {
  if (result.status === "not_on_teescanner") return "not_on_source";
  if (result.error_reason === "price_filter_only") return "ignore_filter_only";

  if (result.status === "success" && result.price_source === "slot_card") {
    const candidateCount = Number.parseInt(result.candidate_count || "0", 10);
    const title = result.matched_title || "";
    const dateMismatch = isTruthyFlag(result.date_mismatch);
    const slotPriceMode = result.slot_price_mode || "";

    if (confidence !== "high") return "manual_review";
    if (candidateCount > 1) return "manual_review";
    if (/\(M\)|\(P\)|\(대중제\)|\(회원제\)/i.test(title)) {
      return "manual_review";
    }
    if (dateMismatch) return "manual_review";
    if (slotPriceMode === "uncertain") return "manual_review";
    if (result.price_scope === "partial_day_slots") return "manual_review";
    if (
      result.date_tab_match_confidence === "none" ||
      result.date_tab_match_confidence === "low"
    ) {
      return "manual_review";
    }

    return "accept_price";
  }

  return "manual_review";
}
