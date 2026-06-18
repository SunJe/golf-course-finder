import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./csvUtils";
import type { SampleGeocodingResult, GeocodingStatus } from "./geocodingQuality";
import { UI_REGIONS } from "./addressNormalize";
import { isValidWgs84Coordinate } from "./geocodingUtils";

export const FULL_RUN_ABORT = {
  MAX_CONSECUTIVE_API_ERRORS: 5,
  NO_RESULT_RATIO_THRESHOLD: 0.2,
  MIN_ROWS_BEFORE_RATIO_CHECK: 30,
  MAX_CONSECUTIVE_OUT_OF_RANGE: 3,
} as const;

export interface AbortState {
  consecutiveApiErrors: number;
  consecutiveOutOfRange: number;
  noResultCount: number;
  outOfRangeCount: number;
  processedCount: number;
}

export interface AbortCheckResult {
  abort: boolean;
  reason: string;
}

export function createAbortState(): AbortState {
  return {
    consecutiveApiErrors: 0,
    consecutiveOutOfRange: 0,
    noResultCount: 0,
    outOfRangeCount: 0,
    processedCount: 0,
  };
}

export function isRateLimitError(message: string): boolean {
  return /429|rate\s*limit|quota|too many requests|over\s*quota|usage limit/i.test(
    message,
  );
}

export function isOutOfRangeResult(result: SampleGeocodingResult): boolean {
  if (!result.latitude.trim() || !result.longitude.trim()) return false;
  const lat = Number(result.latitude);
  const lng = Number(result.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  return !isValidWgs84Coordinate(lat, lng);
}

export function isSuccessForImport(result: SampleGeocodingResult): boolean {
  if (result.status === "success") return true;
  if (
    result.status === "skipped" &&
    result.latitude &&
    result.longitude &&
    isValidWgs84Coordinate(Number(result.latitude), Number(result.longitude))
  ) {
    return true;
  }
  return false;
}

export function updateAbortState(
  state: AbortState,
  result: SampleGeocodingResult,
  errorMessage?: string,
): AbortCheckResult {
  state.processedCount += 1;

  if (errorMessage && isRateLimitError(errorMessage)) {
    return {
      abort: true,
      reason: `API rate limit/quota 감지: ${errorMessage}`,
    };
  }

  if (result.status === "api_error") {
    state.consecutiveApiErrors += 1;
    if (state.consecutiveApiErrors >= FULL_RUN_ABORT.MAX_CONSECUTIVE_API_ERRORS) {
      return {
        abort: true,
        reason: `연속 api_error ${state.consecutiveApiErrors}회 — 자동 중단`,
      };
    }
  } else {
    state.consecutiveApiErrors = 0;
  }

  if (result.status === "no_result") {
    state.noResultCount += 1;
  }

  if (
    state.processedCount >= FULL_RUN_ABORT.MIN_ROWS_BEFORE_RATIO_CHECK &&
    state.noResultCount / state.processedCount >
      FULL_RUN_ABORT.NO_RESULT_RATIO_THRESHOLD
  ) {
    return {
      abort: true,
      reason: `no_result 비율 ${Math.round((state.noResultCount / state.processedCount) * 100)}% — 20% 초과 예상`,
    };
  }

  if (isOutOfRangeResult(result)) {
    state.outOfRangeCount += 1;
    state.consecutiveOutOfRange += 1;
    if (
      state.consecutiveOutOfRange >= FULL_RUN_ABORT.MAX_CONSECUTIVE_OUT_OF_RANGE
    ) {
      return {
        abort: true,
        reason: `한국 좌표 범위 밖 결과 ${state.consecutiveOutOfRange}회 연속 — 자동 중단`,
      };
    }
  } else if (
    result.latitude.trim() &&
    result.longitude.trim() &&
    !isOutOfRangeResult(result)
  ) {
    state.consecutiveOutOfRange = 0;
  }

  return { abort: false, reason: "" };
}

export interface FullRunReportMeta {
  runAt: string;
  provider: string;
  totalInputRows: number;
  processedRows: number;
  apiStepCalls: number;
  cacheHits: number;
  addressSearchHits: number;
  keywordSearchHits: number;
  aborted: boolean;
  abortReason: string;
  geocodedImportRows: number;
  rowsWithoutCoords: number;
  apiKeys: {
    kakaoRestApiKey: boolean;
    naverClientId: boolean;
    naverClientSecret: boolean;
  };
}

function effectiveStatus(result: SampleGeocodingResult): GeocodingStatus {
  if (isSuccessForImport(result)) return "success";
  return result.status;
}

function computeRegionStats(results: SampleGeocodingResult[]) {
  return UI_REGIONS.map((region) => {
    const regionResults = results.filter((row) => row.region === region);
    const stats = {
      success: 0,
      no_result: 0,
      low_confidence: 0,
      multiple_candidates: 0,
      api_error: 0,
    };
    for (const row of regionResults) {
      const status = effectiveStatus(row);
      if (status in stats) {
        stats[status as keyof typeof stats] += 1;
      }
    }
    return { region, count: regionResults.length, ...stats };
  });
}

export function buildFullQualityReport(
  results: SampleGeocodingResult[],
  meta: FullRunReportMeta,
): string {
  const counts = {
    success: 0,
    no_result: 0,
    low_confidence: 0,
    multiple_candidates: 0,
    api_error: 0,
    skipped: 0,
  };

  let confidenceSum = 0;
  let confidenceCount = 0;
  let outOfRangeCount = 0;

  for (const result of results) {
    counts[result.status] += 1;
    const score = Number(result.confidence);
    if (Number.isFinite(score) && score > 0) {
      confidenceSum += score;
      confidenceCount += 1;
    }
    if (isOutOfRangeResult(result)) outOfRangeCount += 1;
  }

  const importSuccessCount = results.filter(isSuccessForImport).length;
  const supabaseReady =
    meta.geocodedImportRows > 0 &&
    meta.rowsWithoutCoords === 0 &&
    !meta.aborted;

  const regionStats = computeRegionStats(results);
  const failedRows = results.filter((row) => !isSuccessForImport(row));

  const avgConfidence =
    confidenceCount > 0
      ? Math.round((confidenceSum / confidenceCount) * 10) / 10
      : 0;

  return [
    "# Geocoding Quality Report — Full Run",
    "",
    `> Generated: ${meta.runAt}`,
    "",
    "## 실행 정보",
    "",
    `- **provider:** ${meta.provider}`,
    `- **총 대상 행 수:** ${meta.totalInputRows}`,
    `- **처리 완료 행 수:** ${meta.processedRows}`,
    `- **자동 중단:** ${meta.aborted ? "예" : "아니오"}`,
    ...(meta.aborted ? [`- **중단 사유:** ${meta.abortReason}`] : []),
    `- **API step calls:** ${meta.apiStepCalls}`,
    `- **cache hit:** ${meta.cacheHits}`,
    `- **address search hits:** ${meta.addressSearchHits}`,
    `- **keyword search hits:** ${meta.keywordSearchHits}`,
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
    `- skipped (cache): ${counts.skipped}`,
    `- import 반영 가능 (success+캐시): ${importSuccessCount}`,
    `- **평균 confidence:** ${avgConfidence}`,
    `- **좌표 한국 범위 밖:** ${outOfRangeCount}`,
    "",
    "## region별 통계",
    "",
    "| region | rows | success | no_result | low_confidence | multiple_candidates | api_error |",
    "|--------|------|---------|-----------|----------------|---------------------|-----------|",
    ...regionStats.map(
      (item) =>
        `| ${item.region} | ${item.count} | ${item.success} | ${item.no_result} | ${item.low_confidence} | ${item.multiple_candidates} | ${item.api_error} |`,
    ),
    "",
    "## geocoded import",
    "",
    `- **golf_courses_import_geocoded.csv 행 수:** ${meta.geocodedImportRows}`,
    `- **좌표 없는 행 수:** ${meta.rowsWithoutCoords}`,
    `- **golf_courses_import.csv 수정:** 없음 (원본 유지)`,
    "",
    "## Supabase import 가능 여부",
    "",
    supabaseReady
      ? "- **가능** — 모든 행에 latitude/longitude 존재."
      : meta.rowsWithoutCoords > 0
        ? `- **불가** — ${meta.rowsWithoutCoords}행 좌표 없음. schema NOT NULL 조건 때문에 바로 import 불가. 실패 행 수동 보정 또는 schema nullable 변경 필요.`
        : "- **불확실** — 실행 중단 또는 미완료.",
    "",
    "## 실패/미반영 항목",
    "",
    ...(failedRows.length === 0
      ? ["_없음_"]
      : failedRows.slice(0, 50).map(
          (row) =>
            `- **${row.name}** (${row.region}/${row.city}) [${row.status}] — ${row.note}`,
        )),
    ...(failedRows.length > 50
      ? [`- ... 외 ${failedRows.length - 50}건 (geocoding_failures.csv 참조)`]
      : []),
    "",
    "## 다음 단계",
    "",
    meta.aborted
      ? "1. 중단 사유 확인 후 cache 기반 재실행: `npm run geocode:golf-courses -- --execute --provider kakao --all --confirm-all`"
      : "1. 실패/low_confidence 항목 수동 검토",
    "2. golf_courses_import_geocoded.csv 품질 확인",
    "3. Supabase import (별도 단계)",
    "",
    "## 참고",
    "",
    "- low_confidence / multiple_candidates / no_result 행은 import_geocoded에서 좌표 비움",
    "- 재실행 시 geocoding_cache.json으로 API 호출 최소화",
    "",
  ].join("\n");
}

export function buildGeocodedImportCsv(input: {
  importPath: string;
  outputPath: string;
  resultsById: Map<string, SampleGeocodingResult>;
}): { rowCount: number; rowsWithoutCoords: number } {
  const { headers, rows } = parseCsv(readFileUtf8(input.importPath));
  const idIndex = headers.indexOf("id");
  const latIndex = headers.indexOf("latitude");
  const lngIndex = headers.indexOf("longitude");

  if (idIndex < 0 || latIndex < 0 || lngIndex < 0) {
    throw new Error("import CSV missing id/latitude/longitude columns");
  }

  let rowsWithoutCoords = 0;

  const outputRows = rows.map((values) => {
    const next = [...values];
    const id = values[idIndex] ?? "";
    const result = input.resultsById.get(id);

    if (result && isSuccessForImport(result)) {
      next[latIndex] = result.latitude;
      next[lngIndex] = result.longitude;
    } else {
      next[latIndex] = "";
      next[lngIndex] = "";
      rowsWithoutCoords += 1;
    }

    return next;
  });

  writeFileUtf8(input.outputPath, rowsToCsv(headers, outputRows));

  return { rowCount: outputRows.length, rowsWithoutCoords };
}

export function resultToGeocodingResultsRow(
  result: SampleGeocodingResult,
  geocodedAt: string,
): string[] {
  return [
    result.id,
    result.name,
    result.address,
    result.query,
    result.latitude,
    result.longitude,
    result.provider,
    result.confidence,
    geocodedAt,
  ];
}
