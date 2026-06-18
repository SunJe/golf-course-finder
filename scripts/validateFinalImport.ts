import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");
const REPORT_PATH = path.join(ROOT, "data/review/final_import_validation_report.md");
const READINESS_PATH = path.join(ROOT, "data/review/supabase_import_readiness.md");
const NAME_WARNINGS_PATH = path.join(
  ROOT,
  "data/review/final_name_quality_warnings.csv",
);

const EXPECTED_ROW_COUNT = 532;

const VALID_REGIONS = new Set([
  "서울",
  "경기",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
]);

const VALID_COURSE_TYPES = new Set(["대중제", "회원제", "군 골프장", "기타"]);

const EXCLUDED_IDS = new Set(["gc-dbaa28f7b44e", "gc-d3a3acc83c4d"]);

const MERGE_EXPECTATIONS: Record<
  string,
  { name: string; holeCount: string; note: string }
> = {
  "gc-bf183cd699c7": {
    name: "로얄링스 CC",
    holeCount: "36",
    note: "로얄링스1+2 병합",
  },
  "gc-167a7f95d402": {
    name: "솔라고CC",
    holeCount: "36",
    note: "솔라고CC1+2 병합",
  },
  "gc-74de2175f831": {
    name: "블랙스톤제주",
    holeCount: "27",
    note: "블랙스톤제주 중복 행 병합",
  },
  "gc-a043ad4dfcf6": {
    name: "서경타니CC",
    holeCount: "36",
    note: "36홀 유지",
  },
  "gc-01d6a94bf335": {
    name: "골프존카운티 청통",
    holeCount: "18",
    note: "청통골프장 → 골프존카운티 청통",
  },
  "gc-716264430902": {
    name: "태기산 나인CC",
    holeCount: "9",
    note: "휘닉스대중골프장 → 태기산 나인CC",
  },
};

const SCHEMA_COLUMNS = [
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

const LAT_MIN = 33;
const LAT_MAX = 39;
const LNG_MIN = 124;
const LNG_MAX = 132;

const ALLOWED_LATIN_TOKENS = new Set([
  "CC",
  "GC",
  "cc",
  "gc",
  "Golf",
  "Club",
  "G",
  "C",
  "H",
  "W",
  "G.C",
]);

interface ValidationIssue {
  severity: "error" | "warn";
  message: string;
}

interface NameWarning {
  id: string;
  name: string;
  warning_type: string;
  matched_text: string;
  severity: "error" | "warn";
  note: string;
}

function idx(headers: string[], name: string): number {
  const index = headers.indexOf(name);
  if (index < 0) {
    throw new Error(`missing column: ${name}`);
  }
  return index;
}

function isValidIsoDate(value: string): boolean {
  if (!value.trim()) return false;
  return Number.isFinite(Date.parse(value));
}

function isKoreaCoordinate(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= LAT_MIN &&
    lat <= LAT_MAX &&
    lng >= LNG_MIN &&
    lng <= LNG_MAX
  );
}

function hasBrokenText(value: string): string | null {
  if (!value) return null;
  if (value.includes("\uFFFD")) return "replacement character (U+FFFD)";
  if (/[\u0080-\u009F]/.test(value)) return "control characters";
  if (/Ã.|Â.|ï¿½/.test(value)) return "possible mojibake";
  return null;
}

function isAllowedLatinToken(token: string, fullName: string): boolean {
  if (ALLOWED_LATIN_TOKENS.has(token)) return true;
  if (token === "G" && fullName.includes("G.C")) return true;
  if (/^[HW]$/.test(token)) return true;
  return false;
}

function inspectNameQuality(id: string, name: string): NameWarning[] {
  const warnings: NameWarning[] = [];

  if (/골프존카[a-zA-Z]/.test(name)) {
    const match = name.match(/골프존카[a-zA-Z]+/)?.[0] ?? "골프존카+Latin";
    warnings.push({
      id,
      name,
      warning_type: "latin_in_hangul_brand",
      matched_text: match,
      severity: "error",
      note: "골프존카운티처럼 한글 브랜드명에 영문이 섞여 있음",
    });
  }

  const latinTokens = name.match(/[A-Za-z]+(?:\.[A-Za-z]+)?/g) ?? [];
  for (const token of latinTokens) {
    if (isAllowedLatinToken(token, name)) {
      warnings.push({
        id,
        name,
        warning_type: "allowed_latin_abbreviation",
        matched_text: token,
        severity: "warn",
        note: "CC/GC/Golf/Club 등 허용 가능한 영문 약어",
      });
      continue;
    }

    warnings.push({
      id,
      name,
      warning_type: "unexpected_latin_in_name",
      matched_text: token,
      severity: "warn",
      note: "이름에 예상치 못한 영문자가 포함됨 — 수동 확인 권장",
    });
  }

  return warnings;
}

function extractSchemaColumnsFromFile(): string[] {
  if (!fs.existsSync(SCHEMA_PATH)) {
    return [...SCHEMA_COLUMNS];
  }

  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  const tableMatch = sql.match(
    /create table if not exists public\.golf_courses \(([\s\S]*?)\);/i,
  );
  if (!tableMatch) return [...SCHEMA_COLUMNS];

  const columns: string[] = [];
  for (const line of tableMatch[1].split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("constraint ") || trimmed.startsWith("--")) {
      continue;
    }
    const colMatch = trimmed.match(
      /^([a-z_]+)\s+(text|integer|boolean|double precision|timestamptz|text\[\])/i,
    );
    if (colMatch) columns.push(colMatch[1]);
  }
  return columns.length > 0 ? columns : [...SCHEMA_COLUMNS];
}

function compareHeaders(csvHeaders: string[], schemaColumns: string[]): {
  match: boolean;
  missingInCsv: string[];
  extraInCsv: string[];
} {
  const csvSet = new Set(csvHeaders);
  const schemaSet = new Set(schemaColumns);
  const missingInCsv = schemaColumns.filter((col) => !csvSet.has(col));
  const extraInCsv = csvHeaders.filter((col) => !schemaSet.has(col));
  return {
    match: missingInCsv.length === 0 && extraInCsv.length === 0,
    missingInCsv,
    extraInCsv,
  };
}

function main(): void {
  const runAt = new Date().toISOString();
  const targetArg = process.argv.find((arg) => arg.startsWith("--file"));
  let targetPath = path.join(ROOT, "data/golf_courses_import_geocoded_final.csv");

  if (targetArg) {
    const value = targetArg.includes("=")
      ? targetArg.split("=")[1]
      : process.argv[process.argv.indexOf(targetArg) + 1];
    if (value) {
      targetPath = path.isAbsolute(value) ? value : path.join(ROOT, value);
    }
  }

  if (!fs.existsSync(targetPath)) {
    console.error(`[validate:final-import] File not found: ${targetPath}`);
    process.exitCode = 1;
    return;
  }

  const target = parseCsv(readFileUtf8(targetPath));
  const issues: ValidationIssue[] = [];
  const nameWarnings: NameWarning[] = [];

  const idIndex = idx(target.headers, "id");
  const nameIndex = idx(target.headers, "name");
  const regionIndex = idx(target.headers, "region");
  const cityIndex = idx(target.headers, "city");
  const addressIndex = idx(target.headers, "address");
  const latIndex = idx(target.headers, "latitude");
  const lngIndex = idx(target.headers, "longitude");
  const courseTypeIndex = idx(target.headers, "course_type");
  const holeCountIndex = idx(target.headers, "hole_count");
  const sourceIndex = idx(target.headers, "source");
  const updatedAtIndex = idx(target.headers, "updated_at");
  const createdAtIndex = idx(target.headers, "created_at");
  const descriptionIndex = idx(target.headers, "description");

  const schemaColumns = extractSchemaColumnsFromFile();
  const headerCompare = compareHeaders(target.headers, schemaColumns);
  if (!headerCompare.match) {
    if (headerCompare.missingInCsv.length > 0) {
      issues.push({
        severity: "error",
        message: `CSV missing schema columns: ${headerCompare.missingInCsv.join(", ")}`,
      });
    }
    if (headerCompare.extraInCsv.length > 0) {
      issues.push({
        severity: "error",
        message: `CSV has extra columns not in schema: ${headerCompare.extraInCsv.join(", ")}`,
      });
    }
  }

  if (target.rows.length !== EXPECTED_ROW_COUNT) {
    issues.push({
      severity: "error",
      message: `row count mismatch: expected=${EXPECTED_ROW_COUNT}, actual=${target.rows.length}`,
    });
  }

  const ids = new Set<string>();
  let duplicateIds = 0;
  let emptyNames = 0;
  let emptyAddresses = 0;
  let missingCoords = 0;
  let outOfRangeCoords = 0;
  let invalidRegions = 0;
  let invalidCourseTypes = 0;
  let invalidHoleCounts = 0;
  let invalidSources = 0;
  let invalidDates = 0;
  let brokenTextRows = 0;
  let rowsWithCoords = 0;

  const nameAddressKeys = new Map<string, string[]>();
  const duplicateNameAddress: Array<{ key: string; ids: string[] }> = [];

  for (const row of target.rows) {
    const id = row[idIndex]?.trim() ?? "";
    const name = row[nameIndex]?.trim() ?? "";
    const address = row[addressIndex]?.trim() ?? "";

    if (ids.has(id)) {
      duplicateIds += 1;
      issues.push({ severity: "error", message: `duplicate id: ${id}` });
    }
    ids.add(id);

    if (!name) emptyNames += 1;
    if (!address) emptyAddresses += 1;

    const region = row[regionIndex]?.trim() ?? "";
    if (!VALID_REGIONS.has(region)) {
      invalidRegions += 1;
      issues.push({
        severity: "error",
        message: `invalid region: ${id} (${region || "empty"})`,
      });
    }

    const courseType = row[courseTypeIndex]?.trim() ?? "";
    if (!courseType || !VALID_COURSE_TYPES.has(courseType)) {
      invalidCourseTypes += 1;
      issues.push({
        severity: "error",
        message: `invalid course_type: ${id} (${courseType || "empty"})`,
      });
    }

    const holeCount = row[holeCountIndex]?.trim() ?? "";
    if (holeCount && !Number.isFinite(Number(holeCount))) {
      invalidHoleCounts += 1;
      issues.push({
        severity: "error",
        message: `invalid hole_count: ${id} (${holeCount})`,
      });
    }

    const source = row[sourceIndex]?.trim() ?? "";
    if (source !== "public_data") {
      invalidSources += 1;
      issues.push({
        severity: "error",
        message: `invalid source: ${id} (${source || "empty"})`,
      });
    }

    for (const [field, value] of [
      ["updated_at", row[updatedAtIndex] ?? ""],
      ["created_at", row[createdAtIndex] ?? ""],
    ] as const) {
      if (!isValidIsoDate(value)) {
        invalidDates += 1;
        issues.push({
          severity: "error",
          message: `invalid ${field}: ${id} (${value || "empty"})`,
        });
      }
    }

    for (const [field, value] of [
      ["name", name],
      ["address", address],
      ["city", row[cityIndex] ?? ""],
      ["description", row[descriptionIndex] ?? ""],
    ] as const) {
      const broken = hasBrokenText(value);
      if (broken) {
        brokenTextRows += 1;
        issues.push({
          severity: "error",
          message: `broken text in ${field}: ${id} (${broken})`,
        });
      }
    }

    nameWarnings.push(...inspectNameQuality(id, name));

    const lat = row[latIndex]?.trim() ?? "";
    const lng = row[lngIndex]?.trim() ?? "";
    if (!lat || !lng) {
      missingCoords += 1;
      issues.push({
        severity: "error",
        message: `missing coordinates: ${id}`,
      });
    } else {
      rowsWithCoords += 1;
      const latNum = Number(lat);
      const lngNum = Number(lng);
      if (!isKoreaCoordinate(latNum, lngNum)) {
        outOfRangeCoords += 1;
        issues.push({
          severity: "error",
          message: `coordinates out of Korea range: ${id} (${lat}, ${lng})`,
        });
      }
    }

    const key = `${name}||${address}`;
    const existing = nameAddressKeys.get(key) ?? [];
    existing.push(id);
    nameAddressKeys.set(key, existing);
  }

  for (const [key, rowIds] of nameAddressKeys.entries()) {
    if (rowIds.length > 1) {
      duplicateNameAddress.push({ key, ids: rowIds });
      issues.push({
        severity: "warn",
        message: `duplicate name+address (${rowIds.length} rows): ${key.replace("||", " / ")} [${rowIds.join(", ")}]`,
      });
    }
  }

  for (const excludedId of EXCLUDED_IDS) {
    if (ids.has(excludedId)) {
      issues.push({
        severity: "error",
        message: `excluded id should not appear in final import: ${excludedId}`,
      });
    }
  }

  for (const [mergeId, expected] of Object.entries(MERGE_EXPECTATIONS)) {
    const row = target.rows.find((r) => (r[idIndex] ?? "").trim() === mergeId);
    if (!row) {
      issues.push({
        severity: "error",
        message: `expected merged row missing: ${mergeId} (${expected.note})`,
      });
      continue;
    }

    const actualName = row[nameIndex]?.trim() ?? "";
    const actualHoleCount = row[holeCountIndex]?.trim() ?? "";
    if (actualName !== expected.name) {
      issues.push({
        severity: "error",
        message: `merge name mismatch: ${mergeId} expected="${expected.name}" actual="${actualName}"`,
      });
    }
    if (actualHoleCount !== expected.holeCount) {
      issues.push({
        severity: "warn",
        message: `merge hole_count mismatch: ${mergeId} expected=${expected.holeCount} actual=${actualHoleCount} (${expected.note})`,
      });
    }
  }

  for (const warning of nameWarnings) {
    if (warning.severity === "error") {
      issues.push({
        severity: "error",
        message: `name quality error: ${warning.id} — ${warning.warning_type} (${warning.matched_text})`,
      });
    }
  }

  const errorIssues = issues.filter((issue) => issue.severity === "error");
  const warnIssues = issues.filter((issue) => issue.severity === "warn");
  const nameErrorCount = nameWarnings.filter((w) => w.severity === "error").length;
  const nameWarnCount = nameWarnings.filter((w) => w.severity === "warn").length;
  const supabaseReady = errorIssues.length === 0;

  writeFileUtf8(
    NAME_WARNINGS_PATH,
    rowsToCsv(
      ["id", "name", "warning_type", "matched_text", "severity", "note"],
      nameWarnings.map((warning) => [
        warning.id,
        warning.name,
        warning.warning_type,
        warning.matched_text,
        warning.severity,
        warning.note,
      ]),
    ),
  );

  const report = [
    "# Final Import Validation Report",
    "",
    `> Generated: ${runAt}`,
    "",
    "## 대상 파일",
    "",
    `- **target:** \`${path.relative(ROOT, targetPath)}\``,
    `- **expected row count:** ${EXPECTED_ROW_COUNT}`,
    `- **actual row count:** ${target.rows.length}`,
    "",
    "## 검증 결과 요약",
    "",
    "| 항목 | 결과 |",
    "|------|------|",
    `| row count (${EXPECTED_ROW_COUNT}) | ${target.rows.length === EXPECTED_ROW_COUNT ? "통과" : "실패"} |`,
    `| duplicate id | ${duplicateIds === 0 ? "없음" : `${duplicateIds}건`} |`,
    `| 빈 name | ${emptyNames} |`,
    `| 빈 address | ${emptyAddresses} |`,
    `| 좌표 보유 | ${rowsWithCoords}/${target.rows.length} |`,
    `| 좌표 없음 | ${missingCoords} |`,
    `| 좌표 한국 범위 밖 (lat ${LAT_MIN}~${LAT_MAX}, lng ${LNG_MIN}~${LNG_MAX}) | ${outOfRangeCoords} |`,
    `| invalid region | ${invalidRegions} |`,
    `| invalid course_type | ${invalidCourseTypes} |`,
    `| invalid hole_count | ${invalidHoleCounts} |`,
    `| invalid source | ${invalidSources} |`,
    `| invalid updated_at/created_at | ${invalidDates} |`,
    `| schema/CSV header 일치 | ${headerCompare.match ? "통과" : "실패"} |`,
    `| 깨진 한글/이상 문자 | ${brokenTextRows}건 |`,
    `| duplicate name+address | ${duplicateNameAddress.length}건 |`,
    `| name quality errors | ${nameErrorCount} |`,
    `| name quality warnings | ${nameWarnCount} |`,
    "",
    "## Supabase import 가능 여부",
    "",
    supabaseReady
      ? "- **가능** — blocking error 없음"
      : "- **불가** — 아래 error 해결 필요",
    "",
    "## 의도적 제외 확인",
    "",
    ...EXCLUDED_IDS.values().map(
      (excludedId) =>
        `- \`${excludedId}\`: ${ids.has(excludedId) ? "❌ final에 존재함" : "✅ final에 없음"}`,
    ),
    "",
    "## 병합 행 hole_count 확인",
    "",
    ...Object.entries(MERGE_EXPECTATIONS).map(([mergeId, expected]) => {
      const row = target.rows.find((r) => (r[idIndex] ?? "").trim() === mergeId);
      const actualHoleCount = row?.[holeCountIndex]?.trim() ?? "(missing)";
      const actualName = row?.[nameIndex]?.trim() ?? "(missing)";
      const ok =
        row &&
        actualName === expected.name &&
        actualHoleCount === expected.holeCount;
      return `- \`${mergeId}\` **${expected.name}** — hole_count ${actualHoleCount} (expected ${expected.holeCount}) ${ok ? "✅" : "⚠️"} — ${expected.note}`;
    }),
    "",
    "## Schema vs CSV header",
    "",
    `- **schema file:** \`${path.relative(ROOT, SCHEMA_PATH)}\``,
    `- **match:** ${headerCompare.match ? "yes" : "no"}`,
    ...(headerCompare.missingInCsv.length > 0
      ? [`- **missing in CSV:** ${headerCompare.missingInCsv.join(", ")}`]
      : []),
    ...(headerCompare.extraInCsv.length > 0
      ? [`- **extra in CSV:** ${headerCompare.extraInCsv.join(", ")}`]
      : []),
    "",
    "## Errors",
    "",
    ...(errorIssues.length === 0
      ? ["_없음_"]
      : errorIssues.map((issue) => `- ${issue.message}`)),
    "",
    "## Warnings",
    "",
    ...(warnIssues.length === 0
      ? ["_없음_"]
      : warnIssues.map((issue) => `- ${issue.message}`)),
    "",
    "## Name quality outputs",
    "",
    `- \`${path.relative(ROOT, NAME_WARNINGS_PATH)}\` (${nameWarnings.length} rows)`,
    "",
  ].join("\n");

  fs.writeFileSync(REPORT_PATH, report, "utf8");

  const userReviewWarnings = [
    ...warnIssues.map((issue) => issue.message),
    ...nameWarnings
      .filter((warning) => warning.severity === "warn")
      .map(
        (warning) =>
          `[name] ${warning.id} "${warning.name}" — ${warning.warning_type}: ${warning.matched_text}`,
      ),
  ];

  const readiness = [
    "# Supabase Import Readiness",
    "",
    `> Generated: ${runAt}`,
    "",
    "## Summary",
    "",
    `- **target file:** \`data/golf_courses_import_geocoded_final.csv\``,
    `- **final row count:** ${target.rows.length}`,
    `- **rows with coordinates:** ${rowsWithCoords}`,
    `- **rows without coordinates:** ${missingCoords}`,
    `- **duplicate id:** ${duplicateIds === 0 ? "none" : `${duplicateIds} found`}`,
    `- **schema/CSV columns match:** ${headerCompare.match ? "yes" : "no"}`,
    `- **Supabase import ready:** ${supabaseReady ? "yes" : "no"}`,
    "",
    "## Pre-import checklist",
    "",
    "- [x] Final CSV generated",
    `- [${target.rows.length === EXPECTED_ROW_COUNT ? "x" : " "}] Row count = ${EXPECTED_ROW_COUNT}`,
    `- [${duplicateIds === 0 ? "x" : " "}] No duplicate ids`,
    `- [${missingCoords === 0 ? "x" : " "}] All rows have coordinates`,
    `- [${outOfRangeCoords === 0 ? "x" : " "}] Coordinates within Korea bounds`,
    `- [${headerCompare.match ? "x" : " "}] CSV headers match schema`,
    `- [${nameErrorCount === 0 ? "x" : " "}] No blocking name quality errors`,
    `- [${invalidSources === 0 ? "x" : " "}] All source = public_data`,
    "",
    "## Known intentional differences from golf_courses_import.csv",
    "",
    "- Final row count is 532 (baseline import is 534)",
    "- Excluded: 로얄링스2 (`gc-dbaa28f7b44e`), 솔라고CC2 (`gc-d3a3acc83c4d`)",
    "- Renamed/patched: 청통골프장 → 골프존카운티 청통, 휘닉스대중골프장 → 태기산 나인CC",
    "- Merged: 로얄링스 CC (36), 솔라고CC (36), 블랙스톤제주 (27)",
    "",
    "## User review warnings",
    "",
    ...(userReviewWarnings.length === 0
      ? ["_없음 — blocking error도 없음_"]
      : userReviewWarnings.map((item) => `- ${item}`)),
    "",
    "## Related reports",
    "",
    `- \`${path.relative(ROOT, REPORT_PATH)}\``,
    `- \`${path.relative(ROOT, NAME_WARNINGS_PATH)}\``,
    "",
  ].join("\n");

  fs.writeFileSync(READINESS_PATH, readiness, "utf8");

  console.log("[validate:final-import] Complete");
  console.log(`  Target: ${targetPath}`);
  console.log(`  Row count: ${target.rows.length}`);
  console.log(`  Supabase ready: ${supabaseReady}`);
  console.log(`  Missing coords: ${missingCoords}`);
  console.log(`  Duplicate ids: ${duplicateIds}`);
  console.log(`  Name quality warnings: ${nameWarnCount} (errors: ${nameErrorCount})`);
  console.log(`  Schema/CSV match: ${headerCompare.match}`);
  console.log(`  Report: ${REPORT_PATH}`);
  console.log(`  Readiness: ${READINESS_PATH}`);
  console.log(`  Name warnings: ${NAME_WARNINGS_PATH}`);

  if (!supabaseReady) {
    process.exitCode = 1;
  }
}

main();
