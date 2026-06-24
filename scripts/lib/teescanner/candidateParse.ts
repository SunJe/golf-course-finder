const REGION_LINE =
  /(서울|경기|인천|부산|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^\n|>]*>\s*[^\s\d.]+/;

function normalizeLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function parseCandidateFields(
  query: string,
  rawText: string,
): { title: string; region: string; rating: string; rawText: string } {
  const normalized = normalizeLine(rawText.replace(/\n+/g, " "));
  const withoutSelect = normalized
    .replace(/골프장\s*선택/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const regionMatch = withoutSelect.match(REGION_LINE);
  const region = regionMatch?.[0]?.trim() ?? "";
  const ratingMatch = withoutSelect.match(/\b(\d+(?:\.\d+)?)\b/);
  const rating = ratingMatch?.[1] ?? "";

  const queryLower = query.trim().toLowerCase();
  let title = query.trim();

  if (region) {
    const beforeRegion = withoutSelect.split(region)[0]?.trim() ?? "";
    const tokens = beforeRegion
      .split(/\s+/)
      .filter((token) => token && token !== rating);
    const titleToken =
      tokens.find((token) => token.toLowerCase().includes(queryLower)) ??
      tokens[0];
    if (titleToken) title = titleToken;
  } else {
    const tokens = withoutSelect
      .split(/\s+/)
      .filter((token) => token && !/^[\d.]+$/.test(token));
    const titleToken =
      tokens.find((token) => token.toLowerCase().includes(queryLower)) ??
      tokens[0];
    if (titleToken) title = titleToken;
  }

  title = normalizeLine(title.replace(/\b\d+(?:\.\d+)?\b/g, "").trim()) || query.trim();

  return { title, region, rating, rawText: normalized };
}
