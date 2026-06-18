import type { GeocodingInputRow } from "./geocodingUtils";
import { isValidWgs84Coordinate } from "./geocodingUtils";

export const SAMPLE_RESULTS_HEADERS = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "query",
  "latitude",
  "longitude",
  "provider",
  "confidence",
  "matched_address",
  "raw_place_name",
  "status",
  "note",
] as const;

export type GeocodingStatus =
  | "success"
  | "no_result"
  | "low_confidence"
  | "multiple_candidates"
  | "api_error"
  | "skipped";

export interface SampleGeocodingResult {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  query: string;
  latitude: string;
  longitude: string;
  provider: string;
  confidence: string;
  matchedAddress: string;
  rawPlaceName: string;
  status: GeocodingStatus;
  note: string;
}

const REGION_HINTS: Record<string, string[]> = {
  서울: ["서울"],
  경기: ["경기", "인천"],
  강원: ["강원", "춘천", "원주", "강릉", "속초", "평창", "횡성", "홍천", "양양"],
  충청: ["충청", "충북", "충남", "대전", "세종", "청주", "천안", "충주", "보령"],
  전라: ["전라", "전북", "전남", "광주", "전주", "익산", "군산", "여수", "순천", "나주"],
  경상: ["경상", "경북", "경남", "부산", "대구", "울산", "포항", "창원", "김해", "경주", "사천"],
  제주: ["제주"],
};

function matchedAddressMatchesRegion(
  region: string,
  city: string,
  matchedAddress: string,
): boolean {
  if (!matchedAddress.trim()) return false;

  const hints = REGION_HINTS[region] ?? [];
  if (hints.some((hint) => matchedAddress.includes(hint))) return true;
  if (city && matchedAddress.includes(city.replace(/(시|군|구)$/, ""))) return true;
  if (city && matchedAddress.includes(city)) return true;
  return false;
}

export function assessGeocodingQuality(input: {
  row: GeocodingInputRow;
  latitude: number | null;
  longitude: number | null;
  matchedAddress: string;
  rawPlaceName: string;
  candidateCount: number;
  apiError?: string;
  fromCache?: boolean;
}): SampleGeocodingResult {
  const base: SampleGeocodingResult = {
    id: input.row.id,
    name: input.row.name,
    region: input.row.region,
    city: input.row.city,
    address: input.row.address,
    query: input.row.query,
    latitude: "",
    longitude: "",
    provider: "",
    confidence: "",
    matchedAddress: input.matchedAddress,
    rawPlaceName: input.rawPlaceName,
    status: "no_result",
    note: "",
  };

  if (input.apiError) {
    return {
      ...base,
      status: "api_error",
      note: input.apiError,
    };
  }

  if (
    input.row.query.trim().length < 8 ||
    input.row.address.trim().length < 8
  ) {
    return {
      ...base,
      status: "low_confidence",
      confidence: "low",
      note: "query 또는 address가 짧아 geocoding 신뢰도 낮음",
    };
  }

  if (
    input.latitude === null ||
    input.longitude === null ||
    !Number.isFinite(input.latitude) ||
    !Number.isFinite(input.longitude)
  ) {
    return {
      ...base,
      status: "no_result",
      note: "API 결과 0건",
    };
  }

  if (!isValidWgs84Coordinate(input.latitude, input.longitude)) {
    return {
      ...base,
      latitude: String(input.latitude),
      longitude: String(input.longitude),
      status: "low_confidence",
      confidence: "low",
      note: "좌표가 한국 WGS84 범위(33~39.5N, 124~132.5E) 밖",
    };
  }

  if (input.candidateCount > 1) {
    return {
      ...base,
      latitude: String(input.latitude),
      longitude: String(input.longitude),
      status: "multiple_candidates",
      confidence: "medium",
      note: `후보 ${input.candidateCount}건 — 첫 결과만 기록, 수동 검토 권장`,
    };
  }

  if (!input.matchedAddress.trim()) {
    return {
      ...base,
      latitude: String(input.latitude),
      longitude: String(input.longitude),
      status: "low_confidence",
      confidence: "low",
      note: "matched_address 비어 있음",
    };
  }

  if (!matchedAddressMatchesRegion(input.row.region, input.row.city, input.matchedAddress)) {
    return {
      ...base,
      latitude: String(input.latitude),
      longitude: String(input.longitude),
      status: "low_confidence",
      confidence: "low",
      note: `region/city(${input.row.region}/${input.row.city})와 matched_address 불일치 가능`,
    };
  }

  return {
    ...base,
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    status: "success",
    confidence: "high",
    note: input.fromCache ? "cache hit" : "단일 후보, region/city 일치",
  };
}

export function sampleResultToRow(result: SampleGeocodingResult): string[] {
  return [
    result.id,
    result.name,
    result.region,
    result.city,
    result.address,
    result.query,
    result.latitude,
    result.longitude,
    result.provider,
    result.confidence,
    result.matchedAddress,
    result.rawPlaceName,
    result.status,
    result.note,
  ];
}

export function buildQualityReport(
  results: SampleGeocodingResult[],
  meta: {
    runAt: string;
    mode: "dry-run" | "execute";
    provider: string;
    limit: number;
    offset: number;
    totalInputRows: number;
    apiKeys: {
      kakaoRestApiKey: boolean;
      naverClientId: boolean;
      naverClientSecret: boolean;
    };
    sampleExecuted: boolean;
  },
): string {
  const counts: Record<GeocodingStatus, number> = {
    success: 0,
    no_result: 0,
    low_confidence: 0,
    multiple_candidates: 0,
    api_error: 0,
    skipped: 0,
  };

  for (const result of results) {
    counts[result.status] += 1;
  }

  const successRows = results.filter((r) => r.status === "success");
  const fullGeocodingReady =
    meta.sampleExecuted &&
    counts.success >= Math.floor(results.length * 0.8) &&
    counts.api_error === 0;

  return [
    "# Geocoding Quality Report — Phase 3 Sample",
    "",
    `> Generated: ${meta.runAt}`,
    "",
    "## 실행 정보",
    "",
    `- **mode:** ${meta.mode}`,
    `- **provider:** ${meta.provider}`,
    `- **limit:** ${meta.limit}`,
    `- **offset:** ${meta.offset}`,
    `- **geocoding_input 총 행 수:** ${meta.totalInputRows}`,
    `- **샘플 처리 행 수:** ${results.length}`,
    `- **실제 API 호출 실행:** ${meta.sampleExecuted}`,
    "",
    "## API key 존재 여부 (값 미표시)",
    "",
    `- KAKAO_REST_API_KEY: ${meta.apiKeys.kakaoRestApiKey}`,
    `- NAVER_CLIENT_ID: ${meta.apiKeys.naverClientId}`,
    `- NAVER_CLIENT_SECRET: ${meta.apiKeys.naverClientSecret}`,
    "",
    "## status별 개수",
    "",
    `- success: ${counts.success}`,
    `- no_result: ${counts.no_result}`,
    `- low_confidence: ${counts.low_confidence}`,
    `- multiple_candidates: ${counts.multiple_candidates}`,
    `- api_error: ${counts.api_error}`,
    `- skipped: ${counts.skipped}`,
    "",
    "## 좌표 품질 검증",
    "",
    `- 한국 WGS84 범위 검증: ${results.filter((r) => r.latitude && r.longitude).every((r) => isValidWgs84Coordinate(Number(r.latitude), Number(r.longitude)) || r.status === "no_result") ? "통과" : "일부 실패"}`,
    `- success 건 region/city 일치: ${successRows.length}건`,
    `- low_confidence / multiple_candidates는 **최종 import 미반영**`,
    "",
    "## success 목록 (상위 10)",
    "",
    ...(successRows.length === 0
      ? ["_success 없음_"]
      : successRows.slice(0, 10).map(
          (r) =>
            `- ${r.name} (${r.region}/${r.city}) → ${r.latitude}, ${r.longitude} — ${r.matchedAddress}`,
        )),
    "",
    "## 검토 필요 목록",
    "",
    ...results
      .filter((r) => r.status !== "success")
      .slice(0, 15)
      .map((r) => `- **${r.name}** [${r.status}] — ${r.note}`),
    "",
    "## 전체 geocoding 실행 가능 여부",
    "",
    fullGeocodingReady
      ? "- **조건부 가능** — 샘플 success 비율 양호. manual_questions 검토 후 전체 실행 권장."
      : meta.sampleExecuted
        ? "- **전체 실행 전 재검토 필요** — success 비율 낮거나 api_error 존재."
        : "- **API key 설정 후 샘플 execute 필요**",
    "",
    "## 다음 단계",
    "",
    "1. manual_questions.md 7건 사용자 확인 유지",
    "2. low_confidence / multiple_candidates 수동 검토",
    "3. 전체 실행: `npm run geocode:golf-courses -- --execute --provider kakao`",
    "4. 결과: `data/golf_courses_import_geocoded.csv` (별도 파일, import 원본 유지)",
    "",
  ].join("\n");
}

export function countStatuses(results: SampleGeocodingResult[]): Record<GeocodingStatus, number> {
  const counts: Record<GeocodingStatus, number> = {
    success: 0,
    no_result: 0,
    low_confidence: 0,
    multiple_candidates: 0,
    api_error: 0,
    skipped: 0,
  };
  for (const result of results) {
    counts[result.status] += 1;
  }
  return counts;
}
