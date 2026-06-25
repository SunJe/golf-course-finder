import { normalizeCourseName } from "./courseEnrichment";
import type { TeescannerInputRow, TeescannerSearchCandidate } from "./types";

export type TeescannerMatchStatus =
  | "matched"
  | "no_result"
  | "ambiguous"
  | "candidate_mismatch"
  | "possible_renamed_course"
  | "search_failed"
  | "blocked"
  | "no_price"
  | "manual_review";

export type MatchEvaluation = {
  matchStatus: TeescannerMatchStatus;
  reviewAction: "accept" | "manual_review" | "skip" | "retry_later";
  reviewReason: string;
  suggestedChangeNameTo: string;
};

function includesNormalized(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return haystack.includes(needle) || needle.includes(haystack);
}

function stripTypeSuffix(title: string): string {
  return title.replace(/\(([PM])\)\s*$/i, "").trim();
}

export function evaluateMatchStatus(options: {
  course: TeescannerInputRow;
  usedSearchTerm: string;
  searchAttempt: "primary" | "fallback";
  candidate: TeescannerSearchCandidate | null;
  candidateCount: number;
  confidence: "high" | "medium" | "low";
  errorReason?: string;
  blocked?: boolean;
  hasPrice?: boolean;
}): MatchEvaluation {
  const {
    course,
    usedSearchTerm,
    candidate,
    candidateCount,
    confidence,
    errorReason,
    blocked,
    hasPrice,
  } = options;

  if (blocked) {
    return {
      matchStatus: "blocked",
      reviewAction: "retry_later",
      reviewReason: "teescanner access blocked",
      suggestedChangeNameTo: "",
    };
  }

  if (!candidate || candidateCount === 0) {
    return {
      matchStatus: "no_result",
      reviewAction: "manual_review",
      reviewReason: "no candidate found",
      suggestedChangeNameTo: "",
    };
  }

  if (
    errorReason === "candidate_collection_failed" ||
    errorReason === "search_input_not_found" ||
    errorReason === "matched_candidate_click_failed"
  ) {
    return {
      matchStatus: "search_failed",
      reviewAction: "retry_later",
      reviewReason: "search result click failed",
      suggestedChangeNameTo: "",
    };
  }

  const sourceNames = [course.change_name_to, course.name].filter(Boolean);
  const normalizedSources = sourceNames.map(normalizeCourseName);
  const normalizedCandidate = normalizeCourseName(candidate.title);
  const normalizedSearch = normalizeCourseName(usedSearchTerm);
  const suggested = stripTypeSuffix(candidate.title);

  const exactOrStrong = normalizedSources.some((source) =>
    includesNormalized(normalizedCandidate, source),
  );

  const searchLinked =
    normalizedSearch.length > 0 &&
    (includesNormalized(normalizedCandidate, normalizedSearch) ||
      normalizedCandidate.includes(normalizedSearch));

  if (candidateCount > 1 && confidence === "low") {
    return {
      matchStatus: "ambiguous",
      reviewAction: "manual_review",
      reviewReason: "multiple similar candidates",
      suggestedChangeNameTo: "",
    };
  }

  if (!exactOrStrong && searchLinked) {
    return {
      matchStatus: "possible_renamed_course",
      reviewAction: "manual_review",
      reviewReason:
        "candidate title differs from source name but includes search token; possible renamed course",
      suggestedChangeNameTo: suggested,
    };
  }

  if (!exactOrStrong) {
    return {
      matchStatus: "candidate_mismatch",
      reviewAction: "manual_review",
      reviewReason: "candidate title differs from source name",
      suggestedChangeNameTo: suggested,
    };
  }

  if (confidence === "low") {
    return {
      matchStatus: "ambiguous",
      reviewAction: "manual_review",
      reviewReason: "ambiguous_match",
      suggestedChangeNameTo: "",
    };
  }

  if (hasPrice === false) {
    return {
      matchStatus: "no_price",
      reviewAction: "manual_review",
      reviewReason: "price area not found",
      suggestedChangeNameTo: "",
    };
  }

  return {
    matchStatus: "matched",
    reviewAction: confidence === "high" ? "accept" : "manual_review",
    reviewReason: "",
    suggestedChangeNameTo: "",
  };
}
