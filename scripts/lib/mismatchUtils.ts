import type { NaverPriceCandidateRow } from "./naverPriceCandidates";

const MISMATCH_REASON_PATTERNS = [
  /동명이인/i,
  /불일치/i,
  /블로그/i,
  /광고/i,
  /약함/i,
  /ambiguous/i,
  /주소 확인/i,
  /이름 일부만/i,
];

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function extractRegionTokens(address: string): Set<string> {
  const tokens = new Set<string>();
  const parts = address.split(/\s+/).filter(Boolean);
  for (const part of parts.slice(0, 3)) {
    const cleaned = part.replace(/(특별자치도|특별시|광역시|시|군|구)$/u, "");
    if (cleaned.length >= 2) tokens.add(cleaned);
  }
  return tokens;
}

export function addressesLikelyMismatch(
  masterAddress: string,
  candidateAddress: string,
): boolean {
  const master = masterAddress.trim();
  const candidate = candidateAddress.trim();
  if (!master || !candidate) return false;

  const masterTokens = extractRegionTokens(master);
  const candidateTokens = extractRegionTokens(candidate);
  if (masterTokens.size === 0 || candidateTokens.size === 0) return false;

  for (const token of masterTokens) {
    if (candidate.includes(token)) return false;
  }
  return true;
}

export function titlesLikelyMismatch(name: string, candidateTitle: string): boolean {
  const masterNorm = normalizeName(name);
  const titleNorm = normalizeName(candidateTitle);
  if (!masterNorm || !titleNorm) return false;
  if (masterNorm === titleNorm) return false;
  if (masterNorm.includes(titleNorm) || titleNorm.includes(masterNorm)) {
    return false;
  }
  const masterCore = masterNorm.replace(/(cc|gc|골프장|컨트리클럽|골프클럽)/gu, "");
  const titleCore = titleNorm.replace(/(cc|gc|골프장|컨트리클럽|골프클럽)/gu, "");
  if (masterCore && titleCore && (masterCore.includes(titleCore) || titleCore.includes(masterCore))) {
    return false;
  }
  return true;
}

export interface MismatchAssessment {
  suspectedMismatch: boolean;
  mismatchReason: string;
  reviewPriority: number;
}

export function assessMismatch(row: {
  name: string;
  address: string;
  candidate_title: string;
  candidate_address: string;
  candidate_confidence: string;
  candidate_price_text: string;
  reason: string;
}): MismatchAssessment {
  const reasons: string[] = [];
  const confidence = row.candidate_confidence.trim();

  if (confidence === "low") {
    reasons.push("low confidence");
  }

  const reasonText = row.reason.trim();
  for (const pattern of MISMATCH_REASON_PATTERNS) {
    if (pattern.test(reasonText)) {
      reasons.push(`reason: ${pattern.source}`);
      break;
    }
  }

  const addressMismatch = addressesLikelyMismatch(
    row.address,
    row.candidate_address,
  );
  if (addressMismatch && confidence !== "high") {
    reasons.push("address region mismatch");
  }

  const titleMismatch = titlesLikelyMismatch(row.name, row.candidate_title);
  if (titleMismatch && confidence !== "high") {
    reasons.push("title differs from course name");
  }

  if (
    row.candidate_price_text.trim() &&
    confidence === "low"
  ) {
    reasons.push("price present but low confidence");
  }

  const suspectedMismatch =
    confidence === "low" ||
    reasons.some((reason) => reason.startsWith("reason:")) ||
    (addressMismatch && confidence === "medium") ||
    (titleMismatch && confidence === "low");

  let reviewPriority = 100;
  if (suspectedMismatch) reviewPriority = 0;
  else if (confidence === "medium") reviewPriority = 20;
  else reviewPriority = 90;

  return {
    suspectedMismatch,
    mismatchReason: reasons.join("; "),
    reviewPriority,
  };
}

/** Stricter check for batch stop conditions (avoid false stops on normal CC/GC name variants). */
export function isSeriousBatchMismatch(row: NaverPriceCandidateRow): boolean {
  if (row.candidate_confidence === "low") return true;
  const reasonText = row.reason.trim();
  if (/동명이인|불일치|블로그|광고|이름 일부만/i.test(reasonText)) return true;
  if (
    row.candidate_confidence === "medium" &&
    addressesLikelyMismatch(row.address, row.candidate_address)
  ) {
    return true;
  }
  return false;
}

export function assessCandidateMismatch(
  row: NaverPriceCandidateRow,
): MismatchAssessment {
  return assessMismatch({
    name: row.name,
    address: row.address,
    candidate_title: row.candidate_title,
    candidate_address: row.candidate_address,
    candidate_confidence: row.candidate_confidence,
    candidate_price_text: row.candidate_price_text,
    reason: row.reason,
  });
}

export function computeReviewSortKey(input: {
  suspectedMismatch: boolean;
  candidate_confidence: string;
  candidate_phone: string;
  candidate_homepage_url: string;
  address: string;
  candidate_address: string;
  name: string;
  candidate_title: string;
  candidate_price_text: string;
  reviewPriority: number;
}): number {
  let score = input.reviewPriority;
  if (input.suspectedMismatch) score -= 1000;
  if (input.candidate_confidence === "low") score -= 500;
  if (!input.candidate_phone.trim()) score -= 100;
  if (!input.candidate_homepage_url.trim()) score -= 50;
  if (
    input.candidate_address.trim() &&
    input.address.trim() &&
    input.candidate_address.trim() !== input.address.trim()
  ) {
    score -= 40;
  }
  if (
    input.candidate_title.trim() &&
    normalizeName(input.name) !== normalizeName(input.candidate_title)
  ) {
    score -= 30;
  }
  if (
    input.candidate_price_text.trim() &&
    input.candidate_confidence === "low"
  ) {
    score -= 20;
  }
  return score;
}
