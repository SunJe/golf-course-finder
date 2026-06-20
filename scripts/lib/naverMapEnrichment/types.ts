export type SearchStrategy =
  | "address_place"
  | "address_title_research"
  | "change_name_fallback"
  | "name_fallback"
  | "clubhouse_fallback"
  | "skipped"
  | "failed";

export type CandidateOpenMode = "click" | "research";

export type CollectionMode = "full" | "limited_contact_only";

export type ConfidenceLevel = "high" | "medium" | "low" | "";

export interface EnrichmentInputRow {
  id: string;
  name: string;
  change_name_to: string;
  address: string;
  phone: string;
  homepage_url: string;
  price_text: string;
  price_min: string;
  price_max: string;
  price_type: string;
  difficulty: string;
  avg_score: string;
  source_url: string;
  confidence: string;
  needs_check: string;
  note: string;
}

export interface PlaceCandidate {
  title: string;
  category: string;
  address?: string;
  placeUrl?: string;
  elementIndex?: number;
}

export interface ScoredPlaceCandidate extends PlaceCandidate {
  score: number;
  tier: number;
  excludeReason?: string;
  collectionMode?: CollectionMode;
}

export interface NaverMapEnrichmentRow {
  id: string;
  name: string;
  change_name_to: string;
  address: string;
  search_strategy: SearchStrategy | "";
  search_query: string;
  research_query: string;
  matched_title: string;
  matched_category: string;
  matched_address: string;
  matched_place_url: string;
  confidence: ConfidenceLevel;
  needs_check: string;
  mismatch_reason: string;
  scraped_phone: string;
  scraped_homepage_url: string;
  scraped_avg_score: string;
  scraped_difficulty: string;
  scraped_difficulty_text: string;
  reservation_available: string;
  scraped_price_text: string;
  scraped_price_min: string;
  scraped_price_max: string;
  scraped_price_type: string;
  scraped_price_checked_at: string;
  note: string;
}

export const NAVER_MAP_ENRICHMENT_HEADERS: (keyof NaverMapEnrichmentRow)[] = [
  "id",
  "name",
  "change_name_to",
  "address",
  "search_strategy",
  "search_query",
  "research_query",
  "matched_title",
  "matched_category",
  "matched_address",
  "matched_place_url",
  "confidence",
  "needs_check",
  "mismatch_reason",
  "scraped_phone",
  "scraped_homepage_url",
  "scraped_avg_score",
  "scraped_difficulty",
  "scraped_difficulty_text",
  "reservation_available",
  "scraped_price_text",
  "scraped_price_min",
  "scraped_price_max",
  "scraped_price_type",
  "scraped_price_checked_at",
  "note",
];

export function emptyEnrichmentRow(
  input: Pick<EnrichmentInputRow, "id" | "name" | "change_name_to" | "address">,
): NaverMapEnrichmentRow {
  return {
    id: input.id,
    name: input.name,
    change_name_to: input.change_name_to,
    address: input.address,
    search_strategy: "",
    search_query: "",
    research_query: "",
    matched_title: "",
    matched_category: "",
    matched_address: "",
    matched_place_url: "",
    confidence: "",
    needs_check: "",
    mismatch_reason: "",
    scraped_phone: "",
    scraped_homepage_url: "",
    scraped_avg_score: "",
    scraped_difficulty: "",
    scraped_difficulty_text: "",
    reservation_available: "",
    scraped_price_text: "",
    scraped_price_min: "",
    scraped_price_max: "",
    scraped_price_type: "",
    scraped_price_checked_at: "",
    note: "",
  };
}

export function enrichmentRowToCells(row: NaverMapEnrichmentRow): string[] {
  return NAVER_MAP_ENRICHMENT_HEADERS.map((header) => row[header] ?? "");
}
