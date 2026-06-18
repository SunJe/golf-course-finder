import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  buildHeaderMap,
  COLUMN_ALIASES,
  findColumnByAliases,
} from "./lib/golfCourseTransform";
import {
  findSourceByFileName,
  getMasterSource,
  getProjectRoot,
  getRawDir,
  isMasterSourceAvailable,
  loadSourceRegistry,
} from "./lib/sourceRegistry";

interface FieldMapping {
  field: string;
  matchedColumn: string | null;
}

interface RawFileAnalysis {
  fileName: string;
  sourceId: string;
  sourceRole: string;
  encoding: string;
  encodingConfidence: string;
  encodingNotes: string;
  rowCount: number;
  columns: string[];
  sampleRows: string[][];
  fieldMappings: FieldMapping[];
  hasLatitude: boolean;
  hasLongitude: boolean;
  excludedKeywordRowEstimate: number;
  fileSizeBytes: number;
}

function buildFieldMappings(headerMap: Map<string, string>): FieldMapping[] {
  const fields = [
    { field: "name", aliases: COLUMN_ALIASES.name },
    { field: "address", aliases: COLUMN_ALIASES.address },
    { field: "hole_count", aliases: COLUMN_ALIASES.holeCount },
    { field: "course_type", aliases: COLUMN_ALIASES.courseType },
    { field: "phone", aliases: COLUMN_ALIASES.phone },
    { field: "business_status", aliases: COLUMN_ALIASES.businessStatus },
    { field: "latitude", aliases: COLUMN_ALIASES.latitude },
    { field: "longitude", aliases: COLUMN_ALIASES.longitude },
  ] as const;

  return fields.map(({ field, aliases }) => ({
    field,
    matchedColumn: findColumnByAliases(headerMap, aliases),
  }));
}

function countExcludedKeywordRows(
  headers: string[],
  rows: string[][],
  keywords: string[],
): number {
  if (keywords.length === 0 || rows.length === 0) return 0;

  let count = 0;
  for (const row of rows) {
    const text = headers
      .map((_, i) => row[i] ?? "")
      .join(" ")
      .toLowerCase();
    if (keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      count += 1;
    }
  }
  return count;
}

function analyzeRawFile(
  filePath: string,
  fileName: string,
  excludedKeywords: string[],
): RawFileAnalysis {
  const registry = loadSourceRegistry();
  const source = findSourceByFileName(registry, fileName);
  const encodingResult = readCsvWithEncodingGuess(filePath);
  const { headers, rows } = parseCsv(encodingResult.content);
  const headerMap = buildHeaderMap(headers);
  const fieldMappings = buildFieldMappings(headerMap);

  const latCol = fieldMappings.find((f) => f.field === "latitude")?.matchedColumn;
  const lngCol = fieldMappings.find((f) => f.field === "longitude")?.matchedColumn;

  const hasLatitude = Boolean(latCol);
  const hasLongitude = Boolean(lngCol);

  return {
    fileName,
    sourceId: source?.id ?? "unknown",
    sourceRole: source?.role ?? "unknown",
    encoding: encodingResult.encoding,
    encodingConfidence: encodingResult.confidence,
    encodingNotes: encodingResult.notes,
    rowCount: rows.length,
    columns: headers,
    sampleRows: rows.slice(0, 5),
    fieldMappings,
    hasLatitude,
    hasLongitude,
    excludedKeywordRowEstimate: countExcludedKeywordRows(
      headers,
      rows,
      excludedKeywords,
    ),
    fileSizeBytes: fs.statSync(filePath).size,
  };
}

function formatSampleRow(headers: string[], row: string[]): string {
  return headers
    .map((h, i) => `${h}=${JSON.stringify((row[i] ?? "").slice(0, 60))}`)
    .join("; ");
}

function buildQualityReport(
  runAt: string,
  analyses: RawFileAnalysis[],
  downloadSummary: {
    registrySources: string[];
    successIds: string[];
    failedIds: string[];
    skippedIds: string[];
    manualIds: string[];
  },
): string {
  const master = getMasterSource(loadSourceRegistry());
  const masterReady = isMasterSourceAvailable();
  const nextPhasePossible = masterReady;

  const lines: string[] = [
    "# Data Quality Report — Phase 1 (Raw Analysis)",
    "",
    `> Generated: ${runAt}`,
    "",
    "Phase 1 only: download status + raw CSV analysis. **No merge, no import CSV.**",
    "",
    "---",
    "",
    "## 실행 정보",
    "",
    `- **실행 일시:** ${runAt}`,
    `- **실행 명령:** \`npm run analyze:golf-raw\` (after \`npm run download:golf-sources\`)`,
    `- **Phase:** 1 — raw collection & analysis`,
    "",
    "## Source registry 목록",
    "",
  ];

  const registry = loadSourceRegistry();
  for (const s of registry.sources) {
    lines.push(
      `- \`${s.id}\` (${s.role}) → \`data/raw/${s.expected_file_name}\``,
    );
  }

  lines.push("");
  lines.push("## 다운로드 결과 (registry 기준)");
  lines.push("");
  lines.push(`- **성공 / 이미 존재:** ${downloadSummary.successIds.length ? downloadSummary.successIds.map((id) => `\`${id}\``).join(", ") : "없음"}`);
  lines.push(`- **실패:** ${downloadSummary.failedIds.length ? downloadSummary.failedIds.map((id) => `\`${id}\``).join(", ") : "없음"}`);
  lines.push(`- **스킵 (API key 등):** ${downloadSummary.skippedIds.length ? downloadSummary.skippedIds.map((id) => `\`${id}\``).join(", ") : "없음"}`);
  lines.push(`- **수동 다운로드 필요:** ${downloadSummary.manualIds.length ? downloadSummary.manualIds.map((id) => `\`${id}\``).join(", ") : "없음"}`);
  lines.push("");
  lines.push("상세: [`download_failures.md`](./download_failures.md)");
  lines.push("");
  lines.push("## Master source 확보 여부");
  lines.push("");

  if (master) {
    lines.push(`- **Master source id:** \`${master.id}\``);
    lines.push(`- **Expected file:** \`data/raw/${master.expected_file_name}\``);
    lines.push(`- **확보 여부:** ${masterReady ? "**YES**" : "**NO**"}`);
  } else {
    lines.push("- Master source not defined in registry.");
  }

  lines.push("");
  lines.push("## 다음 단계 가능 여부");
  lines.push("");
  lines.push(
    nextPhasePossible
      ? "- **Phase 2 (master 변환):** 가능 — master raw CSV 확보됨. `analyze:golf-raw` 결과 확인 후 진행."
      : "- **Phase 2 (master 변환):** **불가** — master CSV(`ministry_golf_courses.csv`)를 `data/raw/`에 먼저 저장해야 함.",
  );
  lines.push(
    "- **Supplement 병합 / import CSV 생성:** Phase 1 범위 아님 — 아직 수행하지 않음.",
  );
  lines.push("");
  lines.push("## 사용자가 직접 해야 할 일");
  lines.push("");

  if (!masterReady) {
    lines.push(
      `1. **최우선:** 문화체육관광부 전국 골프장 CSV를 다운로드하여 \`data/raw/ministry_golf_courses.csv\`로 저장`,
    );
    lines.push("2. `npm run download:golf-sources` → `npm run analyze:golf-raw` 재실행");
    lines.push("3. `data/review/download_failures.md`에서 supplement/manual source 수동 다운로드 목록 확인");
  } else {
    lines.push("1. Master raw 분석 결과(아래) 확인 — 컬럼 매핑·인코딩·행 수 검토");
    lines.push("2. Supplement source는 master 확보 후 수동 다운로드 (download_failures.md 참고)");
    lines.push("3. Phase 2 master 변환 작업 진행 (별도 단계)");
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Raw 파일별 분석");
  lines.push("");

  if (analyses.length === 0) {
    lines.push("*`data/raw/`에 CSV 파일이 없습니다.*");
  }

  for (const a of analyses) {
    lines.push(`### ${a.fileName}`);
    lines.push("");
    lines.push(`| 항목 | 값 |`);
    lines.push(`|------|-----|`);
    lines.push(`| source id | \`${a.sourceId}\` |`);
    lines.push(`| role | ${a.sourceRole} |`);
    lines.push(`| file size | ${a.fileSizeBytes} bytes |`);
    lines.push(`| encoding (estimated) | ${a.encoding} (${a.encodingConfidence}) |`);
    lines.push(`| encoding notes | ${a.encodingNotes} |`);
    lines.push(`| row count | ${a.rowCount} |`);
    lines.push(`| has latitude column | ${a.hasLatitude ? "yes" : "no"} |`);
    lines.push(`| has longitude column | ${a.hasLongitude ? "yes" : "no"} |`);
    lines.push(
      `| excluded keyword rows (estimate) | ${a.excludedKeywordRowEstimate} |`,
    );
    lines.push("");
    lines.push("**Columns:**");
    lines.push("");
    lines.push("```");
    lines.push(a.columns.join(", "));
    lines.push("```");
    lines.push("");
    lines.push("**Field mapping candidates:**");
    lines.push("");
    for (const m of a.fieldMappings) {
      lines.push(
        `- ${m.field}: ${m.matchedColumn ? `\`${m.matchedColumn}\`` : "_not found_"}`,
      );
    }
    lines.push("");
    lines.push("**Sample rows (up to 5):**");
    lines.push("");
    a.sampleRows.forEach((row, index) => {
      lines.push(`${index + 1}. ${formatSampleRow(a.columns, row)}`);
    });
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("## Phase 1 품질 지표 (병합 전 — 템플릿)");
  lines.push("");
  lines.push("| 항목 | 값 |");
  lines.push("|------|-----|");
  lines.push(`| raw CSV 파일 수 | ${analyses.length} |`);
  lines.push(`| master 원본 행 수 | ${analyses.find((a) => a.sourceRole === "master")?.rowCount ?? "N/A (master missing)"} |`);
  lines.push("| supplement 원본별 행 수 | (master 확보 후 supplement raw 추가 시 기록) |");
  lines.push("| 최종 import 행 수 | _Phase 1 — 미생성_ |");
  lines.push(`| 좌표 컬럼 보유 raw 파일 | ${analyses.filter((a) => a.hasLatitude && a.hasLongitude).length} |`);
  lines.push(`| 좌표 컬럼 없는 raw 파일 | ${analyses.filter((a) => !a.hasLatitude || !a.hasLongitude).length} |`);
  lines.push("| 자동 보강된 필드 수 | _Phase 1 — 해당 없음_ |");
  lines.push("| 신규 후보 수 | _Phase 1 — 해당 없음_ |");
  lines.push(`| 제외 키워드 포함 행 (estimate, 전체) | ${analyses.reduce((s, a) => s + a.excludedKeywordRowEstimate, 0)} |`);
  lines.push("");

  return lines.join("\n");
}

function parseDownloadFailureReasons(): Map<string, string> {
  const failuresPath = path.join(
    getProjectRoot(),
    "data/review/download_failures.md",
  );
  const reasons = new Map<string, string>();
  if (!fs.existsSync(failuresPath)) return reasons;

  const lines = fs.readFileSync(failuresPath, "utf8").split("\n");
  for (const line of lines) {
    if (!line.startsWith("|") || line.includes("source_id") || line.includes("---")) {
      continue;
    }
    const parts = line
      .split("|")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length >= 4 && parts[0] !== "—") {
      reasons.set(parts[0], parts[3]);
    }
  }
  return reasons;
}

function inferDownloadSummary(): {
  registrySources: string[];
  successIds: string[];
  failedIds: string[];
  skippedIds: string[];
  manualIds: string[];
} {
  const registry = loadSourceRegistry();
  const rawDir = getRawDir();
  const failureReasons = parseDownloadFailureReasons();

  const successIds: string[] = [];
  const failedIds: string[] = [];
  const skippedIds: string[] = [];
  const manualIds: string[] = [];

  for (const source of registry.sources) {
    const rawPath = path.join(rawDir, source.expected_file_name);
    if (fs.existsSync(rawPath) && fs.statSync(rawPath).size > 0) {
      successIds.push(source.id);
      continue;
    }

    const reason = failureReasons.get(source.id) ?? "missing_raw_file";

    if (reason === "skipped_missing_api_key") {
      skippedIds.push(source.id);
      failedIds.push(source.id);
    } else if (
      reason === "manual_required" ||
      reason === "no_download_url_in_registry"
    ) {
      manualIds.push(source.id);
      failedIds.push(source.id);
    } else {
      failedIds.push(source.id);
      if (reason !== "download_failed") {
        manualIds.push(source.id);
      }
    }
  }

  return {
    registrySources: registry.sources.map((s) => s.id),
    successIds,
    failedIds: [...new Set(failedIds)],
    skippedIds,
    manualIds: [...new Set(manualIds)],
  };
}

function main(): void {
  const runAt = new Date().toISOString();
  const rawDir = getRawDir();
  const registry = loadSourceRegistry();
  const excludedKeywords = registry.excluded_category_keywords ?? [];

  if (!fs.existsSync(rawDir)) {
    fs.mkdirSync(rawDir, { recursive: true });
  }

  const csvFiles = fs
    .readdirSync(rawDir)
    .filter((f) => f.toLowerCase().endsWith(".csv"));

  console.log("[analyze:golf-raw] Phase 1 — raw CSV analysis");
  console.log(`  Files found: ${csvFiles.length}`);

  const analyses = csvFiles.map((fileName) =>
    analyzeRawFile(path.join(rawDir, fileName), fileName, excludedKeywords),
  );

  for (const a of analyses) {
    console.log(
      `  - ${a.fileName}: ${a.rowCount} rows, encoding=${a.encoding}, source=${a.sourceId}`,
    );
  }

  const downloadSummary = inferDownloadSummary();
  const report = buildQualityReport(runAt, analyses, downloadSummary);
  const reportPath = path.join(getProjectRoot(), "data/review/data_quality_report.md");
  fs.writeFileSync(reportPath, report, "utf8");

  console.log("");
  console.log(`  Report: data/review/data_quality_report.md`);

  const masterReady = isMasterSourceAvailable();
  if (!masterReady) {
    console.log("");
    console.log(
      "  WARNING: Master source (ministry_golf_courses.csv) not found.",
    );
    console.log("  Phase 2 is blocked. See data/review/download_failures.md");
    process.exitCode = 1;
  }
}

main();
