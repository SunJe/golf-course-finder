import type { GeocodingInputRow } from "./geocodingUtils";
import { isValidWgs84Coordinate } from "./geocodingUtils";

export type GeocodingStatus =
  | "success"
  | "no_result"
  | "low_confidence"
  | "multiple_candidates"
  | "api_error"
  | "skipped";

export interface GeocodeCandidate {
  latitude: number;
  longitude: number;
  matchedAddress: string;
  rawPlaceName: string;
  roadAddress: string;
}

export interface ConfidenceAssessment {
  score: number;
  status: GeocodingStatus;
  note: string;
  isAmbiguousAmongCandidates: boolean;
}

const REGION_HINTS: Record<string, string[]> = {
  서울: ["서울"],
  경기: ["경기", "인천"],
  강원: ["강원", "춘천", "원주", "강릉", "속초", "평창", "횡성", "홍천", "양양"],
  충청: ["충청", "충북", "충남", "대전", "세종", "청주", "천안", "충주", "보령"],
  전라: ["전라", "전북", "전남", "광주", "전주", "익산", "군산", "여수", "순천", "나주"],
  경상: ["경상", "경북", "경남", "부산", "대구", "울산", "포항", "창원", "김해", "경주", "사천"],
  제주: ["제주"],
};

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function stringsOverlap(a: string, b: string, minLen = 4): boolean {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;

  for (let len = Math.min(na.length, nb.length); len >= minLen; len -= 1) {
    for (let i = 0; i <= na.length - len; i += 1) {
      const slice = na.slice(i, i + len);
      if (nb.includes(slice)) return true;
    }
  }
  return false;
}

function placeNameSimilarity(name: string, placeName: string): boolean {
  if (!placeName.trim()) return false;
  if (stringsOverlap(name, placeName, 3)) return true;

  const tokens = name.split(/\s+/).filter((t) => t.length >= 2);
  return tokens.some((token) => placeName.includes(token));
}

function regionMatches(region: string, text: string): boolean {
  const hints = REGION_HINTS[region] ?? [];
  return hints.some((hint) => text.includes(hint));
}

export function scoreCandidate(
  row: GeocodingInputRow,
  candidate: GeocodeCandidate,
): number {
  let score = 0;
  const addressText = `${candidate.matchedAddress} ${candidate.roadAddress}`;

  if (isValidWgs84Coordinate(candidate.latitude, candidate.longitude)) {
    score += 20;
  }
  if (regionMatches(row.region, addressText)) {
    score += 20;
  }
  if (row.city && addressText.includes(row.city.replace(/(시|군|구)$/, ""))) {
    score += 20;
  } else if (row.city && addressText.includes(row.city)) {
    score += 20;
  }
  if (placeNameSimilarity(row.name, candidate.rawPlaceName)) {
    score += 30;
  }
  if (
    stringsOverlap(row.address, candidate.matchedAddress) ||
    stringsOverlap(row.address, candidate.roadAddress)
  ) {
    score += 20;
  }

  return score;
}

export function assessCandidates(
  row: GeocodingInputRow,
  candidates: GeocodeCandidate[],
): ConfidenceAssessment {
  if (candidates.length === 0) {
    return { score: 0, status: "no_result", note: "API 결과 0건", isAmbiguousAmongCandidates: false };
  }

  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(row, candidate),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const second = scored[1];

  if (
    scored.length > 1 &&
    second &&
    best.score >= 40 &&
    best.score - second.score < 10
  ) {
    return {
      score: best.score,
      status: "multiple_candidates",
      note: `후보 ${scored.length}건, top=${best.score} vs next=${second.score}`,
      isAmbiguousAmongCandidates: true,
    };
  }

  if (best.score >= 70) {
    return {
      score: best.score,
      status: "success",
      note: `confidence=${best.score}`,
      isAmbiguousAmongCandidates: false,
    };
  }

  if (best.score >= 40) {
    return {
      score: best.score,
      status: "low_confidence",
      note: `confidence=${best.score} (<70)`,
      isAmbiguousAmongCandidates: false,
    };
  }

  return {
    score: best.score,
    status: "no_result",
    note: `confidence=${best.score} (<40)`,
    isAmbiguousAmongCandidates: false,
  };
}

export function pickBestCandidate(
  row: GeocodingInputRow,
  candidates: GeocodeCandidate[],
): { candidate: GeocodeCandidate | null; assessment: ConfidenceAssessment } {
  if (candidates.length === 0) {
    return { candidate: null, assessment: assessCandidates(row, candidates) };
  }

  const scored = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(row, candidate),
    }))
    .sort((a, b) => b.score - a.score);

  const assessment = assessCandidates(row, candidates);
  if (assessment.status === "no_result") {
    return { candidate: null, assessment };
  }

  return { candidate: scored[0].candidate, assessment };
}
