/** 주소 정규화 + 시·도 접두 보정 */

const INVALID_TOKENS = new Set(["nan", "undefined", "null"]);

const REGION_PREFIX: Record<string, string> = {
  서울: "서울특별시",
  경기: "경기도",
  강원: "강원특별자치도",
  제주: "제주특별자치도",
};

/** city → 정확한 시·도 (충청/전라/경상 북·남 구분) */
const CITY_PROVINCE: Record<string, string> = {
  춘천시: "강원특별자치도",
  원주시: "강원특별자치도",
  강릉시: "강원특별자치도",
  속초시: "강원특별자치도",
  충주시: "충청북도",
  청주시: "충청북도",
  제천시: "충청북도",
  음성군: "충청북도",
  진천군: "충청북도",
  증평군: "충청북도",
  천안시: "충청남도",
  아산시: "충청남도",
  보령시: "충청남도",
  서산시: "충청남도",
  논산시: "충청남도",
  계룡시: "충청남도",
  당진시: "충청남도",
  예산군: "충청남도",
  전주시: "전북특별자치도",
  군산시: "전북특별자치도",
  익산시: "전북특별자치도",
  정읍시: "전북특별자치도",
  남원시: "전북특별자치도",
  김제시: "전북특별자치도",
  무주군: "전북특별자치도",
  고창군: "전북특별자치도",
  여수시: "전라남도",
  순천시: "전라남도",
  나주시: "전라남도",
  광양시: "전라남도",
  목포시: "전라남도",
  영암군: "전라남도",
  포항시: "경상북도",
  경주시: "경상북도",
  구미시: "경상북도",
  영천시: "경상북도",
  경산시: "경상북도",
  안동시: "경상북도",
  김천시: "경상북도",
  의성군: "경상북도",
  칠곡군: "경상북도",
  김해시: "경상남도",
  창원시: "경상남도",
  진주시: "경상남도",
  통영시: "경상남도",
  사천시: "경상남도",
  밀양시: "경상남도",
  거제시: "경상남도",
  함안군: "경상남도",
  창녕군: "경상남도",
  양산시: "경상남도",
  하남시: "경기도",
  용인시: "경기도",
  가평군: "경기도",
  이천시: "경기도",
  인천시: "인천광역시",
  제주시: "제주특별자치도",
  서귀포시: "제주특별자치도",
};

const FULL_PROVINCE_PATTERN =
  /^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|제주특별자치도|경기도|강원특별자치도|강원도|충청북도|충청남도|전라북도|전라남도|전북특별자치도|경상북도|경상남도)/;

const ROAD_OR_JIBUN_PATTERN =
  /(로|길|번길|대로|리\s*\d|동\s*\d|\d+\s*-\s*\d+)/;

const PROVINCE_IN_ADDRESS: Array<{ pattern: RegExp; prefix: string }> = [
  { pattern: /경상북도|경북/, prefix: "경상북도" },
  { pattern: /경상남도|경남/, prefix: "경상남도" },
  { pattern: /전라북도|전북특별자치도|전북/, prefix: "전북특별자치도" },
  { pattern: /전라남도|전남/, prefix: "전라남도" },
  { pattern: /충청북도|충북/, prefix: "충청북도" },
  { pattern: /충청남도|충남/, prefix: "충청남도" },
  { pattern: /강원특별자치도|강원도|강원/, prefix: "강원특별자치도" },
  { pattern: /경기도|경기/, prefix: "경기도" },
  { pattern: /제주특별자치도|제주/, prefix: "제주특별자치도" },
  { pattern: /서울특별시|서울/, prefix: "서울특별시" },
  { pattern: /인천광역시|인천/, prefix: "인천광역시" },
  { pattern: /대전광역시|대전/, prefix: "대전광역시" },
  { pattern: /세종특별자치시|세종/, prefix: "세종특별자치시" },
  { pattern: /광주광역시|광주/, prefix: "광주광역시" },
];

const LEADING_ABBREV: Array<{ pattern: RegExp; prefix: string }> = [
  { pattern: /^전남\s+/, prefix: "전라남도" },
  { pattern: /^전북\s+/, prefix: "전북특별자치도" },
  { pattern: /^경남\s+/, prefix: "경상남도" },
  { pattern: /^경북\s+/, prefix: "경상북도" },
  { pattern: /^충남\s+/, prefix: "충청남도" },
  { pattern: /^충북\s+/, prefix: "충청북도" },
];

function expandLeadingAbbreviation(address: string): string {
  for (const item of LEADING_ABBREV) {
    if (item.pattern.test(address)) {
      return address.replace(item.pattern, `${item.prefix} `);
    }
  }
  return address;
}

function extractCityToken(city: string, address: string): string {
  if (city.trim()) return city.trim();
  const match = address.match(/^(\S+?(?:시|군|구))/);
  return match?.[1] ?? "";
}

function resolveProvincePrefix(
  region: string,
  city: string,
  address: string,
): string | null {
  for (const item of PROVINCE_IN_ADDRESS) {
    if (item.pattern.test(address)) return item.prefix;
  }

  const cityToken = extractCityToken(city, address);
  if (cityToken && CITY_PROVINCE[cityToken]) {
    return CITY_PROVINCE[cityToken];
  }

  if (REGION_PREFIX[region]) {
    return REGION_PREFIX[region];
  }

  return null;
}

export function normalizeAddress(
  address: string,
  region = "",
  city = "",
): string {
  let value = address
    .replace(/^\uFEFF/, "")
    .replace(/[\r\n]+/g, " ")
    .replace(/["""]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (INVALID_TOKENS.has(value.toLowerCase())) {
    value = "";
  }

  if (!value) return "";

  value = value.replace(/\([^)]{1,20}\)\s*$/, "").trim();

  value = expandLeadingAbbreviation(value);

  if (FULL_PROVINCE_PATTERN.test(value)) {
    return value;
  }

  const prefix = resolveProvincePrefix(region, city, value);
  const cityToken = extractCityToken(city, value);

  if (prefix) {
    if (FULL_PROVINCE_PATTERN.test(`${prefix} ${value}`)) {
      return value.startsWith(prefix) ? value : `${prefix} ${value}`;
    }
    if (cityToken && value.startsWith(cityToken)) {
      return `${prefix} ${value}`;
    }
    if (cityToken && !value.includes(cityToken)) {
      return `${prefix} ${cityToken} ${value}`;
    }
    return `${prefix} ${value}`;
  }

  return value;
}

export function isLikelyRoadOrJibunAddress(address: string): boolean {
  return ROAD_OR_JIBUN_PATTERN.test(address);
}

export function isAddressTooShort(address: string): boolean {
  const trimmed = address.trim();
  if (trimmed.length < 8) return true;
  if (/^(서울|경기|강원|충청|전라|경상|제주)/.test(trimmed) && trimmed.length < 12) {
    return true;
  }
  return false;
}

export function buildAddressSearchQuery(
  address: string,
  region: string,
  city: string,
): string {
  return normalizeAddress(address, region, city);
}

export function buildKeywordQueries(
  name: string,
  region: string,
  city: string,
  normalizedAddress: string,
): string[] {
  const queries: string[] = [];
  const golfName = name.trim();

  if (city) queries.push(`${golfName} ${city}`);
  if (region) queries.push(`${golfName} ${region}`);
  queries.push(golfName);
  if (normalizedAddress) {
    queries.push(`${golfName} ${normalizedAddress}`);
  }

  return [...new Set(queries.filter(Boolean))];
}

export const UI_REGIONS = [
  "서울",
  "경기",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
] as const;
