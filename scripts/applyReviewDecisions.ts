import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  buildHeaderMap,
  buildOutputRow,
  COLUMN_ALIASES,
  createStableId,
  extractRegionCity,
  normalizeCourseType,
  OUTPUT_HEADERS,
  parseHoleCountStrict,
  pickColumn,
  rowToRecord,
  transformMasterRow,
} from "./lib/golfCourseTransform";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const IMPORT_PATH = path.join(ROOT, "data/golf_courses_import.csv");
const GEOCODING_PATH = path.join(ROOT, "data/golf_courses_needs_geocoding.csv");
const EXCLUDED_PATH = path.join(ROOT, "data/review/excluded_non_golf_courses.csv");
const AMBIGUOUS_PATH = path.join(ROOT, "data/review/ambiguous_courses.csv");
const DECISIONS_PATH = path.join(ROOT, "data/review/review_decisions.csv");
const MANUAL_PATH = path.join(ROOT, "data/review/manual_questions.md");
const REPORT_PATH = path.join(ROOT, "data/review/data_quality_report.md");
const RAW_PATH = path.join(ROOT, "data/raw/ministry_golf_courses.csv");

const DECISION_HEADERS = [
  "type",
  "name",
  "address",
  "original_id",
  "decision",
  "course_type",
  "hole_count",
  "note",
] as const;

const VALID_COURSE_TYPES = new Set(["대중제", "회원제", "군 골프장", "기타"]);
const VALID_REGIONS = new Set([
  "서울",
  "경기",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
]);

const MILITARY_PATTERN = /군\s*골프|체력단련|국방|군체육|군\s*cc/i;

interface CourseRow {
  values: string[];
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  holeCount: string;
  courseType: string;
}

interface ReviewDecision {
  type: string;
  name: string;
  address: string;
  originalId: string;
  decision: string;
  courseType: string;
  holeCount: string;
  note: string;
}

interface ManualQuestion {
  name: string;
  address: string;
  holeCount: string;
  courseType: string;
  reason: string;
  options: string;
  recommendation: string;
  userAnswer: string;
}

function toCourseRow(values: string[]): CourseRow {
  return {
    values,
    id: values[0] ?? "",
    name: values[1] ?? "",
    region: values[2] ?? "",
    city: values[3] ?? "",
    address: values[4] ?? "",
    holeCount: values[10] ?? "",
    courseType: values[11] ?? "",
  };
}

function parseBaseIdFromConflict(text: string): string | null {
  const match = text.match(/baseId=([^,\s]+)/);
  return match?.[1] ?? null;
}

function stripIdSuffix(id: string): string {
  return id.replace(/-\d+$/, "");
}

function nameWithCourseTypeSuffix(baseName: string, courseType: string): string {
  const stripped = baseName.replace(/\s*\((회원제|대중제|군 골프장)\)\s*$/, "").trim();
  if (courseType === "회원제") return `${stripped} (회원제)`;
  if (courseType === "대중제") return `${stripped} (대중제)`;
  if (courseType === "군 골프장") return `${stripped} (군 골프장)`;
  return stripped;
}

function updateRowFields(row: CourseRow, updates: Partial<CourseRow>): CourseRow {
  const next = [...row.values];
  if (updates.id !== undefined) next[0] = updates.id;
  if (updates.name !== undefined) next[1] = updates.name;
  if (updates.region !== undefined) next[2] = updates.region;
  if (updates.city !== undefined) next[3] = updates.city;
  if (updates.address !== undefined) next[4] = updates.address;
  if (updates.holeCount !== undefined) next[10] = updates.holeCount;
  if (updates.courseType !== undefined) next[11] = updates.courseType;
  if (updates.name !== undefined || updates.courseType !== undefined) {
    const name = updates.name ?? row.name;
    const courseType = updates.courseType ?? row.courseType;
    const region = updates.region ?? row.region;
    next[22] = `${name}은(는) ${region} 지역의 ${courseType} 골프장입니다.`;
  }
  return toCourseRow(next);
}

type GroupAction =
  | { kind: "merge_expanded_holes"; sumHoles: number; note: string }
  | { kind: "keep_separate_membership_public"; note: string }
  | { kind: "needs_user_review"; note: string };

function classifyDuplicateGroup(members: CourseRow[]): GroupAction {
  const types = new Set(members.map((member) => member.courseType));
  const hasMember = types.has("회원제");
  const hasPublic = types.has("대중제");

  if (hasMember && hasPublic) {
    return {
      kind: "keep_separate_membership_public",
      note: "회원제/대중제 분리 — suffix 추가 후 각각 유지",
    };
  }

  if (types.size === 1) {
    const courseType = members[0].courseType;
    const holes = members
      .map((member) => Number(member.holeCount))
      .filter((value) => Number.isFinite(value) && value > 0);

    if (holes.length === members.length && courseType === "대중제") {
      const sum = holes.reduce((total, value) => total + value, 0);
      const allMultiplesOfNine = holes.every((value) => value % 9 === 0);
      if (allMultiplesOfNine && sum > Math.max(...holes)) {
        return {
          kind: "merge_expanded_holes",
          sumHoles: sum,
          note: `동일 course_type(대중제) — 홀수 ${holes.join("+")}=${sum} 병합`,
        };
      }
    }

    if (holes.length === members.length && courseType === "회원제") {
      return {
        kind: "needs_user_review",
        note: `동일 회원제·동일 주소 — 리조트 내 별도 코스 vs 증설 홀 합산 여부 애매 (${members.map((m) => `${m.holeCount}홀`).join(" vs ")})`,
      };
    }

    return {
      kind: "needs_user_review",
      note: `동일 course_type(${courseType})이나 홀수 합산/별도 코스 여부 애매 (${members.map((m) => `${m.holeCount}홀`).join(" vs ")})`,
    };
  }

  return {
    kind: "needs_user_review",
    note: `course_type 충돌: ${[...types].join(", ")}`,
  };
}

function loadImportRows(): CourseRow[] {
  const { headers, rows } = parseCsv(readFileUtf8(IMPORT_PATH));
  if (headers.join(",") !== OUTPUT_HEADERS.join(",")) {
    throw new Error("Unexpected import CSV headers");
  }
  return rows.map(toCourseRow);
}

function loadAmbiguousBaseIds(): string[] {
  const { headers, rows } = parseCsv(readFileUtf8(AMBIGUOUS_PATH));
  const index = headers.indexOf("conflicting_values");
  return rows
    .map((values) => parseBaseIdFromConflict(values[index] ?? ""))
    .filter((value): value is string => Boolean(value));
}

function findGroupMembers(rows: CourseRow[], baseId: string): CourseRow[] {
  return rows.filter(
    (row) => row.id === baseId || row.id.startsWith(`${baseId}-`),
  );
}

function assignStableIds(rows: CourseRow[], timestamp: string): CourseRow[] {
  const used = new Map<string, number>();
  const result: CourseRow[] = [];

  for (const row of rows) {
    const baseId = createStableId(row.name, row.city, row.address);
    const count = used.get(baseId) ?? 0;
    used.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
    const values = [...row.values];
    values[0] = id;
    values[25] = timestamp;
    values[26] = timestamp;
    result.push(toCourseRow(values));
  }

  return result;
}

function loadRawRecords(): Array<Record<string, string>> {
  const encodingResult = readCsvWithEncodingGuess(RAW_PATH);
  const { headers, rows } = parseCsv(encodingResult.content);
  const headerMap = buildHeaderMap(headers);
  return rows.map((values) => rowToRecord(headers, values));
}

function findRawMatches(
  rawRecords: Array<Record<string, string>>,
  headerMap: Map<string, string>,
  name: string,
  address: string,
): Array<Record<string, string>> {
  const normalizedAddress = address.trim();
  return rawRecords.filter((record) => {
    const rawName = pickColumn(record, headerMap, COLUMN_ALIASES.name);
    const rawAddress = pickColumn(record, headerMap, COLUMN_ALIASES.address);
    return rawName.trim() === name.trim() && rawAddress.trim() === normalizedAddress;
  });
}

function restoreExcludedRows(
  timestamp: string,
): { rows: CourseRow[]; decisions: ReviewDecision[]; questions: ManualQuestion[] } {
  const { headers, rows } = parseCsv(readFileUtf8(EXCLUDED_PATH));
  const rawContent = readCsvWithEncodingGuess(RAW_PATH);
  const rawParsed = parseCsv(rawContent.content);
  const headerMap = buildHeaderMap(rawParsed.headers);
  const rawRecords = rawParsed.rows.map((values) =>
    rowToRecord(rawParsed.headers, values),
  );

  const idRegistry = new Map<string, number>();
  const restored: CourseRow[] = [];
  const decisions: ReviewDecision[] = [];
  const questions: ManualQuestion[] = [];
  const seenRawKeys = new Set<string>();

  for (const values of rows) {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });

    const name = record.name ?? "";
    const address = record.address ?? "";
    const category = record.detected_category ?? "";
    const matches = findRawMatches(rawRecords, headerMap, name, address);

    if (matches.length === 0) {
      questions.push({
        name,
        address,
        holeCount: "",
        courseType: "",
        reason: "excluded 복귀 대상이지만 raw CSV에서 매칭 row를 찾지 못함",
        options:
          "1. 둘 다 유지 2. 하나로 병합 3. 제외 4. suffix 추가 5. 기타",
        recommendation: "raw CSV 수동 확인 후 restore",
        userAnswer: "",
      });
      continue;
    }

    for (const raw of matches) {
      const rawName = pickColumn(raw, headerMap, COLUMN_ALIASES.name);
      const rawAddress = pickColumn(raw, headerMap, COLUMN_ALIASES.address);
      const holeRaw = pickColumn(raw, headerMap, COLUMN_ALIASES.holeCount);
      const typeRaw = pickColumn(raw, headerMap, COLUMN_ALIASES.courseType);
      const rawKey = `${rawName}|${rawAddress}|${holeRaw}|${typeRaw}`;
      if (seenRawKeys.has(rawKey)) continue;
      seenRawKeys.add(rawKey);

      const businessText = Object.values(raw).join(" ");
      const isMilitary = MILITARY_PATTERN.test(`${rawName} ${rawAddress} ${businessText}`);
      const decisionType = isMilitary
        ? "restore_as_military_course"
        : "restore_as_golf_course";

      const transform = transformMasterRow(
        {
          name: rawName,
          address: rawAddress,
          rawRegion: pickColumn(raw, headerMap, COLUMN_ALIASES.rawRegion),
          holeCountRaw: holeRaw,
          courseTypeRaw: isMilitary ? "군 골프장" : typeRaw,
          phone: pickColumn(raw, headerMap, COLUMN_ALIASES.phone),
          businessStatus: pickColumn(raw, headerMap, COLUMN_ALIASES.businessStatus),
          latitudeRaw: pickColumn(raw, headerMap, COLUMN_ALIASES.latitude),
          longitudeRaw: pickColumn(raw, headerMap, COLUMN_ALIASES.longitude),
          timestamp,
        },
        idRegistry,
      );

      if (transform.kind !== "import") {
        questions.push({
          name: rawName,
          address: rawAddress,
          holeCount: holeRaw,
          courseType: typeRaw,
          reason: `excluded 복귀 변환 실패: ${transform.kind}`,
          options:
            "1. 둘 다 유지 2. 하나로 병합 3. 제외 4. suffix 추가 5. 기타",
          recommendation: "수동 변환 필요",
          userAnswer: "",
        });
        continue;
      }

      restored.push(toCourseRow(transform.row));
      decisions.push({
        type: "excluded_restore",
        name: rawName,
        address: rawAddress,
        originalId: "",
        decision: decisionType,
        courseType: transform.row[11],
        holeCount: transform.row[10],
        note: `excluded(${category})에서 import 복귀`,
      });

      if (category === "파크골프" || /파크골프|파크\s*골프/i.test(name)) {
        questions.push({
          name: rawName,
          address: rawAddress,
          holeCount: transform.row[10],
          courseType: transform.row[11],
          reason: `파크골프 키워드(${category})로 excluded됐으나 이번 단계에서 복귀함 — 정말 import할지 확인 필요`,
          options:
            "1. 둘 다 유지 2. 하나로 병합 3. 제외 4. suffix 추가 5. 기타",
          recommendation: "파크골프 시설이면 제외(3), 필드 골프장이면 유지(1)",
          userAnswer: "",
        });
      }

      if (
        category === "아카데미" ||
        /골프\s*아카데미|아카데미/i.test(name)
      ) {
        questions.push({
          name: rawName,
          address: rawAddress,
          holeCount: transform.row[10],
          courseType: transform.row[11],
          reason: `아카데미 키워드(${category})로 excluded됐으나 이번 단계에서 복귀함 — 연습장/아카데미인지 확인 필요`,
          options:
            "1. 둘 다 유지 2. 하나로 병합 3. 제외 4. suffix 추가 5. 기타",
          recommendation:
            "name/address상 실제 필드 골프장이면 유지(1), 연습 아카데미면 제외(3)",
          userAnswer: "",
        });
      }
    }
  }

  return { rows: restored, decisions, questions };
}

function processDuplicateGroups(
  rows: CourseRow[],
  baseIds: string[],
  timestamp: string,
): {
  rows: CourseRow[];
  decisions: ReviewDecision[];
  questions: ManualQuestion[];
  mergeGroups: number;
  removedRows: number;
  suffixRows: number;
  membershipPublicRows: number;
} {
  const removeIds = new Set<string>();
  const newRows: CourseRow[] = [];
  const decisions: ReviewDecision[] = [];
  const questions: ManualQuestion[] = [];
  let mergeGroups = 0;
  let removedRows = 0;
  let suffixRows = 0;
  let membershipPublicRows = 0;

  for (const baseId of baseIds) {
    const members = findGroupMembers(rows, baseId);
    if (members.length < 2) continue;

    const action = classifyDuplicateGroup(members);
    const baseName = members[0].name.replace(/\s*\((회원제|대중제|군 골프장)\)\s*$/, "").trim();

    if (action.kind === "needs_user_review") {
      for (const member of members) {
        questions.push({
          name: member.name,
          address: member.address,
          holeCount: member.holeCount,
          courseType: member.courseType,
          reason: action.note,
          options:
            "1. 둘 다 유지 2. 하나로 병합 3. 제외 4. suffix 추가 5. 기타",
          recommendation:
            "확신 없음 — import row는 변경하지 않고 유지. 사용자 결정 후 재실행.",
          userAnswer: "",
        });
        decisions.push({
          type: "ambiguous_duplicate",
          name: member.name,
          address: member.address,
          originalId: member.id,
          decision: "keep_ambiguous",
          courseType: member.courseType,
          holeCount: member.holeCount,
          note: action.note,
        });
      }
      continue;
    }

    for (const member of members) {
      removeIds.add(member.id);
    }

    if (action.kind === "merge_expanded_holes") {
      mergeGroups += 1;
      removedRows += members.length - 1;

      const longestAddress = [...members]
        .map((member) => member.address)
        .sort((a, b) => b.length - a.length)[0];
      const merged = updateRowFields(members[0], {
        id: createStableId(baseName, members[0].city, longestAddress),
        name: baseName,
        address: longestAddress,
        holeCount: String(action.sumHoles),
      });
      newRows.push(merged);

      decisions.push({
        type: "ambiguous_duplicate",
        name: baseName,
        address: longestAddress,
        originalId: members.map((member) => member.id).join("|"),
        decision: "merge_expanded_holes",
        courseType: merged.courseType,
        holeCount: String(action.sumHoles),
        note: `${action.note}; removed=${members.map((m) => `${m.id}(${m.holeCount}홀)`).join(", ")}`,
      });
      continue;
    }

    membershipPublicRows += members.length;
    for (const member of members) {
      const suffixedName = nameWithCourseTypeSuffix(baseName, member.courseType);
      suffixRows += 1;
      const updated = updateRowFields(member, {
        id: createStableId(suffixedName, member.city, member.address),
        name: suffixedName,
      });
      newRows.push(updated);
      decisions.push({
        type: "ambiguous_duplicate",
        name: suffixedName,
        address: member.address,
        originalId: member.id,
        decision: "keep_separate_membership_public",
        courseType: member.courseType,
        holeCount: member.holeCount,
        note: action.note,
      });
    }
  }

  const kept = rows.filter((row) => !removeIds.has(row.id));
  return {
    rows: [...kept, ...newRows],
    decisions,
    questions,
    mergeGroups,
    removedRows,
    suffixRows,
    membershipPublicRows,
  };
}

function processNewDuplicateGroups(
  rows: CourseRow[],
  processedBaseIds: Set<string>,
): {
  rows: CourseRow[];
  decisions: ReviewDecision[];
  questions: ManualQuestion[];
  mergeGroups: number;
  removedRows: number;
  suffixRows: number;
} {
  const groups = new Map<string, CourseRow[]>();
  for (const row of rows) {
    const baseId = createStableId(row.name, row.city, row.address);
    const list = groups.get(baseId) ?? [];
    list.push(row);
    groups.set(baseId, list);
  }

  const newBaseIds = [...groups.entries()]
    .filter(([baseId, members]) => members.length > 1 && !processedBaseIds.has(baseId))
    .map(([baseId]) => baseId);

  const result = processDuplicateGroups(rows, newBaseIds, new Date().toISOString());
  return {
    rows: result.rows,
    decisions: result.decisions,
    questions: result.questions,
    mergeGroups: result.mergeGroups,
    removedRows: result.removedRows,
    suffixRows: result.suffixRows,
  };
}

function validateRows(rows: CourseRow[]): {
  duplicateIds: string[];
  emptyNames: number;
  emptyAddresses: number;
  invalidCourseTypes: number;
  invalidRegions: number;
  invalidHoleCounts: number;
  needsGeocoding: number;
} {
  const idCounts = new Map<string, number>();
  let emptyNames = 0;
  let emptyAddresses = 0;
  let invalidCourseTypes = 0;
  let invalidRegions = 0;
  let invalidHoleCounts = 0;
  let needsGeocoding = 0;

  for (const row of rows) {
    idCounts.set(row.id, (idCounts.get(row.id) ?? 0) + 1);
    if (!row.name.trim()) emptyNames += 1;
    if (!row.address.trim()) emptyAddresses += 1;
    if (!VALID_COURSE_TYPES.has(row.courseType)) invalidCourseTypes += 1;
    if (!VALID_REGIONS.has(row.region)) invalidRegions += 1;
    if (row.holeCount && !/^\d+$/.test(row.holeCount)) invalidHoleCounts += 1;
    if (!row.values[5]?.trim() || !row.values[6]?.trim()) needsGeocoding += 1;
  }

  const duplicateIds = [...idCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  return {
    duplicateIds,
    emptyNames,
    emptyAddresses,
    invalidCourseTypes,
    invalidRegions,
    invalidHoleCounts,
    needsGeocoding,
  };
}

function writeManualQuestions(questions: ManualQuestion[]): void {
  const unique = new Map<string, ManualQuestion>();
  for (const question of questions) {
    const key = `${question.name}|${question.address}|${question.reason}`;
    if (!unique.has(key)) unique.set(key, question);
  }

  const lines = [
    "# Manual Review Questions",
    "",
    `> Generated: ${new Date().toISOString()}`,
    "",
    "애매하거나 사용자 확인이 필요한 항목입니다. **자동 삭제/병합/제외하지 않았습니다.**",
    "",
  ];

  [...unique.values()].forEach((question, index) => {
    lines.push(`## 질문 ${index + 1}: ${question.name}`);
    lines.push("");
    lines.push(`- **주소:** ${question.address}`);
    lines.push(`- **현재 hole_count:** ${question.holeCount || "(empty)"}`);
    lines.push(`- **현재 course_type:** ${question.courseType || "(empty)"}`);
    lines.push(`- **충돌/애매한 이유:** ${question.reason}`);
    lines.push("- **가능한 선택지:**");
    lines.push("  1. 둘 다 유지");
    lines.push("  2. 하나로 병합");
    lines.push("  3. 제외");
    lines.push("  4. 이름에 회원제/대중제 suffix 추가");
    lines.push("  5. 기타");
    lines.push(`- **Cursor 추천:** ${question.recommendation}`);
    lines.push("- **사용자 답:** (미응답)");
    lines.push("");
  });

  fs.writeFileSync(MANUAL_PATH, lines.join("\n"), "utf8");
}

function appendDecisionReport(stats: Record<string, string | number | boolean>): void {
  const section = [
    "",
    "---",
    "",
    "## Phase 2.6 — Review Decision 반영",
    "",
    `- **실행 일시:** ${stats.runAt}`,
    `- **excluded → import 복귀 행 수:** ${stats.restoredCount}`,
    `- **회원제/대중제 분리 유지 행 수:** ${stats.membershipPublicRows}`,
    `- **이름 suffix 추가 행 수:** ${stats.suffixRows}`,
    `- **홀수 합산 병합 그룹 수:** ${stats.mergeGroups}`,
    `- **병합으로 제거된 row 수:** ${stats.removedRows}`,
    `- **manual_questions.md 질문 수:** ${stats.manualQuestionCount}`,
    `- **최종 golf_courses_import.csv 행 수:** ${stats.finalImportRows}`,
    `- **중복 id:** ${stats.duplicateIdsOk ? "없음" : stats.duplicateIds}`,
    `- **좌표 보강 필요 행 수:** ${stats.needsGeocoding}`,
    "",
    "### 다음 단계",
    "",
    "1. manual_questions.md 사용자 응답",
    "2. 필요 시 review_decisions 반영 후 재실행",
    "3. geocoding_input 재생성 (`npm run prepare:phase25-review`)",
    "4. geocoding 실행 후 Supabase import 검토",
    "",
  ].join("\n");

  const existing = fs.readFileSync(REPORT_PATH, "utf8");
  const marker = "## Phase 2.6 — Review Decision 반영";
  const withoutOld = existing.includes(marker)
    ? existing.slice(0, existing.indexOf(marker) - 4)
    : existing;
  fs.writeFileSync(REPORT_PATH, `${withoutOld.trimEnd()}${section}\n`, "utf8");
}

function main(): void {
  const runAt = new Date().toISOString();
  const timestamp = runAt;

  let rows = loadImportRows();
  const ambiguousBaseIds = loadAmbiguousBaseIds();
  const processedBaseIds = new Set<string>(ambiguousBaseIds);

  const groupResult = processDuplicateGroups(rows, ambiguousBaseIds, timestamp);
  rows = groupResult.rows;

  const restoreResult = restoreExcludedRows(timestamp);
  rows = [...rows, ...restoreResult.rows];

  const newDupResult = processNewDuplicateGroups(rows, processedBaseIds);
  rows = newDupResult.rows;

  rows = assignStableIds(rows, timestamp);

  const validation = validateRows(rows);
  if (validation.duplicateIds.length > 0) {
    console.error("Duplicate IDs remain:", validation.duplicateIds);
    process.exit(1);
  }

  writeFileUtf8(
    IMPORT_PATH,
    rowsToCsv([...OUTPUT_HEADERS], rows.map((row) => row.values)),
  );

  const geocodingRows = rows
    .filter((row) => !row.values[5]?.trim() || !row.values[6]?.trim())
    .map((row) => row.values);
  writeFileUtf8(
    GEOCODING_PATH,
    rowsToCsv([...OUTPUT_HEADERS], geocodingRows),
  );

  const allDecisions = [
    ...groupResult.decisions,
    ...restoreResult.decisions,
    ...newDupResult.decisions,
  ];
  writeFileUtf8(
    DECISIONS_PATH,
    rowsToCsv(
      [...DECISION_HEADERS],
      allDecisions.map((decision) => [
        decision.type,
        decision.name,
        decision.address,
        decision.originalId,
        decision.decision,
        decision.courseType,
        decision.holeCount,
        decision.note,
      ]),
    ),
  );

  const allQuestions = [
    ...groupResult.questions,
    ...restoreResult.questions,
    ...newDupResult.questions,
  ];
  writeManualQuestions(allQuestions);

  appendDecisionReport({
    runAt,
    restoredCount: restoreResult.rows.length,
    membershipPublicRows:
      groupResult.membershipPublicRows +
      (newDupResult.suffixRows > 0 ? newDupResult.suffixRows : 0),
    suffixRows: groupResult.suffixRows + newDupResult.suffixRows,
    mergeGroups: groupResult.mergeGroups + newDupResult.mergeGroups,
    removedRows: groupResult.removedRows + newDupResult.removedRows,
    manualQuestionCount: new Set(
      allQuestions.map((q) => `${q.name}|${q.address}|${q.reason}`),
    ).size,
    finalImportRows: rows.length,
    duplicateIdsOk: validation.duplicateIds.length === 0,
    duplicateIds: validation.duplicateIds.join(", "),
    needsGeocoding: validation.needsGeocoding,
  });

  console.log("[apply:review-decisions] Complete");
  console.log(`  Final import rows:      ${rows.length}`);
  console.log(`  Restored from excluded: ${restoreResult.rows.length}`);
  console.log(`  Merge groups:           ${groupResult.mergeGroups + newDupResult.mergeGroups}`);
  console.log(`  Suffix rows:            ${groupResult.suffixRows + newDupResult.suffixRows}`);
  console.log(`  Manual questions:       ${new Set(allQuestions.map((q) => `${q.name}|${q.address}|${q.reason}`)).size}`);
  console.log(`  Duplicate IDs:          none`);
  console.log(`  Needs geocoding:        ${validation.needsGeocoding}`);
}

main();
