import type { Course } from "@/types/course";
import { normalizeCourseNameForMapSearch } from "@/lib/mapSearchName";

/** 검색어·텍스트 비교용 정규화 (공백·기호·대소문자) */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[().·\-_/（）[\]]/g, "");
}

export type SearchMatchReason =
  | "name_exact"
  | "name_starts_with"
  | "name_contains"
  | "alias_contains"
  | "address_contains"
  | "city_exact"
  | "city_contains"
  | "region_contains"
  | "fuzzy_name";

export interface SearchMatchResult {
  matched: boolean;
  reason?: SearchMatchReason;
  score: number;
}

const ADDRESS_TOKEN_SPLIT = /[\s,，·\-_/()（）[\]]+/;

function countQueryChars(query: string): number {
  return [...query].length;
}

function getCourseAliases(course: Course): string[] {
  const aliases = new Set<string>();
  const parenFree = normalizeCourseNameForMapSearch(course.name);
  if (parenFree) aliases.add(parenFree);
  for (const tag of course.tags) {
    const trimmed = tag.trim();
    if (trimmed) aliases.add(trimmed);
  }
  return [...aliases];
}

/** 주소는 토큰(단어) 단위로만 매칭 — `경기도`+`고양시` 합쳐진 `도고` 오매칭 방지 */
function addressTokenContainsQuery(address: string, normalizedQuery: string): boolean {
  if (!address.trim() || !normalizedQuery) return false;
  return address
    .split(ADDRESS_TOKEN_SPLIT)
    .map((token) => normalizeSearchText(token))
    .some((token) => token.length > 0 && token.includes(normalizedQuery));
}

function fuzzyNameMatches(name: string, normalizedQuery: string): boolean {
  if (countQueryChars(normalizedQuery) < 3) return false;
  if (Math.abs(name.length - normalizedQuery.length) > 2) return false;

  let mismatches = 0;
  const maxLen = Math.max(name.length, normalizedQuery.length);
  for (let index = 0; index < maxLen; index += 1) {
    if (name[index] !== normalizedQuery[index]) {
      mismatches += 1;
      if (mismatches > 1) return false;
    }
  }
  return mismatches <= 1;
}

export function matchCourseSearch(
  course: Course,
  rawQuery: string,
): SearchMatchResult {
  const normalizedQuery = normalizeSearchText(rawQuery.trim());
  if (!normalizedQuery) {
    return { matched: true, score: 0 };
  }

  const normalizedName = normalizeSearchText(course.name);
  const normalizedCity = normalizeSearchText(course.city);
  const normalizedRegion = normalizeSearchText(course.region);
  const aliases = getCourseAliases(course)
    .map((alias) => normalizeSearchText(alias))
    .filter((alias) => alias && alias !== normalizedName);

  if (normalizedName === normalizedQuery) {
    return { matched: true, reason: "name_exact", score: 100 };
  }
  if (normalizedName.startsWith(normalizedQuery)) {
    return { matched: true, reason: "name_starts_with", score: 80 };
  }
  if (normalizedName.includes(normalizedQuery)) {
    return { matched: true, reason: "name_contains", score: 60 };
  }

  const aliasHit = aliases.find((alias) => alias.includes(normalizedQuery));
  if (aliasHit) {
    return { matched: true, reason: "alias_contains", score: 55 };
  }

  const isShortQuery = countQueryChars(normalizedQuery) <= 2;

  if (addressTokenContainsQuery(course.address, normalizedQuery)) {
    return { matched: true, reason: "address_contains", score: 20 };
  }

  if (!isShortQuery) {
    if (normalizedCity === normalizedQuery) {
      return { matched: true, reason: "city_exact", score: 45 };
    }
    if (normalizedCity.includes(normalizedQuery)) {
      return { matched: true, reason: "city_contains", score: 40 };
    }
    if (normalizedRegion.includes(normalizedQuery)) {
      return { matched: true, reason: "region_contains", score: 35 };
    }

    if (fuzzyNameMatches(normalizedName, normalizedQuery)) {
      return { matched: true, reason: "fuzzy_name", score: 15 };
    }
  }

  return { matched: false, score: 0 };
}

export function courseMatchesSearchQuery(course: Course, query: string): boolean {
  return matchCourseSearch(course, query).matched;
}

export interface SearchDebugEntry {
  id: string;
  name: string;
  reason: SearchMatchReason;
  score: number;
}

/** 개발 모드 콘솔 디버그용 — 상위 N개 매칭 이유 */
export function debugSearchMatches(
  courses: Course[],
  query: string,
  limit = 20,
): SearchDebugEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return courses
    .map((course) => {
      const result = matchCourseSearch(course, trimmed);
      return {
        id: course.id,
        name: course.name,
        reason: result.reason,
        score: result.score,
        matched: result.matched,
      };
    })
    .filter(
      (entry): entry is SearchDebugEntry & { matched: true } =>
        entry.matched && entry.reason != null,
    )
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "ko"))
    .slice(0, limit)
    .map(({ id, name, reason, score }) => ({ id, name, reason, score }));
}
