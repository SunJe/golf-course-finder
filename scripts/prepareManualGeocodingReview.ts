import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import {
  buildGeocodingQuery,
  GEOCODING_INPUT_HEADERS,
  type GeocodingInputRow,
} from "./lib/geocodingUtils";
import { checkGeocodingEnvKeys, loadEnvLocal } from "./lib/envUtils";
import {
  buildNoResultRetryQueries,
  buildRowCountReconciliationReport,
  compareImportRowCounts,
} from "./lib/geocodingManualReview";
import {
  fetchReviewCandidates,
  retryNoResultWithQueries,
  type ReviewCandidate,
} from "./lib/kakaoGeocoder";
import { isValidWgs84Coordinate } from "./lib/geocodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const IMPORT_PATH = path.join(ROOT, "data/golf_courses_import.csv");
const GEOCODING_INPUT_PATH = path.join(ROOT, "data/geocoding/geocoding_input.csv");
const GEOCODED_PATH = path.join(ROOT, "data/golf_courses_import_geocoded.csv");
const FAILURES_PATH = path.join(ROOT, "data/geocoding/geocoding_failures.csv");
const REVIEW_DIR = path.join(ROOT, "data/review");
const GEOCODING_DIR = path.join(ROOT, "data/geocoding");

const RECONCILIATION_PATH = path.join(REVIEW_DIR, "row_count_reconciliation.md");
const MANUAL_REVIEW_PATH = path.join(REVIEW_DIR, "geocoding_manual_review.md");
const DECISIONS_PATH = path.join(GEOCODING_DIR, "manual_geocoding_decisions.csv");
const RETRY_RESULTS_PATH = path.join(GEOCODING_DIR, "geocoding_retry_results.csv");

const DECISION_HEADERS = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "status",
  "selected_latitude",
  "selected_longitude",
  "selected_address",
  "decision",
  "note",
] as const;

const RETRY_HEADERS = [
  "id",
  "name",
  "status",
  "winning_query",
  "endpoint",
  "confidence",
  "candidate_count",
  "top_place_name",
  "top_latitude",
  "top_longitude",
  "note",
] as const;

const GEOCODING_REQUEST_DELAY_MS = 350;

interface FailureRow {
  id: string;
  name: string;
  address: string;
  query: string;
  reason: string;
  region: string;
  city: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function recordFromRow(headers: string[], values: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = values[index] ?? "";
  });
  return record;
}

function loadImportMaps() {
  const parsed = parseCsv(readFileUtf8(IMPORT_PATH));
  const byId = new Map<string, Record<string, string>>();
  for (const row of parsed.rows) {
    const record = recordFromRow(parsed.headers, row);
    byId.set(record.id, record);
  }
  return { parsed, byId };
}

function loadGeocodingInputRows(): GeocodingInputRow[] {
  const { headers, rows } = parseCsv(readFileUtf8(GEOCODING_INPUT_PATH));
  const index = (name: string) => headers.indexOf(name);
  return rows.map((values) => ({
    id: values[index("id")] ?? "",
    name: values[index("name")] ?? "",
    region: values[index("region")] ?? "",
    city: values[index("city")] ?? "",
    address: values[index("address")] ?? "",
    query: values[index("query")] ?? "",
    source: values[index("source")] ?? "",
  }));
}

function syncGeocodingInputFromImport(
  importParsed: ReturnType<typeof parseCsv>,
  missingIds: string[],
): number {
  if (missingIds.length === 0) return 0;

  const { headers, rows } = parseCsv(readFileUtf8(GEOCODING_INPUT_PATH));
  const importById = new Map<string, string[]>();
  for (const row of importParsed.rows) {
    importById.set(row[importParsed.headers.indexOf("id")] ?? "", row);
  }

  const added: string[][] = [];
  for (const id of missingIds) {
    const importRow = importById.get(id);
    if (!importRow) continue;
    const record = recordFromRow(importParsed.headers, importRow);
    const query = buildGeocodingQuery(
      record.name,
      record.city,
      record.address,
      record.region,
    );
    added.push([
      record.id,
      record.name,
      record.region,
      record.city,
      record.address,
      query,
      record.source || "public_data",
    ]);
  }

  writeFileUtf8(
    GEOCODING_INPUT_PATH,
    rowsToCsv([...GEOCODING_INPUT_HEADERS], [...rows, ...added]),
  );
  return added.length;
}

function loadFailures(byId: Map<string, Record<string, string>>): FailureRow[] {
  const { headers, rows } = parseCsv(readFileUtf8(FAILURES_PATH));
  const index = (name: string) => headers.indexOf(name);
  return rows.map((values) => {
    const id = values[index("id")] ?? "";
    const importRow = byId.get(id);
    return {
      id,
      name: values[index("name")] ?? "",
      address: values[index("address")] ?? "",
      query: values[index("query")] ?? "",
      reason: values[index("reason")] ?? "",
      region: importRow?.region ?? "",
      city: importRow?.city ?? "",
    };
  });
}

function toInputRow(failure: FailureRow): GeocodingInputRow {
  return {
    id: failure.id,
    name: failure.name,
    region: failure.region,
    city: failure.city,
    address: failure.address,
    query: failure.query,
    source: "public_data",
  };
}

function recommendCandidate(
  row: GeocodingInputRow,
  candidates: ReviewCandidate[],
): {
  recommended: ReviewCandidate | null;
  reason: string;
  userSelectionRequired: boolean;
} {
  if (candidates.length === 0) {
    return {
      recommended: null,
      reason: "후보 없음",
      userSelectionRequired: true,
    };
  }

  const top = candidates[0];
  const second = candidates[1];
  const topValid = isValidWgs84Coordinate(top.latitude, top.longitude);
  const tied =
    second &&
    top.confidence >= 40 &&
    top.confidence - second.confidence < 10;

  if (tied) {
    return {
      recommended: top,
      reason: `동점/근접 score (${top.confidence} vs ${second.confidence}) — 자동 확정 불가`,
      userSelectionRequired: true,
    };
  }

  if (top.confidence >= 70 && topValid) {
    return {
      recommended: top,
      reason: `confidence=${top.confidence}, region/city/address/name 일치도 높음 (추천만, 자동 반영 없음)`,
      userSelectionRequired: true,
    };
  }

  if (top.confidence >= 40 && topValid) {
    return {
      recommended: top,
      reason: `confidence=${top.confidence} — 검토 후 선택 권장`,
      userSelectionRequired: true,
    };
  }

  return {
    recommended: top,
    reason: `confidence=${top.confidence} — 신뢰 낮음, 수동 확인 필요`,
    userSelectionRequired: true,
  };
}

function formatCandidateBlock(candidate: ReviewCandidate): string[] {
  return [
    `- **후보 ${candidate.rank}**`,
    `  - place_name: ${candidate.placeName || "(none)"}`,
    `  - address_name: ${candidate.addressName || "(none)"}`,
    `  - road_address_name: ${candidate.roadAddressName || "(none)"}`,
    `  - latitude: ${candidate.latitude}`,
    `  - longitude: ${candidate.longitude}`,
    `  - confidence: ${candidate.confidence}`,
    `  - query: ${candidate.query} (${candidate.endpoint})`,
    `  - 이유: ${candidate.reason}`,
  ];
}

async function main(): Promise<void> {
  const runAt = new Date().toISOString();
  const { parsed: importParsed, byId } = loadImportMaps();
  const geocodingInputParsed = parseCsv(readFileUtf8(GEOCODING_INPUT_PATH));
  const geocodedParsed = parseCsv(readFileUtf8(GEOCODED_PATH));

  const counts = compareImportRowCounts({
    importRows: importParsed.rows,
    importHeaders: importParsed.headers,
    geocodingInputRows: geocodingInputParsed.rows,
    geocodingInputHeaders: geocodingInputParsed.headers,
    geocodedOutputRows: geocodedParsed.rows,
    geocodedOutputHeaders: geocodedParsed.headers,
  });

  const addedRows = syncGeocodingInputFromImport(
    importParsed,
    counts.missingInGeocodingInput,
  );

  const historicalNote = [
    "- Phase 2.6 `apply:manual-answers`에서 **블랙스톤제주** 2행(18홀+9홀)을 1행(27홀)으로 병합",
    "- 제거된 id: `gc-74de2175f831-2` (병합 후 `gc-74de2175f831` 단일 row 유지)",
    "- 이전 리포트의 **535행**은 병합 전 import 기준이며, 현재 기준 import **데이터 행 수는 534**",
    "- geocoding 실행 시점 리포트의 534행은 병합 후 정상 수치",
    "- 현재 import / geocoding_input / geocoded output id 집합은 **일치**",
  ].join("\n");

  const actionTaken =
    addedRows > 0
      ? `- geocoding_input.csv에 누락 ${addedRows}행 추가`
      : "- id 불일치 없음 — geocoding_input 수정 불필요";

  fs.writeFileSync(
    RECONCILIATION_PATH,
    buildRowCountReconciliationReport({
      counts,
      importRowsById: byId,
      runAt,
      historicalNote,
      actionTaken,
    }),
    "utf8",
  );

  const failures = loadFailures(byId);
  const multipleCandidates = failures.filter(
    (row) => row.reason === "multiple_candidates",
  );
  const noResults = failures.filter((row) => row.reason === "no_result");

  const keys = checkGeocodingEnvKeys(ROOT);
  const env = loadEnvLocal(ROOT);
  const apiKey = env.KAKAO_REST_API_KEY ?? "";

  const reviewLines = [
    "# Geocoding Manual Review",
    "",
    `> Generated: ${runAt}`,
    "",
    "## 개요",
    "",
    `- **failure 총 ${failures.length}건** (multiple_candidates ${multipleCandidates.length}, no_result ${noResults.length})`,
    `- **자동 좌표 반영 없음** — \`manual_geocoding_decisions.csv\`에 decision 입력 후 \`npm run apply:manual-geocoding\``,
    "",
    "## decision 값",
    "",
    "- `use_candidate` — 후보 좌표 사용 (selected_* 또는 추천 후보 rank 1)",
    "- `manual_coordinate` — selected_latitude/longitude 직접 입력",
    "- `retry_with_query` — 추가 query 재시도 (수동)",
    "- `keep_unresolved` — 좌표 없이 유지",
    "- `exclude_from_import` — 최종 import 제외",
    "",
  ];

  const decisionRows: string[][] = [];
  const retryResultRows: string[][] = [];

  if (!keys.kakaoRestApiKey) {
    reviewLines.push("## API key 없음", "", "후보 조회/no_result retry 스킵", "");
  } else {
    reviewLines.push("## multiple_candidates", "");

    for (const [index, failure] of multipleCandidates.entries()) {
      if (index > 0) await sleep(GEOCODING_REQUEST_DELAY_MS);
      const row = toInputRow(failure);
      const candidates = await fetchReviewCandidates(row, apiKey);
      const recommendation = recommendCandidate(row, candidates);

      reviewLines.push(`### ${failure.name}`, "");
      reviewLines.push(`- **id:** ${failure.id}`);
      reviewLines.push(`- **region / city:** ${failure.region} / ${failure.city}`);
      reviewLines.push(`- **original address:** ${failure.address}`);
      reviewLines.push(`- **query:** ${failure.query}`);
      reviewLines.push("");
      reviewLines.push("#### 후보");
      reviewLines.push("");
      if (candidates.length === 0) {
        reviewLines.push("_후보 없음_");
      } else {
        for (const candidate of candidates) {
          reviewLines.push(...formatCandidateBlock(candidate));
          reviewLines.push("");
        }
      }
      reviewLines.push("#### Cursor 추천");
      reviewLines.push("");
      if (recommendation.recommended) {
        reviewLines.push(
          `- **추천 후보 ${recommendation.recommended.rank}:** ${recommendation.recommended.placeName || recommendation.recommended.addressName}`,
        );
        reviewLines.push(`- **추천 이유:** ${recommendation.reason}`);
      } else {
        reviewLines.push("- **추천 후보:** 없음");
        reviewLines.push(`- **추천 이유:** ${recommendation.reason}`);
      }
      reviewLines.push(
        `- **사용자 선택 필요:** ${recommendation.userSelectionRequired ? "예" : "아니오"}`,
      );
      reviewLines.push("");

      decisionRows.push([
        failure.id,
        failure.name,
        failure.region,
        failure.city,
        failure.address,
        failure.reason,
        "",
        "",
        recommendation.recommended?.addressName ||
          recommendation.recommended?.roadAddressName ||
          "",
        "",
        recommendation.reason,
      ]);
    }

    reviewLines.push("## no_result retry", "");

    for (const [index, failure] of noResults.entries()) {
      if (index > 0) await sleep(GEOCODING_REQUEST_DELAY_MS);
      const row = toInputRow(failure);
      const retryQueries = buildNoResultRetryQueries(row);
      const retry = await retryNoResultWithQueries(row, retryQueries, apiKey);

      reviewLines.push(`### ${failure.name}`, "");
      reviewLines.push(`- **id:** ${failure.id}`);
      reviewLines.push(`- **region / city:** ${failure.region} / ${failure.city}`);
      reviewLines.push(`- **original address:** ${failure.address}`);
      reviewLines.push(`- **retry queries (${retryQueries.length}):** ${retryQueries.slice(0, 8).join(" | ")}${retryQueries.length > 8 ? " | ..." : ""}`);
      reviewLines.push(`- **retry status:** ${retry.status}`);
      reviewLines.push(`- **winning query:** ${retry.winningQuery || "(none)"}`);
      reviewLines.push(`- **confidence:** ${retry.confidence}`);
      reviewLines.push(
        `- **자동 반영:** ${retry.status === "success" ? "아니오 (review/decisions 필요)" : "불가"}`,
      );
      reviewLines.push("");

      if (retry.candidates.length > 0) {
        reviewLines.push("#### retry 후보");
        reviewLines.push("");
        for (const candidate of retry.candidates) {
          reviewLines.push(...formatCandidateBlock(candidate));
          reviewLines.push("");
        }
      }

      const top = retry.candidates[0];
      retryResultRows.push([
        failure.id,
        failure.name,
        retry.status,
        retry.winningQuery,
        retry.endpoint,
        String(retry.confidence),
        String(retry.candidateCount),
        top?.placeName ?? "",
        top ? String(top.latitude) : "",
        top ? String(top.longitude) : "",
        retry.status === "success"
          ? "success — manual_geocoding_decisions에 use_candidate 입력 필요"
          : retry.status === "multiple_candidates"
            ? "multiple_candidates — 후보 비교 후 decision 입력"
            : "no_result 유지",
      ]);

      decisionRows.push([
        failure.id,
        failure.name,
        failure.region,
        failure.city,
        failure.address,
        retry.status === "no_result" ? "no_result" : retry.status,
        "",
        "",
        top?.addressName || top?.roadAddressName || "",
        "",
        retry.status === "success"
          ? `retry success query="${retry.winningQuery}" — decision=use_candidate 입력`
          : retry.status === "multiple_candidates"
            ? "retry multiple_candidates — 후보 선택 필요"
            : "retry no_result — manual_coordinate 또는 keep_unresolved",
      ]);
    }
  }

  writeFileUtf8(DECISIONS_PATH, rowsToCsv([...DECISION_HEADERS], decisionRows));
  writeFileUtf8(RETRY_RESULTS_PATH, rowsToCsv([...RETRY_HEADERS], retryResultRows));
  fs.writeFileSync(MANUAL_REVIEW_PATH, reviewLines.join("\n"), "utf8");

  console.log("[prepare:manual-geocoding-review] Complete");
  console.log(`  Reconciliation: ${RECONCILIATION_PATH}`);
  console.log(`  Manual review:  ${MANUAL_REVIEW_PATH}`);
  console.log(`  Decisions:      ${DECISIONS_PATH}`);
  console.log(`  Retry results:  ${RETRY_RESULTS_PATH}`);
  console.log(`  Import rows:    ${counts.importDataRows}`);
  console.log(`  Failures:       ${failures.length}`);
}

main().catch((error) => {
  console.error("[prepare:manual-geocoding-review] Failed:", error);
  process.exit(1);
});
