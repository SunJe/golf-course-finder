export const REVIEW_STATUS_VALUES = [
  "pending",
  "approved",
  "needs_edit",
  "rejected",
] as const;

export const FIELD_STATUS_VALUES = [
  "pending",
  "approved",
  "edited",
  "rejected",
  "empty",
] as const;

export type ReviewStatus = (typeof REVIEW_STATUS_VALUES)[number];
export type FieldStatus = (typeof FIELD_STATUS_VALUES)[number];

export type ReviewFilter =
  | "all"
  | "pending"
  | "approved"
  | "needs_edit"
  | "no_price"
  | "no_phone"
  | "no_homepage"
  | "low_confidence";

export const NAVER_REVIEW_BASE_HEADERS = [
  "id",
  "name",
  "address",
  "candidate_title",
  "candidate_address",
  "candidate_phone",
  "candidate_homepage_url",
  "candidate_price_text",
  "candidate_price_min",
  "candidate_price_max",
  "candidate_price_type",
  "candidate_difficulty",
  "candidate_difficulty_text",
  "candidate_avg_score",
  "candidate_reservation_prices_text",
  "source_url",
  "confidence",
  "approve_phone",
  "approve_homepage",
  "approve_price",
  "approve_difficulty",
  "approve_avg_score",
  "review_phone",
  "review_homepage_url",
  "review_price_min",
  "review_price_max",
  "review_price_type",
  "review_difficulty",
  "review_avg_score",
  "review_note",
] as const;

export const NAVER_REVIEW_STATUS_HEADERS = [
  "review_status",
  "phone_status",
  "homepage_status",
  "price_status",
  "difficulty_status",
  "avg_score_status",
  "reviewed_at",
  "reviewer_note",
] as const;

export const NAVER_PRICE_REVIEW_HEADERS = [
  ...NAVER_REVIEW_BASE_HEADERS,
  ...NAVER_REVIEW_STATUS_HEADERS,
] as const;

export type NaverReviewRow = Record<string, string>;

export interface NaverReviewItem {
  id: string;
  name: string;
  address: string;
  candidate_title: string;
  candidate_address: string;
  candidate_phone: string;
  candidate_homepage_url: string;
  candidate_price_text: string;
  candidate_price_min: string;
  candidate_price_max: string;
  candidate_price_type: string;
  candidate_difficulty: string;
  candidate_difficulty_text: string;
  candidate_avg_score: string;
  candidate_reservation_prices_text: string;
  source_url: string;
  confidence: string;
  query_variant: string;
  matched_query: string;
  approve_phone: string;
  approve_homepage: string;
  approve_price: string;
  approve_difficulty: string;
  approve_avg_score: string;
  review_phone: string;
  review_homepage_url: string;
  review_price_min: string;
  review_price_max: string;
  review_price_type: string;
  review_difficulty: string;
  review_avg_score: string;
  review_note: string;
  review_status: string;
  phone_status: string;
  homepage_status: string;
  price_status: string;
  difficulty_status: string;
  avg_score_status: string;
  reviewed_at: string;
  reviewer_note: string;
}

export interface ReviewProgressStats {
  total: number;
  pending: number;
  approved: number;
  needs_edit: number;
  rejected: number;
  phone_approved: number;
  homepage_approved: number;
  price_approved: number;
  difficulty_approved: number;
  avg_score_approved: number;
  reviewed: number;
}

export type ReviewSaveAction =
  | "save"
  | "save_and_next"
  | "approve_all"
  | "approve_contacts"
  | "approve_price"
  | "approve_stats"
  | "needs_edit"
  | "reject";

export interface ReviewSavePayload {
  id: string;
  action: ReviewSaveAction;
  fields?: Partial<NaverReviewItem>;
}

export function emptyReviewItem(
  id: string,
  name: string,
  address: string,
): NaverReviewItem {
  return {
    id,
    name,
    address,
    candidate_title: "",
    candidate_address: "",
    candidate_phone: "",
    candidate_homepage_url: "",
    candidate_price_text: "",
    candidate_price_min: "",
    candidate_price_max: "",
    candidate_price_type: "unknown",
    candidate_difficulty: "",
    candidate_difficulty_text: "",
    candidate_avg_score: "",
    candidate_reservation_prices_text: "",
    source_url: "",
    confidence: "low",
    query_variant: "",
    matched_query: "",
    approve_phone: "",
    approve_homepage: "",
    approve_price: "",
    approve_difficulty: "",
    approve_avg_score: "",
    review_phone: "",
    review_homepage_url: "",
    review_price_min: "",
    review_price_max: "",
    review_price_type: "",
    review_difficulty: "",
    review_avg_score: "",
    review_note: "",
    review_status: "pending",
    phone_status: "pending",
    homepage_status: "pending",
    price_status: "pending",
    difficulty_status: "pending",
    avg_score_status: "pending",
    reviewed_at: "",
    reviewer_note: "",
  };
}

export function isApprovedFlag(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized === "y" || normalized === "yes" || normalized === "true";
}

export function effectiveReviewStatus(row: NaverReviewItem): ReviewStatus {
  const status = row.review_status.trim().toLowerCase();
  if (REVIEW_STATUS_VALUES.includes(status as ReviewStatus)) {
    return status as ReviewStatus;
  }
  return "pending";
}
