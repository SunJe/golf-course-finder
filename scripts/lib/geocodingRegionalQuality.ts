import type { SampleGeocodingResult } from "./geocodingQuality";
import { countStatuses, type GeocodingStatus } from "./geocodingQuality";
import { isValidWgs84Coordinate } from "./geocodingUtils";
import { UI_REGIONS } from "./addressNormalize";

export interface RegionalStats {
  region: string;
  sampleCount: number;
  success: number;
  noResult: number;
  lowConfidence: number;
  multipleCandidates: number;
  apiError: number;
  skipped: number;
  avgConfidence: number;
  passRate: number;
  passed: boolean;
}

function effectiveStatus(result: SampleGeocodingResult): GeocodingStatus {
  if (
    result.status === "skipped" &&
    result.latitude &&
    result.longitude &&
    isValidWgs84Coordinate(Number(result.latitude), Number(result.longitude))
  ) {
    return "success";
  }
  return result.status;
}

function computeRegionalStats(
  results: SampleGeocodingResult[],
): RegionalStats[] {
  return UI_REGIONS.map((region) => {
    const regionResults = results.filter((row) => row.region === region);
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

    for (const row of regionResults) {
      const status = effectiveStatus(row);
      counts[status] += 1;
      const score = Number(row.confidence);
      if (Number.isFinite(score) && score > 0) {
        confidenceSum += score;
        confidenceCount += 1;
      }
    }

    const sampleCount = regionResults.length;
    const success = counts.success;
    const passRate = sampleCount > 0 ? success / sampleCount : 0;

    return {
      region,
      sampleCount,
      success,
      noResult: counts.no_result,
      lowConfidence: counts.low_confidence,
      multipleCandidates: counts.multiple_candidates,
      apiError: counts.api_error,
      skipped: counts.skipped,
      avgConfidence:
        confidenceCount > 0
          ? Math.round((confidenceSum / confidenceCount) * 10) / 10
          : 0,
      passRate,
      passed: sampleCount > 0 ? passRate >= 0.8 : true,
    };
  });
}

export function buildRegionalQualityReport(input: {
  runAt: string;
  results: SampleGeocodingResult[];
  totalInputRows: number;
  limitPerRegion: number;
  addressSearchHits: number;
  keywordSearchHits: number;
  apiStepCalls: number;
}): string {
  const stats = computeRegionalStats(input.results);
  const overall = countStatuses(input.results);
  const allPassed = stats.every((item) => item.passed || item.sampleCount === 0);
  const failedRows = input.results.filter(
    (row) => effectiveStatus(row) !== "success",
  );

  const lines = [
    "# Geocoding Regional Quality Report",
    "",
    `> Generated: ${input.runAt}`,
    "",
    "## 실행 정보",
    "",
    `- **지역별 샘플 limit:** ${input.limitPerRegion}`,
    `- **총 샘플 행 수:** ${input.results.length}`,
    `- **geocoding_input 총 행 수:** ${input.totalInputRows}`,
    `- **address search hits:** ${input.addressSearchHits}`,
    `- **keyword search hits:** ${input.keywordSearchHits}`,
    `- **API step calls:** ${input.apiStepCalls}`,
    "",
    "## region별 결과",
    "",
    "| region | 샘플 | success | no_result | low_confidence | multiple_candidates | api_error | avg confidence | pass rate |",
    "|--------|------|---------|-----------|----------------|---------------------|-----------|----------------|-----------|",
    ...stats.map(
      (item) =>
        `| ${item.region} | ${item.sampleCount} | ${item.success} | ${item.noResult} | ${item.lowConfidence} | ${item.multipleCandidates} | ${item.apiError} | ${item.avgConfidence} | ${Math.round(item.passRate * 100)}% ${item.passed ? "✓" : "✗"} |`,
    ),
    "",
    "## 전체 status",
    "",
    `- success: ${overall.success}`,
    `- no_result: ${overall.no_result}`,
    `- low_confidence: ${overall.low_confidence}`,
    `- multiple_candidates: ${overall.multiple_candidates}`,
    `- api_error: ${overall.api_error}`,
    `- skipped: ${overall.skipped}`,
    "",
    "## 실패/검토 필요 목록",
    "",
    ...(failedRows.length === 0
      ? ["_없음_"]
      : failedRows.map(
          (row) =>
            `- **${row.name}** (${row.region}/${row.city}) [${row.status}] — ${row.note}`,
        )),
    "",
    "## 원인 추정",
    "",
    ...stats
      .filter((item) => !item.passed && item.sampleCount > 0)
      .map(
        (item) =>
          `- **${item.region}**: success rate ${Math.round(item.passRate * 100)}% — city 기반 시·도 보정 또는 keyword fallback 재검토`,
      ),
    ...(stats.every((item) => item.passed || item.sampleCount === 0)
      ? ["- 모든 region 80% 이상 통과"]
      : []),
    "",
    "## address normalization 점검",
    "",
    "- 서울/경기/강원/제주: region prefix 직접 매핑",
    "- 충청/전라/경상: **city → 시·도** 매핑 (청주→충청북도, 천안→충청남도 등)",
    "- address에 경북/전남 등 포함 시 address 내용 우선",
    "- 시·도 확정 불가 시 keyword fallback",
    "",
    "## 전체 geocoding 실행 가능 여부",
    "",
    allPassed
      ? "- **조건부 가능** — 모든 region 샘플 pass rate ≥ 80%. manual_questions 검토 후 전체 실행."
      : "- **아직 불가** — 일부 region pass rate 미달. normalization/fallback 추가 보정 필요.",
    "",
    "## 다음 단계 (전체 실행 — 아직 실행하지 않음)",
    "",
    "```bash",
    "npm run geocode:golf-courses -- --execute --provider kakao --all",
    "```",
    "",
    "현재 `--all`은 regional 검증 완료 후 별도 승인 단계에서 활성화.",
    "",
  ];

  return lines.join("\n");
}

export function selectRegionalSampleRows<T extends { region: string }>(
  rows: T[],
  limitPerRegion: number,
): T[] {
  const selected: T[] = [];
  for (const region of UI_REGIONS) {
    const regionRows = rows.filter((row) => row.region === region);
    selected.push(...regionRows.slice(0, limitPerRegion));
  }
  return selected;
}
