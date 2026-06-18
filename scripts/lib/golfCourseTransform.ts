import { createHash } from "node:crypto";

export const OUTPUT_HEADERS = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "latitude",
  "longitude",
  "phone",
  "homepage_url",
  "booking_url",
  "hole_count",
  "course_type",
  "weekday_green_fee_min",
  "weekend_green_fee_min",
  "caddie_fee",
  "cart_fee",
  "night_round",
  "no_caddie",
  "two_player_allowed",
  "resort",
  "tags",
  "image_url",
  "description",
  "business_status",
  "source",
  "updated_at",
  "created_at",
] as const;

export const ERROR_HEADERS = [
  "error_reason",
  "raw_name",
  "raw_address",
  ...OUTPUT_HEADERS,
] as const;

/** 원본 CSV 컬럼명 후보 (공공데이터 포맷 차이 대응) */
export const COLUMN_ALIASES = {
  name: [
    "업소명",
    "사업장명",
    "골프장명",
    "시설명",
    "명칭",
    "이름",
    "name",
    "NAME",
  ],
  rawRegion: ["지역", "광역", "region", "REGION", "시도"],
  address: [
    "소재지",
    "소재지주소",
    "소재지전체",
    "도로명주소",
    "지번주소",
    "주소",
    "address",
    "ADDRESS",
  ],
  holeCount: ["홀수", "코스홀수", "홀", "hole_count", "HOLE_COUNT"],
  courseType: ["구분", "운영구분", "시설구분", "업종", "course_type", "COURSE_TYPE"],
  phone: ["전화번호", "연락처", "대표전화", "phone", "PHONE"],
  businessStatus: [
    "영업상태",
    "상세영업상태명",
    "영업상태명",
    "business_status",
    "BUSINESS_STATUS",
  ],
  latitude: ["위도", "latitude", "lat", "LAT", "y", "Y좌표", "y좌표"],
  longitude: ["경도", "longitude", "lng", "lon", "LNG", "x", "X좌표", "x좌표"],
  homepageUrl: ["홈페이지", "homepage", "homepage_url", "HOMEPAGE_URL"],
  description: ["설명", "소개", "description", "DESCRIPTION"],
} as const;

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().replace(/\s+/g, "").toLowerCase();
}

export function buildHeaderMap(headers: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const header of headers) {
    map.set(normalizeHeader(header), header);
  }
  return map;
}

export function rowToRecord(
  headers: string[],
  values: string[],
): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = (values[index] ?? "").trim();
  });
  return record;
}

export function findColumnByAliases(
  headerMap: Map<string, string>,
  aliases: readonly string[],
): string | null {
  for (const alias of aliases) {
    const originalKey = headerMap.get(normalizeHeader(alias));
    if (originalKey) return originalKey;
  }
  return null;
}

export function pickColumn(
  record: Record<string, string>,
  headerMap: Map<string, string>,
  aliases: readonly string[],
): string {
  for (const alias of aliases) {
    const originalKey = headerMap.get(normalizeHeader(alias));
    if (!originalKey) continue;
    const value = record[originalKey]?.trim();
    if (value) return value;
  }
  return "";
}

export function parseHoleCount(raw: string): string {
  if (!raw.trim()) return "";
  const match = raw.match(/(\d+)/);
  return match ? match[1] : "";
}

/** 여러 홀수 표기(18/27, 18·27 등)면 ambiguous */
export function parseHoleCountStrict(raw: string): {
  value: string;
  ambiguous: boolean;
  reason?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { value: "", ambiguous: false };

  if (/(\d+)\s*[\/·,]\s*(\d+)/.test(trimmed)) {
    return {
      value: "",
      ambiguous: true,
      reason: `hole_count 다중 표기: ${trimmed}`,
    };
  }

  const numbers = trimmed.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    if (trimmed) {
      return { value: "", ambiguous: true, reason: `hole_count 파싱 불가: ${trimmed}` };
    }
    return { value: "", ambiguous: false };
  }

  if (numbers.length > 1) {
    return {
      value: "",
      ambiguous: true,
      reason: `hole_count 숫자 다중: ${trimmed}`,
    };
  }

  return { value: numbers[0], ambiguous: false };
}

const RAW_REGION_MAP: Record<string, string> = {
  서울: "서울",
  서울특별시: "서울",
  경기: "경기",
  경기도: "경기",
  인천: "경기",
  인천광역시: "경기",
  강원: "강원",
  강원도: "강원",
  강원특별자치도: "강원",
  충청: "충청",
  충북: "충청",
  충남: "충청",
  충청북도: "충청",
  충청남도: "충청",
  대전: "충청",
  세종: "충청",
  전라: "전라",
  전북: "전라",
  전남: "전라",
  전라북도: "전라",
  전라남도: "전라",
  광주: "전라",
  경상: "경상",
  경북: "경상",
  경남: "경상",
  경상북도: "경상",
  경상남도: "경상",
  부산: "경상",
  대구: "경상",
  울산: "경상",
  제주: "제주",
  제주특별자치도: "제주",
};

export function mapRawRegionToFilterRegion(rawRegion: string): string | null {
  const key = rawRegion.trim().replace(/\s+/g, "");
  if (!key) return null;
  if (RAW_REGION_MAP[key]) return RAW_REGION_MAP[key];

  for (const [pattern, region] of Object.entries(RAW_REGION_MAP)) {
    if (key.startsWith(pattern) || key.includes(pattern)) return region;
  }

  return null;
}

export function normalizeCourseType(raw: string): string {
  const value = raw.trim().toLowerCase();
  if (!value) return "기타";

  if (
    value.includes("비회원") ||
    value.includes("대중") ||
    value.includes("퍼블릭") ||
    value.includes("public")
  ) {
    return "대중제";
  }
  if (value.includes("회원") || value.includes("private")) {
    return "회원제";
  }
  if (
    value.includes("군") ||
    value.includes("체력단련") ||
    value.includes("국방")
  ) {
    return "군 골프장";
  }
  if (value === "대중제" || value === "회원제" || value === "군 골프장") {
    return raw.trim();
  }
  return "기타";
}

interface RegionRule {
  region: string;
  patterns: RegExp[];
}

const REGION_RULES: RegionRule[] = [
  { region: "서울", patterns: [/서울특별시/, /^서울(?:시|\s)/] },
  { region: "제주", patterns: [/제주특별자치도/, /^제주(?:시|\s)/] },
  { region: "경기", patterns: [/경기도/, /인천광역시/, /^인천(?:시|\s)/] },
  { region: "강원", patterns: [/강원특별자치도/, /강원도/] },
  {
    region: "충청",
    patterns: [/충청북도/, /충청남도/, /대전광역시/, /세종특별자치시/],
  },
  { region: "전라", patterns: [/전라북도/, /전라남도/, /광주광역시/] },
  {
    region: "경상",
    patterns: [
      /경상북도/,
      /경상남도/,
      /부산광역시/,
      /대구광역시/,
      /울산광역시/,
    ],
  },
];

const PROVINCE_PREFIX =
  /^(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|제주특별자치도|경기도|강원특별자치도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도)\s*/;

export function extractRegionCity(
  address: string,
  regionHint = "",
): {
  region: string;
  city: string;
} | null {
  const trimmed = address.trim();
  if (!trimmed && !regionHint.trim()) return null;

  let region = mapRawRegionToFilterRegion(regionHint) ?? "";

  if (!region) {
    for (const rule of REGION_RULES) {
      if (rule.patterns.some((pattern) => pattern.test(trimmed))) {
        region = rule.region;
        break;
      }
    }
  }

  if (!region) return null;

  const withoutProvince = trimmed.replace(PROVINCE_PREFIX, "").trim();
  const cityMatch = (withoutProvince || trimmed).match(/^(\S+?(?:시|군|구))/);
  const city =
    cityMatch?.[1] ??
    withoutProvince.split(/\s+/)[0] ??
    trimmed.split(/\s+/)[0] ??
    region;

  return { region, city };
}

export function parseCoordinate(raw: string): string {
  const value = raw.trim().replace(/,/g, "");
  if (!value) return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return String(num);
}

export function createStableId(
  name: string,
  city: string,
  address: string,
): string {
  const normalized = `${name.trim()}|${city.trim()}|${address.trim()}`;
  const hash = createHash("sha256").update(normalized, "utf8").digest("hex");
  return `gc-${hash.slice(0, 12)}`;
}

export function dedupeId(baseId: string, used: Map<string, number>): string {
  const count = used.get(baseId) ?? 0;
  used.set(baseId, count + 1);
  if (count === 0) return baseId;
  return `${baseId}-${count + 1}`;
}

export interface MasterTransformInput {
  name: string;
  address: string;
  rawRegion: string;
  holeCountRaw: string;
  courseTypeRaw: string;
  phone: string;
  businessStatus: string;
  latitudeRaw: string;
  longitudeRaw: string;
  timestamp: string;
}

export type MasterTransformResult =
  | {
      kind: "import";
      row: string[];
      needsGeocoding: boolean;
      id: string;
      baseId: string;
    }
  | { kind: "excluded"; reason: string; category: string; name: string; address: string }
  | { kind: "ambiguous"; reason: string; name: string; address: string; conflictingValues: string }
  | { kind: "error"; reason: string; name: string; address: string; partialRow: string[] };

export function transformMasterRow(
  input: MasterTransformInput,
  idRegistry: Map<string, number>,
): MasterTransformResult {
  const name = input.name.trim();
  const address = input.address.trim();

  if (!name) {
    return {
      kind: "error",
      reason: "필수값 누락: name",
      name,
      address,
      partialRow: [],
    };
  }

  if (!address) {
    return {
      kind: "error",
      reason: "필수값 누락: address",
      name,
      address,
      partialRow: [],
    };
  }

  const holeParsed = parseHoleCountStrict(input.holeCountRaw);
  if (holeParsed.ambiguous) {
    return {
      kind: "ambiguous",
      reason: holeParsed.reason ?? "hole_count ambiguous",
      name,
      address,
      conflictingValues: input.holeCountRaw,
    };
  }

  const courseType = normalizeCourseType(input.courseTypeRaw);
  const courseTypeRaw = input.courseTypeRaw.trim();
  if (
    courseTypeRaw &&
    courseType === "기타" &&
    !["기타", ""].includes(courseTypeRaw)
  ) {
    return {
      kind: "ambiguous",
      reason: "course_type 정규화 불명확",
      name,
      address,
      conflictingValues: courseTypeRaw,
    };
  }

  const regionCity = extractRegionCity(address, input.rawRegion);
  if (!regionCity) {
    return {
      kind: "ambiguous",
      reason: "region/city 추출 실패",
      name,
      address,
      conflictingValues: `region_hint=${input.rawRegion}, address=${address}`,
    };
  }

  const baseId = createStableId(name, regionCity.city, address);
  const id = dedupeId(baseId, idRegistry);

  const latitude = parseCoordinate(input.latitudeRaw);
  const longitude = parseCoordinate(input.longitudeRaw);
  const needsGeocoding = !latitude || !longitude;

  const row = buildOutputRow({
    id,
    name,
    region: regionCity.region,
    city: regionCity.city,
    address,
    latitude,
    longitude,
    phone: input.phone.trim(),
    homepageUrl: "",
    description: "",
    holeCount: holeParsed.value,
    courseType,
    businessStatus: input.businessStatus.trim(),
    timestamp: input.timestamp,
  });

  return { kind: "import", row, needsGeocoding, id, baseId };
}

export interface TransformInput {
  name: string;
  address: string;
  phone: string;
  holeCountRaw: string;
  courseTypeRaw: string;
  businessStatus: string;
  latitudeRaw: string;
  longitudeRaw: string;
  homepageUrl: string;
  description: string;
  timestamp: string;
}

export interface TransformSuccess {
  ok: true;
  row: string[];
  needsGeocoding: boolean;
}

export interface TransformFailure {
  ok: false;
  reason: string;
  partialRow: string[];
}

export function transformPublicRow(
  input: TransformInput,
  idRegistry: Map<string, number>,
): TransformSuccess | TransformFailure {
  if (!input.name.trim()) {
    return {
      ok: false,
      reason: "필수값 누락: name(골프장명)",
      partialRow: buildPartialRow(input, "", "", ""),
    };
  }

  if (!input.address.trim()) {
    return {
      ok: false,
      reason: "필수값 누락: address(주소)",
      partialRow: buildPartialRow(input, "", "", ""),
    };
  }

  const regionCity = extractRegionCity(input.address);
  if (!regionCity) {
    return {
      ok: false,
      reason: "region 추출 실패: address에서 지역을 판별할 수 없음",
      partialRow: buildPartialRow(input, "", "", ""),
    };
  }

  const baseId = createStableId(input.name, regionCity.city, input.address);
  const id = dedupeId(baseId, idRegistry);
  const latitude = parseCoordinate(input.latitudeRaw);
  const longitude = parseCoordinate(input.longitudeRaw);
  const needsGeocoding = !latitude || !longitude;

  const row = buildOutputRow({
    id,
    name: input.name.trim(),
    region: regionCity.region,
    city: regionCity.city,
    address: input.address.trim(),
    latitude,
    longitude,
    phone: input.phone.trim(),
    homepageUrl: input.homepageUrl.trim(),
    description: input.description.trim(),
    holeCount: parseHoleCount(input.holeCountRaw),
    courseType: normalizeCourseType(input.courseTypeRaw),
    businessStatus: input.businessStatus.trim(),
    timestamp: input.timestamp,
  });

  return { ok: true, row, needsGeocoding };
}

function buildPartialRow(
  input: TransformInput,
  id: string,
  region: string,
  city: string,
): string[] {
  return buildOutputRow({
    id,
    name: input.name.trim(),
    region,
    city,
    address: input.address.trim(),
    latitude: parseCoordinate(input.latitudeRaw),
    longitude: parseCoordinate(input.longitudeRaw),
    phone: input.phone.trim(),
    homepageUrl: input.homepageUrl.trim(),
    description: input.description.trim(),
    holeCount: parseHoleCount(input.holeCountRaw),
    courseType: normalizeCourseType(input.courseTypeRaw),
    businessStatus: input.businessStatus.trim(),
    timestamp: input.timestamp,
  });
}

export function buildOutputRow(values: {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
  homepageUrl: string;
  description: string;
  holeCount: string;
  courseType: string;
  businessStatus: string;
  timestamp: string;
}): string[] {
  const description =
    values.description ||
    `${values.name}은(는) ${values.region} 지역의 ${values.courseType} 골프장입니다.`;

  return [
    values.id,
    values.name,
    values.region,
    values.city,
    values.address,
    values.latitude,
    values.longitude,
    values.phone,
    values.homepageUrl,
    "",
    values.holeCount,
    values.courseType,
    "",
    "",
    "",
    "",
    "false",
    "false",
    "false",
    "false",
    "{}",
    "",
    description,
    values.businessStatus,
    "public_data",
    values.timestamp,
    values.timestamp,
  ];
}

export function transformPublicRecord(
  record: Record<string, string>,
  headerMap: Map<string, string>,
  timestamp: string,
  idRegistry: Map<string, number>,
): TransformSuccess | TransformFailure {
  return transformPublicRow(
    {
      name: pickColumn(record, headerMap, COLUMN_ALIASES.name),
      address: pickColumn(record, headerMap, COLUMN_ALIASES.address),
      phone: pickColumn(record, headerMap, COLUMN_ALIASES.phone),
      holeCountRaw: pickColumn(record, headerMap, COLUMN_ALIASES.holeCount),
      courseTypeRaw: pickColumn(record, headerMap, COLUMN_ALIASES.courseType),
      businessStatus: pickColumn(record, headerMap, COLUMN_ALIASES.businessStatus),
      latitudeRaw: pickColumn(record, headerMap, COLUMN_ALIASES.latitude),
      longitudeRaw: pickColumn(record, headerMap, COLUMN_ALIASES.longitude),
      homepageUrl: pickColumn(record, headerMap, COLUMN_ALIASES.homepageUrl),
      description: pickColumn(record, headerMap, COLUMN_ALIASES.description),
      timestamp,
    },
    idRegistry,
  );
}
