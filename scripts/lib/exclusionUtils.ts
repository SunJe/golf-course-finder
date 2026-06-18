/** 체력단련장/군 골프장은 제외하지 않음 */
const MILITARY_PATTERN = /군\s*골프|체력단련|국방|군체육|군\s*cc/i;

/**
 * 제외 키워드 매칭 — 군 골프장/체력단련장은 제외 대상이 아님
 * @returns 매칭된 키워드 또는 null
 */
export function detectExcludedCategory(
  text: string,
  keywords: string[],
): string | null {
  if (!text.trim()) return null;
  if (MILITARY_PATTERN.test(text)) return null;

  const lower = text.toLowerCase();

  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    if (kw === "군") continue;
    if (lower.includes(kw)) return keyword;
  }

  return null;
}

export function buildRowSearchText(
  record: Record<string, string>,
  extraFields: string[] = [],
): string {
  return [...Object.values(record), ...extraFields].join(" ");
}
