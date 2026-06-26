const NAME_SUFFIX_PATTERN =
  /(?:골프\s*클럽\s*&\s*리조트|골프클럽&리조트|골프클럽앤리조트|골프\s*클럽\s*앤\s*리조트|컨트리클럽|골프클럽|골프\s*클럽|골프장|리조트|클럽|cc|c\.c\.?|gc|g\.c\.?)$/gi;

const ALIAS_REPLACEMENTS: Array<[RegExp, string]> = [
  [/제이\s*퍼블릭/gi, "jpublic"],
  [/j[\s-]*public/gi, "jpublic"],
  [/퍼블릭/gi, "public"],
  [/앤/gi, "and"],
  [/&/g, "and"],
];

const REGION_ALIASES: Record<string, string> = {
  서울특별시: "서울",
  서울시: "서울",
  부산광역시: "부산",
  부산시: "부산",
  대구광역시: "대구",
  대구시: "대구",
  인천광역시: "인천",
  인천시: "인천",
  광주광역시: "광주",
  광주시: "광주",
  대전광역시: "대전",
  대전시: "대전",
  울산광역시: "울산",
  울산시: "울산",
  세종특별자치시: "세종",
  세종시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
  제주도: "제주",
};

export function normalizeGolfCourseName(input: string): string {
  let value = input.trim();
  for (const [pattern, replacement] of ALIAS_REPLACEMENTS) {
    value = value.replace(pattern, replacement);
  }

  value = value
    .replace(/\([^)]*\)/g, "")
    .replace(/[\[\]{}]/g, "")
    .replace(NAME_SUFFIX_PATTERN, "")
    .replace(/[^0-9a-zA-Z가-힣]/g, "")
    .toLowerCase();

  return value.trim();
}

export function normalizeAddressText(input: string): string {
  let value = input.trim();
  for (const [from, to] of Object.entries(REGION_ALIASES)) {
    value = value.replaceAll(from, to);
  }

  return value
    .replace(/\([^)]*\)/g, "")
    .replace(/[\[\]{}]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export interface ParsedAddressParts {
  region?: string;
  city?: string;
  district?: string;
  tokens: string[];
}

export function parseAddressParts(
  address: string,
  regionHint?: string,
  cityHint?: string,
): ParsedAddressParts {
  const normalized = normalizeAddressText(address);
  const tokens = normalized.match(/[가-힣]+|\d+/g) ?? [];

  const region =
    regionHint?.trim() ||
    tokens.find((token) =>
      Object.values(REGION_ALIASES).includes(token) ||
      Object.keys(REGION_ALIASES).some((key) => normalizeAddressText(key) === token),
    );

  const city =
    cityHint?.replace(/\s+/g, "") ||
    tokens.find((token) => /(시|군|구)$/.test(token));

  const district = tokens.find((token) => /(읍|면|동|리)$/.test(token));

  return { region: region?.replace(/\s+/g, ""), city, district, tokens };
}

export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function fuzzyNameScore(a: string, b: string): number {
  const left = normalizeGolfCourseName(a);
  const right = normalizeGolfCourseName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    const shorter = Math.min(left.length, right.length);
    const longer = Math.max(left.length, right.length);
    return shorter / longer;
  }

  const maxLen = Math.max(left.length, right.length);
  return 1 - levenshteinDistance(left, right) / maxLen;
}

export function addressOverlapScore(
  courseAddress: string,
  courseRegion?: string,
  courseCity?: string,
  visitAddr1?: string,
  visitAddr2?: string,
): number {
  const courseParts = parseAddressParts(courseAddress, courseRegion, courseCity);
  const visitParts = parseAddressParts(
    `${visitAddr1 ?? ""} ${visitAddr2 ?? ""}`.trim(),
  );

  const courseNormalized = normalizeAddressText(courseAddress);
  const visitNormalized = normalizeAddressText(
    `${visitAddr1 ?? ""}${visitAddr2 ?? ""}`,
  );

  if (courseNormalized && visitNormalized) {
    if (courseNormalized === visitNormalized) return 1;
    if (
      courseNormalized.includes(visitNormalized) ||
      visitNormalized.includes(courseNormalized)
    ) {
      return 0.85;
    }
  }

  let score = 0;
  if (courseParts.region && visitParts.region && courseParts.region === visitParts.region) {
    score += 0.35;
  }
  if (courseParts.city && visitParts.city && courseParts.city === visitParts.city) {
    score += 0.35;
  }
  if (
    courseParts.district &&
    visitParts.district &&
    courseParts.district === visitParts.district
  ) {
    score += 0.2;
  }

  if (courseRegion?.trim()) {
    const regionToken = normalizeAddressText(courseRegion);
    if (regionToken && visitNormalized.includes(regionToken)) score += 0.25;
  }
  if (courseCity?.trim()) {
    const cityToken = normalizeAddressText(courseCity).replace(/(시|군|구)$/, "");
    if (cityToken && visitNormalized.includes(cityToken)) score += 0.3;
  }

  const sharedTokens = courseParts.tokens.filter((token) =>
    visitParts.tokens.includes(token),
  );
  if (sharedTokens.length >= 2) score += 0.1;
  if (sharedTokens.length >= 4) score += 0.1;

  return Math.min(score, 1);
}
