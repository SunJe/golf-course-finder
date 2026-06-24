import { buildCourseSearchTerms } from "./courseEnrichment";
import type { MatchEvaluation } from "./matchStatus";
import type {
  TeescannerInputRow,
  TeescannerPriceResult,
  TeescannerSearchCandidate,
} from "./types";

export function buildCourseMetaPartial(
  course: TeescannerInputRow,
  options: {
    usedSearchTerm: string;
    searchAttempt: "primary" | "fallback";
    candidate?: TeescannerSearchCandidate | null;
    evaluation?: MatchEvaluation;
  },
): Partial<TeescannerPriceResult> {
  const candidate = options.candidate;
  return {
    source_row_index: String(course.row_index ?? ""),
    change_name_to: course.change_name_to,
    primary_search_term: course.primary_search_term,
    fallback_search_term: course.fallback_search_term,
    used_search_term: options.usedSearchTerm,
    search_attempt: options.searchAttempt,
    candidate_title: candidate?.title ?? "",
    candidate_region: candidate?.candidate_region ?? "",
    candidate_subregion: candidate?.candidate_subregion ?? "",
    candidate_type: candidate?.candidate_type ?? "",
    match_status: options.evaluation?.matchStatus ?? "",
    review_reason: options.evaluation?.reviewReason ?? "",
    suggested_change_name_to: options.evaluation?.suggestedChangeNameTo ?? "",
  };
}

export function enrichInputRowFromCourse(
  row: Omit<TeescannerInputRow, "primary_search_term" | "fallback_search_term"> & {
    change_name_to: string;
    name: string;
  },
): TeescannerInputRow {
  const terms = buildCourseSearchTerms({
    name: row.name,
    changeNameTo: row.change_name_to,
  });
  return {
    ...row,
    primary_search_term: terms.primarySearchTerm,
    fallback_search_term: terms.fallbackSearchTerm,
  };
}
