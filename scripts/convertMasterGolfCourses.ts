import fs from "node:fs";
import path from "node:path";
import { parseCsv, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  buildRowSearchText,
  detectExcludedCategory,
} from "./lib/exclusionUtils";
import {
  buildHeaderMap,
  COLUMN_ALIASES,
  ERROR_HEADERS,
  OUTPUT_HEADERS,
  pickColumn,
  rowToRecord,
  transformMasterRow,
} from "./lib/golfCourseTransform";
import {
  getMasterSource,
  getProjectRoot,
  getRawFilePath,
  isMasterSourceAvailable,
  loadSourceRegistry,
} from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const IMPORT_PATH = path.join(ROOT, "data/golf_courses_import.csv");
const GEOCODING_PATH = path.join(ROOT, "data/golf_courses_needs_geocoding.csv");
const ERRORS_PATH = path.join(ROOT, "data/golf_courses_errors.csv");
const EXCLUDED_PATH = path.join(ROOT, "data/review/excluded_non_golf_courses.csv");
const AMBIGUOUS_PATH = path.join(ROOT, "data/review/ambiguous_courses.csv");
const REPORT_PATH = path.join(ROOT, "data/review/data_quality_report.md");

const EXCLUDED_HEADERS = [
  "reason",
  "name",
  "address",
  "source",
  "detected_category",
] as const;

const AMBIGUOUS_HEADERS = [
  "reason",
  "candidate_name",
  "candidate_address",
  "source",
  "conflicting_values",
  "suggested_action",
] as const;

interface Phase2Stats {
  runAt: string;
  masterSourceId: string;
  masterFileName: string;
  masterRawRows: number;
  importRows: number;
  geocodingRows: number;
  withCoordinates: number;
  excludedRows: number;
  ambiguousRows: number;
  errorRows: number;
  regionCounts: Record<string, number>;
  courseTypeCounts: Record<string, number>;
  holeCountCounts: Record<string, number>;
}

function countKey(map: Record<string, number>, key: string): void {
  map[key] = (map[key] ?? 0) + 1;
}

function writePhase2Report(stats: Phase2Stats): void {
  const supabaseImportReady =
    stats.withCoordinates === stats.importRows && stats.importRows > 0;

  const lines = [
    "# Data Quality Report — Phase 2 (Master Conversion)",
    "",
    `> Generated: ${stats.runAt}`,
    "",
    "Master-only conversion. **No supplement merge.**",
    "",
    "---",
    "",
    "## 실행 정보",
    "",
    `- **실행 일시:** ${stats.runAt}`,
    `- **실행 명령:** \`npm run convert:master-courses\``,
    `- **Master source:** \`${stats.masterSourceId}\``,
    `- **Master raw file:** \`data/raw/${stats.masterFileName}\``,
    "",
    "## Phase 2 변환 결과",
    "",
    "| 항목 | 값 |",
    "|------|-----|",
    `| master 원본 행 수 | ${stats.masterRawRows} |`,
    `| 정상 변환(import) 행 수 | ${stats.importRows} |`,
    `| golf_courses_import.csv 행 수 | ${stats.importRows} |`,
    `| 좌표 보유 행 수 | ${stats.withCoordinates} |`,
    `| 좌표 없는 행 수 | ${stats.importRows - stats.withCoordinates} |`,
    `| geocoding 필요 행 수 | ${stats.geocodingRows} |`,
    `| excluded_non_golf_courses 행 수 | ${stats.excludedRows} |`,
    `| ambiguous_courses 행 수 | ${stats.ambiguousRows} |`,
    `| 오류 행 수 | ${stats.errorRows} |`,
    "",
    "## Supabase import 가능 여부",
    "",
    supabaseImportReady
      ? "- **가능** — 모든 import 행에 latitude/longitude가 있습니다."
      : `- **좌표 보강 전 업로드 불가** — schema.sql에서 latitude/longitude가 NOT NULL입니다. 현재 ${stats.geocodingRows}행은 geocoding이 필요합니다.`,
    "",
    "## region별 행 수",
    "",
    ...Object.entries(stats.regionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([region, count]) => `- ${region}: ${count}`),
    "",
    "## course_type별 행 수",
    "",
    ...Object.entries(stats.courseTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => `- ${type}: ${count}`),
    "",
    "## hole_count 분포 (상위)",
    "",
    ...Object.entries(stats.holeCountCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([holes, count]) => `- ${holes || "(empty)"}: ${count}`),
    "",
    "## 다음 단계 필요 작업",
    "",
    "1. `data/review/excluded_non_golf_courses.csv` 검토",
    "2. `data/review/ambiguous_courses.csv` 검토",
    stats.geocodingRows > 0
      ? "3. `data/golf_courses_needs_geocoding.csv` 기준 geocoding (또는 supplement 좌표 보강)"
      : "3. geocoding 불필요 — Supabase import 진행 가능",
    "4. Supplement 병합 (Phase 3, 별도 작업)",
    "5. Review 통과 후 Supabase CSV import",
    "",
  ];

  fs.writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
}

function main(): void {
  const runAt = new Date().toISOString();
  const registry = loadSourceRegistry();

  if (!isMasterSourceAvailable(registry)) {
    console.error(
      "[convert:master-courses] Master source not found: data/raw/ministry_golf_courses.csv",
    );
    process.exit(1);
  }

  const master = getMasterSource(registry);
  if (!master) {
    console.error("[convert:master-courses] No master source in registry.");
    process.exit(1);
  }

  const rawPath = getRawFilePath(master.expected_file_name);
  const encodingResult = readCsvWithEncodingGuess(rawPath);
  const { headers, rows } = parseCsv(encodingResult.content);
  const headerMap = buildHeaderMap(headers);
  const timestamp = runAt;
  const idRegistry = new Map<string, number>();
  const excludedKeywords = registry.excluded_category_keywords ?? [];

  const importRows: string[][] = [];
  const geocodingRows: string[][] = [];
  const errorRows: string[][] = [];
  const excludedRows: string[][] = [];
  const ambiguousRows: string[][] = [];

  const stats: Phase2Stats = {
    runAt,
    masterSourceId: master.id,
    masterFileName: master.expected_file_name,
    masterRawRows: rows.length,
    importRows: 0,
    geocodingRows: 0,
    withCoordinates: 0,
    excludedRows: 0,
    ambiguousRows: 0,
    errorRows: 0,
    regionCounts: {},
    courseTypeCounts: {},
    holeCountCounts: {},
  };

  for (const values of rows) {
    const record = rowToRecord(headers, values);
    const name = pickColumn(record, headerMap, COLUMN_ALIASES.name);
    const address = pickColumn(record, headerMap, COLUMN_ALIASES.address);
    const rawRegion = pickColumn(record, headerMap, COLUMN_ALIASES.rawRegion);

    const searchText = buildRowSearchText(record);
    const excludedCategory = detectExcludedCategory(
      searchText,
      excludedKeywords,
    );

    if (excludedCategory) {
      excludedRows.push([
        `excluded_keyword:${excludedCategory}`,
        name,
        address,
        master.id,
        excludedCategory,
      ]);
      stats.excludedRows += 1;
      continue;
    }

    const result = transformMasterRow(
      {
        name,
        address,
        rawRegion,
        holeCountRaw: pickColumn(record, headerMap, COLUMN_ALIASES.holeCount),
        courseTypeRaw: pickColumn(record, headerMap, COLUMN_ALIASES.courseType),
        phone: pickColumn(record, headerMap, COLUMN_ALIASES.phone),
        businessStatus: pickColumn(
          record,
          headerMap,
          COLUMN_ALIASES.businessStatus,
        ),
        latitudeRaw: pickColumn(record, headerMap, COLUMN_ALIASES.latitude),
        longitudeRaw: pickColumn(record, headerMap, COLUMN_ALIASES.longitude),
        timestamp,
      },
      idRegistry,
    );

    if (result.kind === "excluded") {
      excludedRows.push([
        result.reason,
        result.name,
        result.address,
        master.id,
        result.category,
      ]);
      stats.excludedRows += 1;
      continue;
    }

    if (result.kind === "ambiguous") {
      ambiguousRows.push([
        result.reason,
        result.name,
        result.address,
        master.id,
        result.conflictingValues,
        "manual_review",
      ]);
      stats.ambiguousRows += 1;
      continue;
    }

    if (result.kind === "error") {
      errorRows.push([
        result.reason,
        result.name,
        result.address,
        ...result.partialRow,
      ]);
      stats.errorRows += 1;
      continue;
    }

    if (result.id !== result.baseId) {
      ambiguousRows.push([
        "duplicate_id_collision",
        name,
        address,
        master.id,
        `baseId=${result.baseId}, assigned=${result.id}`,
        "imported_with_suffix_id",
      ]);
      stats.ambiguousRows += 1;
    }

    importRows.push(result.row);
    if (result.needsGeocoding) {
      geocodingRows.push(result.row);
    } else {
      stats.withCoordinates += 1;
    }

    const region = result.row[2];
    const courseType = result.row[11];
    const holeCount = result.row[10];
    countKey(stats.regionCounts, region || "(empty)");
    countKey(stats.courseTypeCounts, courseType || "(empty)");
    countKey(stats.holeCountCounts, holeCount || "(empty)");
  }

  stats.importRows = importRows.length;
  stats.geocodingRows = geocodingRows.length;

  writeFileUtf8(IMPORT_PATH, rowsToCsv([...OUTPUT_HEADERS], importRows));
  writeFileUtf8(GEOCODING_PATH, rowsToCsv([...OUTPUT_HEADERS], geocodingRows));
  writeFileUtf8(ERRORS_PATH, rowsToCsv([...ERROR_HEADERS], errorRows));
  writeFileUtf8(
    EXCLUDED_PATH,
    rowsToCsv([...EXCLUDED_HEADERS], excludedRows),
  );
  writeFileUtf8(
    AMBIGUOUS_PATH,
    rowsToCsv([...AMBIGUOUS_HEADERS], ambiguousRows),
  );
  writePhase2Report(stats);

  console.log("[convert:master-courses] Phase 2 master conversion complete");
  console.log(`  Master raw rows:     ${stats.masterRawRows}`);
  console.log(`  Import rows:         ${stats.importRows}`);
  console.log(`  Geocoding needed:    ${stats.geocodingRows}`);
  console.log(`  With coordinates:    ${stats.withCoordinates}`);
  console.log(`  Excluded:            ${stats.excludedRows}`);
  console.log(`  Ambiguous (review):  ${stats.ambiguousRows}`);
  console.log(`  Errors:              ${stats.errorRows}`);
  console.log(`  Output: data/golf_courses_import.csv`);
  console.log(`  Report: data/review/data_quality_report.md`);

  if (stats.geocodingRows > 0) {
    console.log("");
    console.log(
      "  NOTE: Supabase import blocked until geocoding — latitude/longitude NOT NULL in schema.sql",
    );
  }
}

main();
