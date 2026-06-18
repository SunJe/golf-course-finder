import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8 } from "./csvUtils";

interface ExcludedRow {
  reason: string;
  name: string;
  address: string;
  source: string;
  detectedCategory: string;
}

interface AmbiguousRow {
  reason: string;
  candidateName: string;
  candidateAddress: string;
  source: string;
  conflictingValues: string;
  suggestedAction: string;
}

interface ImportRow {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  holeCount: string;
  courseType: string;
}

const MILITARY_PATTERN = /군\s*골프|체력단련|국방|군체육|군\s*cc/i;
const GOLF_FACILITY_PATTERN =
  /cc|컨트리|골프클럽|골프장|c\.c|country\s*club/i;

function loadExcludedRows(filePath: string): ExcludedRow[] {
  const { headers, rows } = parseCsv(readFileUtf8(filePath));
  return rows.map((values) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return {
      reason: record.reason ?? "",
      name: record.name ?? "",
      address: record.address ?? "",
      source: record.source ?? "",
      detectedCategory: record.detected_category ?? "",
    };
  });
}

function loadAmbiguousRows(filePath: string): AmbiguousRow[] {
  const { headers, rows } = parseCsv(readFileUtf8(filePath));
  return rows.map((values) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return {
      reason: record.reason ?? "",
      candidateName: record.candidate_name ?? "",
      candidateAddress: record.candidate_address ?? "",
      source: record.source ?? "",
      conflictingValues: record.conflicting_values ?? "",
      suggestedAction: record.suggested_action ?? "",
    };
  });
}

function loadImportRows(filePath: string): ImportRow[] {
  const { headers, rows } = parseCsv(readFileUtf8(filePath));
  const index = (name: string): number => headers.indexOf(name);

  return rows.map((values) => ({
    id: values[index("id")] ?? "",
    name: values[index("name")] ?? "",
    region: values[index("region")] ?? "",
    city: values[index("city")] ?? "",
    address: values[index("address")] ?? "",
    holeCount: values[index("hole_count")] ?? "",
    courseType: values[index("course_type")] ?? "",
  }));
}

function countBy<T>(
  items: T[],
  keyFn: (item: T) => string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item) || "(empty)";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function parseBaseId(conflictingValues: string): string | null {
  const match = conflictingValues.match(/baseId=([^,\s]+)/);
  return match?.[1] ?? null;
}

interface ConfirmationFlag {
  name: string;
  address: string;
  detectedCategory: string;
  reason: string;
  note: string;
}

function detectExcludedConfirmationNeeded(row: ExcludedRow): ConfirmationFlag | null {
  const text = `${row.name} ${row.address}`;

  if (MILITARY_PATTERN.test(text)) {
    return {
      name: row.name,
      address: row.address,
      detectedCategory: row.detectedCategory,
      reason: row.reason,
      note: "군/체력단련장 계열 — 일반 골프장 import 대상일 수 있음. excluded에서 제외 후 import/ambiguous 검토.",
    };
  }

  if (row.detectedCategory === "아카데미") {
    if (/아카데미로/.test(row.address) && !/골프\s*아카데미|아카데미/i.test(row.name)) {
      return {
        name: row.name,
        address: row.address,
        detectedCategory: row.detectedCategory,
        reason: row.reason,
        note: "도로명 '아카데미로' 오탐 가능 — 실제 골프장(잭 니클라우스 등) import 복귀 검토.",
      };
    }
    if (!/아카데미|academy/i.test(row.name)) {
      return {
        name: row.name,
        address: row.address,
        detectedCategory: row.detectedCategory,
        reason: row.reason,
        note: "시설명에는 아카데미 없음 — 사업자명 키워드 오탐 가능. import 복귀 검토.",
      };
    }
  }

  if (row.detectedCategory === "골프존") {
    if (
      row.name.includes("골프존카운티") ||
      row.name.includes("골프존 카운티") ||
      GOLF_FACILITY_PATTERN.test(row.name)
    ) {
      return {
        name: row.name,
        address: row.address,
        detectedCategory: row.detectedCategory,
        reason: row.reason,
        note: "골프존카운티 실제 필드 골프장 — 스크린골프와 다름. import 복귀 검토.",
      };
    }
  }

  return null;
}

type GroupSuggestion =
  | "dedupe_candidate"
  | "merge_candidate"
  | "keep_both_candidate";

function suggestDuplicateAction(members: ImportRow[]): {
  suggestion: GroupSuggestion;
  rationale: string;
} {
  if (members.length < 2) {
    return {
      suggestion: "keep_both_candidate",
      rationale: "충돌 그룹에 2개 미만 — 수동 확인",
    };
  }

  const allSameFields = members.every(
    (member) =>
      member.name === members[0].name &&
      member.city === members[0].city &&
      member.address === members[0].address &&
      member.holeCount === members[0].holeCount &&
      member.courseType === members[0].courseType,
  );

  if (allSameFields) {
    return {
      suggestion: "dedupe_candidate",
      rationale: "name/city/address/hole_count/course_type가 완전히 동일 — 중복 제거 후보",
    };
  }

  const sameNameAddress = members.every(
    (member) =>
      member.name === members[0].name &&
      member.address === members[0].address,
  );

  if (sameNameAddress) {
    const holeTypes = new Set(
      members.map((m) => `${m.holeCount}|${m.courseType}`),
    );
    if (holeTypes.size > 1) {
      return {
        suggestion: "keep_both_candidate",
        rationale:
          "동일 name+address이나 hole_count 또는 course_type 상이 — 리조트 내 복수 코스/운영구분 분리 가능. 유지 후보",
      };
    }
  }

  const sameAddress = members.every(
    (member) => member.address === members[0].address,
  );
  const nameVariants = new Set(members.map((m) => m.name));

  if (sameAddress && nameVariants.size > 1) {
    return {
      suggestion: "merge_candidate",
      rationale: "동일 주소에 name만 다름 — 병합 후보(동일 시설 다른 표기)",
    };
  }

  return {
    suggestion: "keep_both_candidate",
    rationale: "판단 근거 불명확 — 수동 검토",
  };
}

export function generateExcludedReviewSummary(
  excludedPath: string,
  outputPath: string,
): { total: number; confirmationCount: number } {
  const rows = loadExcludedRows(excludedPath);
  const categoryCounts = countBy(rows, (r) => r.detectedCategory);
  const reasonCounts = countBy(rows, (r) => r.reason);
  const confirmations = rows
    .map(detectExcludedConfirmationNeeded)
    .filter((item): item is ConfirmationFlag => item !== null);

  const lines = [
    "# Excluded Review Summary",
    "",
    `> Generated: ${new Date().toISOString()}`,
    "",
    "## 개요",
    "",
    `- **총 제외 행 수:** ${rows.length}`,
    `- **사용자 확인 필요:** ${confirmations.length}건`,
    "",
    "## detected_category별 개수",
    "",
    ...Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => `- ${category}: ${count}`),
    "",
    "## 제외 사유(reason)별 개수",
    "",
    ...Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `- ${reason}: ${count}`),
    "",
    "## 이름 목록",
    "",
    ...rows.map((row, index) => `${index + 1}. ${row.name}`),
    "",
    "## 주소 목록",
    "",
    ...rows.map(
      (row, index) => `${index + 1}. ${row.name} — ${row.address}`,
    ),
    "",
    "## 정말 제외해도 되는지 확인 필요한 행",
    "",
    confirmations.length === 0
      ? "_해당 없음 — 군/체력단련장 오탐 없음._"
      : confirmations
          .map(
            (item, index) =>
              `### ${index + 1}. ${item.name}\n\n` +
              `- **detected_category:** ${item.detectedCategory}\n` +
              `- **reason:** ${item.reason}\n` +
              `- **address:** ${item.address}\n` +
              `- **note:** ${item.note}\n` +
              `- **action:** 자동 import 복귀하지 않음 — 사용자 확인 후 \`convert:master-courses\` 정책 조정 또는 수동 추가\n`,
          )
          .join("\n"),
    "",
    "## 제외 정책 참고",
    "",
    "- 골프연습장, 스크린골프, 파크골프장, 실내골프, 골프 아카데미 → 제외 유지",
    "- 체력단련장, 군 골프장, CC, 컨트리클럽, 골프클럽 → import 대상",
    "- 골프존카운티는 실제 필드 골프장 — 키워드 '골프존' 단독 제외는 재검토 필요",
    "",
  ];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

  return { total: rows.length, confirmationCount: confirmations.length };
}

export function generateAmbiguousReviewSummary(
  ambiguousPath: string,
  importPath: string,
  outputPath: string,
): { total: number; groupCount: number } {
  const ambiguousRows = loadAmbiguousRows(ambiguousPath);
  const importRows = loadImportRows(importPath);
  const importById = new Map(importRows.map((row) => [row.id, row]));

  const reasonCounts = countBy(ambiguousRows, (r) => r.reason);

  const groups: Array<{
    baseId: string;
    members: ImportRow[];
    ambiguous: AmbiguousRow;
    suggestion: GroupSuggestion;
    rationale: string;
  }> = [];

  for (const ambiguous of ambiguousRows) {
    const baseId = parseBaseId(ambiguous.conflictingValues);
    if (!baseId) continue;

    const members = importRows.filter(
      (row) => row.id === baseId || row.id.startsWith(`${baseId}-`),
    );
    const { suggestion, rationale } = suggestDuplicateAction(members);

    groups.push({
      baseId,
      members,
      ambiguous,
      suggestion,
      rationale,
    });
  }

  const lines = [
    "# Ambiguous Review Summary",
    "",
    `> Generated: ${new Date().toISOString()}`,
    "",
    "## 개요",
    "",
    `- **총 ambiguous 행 수:** ${ambiguousRows.length}`,
    `- **duplicate_id_collision 그룹 수:** ${groups.length}`,
    "",
    "## reason별 개수",
    "",
    ...Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => `- ${reason}: ${count}`),
    "",
    "## duplicate_id_collision 대상 목록",
    "",
    ...ambiguousRows.map(
      (row, index) =>
        `${index + 1}. **${row.candidateName}** — ${row.candidateAddress} (${row.conflictingValues})`,
    ),
    "",
    "## 그룹별 비교 및 suggested_action",
    "",
  ];

  for (const [index, group] of groups.entries()) {
    const suffixRow = group.members.find((m) => m.id !== group.baseId);
    const baseRow = importById.get(group.baseId) ?? group.members[0];

    lines.push(`### 그룹 ${index + 1}: ${group.baseId}`);
    lines.push("");
    lines.push(`- **suggested_action:** \`${group.suggestion}\``);
    lines.push(`- **근거:** ${group.rationale}`);
    lines.push("");
    lines.push("| id | name | region | city | address | hole_count | course_type |");
    lines.push("|----|------|--------|------|---------|------------|-------------|");

    for (const member of group.members) {
      lines.push(
        `| ${member.id} | ${member.name} | ${member.region} | ${member.city} | ${member.address} | ${member.holeCount} | ${member.courseType} |`,
      );
    }

    lines.push("");
    if (baseRow && suffixRow) {
      lines.push("**비교 요약:**");
      if (baseRow.holeCount !== suffixRow.holeCount) {
        lines.push(
          `- hole_count: ${baseRow.holeCount} vs ${suffixRow.holeCount}`,
        );
      }
      if (baseRow.courseType !== suffixRow.courseType) {
        lines.push(
          `- course_type: ${baseRow.courseType} vs ${suffixRow.courseType}`,
        );
      }
      if (baseRow.name === suffixRow.name && baseRow.address === suffixRow.address) {
        lines.push("- name+address 동일");
      }
    }
    lines.push("");
  }

  lines.push("## 판단 가이드");
  lines.push("");
  lines.push("- `dedupe_candidate`: 완전 동일 행 — 하나만 유지");
  lines.push("- `merge_candidate`: 동일 시설 다른 표기 — 하나로 병합 검토");
  lines.push("- `keep_both_candidate`: 복수 코스/운영구분 — 각각 유지 검토");
  lines.push("");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

  return { total: ambiguousRows.length, groupCount: groups.length };
}

export interface Phase25ReportInput {
  runAt: string;
  excludedSummaryCreated: boolean;
  ambiguousSummaryCreated: boolean;
  geocodingInputCount: number;
  geocodingFailureCount: number;
  geocodingTargetCount: number;
  apiKeys: {
    kakaoRestApiKey: boolean;
    naverClientId: boolean;
    naverClientSecret: boolean;
  };
  dryRunReady: boolean;
}

export function appendPhase25ToQualityReport(
  reportPath: string,
  input: Phase25ReportInput,
): void {
  const provider =
    input.apiKeys.kakaoRestApiKey
      ? "kakao (REST)"
      : input.apiKeys.naverClientId && input.apiKeys.naverClientSecret
        ? "naver"
        : "none";

  const section = [
    "",
    "---",
    "",
    "## Phase 2.5 — Review & Geocoding 준비",
    "",
    `- **실행 일시:** ${input.runAt}`,
    `- **excluded review summary:** ${input.excludedSummaryCreated ? "생성됨 (`data/review/excluded_review_summary.md`)" : "미생성"}`,
    `- **ambiguous review summary:** ${input.ambiguousSummaryCreated ? "생성됨 (`data/review/ambiguous_review_summary.md`)" : "미생성"}`,
    `- **geocoding_input.csv 행 수:** ${input.geocodingInputCount}`,
    `- **geocoding_failures.csv (사전 분리) 행 수:** ${input.geocodingFailureCount}`,
    `- **geocoding 대상 행 수:** ${input.geocodingTargetCount}`,
    "",
    "### API key 존재 여부 (값 미표시)",
    "",
    `- KAKAO_REST_API_KEY: ${input.apiKeys.kakaoRestApiKey}`,
    `- NAVER_CLIENT_ID: ${input.apiKeys.naverClientId}`,
    `- NAVER_CLIENT_SECRET: ${input.apiKeys.naverClientSecret}`,
    `- 사용 가능 provider: ${provider}`,
    "",
    "### dry-run 가능 여부",
    "",
    input.dryRunReady
      ? "- **가능** — `npm run geocode:golf-courses` (기본 dry-run)"
      : "- geocoding_input.csv 없음",
    "",
    "### 다음 단계",
    "",
    "1. `excluded_review_summary.md` / `ambiguous_review_summary.md` 사용자 검토",
    "2. review 반영 후 필요 시 `npm run convert:master-courses` 재실행",
    "3. `.env.local`에 geocoding API key 설정",
    "4. `npm run geocode:golf-courses -- --execute` 로 실제 geocoding",
    "5. 좌표 보강 결과 확인 후 `golf_courses_import_geocoded.csv` 생성 (별도 단계)",
    "",
  ].join("\n");

  const existing = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, "utf8")
    : "# Data Quality Report\n";

  const marker = "## Phase 2.5 — Review & Geocoding 준비";
  const withoutOld = existing.includes(marker)
    ? existing.slice(0, existing.indexOf(marker) - 4)
    : existing;

  fs.writeFileSync(reportPath, `${withoutOld.trimEnd()}${section}\n`, "utf8");
}
