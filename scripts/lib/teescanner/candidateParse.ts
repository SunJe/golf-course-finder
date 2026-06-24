import {
  isLikelyCourseTitleToken,
  isLikelySubregionToken,
  parseRegionBreadcrumb,
} from "./regionParse";

const REGION_LINE =
  /(서울|경기|인천|부산|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주|경상)[^\n|>]*>\s*[^\s\d.]+/;

function normalizeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export type ParsedCandidateFields = {
  title: string;
  region: string;
  rating: string;
  rawText: string;
  candidateRegion: string;
  candidateSubregion: string;
  candidateType: string;
};

function pickTitleToken(tokens: string[], queryLower: string): string {
  const courseTokens = tokens.filter(isLikelyCourseTitleToken);
  const pool = courseTokens.length > 0 ? courseTokens : tokens;

  const queryMatch = pool.find((token) => {
    const lower = token.toLowerCase();
    return lower.includes(queryLower) && !isLikelySubregionToken(token);
  });
  if (queryMatch) return queryMatch;

  const nonSubregion = pool.find((token) => !isLikelySubregionToken(token));
  if (nonSubregion) return nonSubregion;

  return pool[0] ?? "";
}

export function parseCandidateFields(
  query: string,
  rawText: string,
): ParsedCandidateFields {
  const normalized = normalizeLine(rawText.replace(/\n+/g, " "));
  const withoutSelect = normalized
    .replace(/골프장\s*선택/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const regionMatch = withoutSelect.match(REGION_LINE);
  const region = regionMatch?.[0]?.trim() ?? "";
  const breadcrumb = parseRegionBreadcrumb(region);
  const ratingMatch = withoutSelect.match(/\b(\d+(?:\.\d+)?)\b/);
  const rating = ratingMatch?.[1] ?? "";

  const queryLower = query.trim().toLowerCase();
  let title = "";

  if (region) {
    const beforeRegion = withoutSelect.split(region)[0]?.trim() ?? "";
    const tokens = beforeRegion
      .split(/\s+/)
      .filter((token) => token && token !== rating);
    title = pickTitleToken(tokens, queryLower);
  }

  if (!title) {
    const tokens = withoutSelect
      .split(/\s+/)
      .filter((token) => token && !/^[\d.]+$/.test(token));
    title = pickTitleToken(tokens, queryLower);
  }

  title = normalizeLine(title.replace(/\b\d+(?:\.\d+)?\b/g, "").trim());

  if (!title || isLikelySubregionToken(title)) {
    const fallbackTokens = withoutSelect
      .split(/\s+/)
      .filter((token) => isLikelyCourseTitleToken(token));
    title = fallbackTokens[0] ?? title;
  }

  if (!title || isLikelySubregionToken(title)) {
    title = query.trim();
  }

  const typeFromTitle = title.match(/\(([PM])\)\s*$/i);
  const candidateType =
    breadcrumb.candidateType || typeFromTitle?.[1]?.toUpperCase() || "";

  return {
    title,
    region,
    rating,
    rawText: normalized,
    candidateRegion: breadcrumb.candidateRegion,
    candidateSubregion: breadcrumb.candidateSubregion,
    candidateType,
  };
}
