import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import { createStableId, OUTPUT_HEADERS } from "./lib/golfCourseTransform";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const IMPORT_PATH = path.join(ROOT, "data/golf_courses_import.csv");
const GEOCODING_PATH = path.join(ROOT, "data/golf_courses_needs_geocoding.csv");
const DECISIONS_PATH = path.join(ROOT, "data/review/review_decisions.csv");
const MANUAL_PATH = path.join(ROOT, "data/review/manual_questions.md");
const REPORT_PATH = path.join(ROOT, "data/review/data_quality_report.md");

interface CourseRow {
  values: string[];
  id: string;
  name: string;
  city: string;
  address: string;
  holeCount: string;
  courseType: string;
}

function toCourseRow(values: string[]): CourseRow {
  return {
    values,
    id: values[0] ?? "",
    name: values[1] ?? "",
    city: values[3] ?? "",
    address: values[4] ?? "",
    holeCount: values[10] ?? "",
    courseType: values[11] ?? "",
  };
}

function loadImportRows(): CourseRow[] {
  const { headers, rows } = parseCsv(readFileUtf8(IMPORT_PATH));
  if (headers.join(",") !== OUTPUT_HEADERS.join(",")) {
    throw new Error("Unexpected import CSV headers");
  }
  return rows.map(toCourseRow);
}

function mergeBlackstoneJeju(rows: CourseRow[], runAt: string): {
  rows: CourseRow[];
  removedIds: string[];
} {
  const targetName = "블랙스톤제주";
  const members = rows.filter((row) => row.name === targetName);
  if (members.length !== 2) {
    throw new Error(
      `Expected 2 rows for ${targetName}, found ${members.length}`,
    );
  }

  const holes = members
    .map((row) => Number(row.holeCount))
    .filter((value) => Number.isFinite(value));
  const sumHoles = holes.reduce((total, value) => total + value, 0);
  const base = members[0];
  const mergedId = createStableId(base.name, base.city, base.address);
  const mergedValues = [...base.values];
  mergedValues[0] = mergedId;
  mergedValues[10] = String(sumHoles);
  mergedValues[25] = runAt;
  mergedValues[26] = runAt;
  mergedValues[22] = `${base.name}은(는) ${base.values[2]} 지역의 ${base.courseType} 골프장입니다.`;

  const removedIds = members.map((row) => row.id);
  const kept = rows.filter((row) => row.name !== targetName);
  return {
    rows: [...kept, toCourseRow(mergedValues)],
    removedIds,
  };
}

function appendDecision(decision: string[]): void {
  const content = fs.readFileSync(DECISIONS_PATH, "utf8");
  const line = decision.map((value) =>
    /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value,
  ).join(",");
  fs.writeFileSync(DECISIONS_PATH, `${content.trimEnd()}\n${line}\n`, "utf8");
}

function updateManualQuestions(): void {
  const answers: Record<string, string> = {
    "블랙스톤제주": "2. 하나로 병합 (18홀+9홀 → 27홀)",
    "스프링베일리조트": "1. 유지",
    "밀양에스파크골프리조트": "1. 유지",
    "마이다스 구미 골프아카데미": "1. 유지",
    "잭 니클라우스 골프클럽 코리아": "1. 유지",
    "드림파크골프장": "1. 유지",
    "여수시티파크골프&호텔": "1. 유지",
  };

  let content = fs.readFileSync(MANUAL_PATH, "utf8");
  content = content.replace(
    /> Generated: .+/,
    `> Generated: ${new Date().toISOString()}\n> Status: **사용자 응답 반영 완료**`,
  );

  for (const [name, answer] of Object.entries(answers)) {
    const pattern = new RegExp(
      `(## 질문 \\d+: ${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?- \\*\\*사용자 답:\\*\\* )\\(미응답\\)`,
    );
    content = content.replace(pattern, `$1${answer}`);
  }

  fs.writeFileSync(MANUAL_PATH, content, "utf8");
}

function appendManualAnswerReport(stats: {
  runAt: string;
  beforeRows: number;
  afterRows: number;
  mergedName: string;
  mergedHoles: number;
}): void {
  const section = [
    "",
    "---",
    "",
    "## Phase 2.7 — Manual Questions 응답 반영",
    "",
    `- **실행 일시:** ${stats.runAt}`,
    `- **반영 전 import 행 수:** ${stats.beforeRows}`,
    `- **반영 후 import 행 수:** ${stats.afterRows}`,
    `- **병합 적용:** ${stats.mergedName} (18+9 → ${stats.mergedHoles}홀, 회원제)`,
    `- **유지 (변경 없음):** 스프링베일리조트, 밀양에스파크골프리조트, 마이다스 구미 골프아카데미, 잭 니클라우스 골프클럽 코리아, 드림파크골프장, 여수시티파크골프&호텔`,
    `- **중복 id:** 없음`,
    `- **좌표 보강 필요:** ${stats.afterRows}행`,
    "",
    "### 다음 단계",
    "",
    "1. `npm run prepare:phase25-review` — geocoding input 갱신",
    "2. geocoding API key 설정 후 execute",
    "",
  ].join("\n");

  const existing = fs.readFileSync(REPORT_PATH, "utf8");
  const marker = "## Phase 2.7 — Manual Questions 응답 반영";
  const withoutOld = existing.includes(marker)
    ? existing.slice(0, existing.indexOf(marker) - 4)
    : existing;
  fs.writeFileSync(REPORT_PATH, `${withoutOld.trimEnd()}${section}\n`, "utf8");
}

function validateUniqueIds(rows: CourseRow[]): void {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.id, (counts.get(row.id) ?? 0) + 1);
  }
  const duplicates = [...counts.entries()].filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate IDs: ${duplicates.map(([id]) => id).join(", ")}`);
  }
}

function main(): void {
  const runAt = new Date().toISOString();
  const beforeRows = loadImportRows();
  const { rows, removedIds } = mergeBlackstoneJeju(beforeRows, runAt);
  validateUniqueIds(rows);

  writeFileUtf8(
    IMPORT_PATH,
    rowsToCsv(
      [...OUTPUT_HEADERS],
      rows.map((row) => row.values),
    ),
  );

  const geocodingRows = rows
    .filter((row) => !row.values[5]?.trim() || !row.values[6]?.trim())
    .map((row) => row.values);
  writeFileUtf8(GEOCODING_PATH, rowsToCsv([...OUTPUT_HEADERS], geocodingRows));

  appendDecision([
    "manual_answer",
    "블랙스톤제주",
    "제주특별자치도 제주시 한창로 925-122",
    removedIds.join("|"),
    "merge_expanded_holes",
    "회원제",
    "27",
    "사용자 manual Q1 답변: 2(하나로 병합) — 18홀+9홀 회원제 → 27홀",
  ]);

  for (const name of [
    "스프링베일리조트",
    "밀양에스파크골프리조트",
    "마이다스 구미 골프아카데미",
    "잭 니클라우스 골프클럽 코리아",
    "드림파크골프장",
    "여수시티파크골프&호텔",
  ]) {
    appendDecision([
      "manual_answer",
      name,
      "",
      "",
      "restore_as_golf_course",
      "",
      "",
      "사용자 답변: 유지 — import 변경 없음",
    ]);
  }

  updateManualQuestions();
  appendManualAnswerReport({
    runAt,
    beforeRows: beforeRows.length,
    afterRows: rows.length,
    mergedName: "블랙스톤제주",
    mergedHoles: 27,
  });

  console.log("[apply:manual-answers] Complete");
  console.log(`  Import rows: ${beforeRows.length} → ${rows.length}`);
  console.log(`  Merged: 블랙스톤제주 18+9 → 27홀`);
  console.log(`  Kept unchanged: 6 courses`);
}

main();
