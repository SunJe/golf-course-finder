const GENERIC_ALIAS_BLOCKLIST = new Set([
  "골프",
  "골프장",
  "컨트리클럽",
  "골프클럽",
  "cc",
  "gc",
  "대중제",
  "회원제",
  "퍼블릭",
  "리조트",
]);

const MAX_ALIASES = 6;

export function stripGolfCourseSuffixForAlias(input: string): string {
  return input
    .replace(/\((?:회원제|퍼블릭|대중제|일반|예약제|public|member|P|M)\)/gi, "")
    .replace(/\([^)]*(?:대중제|회원제|퍼블릭|대중형|회원)[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\s*(?:골프\s*클럽\s*&\s*리조트|골프클럽&리조트|골프클럽앤리조트|골프\s*클럽\s*앤\s*리조트)$/i,
      "",
    )
    .replace(/\s*(?:컨트리클럽|골프클럽|골프\s*클럽|골프장|리조트)$/i, "")
    .replace(/\s*(?:C\.?C\.?|G\.?C\.?)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripMembershipParens(input: string): string {
  return input
    .replace(/\((?:회원제|퍼블릭|대중제|일반|예약제|public|member|P|M)\)/gi, "")
    .replace(/\([^)]*(?:대중제|회원제|퍼블릭|대중형|회원)[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isBlockedAlias(value: string): boolean {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
  if (!normalized) return true;
  return GENERIC_ALIAS_BLOCKLIST.has(normalized);
}

function pushUnique(target: string[], seen: Set<string>, value: string): void {
  const trimmed = value.trim();
  if (!trimmed || isBlockedAlias(trimmed)) return;
  const key = trimmed.toLowerCase().replace(/\s+/g, "");
  if (seen.has(key)) return;
  seen.add(key);
  target.push(trimmed);
}

/**
 * 공식명·검색 별칭 목록 (최대 6개).
 * 별칭 전용 URL/페이지는 만들지 않고 metadata·검색·JSON-LD에 사용합니다.
 */
export function buildCourseNameAliases(input: {
  name: string;
  changeNameTo?: string | null;
}): string[] {
  const name = input.name.trim();
  const sourceName = (input.changeNameTo?.trim() || name).trim();
  if (!sourceName) return [];

  const officialName = stripMembershipParens(sourceName);
  const base = stripGolfCourseSuffixForAlias(officialName);
  const variants = [
    officialName,
    base ? `${base}CC` : "",
    base ? `${base}GC` : "",
    base ? `${base}컨트리클럽` : "",
    base ? `${base}골프클럽` : "",
    base ? `${base}골프장` : "",
  ];

  const aliases: string[] = [];
  const seen = new Set<string>();
  for (const variant of variants) {
    pushUnique(aliases, seen, variant);
    if (aliases.length >= MAX_ALIASES) break;
  }

  return aliases;
}

/** DB·mapper에 미리 계산된 alias가 있으면 우선 사용 */
export function resolveCourseSearchAliases(course: {
  name: string;
  changeNameTo?: string | null;
  searchAliases?: string[];
}): string[] {
  if (course.searchAliases && course.searchAliases.length > 0) {
    return course.searchAliases;
  }
  return buildCourseNameAliases({
    name: course.name,
    changeNameTo: course.changeNameTo,
  });
}

/** meta description용 — 공식명 뒤에 별칭 2개까지 괄호 표기 */
export function formatAliasesForMetaDescription(
  officialName: string,
  aliases: string[],
): string {
  const others = aliases
    .filter((alias) => alias.trim() && alias !== officialName)
    .slice(0, 2);
  if (others.length === 0) return officialName;
  return `${officialName}(${others.join(", ")})`;
}

/** 상세 본문용 — 공식명 제외 별칭 3개까지 */
export function formatAliasesForBodyText(aliases: string[]): string {
  const others = aliases.slice(1, 4);
  return others.join(", ");
}
