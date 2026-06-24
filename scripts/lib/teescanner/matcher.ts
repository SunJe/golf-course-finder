import { nameSimilarity } from "../naverMapEnrichment/placeMatcher";
import type {
  TeescannerConfidence,
  TeescannerInputRow,
  TeescannerMatchResult,
  TeescannerSearchCandidate,
} from "./types";

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function extractDistrictTokens(address: string): string[] {
  return address
    .split(/\s+/)
    .map((part) => part.replace(/[,\d].*$/, "").trim())
    .filter((part) => /(시|군|구)$/.test(part));
}

function extractRegionHints(address: string): string[] {
  const hints: string[] = [];
  const metro = [
    "서울",
    "경기",
    "인천",
    "부산",
    "대구",
    "대전",
    "광주",
    "울산",
    "세종",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
  ];
  for (const token of metro) {
    if (address.includes(token)) hints.push(token);
  }
  hints.push(...extractDistrictTokens(address));
  return [...new Set(hints.map(normalizeText))].filter(Boolean);
}

function bestNameSimilarity(
  title: string,
  referenceNames: string[],
): number {
  let best = 0;
  for (const ref of referenceNames) {
    if (!ref.trim()) continue;
    best = Math.max(best, nameSimilarity(title, ref));
  }
  return best;
}

function regionMatchScore(
  candidate: TeescannerSearchCandidate,
  address: string,
): number {
  const hints = extractRegionHints(address);
  if (hints.length === 0) return 0;

  const haystack = normalizeText(`${candidate.title} ${candidate.region}`);
  let score = 0;
  for (const hint of hints) {
    if (haystack.includes(hint)) score += 15;
  }
  return Math.min(score, 30);
}

function coreTokenMatch(
  title: string,
  referenceNames: string[],
): boolean {
  for (const ref of referenceNames) {
    const core = normalizeText(
      ref.replace(/\([^)]*\)/g, "").replace(/(cc|gc|골프장|컨트리클럽|골프클럽)/giu, ""),
    );
    const normTitle = normalizeText(title);
    if (core.length >= 2 && normTitle.includes(core)) return true;
  }
  return false;
}

function resolveConfidence(
  bestScore: number,
  secondScore: number,
  nameSim: number,
  regionScore: number,
  candidateCount: number,
  coreMatched: boolean,
): TeescannerConfidence {
  if (
    coreMatched &&
    regionScore >= 15 &&
    (candidateCount === 1 || bestScore - secondScore >= 20)
  ) {
    return "high";
  }

  if (nameSim >= 0.85 && regionScore >= 15 && candidateCount <= 2) {
    return "high";
  }

  if (nameSim >= 0.7 && regionScore >= 10 && candidateCount <= 3) {
    return "medium";
  }

  if (nameSim >= 0.55 && regionScore >= 5) {
    return "medium";
  }

  return "low";
}

export function matchTeescannerCandidates(
  course: TeescannerInputRow,
  candidates: TeescannerSearchCandidate[],
): TeescannerMatchResult {
  if (candidates.length === 0) {
    return {
      candidate: null,
      confidence: "low",
      matchScore: 0,
      candidateCount: 0,
      needsCheck: true,
    };
  }

  const referenceNames = [course.change_name_to, course.name].filter(Boolean);

  const scored = candidates
    .map((candidate) => {
      const nameSim = bestNameSimilarity(candidate.title, referenceNames);
      const regionScore = regionMatchScore(candidate, course.address);
      const matchScore = Math.round(nameSim * 100 + regionScore);
      return { candidate, nameSim, regionScore, matchScore };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const best = scored[0];
  const second = scored[1];
  const coreMatched = coreTokenMatch(best.candidate.title, referenceNames);
  const confidence = resolveConfidence(
    best.matchScore,
    second?.matchScore ?? 0,
    best.nameSim,
    best.regionScore,
    candidates.length,
    coreMatched,
  );

  const needsCheck =
    confidence === "low" ||
    (confidence === "medium" && candidates.length > 1) ||
    /\(대중제\)|\(회원제\)|대중|회원/i.test(
      `${course.name} ${course.change_name_to}`,
    );

  return {
    candidate: best.candidate,
    confidence,
    matchScore: best.matchScore,
    candidateCount: candidates.length,
    needsCheck,
  };
}
