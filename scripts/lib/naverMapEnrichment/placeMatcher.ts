import type {
  CollectionMode,
  PlaceCandidate,
  ScoredPlaceCandidate,
} from "./types";

/** full 수집 허용 category */
export const ALLOWED_GOLF_CATEGORIES = [
  "퍼블릭골프장",
  "회원제골프장",
  "골프장코스",
  "컨트리클럽",
  "골프클럽",
  "골프장",
] as const;

/** phone/homepage limited fallback 전용 category */
export const CLUBHOUSE_FALLBACK_CATEGORIES = ["클럽하우스"] as const;

/** full 수집 금지 category (클럽하우스는 fallback 전용이라 여기 포함하지 않음) */
export const DENIED_GOLF_CATEGORIES = [
  "골프연습장",
  "스크린골프",
  "골프용품",
  "음식점",
  "음식",
  "양식",
  "카페",
  "은행",
  "atm",
  "주차장",
  "주차",
  "전기차충전",
  "충전소",
  "숙박",
  "콘도",
  "리조트",
  "드라이빙",
  "연습장",
  "스크린",
  "현금인출",
  "인출기",
  "골프웨어",
  "스포츠시설",
  "기업",
  "호텔",
] as const;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function containsAny(text: string, keywords: readonly string[]): boolean {
  const norm = normalizeText(text);
  return keywords.some((keyword) => norm.includes(normalizeText(keyword)));
}

export function nameSimilarity(a: string, b: string): number {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;
  if (normA.includes(normB) || normB.includes(normA)) return 0.85;

  const coreA = normA.replace(/(cc|gc|골프장|컨트리클럽|골프클럽)/gu, "");
  const coreB = normB.replace(/(cc|gc|골프장|컨트리클럽|골프클럽)/gu, "");
  if (coreA && coreB && (coreA.includes(coreB) || coreB.includes(coreA))) {
    return 0.75;
  }

  const shorter = normA.length <= normB.length ? normA : normB;
  const longer = normA.length <= normB.length ? normB : normA;
  let matches = 0;
  for (let i = 0; i < shorter.length; i += 1) {
    if (longer.includes(shorter.slice(i, i + 3))) matches += 1;
  }
  return matches / Math.max(shorter.length, 1);
}

/** 네이버 category가 full 수집 골프장 계열인지 */
export function isAllowedGolfCategory(category: string): boolean {
  const trimmed = category.trim();
  if (!trimmed) return false;
  if (containsAny(trimmed, DENIED_GOLF_CATEGORIES)) return false;
  if (containsAny(trimmed, CLUBHOUSE_FALLBACK_CATEGORIES)) return false;
  return containsAny(trimmed, ALLOWED_GOLF_CATEGORIES);
}

/** 클럽하우스 limited fallback category인지 */
export function isClubhouseCategory(category: string): boolean {
  const trimmed = category.trim();
  if (!trimmed) return false;
  if (containsAny(trimmed, DENIED_GOLF_CATEGORIES)) return false;
  if (containsAny(trimmed, ALLOWED_GOLF_CATEGORIES)) return false;
  return containsAny(trimmed, CLUBHOUSE_FALLBACK_CATEGORIES);
}

function categoryTier(category: string): number {
  if (/퍼블릭골프장|회원제골프장/.test(category)) return 1;
  if (/골프장코스|컨트리클럽|골프클럽/.test(category)) return 2;
  if (/골프장/.test(category)) return 3;
  return 4;
}

function bestNameSimilarity(title: string, referenceNames: string[]): number {
  let best = 0;
  for (const ref of referenceNames) {
    if (!ref.trim()) continue;
    best = Math.max(best, nameSimilarity(title, ref));
  }
  return best;
}

function addressBoost(title: string, courseAddress: string): number {
  if (!courseAddress.trim()) return 0;
  const addrTokens = courseAddress
    .split(/\s+/)
    .slice(0, 3)
    .map((t) => normalizeText(t.replace(/(시|군|구|특별시|광역시)$/u, "")))
    .filter((t) => t.length >= 2);
  const normTitle = normalizeText(title);
  for (const token of addrTokens) {
    if (normTitle.includes(token)) return 15;
  }
  return 0;
}

export function scorePlaceCandidate(
  candidate: PlaceCandidate,
  referenceNames: string[],
): ScoredPlaceCandidate {
  const { title, category } = candidate;

  if (!isAllowedGolfCategory(category)) {
    return {
      ...candidate,
      score: -100,
      tier: 99,
      excludeReason: `category_not_golf_course: ${category}`,
    };
  }

  if (containsAny(title, ["atm", "은행365"])) {
    return {
      ...candidate,
      score: -100,
      tier: 99,
      excludeReason: "excluded name pattern",
    };
  }

  let score = 100;
  const tier = categoryTier(category);
  const sim = bestNameSimilarity(title, referenceNames);
  if (sim >= 0.85) score += 25;
  else if (sim >= 0.5) score += 10;

  return { ...candidate, score, tier, collectionMode: "full" };
}

function scoreClubhouseCandidate(
  candidate: PlaceCandidate,
  referenceNames: string[],
  courseAddress: string,
): ScoredPlaceCandidate {
  const { title, category } = candidate;

  if (!isClubhouseCategory(category)) {
    return {
      ...candidate,
      score: -100,
      tier: 99,
      excludeReason: `not_clubhouse: ${category}`,
    };
  }

  if (containsAny(title, ["atm", "은행365"])) {
    return {
      ...candidate,
      score: -100,
      tier: 99,
      excludeReason: "excluded name pattern",
    };
  }

  let score = 50;
  const sim = bestNameSimilarity(title, referenceNames);
  score += sim * 40;
  score += addressBoost(title, courseAddress);

  return { ...candidate, score, tier: 10, collectionMode: "limited_contact_only" };
}

/** 골프장 category 후보만 선택 — 없으면 null */
export function pickBestGolfCandidate(
  candidates: PlaceCandidate[],
  referenceNames: string[],
): ScoredPlaceCandidate | null {
  if (candidates.length === 0) return null;

  const scored = candidates
    .map((candidate) => scorePlaceCandidate(candidate, referenceNames))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.score - a.score;
    });

  return scored[0] ?? null;
}

/** 클럽하우스 limited fallback 후보만 선택 */
export function pickBestClubhouseCandidate(
  candidates: PlaceCandidate[],
  referenceNames: string[],
  courseAddress = "",
): ScoredPlaceCandidate | null {
  if (candidates.length === 0) return null;

  const scored = candidates
    .map((candidate) => scoreClubhouseCandidate(candidate, referenceNames, courseAddress))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0] ?? null;
}

/**
 * 1) golf category full 수집 후보
 * 2) 없으면 클럽하우스 limited fallback 후보
 */
export function pickBestPlaceCandidate(
  candidates: PlaceCandidate[],
  referenceNames: string[],
  courseAddress = "",
): ScoredPlaceCandidate | null {
  const golf = pickBestGolfCandidate(candidates, referenceNames);
  if (golf) return golf;
  return pickBestClubhouseCandidate(candidates, referenceNames, courseAddress);
}

/** skip 기록용 — golf/clubhouse 모두 해당 없는 후보 중 이름 유사도 최상 */
export function pickTopNonGolfCandidate(
  candidates: PlaceCandidate[],
  referenceNames: string[],
): PlaceCandidate | null {
  const rejected = candidates.filter(
    (c) => !isAllowedGolfCategory(c.category) && !isClubhouseCategory(c.category),
  );
  if (rejected.length === 0) return null;

  let best: PlaceCandidate | null = null;
  let bestScore = -1;
  for (const candidate of rejected) {
    const sim = bestNameSimilarity(candidate.title, referenceNames);
    if (sim > bestScore) {
      bestScore = sim;
      best = candidate;
    }
  }
  return best ?? rejected[0];
}

export function confidenceFromMatch(input: {
  searchStrategy: string;
  tier: number;
  referenceNames: string[];
  matchedTitle: string;
  matchedAddress: string;
  courseAddress: string;
}): "high" | "medium" | "low" {
  const { searchStrategy, tier, referenceNames, matchedTitle, courseAddress, matchedAddress } =
    input;

  if (searchStrategy === "clubhouse_fallback") {
    return confidenceFromClubhouseFallback({
      referenceNames,
      matchedTitle,
      courseAddress,
    });
  }

  if (
    (searchStrategy === "address_place" || searchStrategy === "address_title_research") &&
    tier <= 2
  ) {
    return "high";
  }

  let bestSim = 0;
  for (const ref of referenceNames) {
    bestSim = Math.max(bestSim, nameSimilarity(matchedTitle, ref));
  }

  const addressAlign =
    courseAddress.trim() &&
    matchedAddress.trim() &&
    (matchedAddress.includes(courseAddress.split(/\s+/)[0] ?? "") ||
      courseAddress.includes(matchedAddress.split(/\s+/)[0] ?? ""));

  if (bestSim >= 0.75 && addressAlign) return "high";
  if (bestSim >= 0.5 || tier <= 2) return "medium";
  return "low";
}

export function confidenceFromClubhouseFallback(input: {
  referenceNames: string[];
  matchedTitle: string;
  courseAddress: string;
}): "medium" | "low" {
  const sim = bestNameSimilarity(input.matchedTitle, input.referenceNames);
  const addrBoost = addressBoost(input.matchedTitle, input.courseAddress);
  if (sim >= 0.5 || addrBoost > 0) return "medium";
  return "low";
}

export function isLimitedContactMode(
  candidate: ScoredPlaceCandidate | null | undefined,
): boolean {
  return candidate?.collectionMode === "limited_contact_only";
}
