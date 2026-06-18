import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8 } from "./lib/csvUtils";
import { isValidWgs84Coordinate } from "./lib/geocodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const IMPORT_PATH = path.join(ROOT, "data/golf_courses_import.csv");
const REPORT_PATH = path.join(ROOT, "data/review/final_import_validation_report.md");

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

interface ValidationIssue {
  severity: "error" | "warn";
  message: string;
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
  } else if (!fs.existsSync(targetPath)) {
    targetPath = path.join(ROOT, "data/golf_courses_import_geocoded.csv");
  }

  const baseline = parseCsv(readFileUtf8(IMPORT_PATH));
  const target = parseCsv(readFileUtf8(targetPath));
  const issues: ValidationIssue[] = [];

  const baselineIdIndex = baseline.headers.indexOf("id");
  const idIndex = target.headers.indexOf("id");
  const nameIndex = target.headers.indexOf("name");
  const regionIndex = target.headers.indexOf("region");
  const addressIndex = target.headers.indexOf("address");
  const latIndex = target.headers.indexOf("latitude");
  const lngIndex = target.headers.indexOf("longitude");
  const courseTypeIndex = target.headers.indexOf("course_type");
  const holeCountIndex = target.headers.indexOf("hole_count");

  if (target.rows.length !== baseline.rows.length) {
    issues.push({
      severity: "error",
      message: `row count mismatch: baseline=${baseline.rows.length}, target=${target.rows.length}`,
    });
  }

  const ids = new Set<string>();
  let missingCoords = 0;
  let outOfRangeCoords = 0;
  let emptyNames = 0;
  let emptyAddresses = 0;
  let invalidRegions = 0;
  let invalidCourseTypes = 0;
  let invalidHoleCounts = 0;

  for (const row of target.rows) {
    const id = row[idIndex] ?? "";
    if (ids.has(id)) {
      issues.push({ severity: "error", message: `duplicate id: ${id}` });
    }
    ids.add(id);

    if (!row[nameIndex]?.trim()) emptyNames += 1;
    if (!row[addressIndex]?.trim()) emptyAddresses += 1;

    const region = row[regionIndex] ?? "";
    if (!VALID_REGIONS.has(region)) invalidRegions += 1;

    const courseType = row[courseTypeIndex] ?? "";
    if (courseType && !VALID_COURSE_TYPES.has(courseType)) {
      invalidCourseTypes += 1;
    }

    const holeCount = row[holeCountIndex] ?? "";
    if (holeCount.trim() && !Number.isFinite(Number(holeCount))) {
      invalidHoleCounts += 1;
    }

    const lat = row[latIndex]?.trim() ?? "";
    const lng = row[lngIndex]?.trim() ?? "";
    if (!lat || !lng) {
      missingCoords += 1;
      continue;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!isValidWgs84Coordinate(latNum, lngNum)) {
      outOfRangeCoords += 1;
      issues.push({
        severity: "error",
        message: `out of range coordinates: ${id} (${lat}, ${lng})`,
      });
    }
  }

  const baselineIds = new Set(
    baseline.rows.map((row) => row[baselineIdIndex] ?? ""),
  );
  for (const id of baselineIds) {
    if (!ids.has(id)) {
      issues.push({ severity: "error", message: `missing id in target: ${id}` });
    }
  }
  for (const id of ids) {
    if (!baselineIds.has(id)) {
      issues.push({ severity: "error", message: `extra id in target: ${id}` });
    }
  }

  if (emptyNames > 0) {
    issues.push({ severity: "error", message: `empty name rows: ${emptyNames}` });
  }
  if (emptyAddresses > 0) {
    issues.push({
      severity: "error",
      message: `empty address rows: ${emptyAddresses}`,
    });
  }
  if (invalidRegions > 0) {
    issues.push({
      severity: "error",
      message: `invalid region rows: ${invalidRegions}`,
    });
  }
  if (invalidCourseTypes > 0) {
    issues.push({
      severity: "warn",
      message: `invalid course_type rows: ${invalidCourseTypes}`,
    });
  }
  if (invalidHoleCounts > 0) {
    issues.push({
      severity: "error",
      message: `invalid hole_count rows: ${invalidHoleCounts}`,
    });
  }
  if (missingCoords > 0) {
    issues.push({
      severity: "error",
      message: `missing coordinates rows: ${missingCoords}`,
    });
  }

  const supabaseReady =
    issues.filter((issue) => issue.severity === "error").length === 0;

  const report = [
    "# Final Import Validation Report",
    "",
    `> Generated: ${runAt}`,
    "",
    "## 대상 파일",
    "",
    `- **baseline:** ${IMPORT_PATH} (${baseline.rows.length} rows)`,
    `- **target:** ${targetPath} (${target.rows.length} rows)`,
    "",
    "## 검증 결과",
    "",
    `- **row count 일치:** ${target.rows.length === baseline.rows.length ? "통과" : "실패"}`,
    `- **duplicate id:** ${issues.some((issue) => issue.message.startsWith("duplicate")) ? "있음" : "없음"}`,
    `- **빈 name:** ${emptyNames}`,
    `- **빈 address:** ${emptyAddresses}`,
    `- **좌표 없음:** ${missingCoords}`,
    `- **좌표 범위 밖:** ${outOfRangeCoords}`,
    `- **invalid region:** ${invalidRegions}`,
    `- **invalid course_type:** ${invalidCourseTypes}`,
    `- **invalid hole_count:** ${invalidHoleCounts}`,
    "",
    "## Supabase import 가능 여부",
    "",
    supabaseReady
      ? "- **가능** — 모든 필수 검증 통과"
      : "- **불가** — 아래 issue 해결 필요",
    "",
    "## Issues",
    "",
    ...(issues.length === 0
      ? ["_없음_"]
      : issues.map(
          (issue) =>
            `- **[${issue.severity}]** ${issue.message}`,
        )),
    "",
  ].join("\n");

  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log("[validate:final-import] Complete");
  console.log(`  Target: ${targetPath}`);
  console.log(`  Supabase ready: ${supabaseReady}`);
  console.log(`  Missing coords: ${missingCoords}`);
  console.log(`  Report: ${REPORT_PATH}`);

  if (!supabaseReady) {
    process.exitCode = 1;
  }
}

main();
