/**
 * 티스캐너 가격 검수 결과 반영 → summary 재생성 → enrichment merge
 * Usage: npm run apply:teescanner-review-decisions
 *
 * decisions 파일 형식 (JSON):
 * {
 *   "approved": ["gc-..."],
 *   "rejected": ["gc-..."],
 *   "manualPrices": {
 *     "gc-...": {
 *       "priceMin": "100000",
 *       "priceMax": "150000",
 *       "weekdayMin": "",
 *       "weekdayMax": "",
 *       "weekendMin": "",
 *       "weekendMax": "",
 *       "sourceUrl": "https://...",
 *       "note": ""
 *     }
 *   }
 * }
 *
 * 또는 채팅 붙여넣기 텍스트:
 * gc-xxx 승인
 * gc-yyy 승인 100000 150000
 * gc-zzz 승인 평일 100000 150000 주말 200000 250000 url=https://...
 * gc-aaa 거부
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import {
  DEFAULT_COURSE_RESULTS_CSV,
  DEFAULT_DAILY_RESULTS_CSV,
  DEFAULT_MANUAL_REVIEW_CSV,
  DEFAULT_SUMMARY_CSV,
  DAILY_RESULT_HEADERS,
  type DailyResultRow,
  readDailyResults,
  writeCourseResultsCsv,
  writeManualReviewCsv,
  writeSummaryCsv,
} from "./lib/teescanner/batchIo";
import { buildAllSummaries, buildManualReviewRows } from "./lib/teescanner/summary";
import { rowsToCsv } from "./lib/csvUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DECISIONS_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_price_review_decisions.json",
);
const REVIEW_JSON_PATH = path.join(ROOT, "data/enrichment/teescanner_price_review.json");
const RESOLVED_PATH = path.join(
  ROOT,
  "data/enrichment/teescanner_price_review_resolved.json",
);

type ManualPriceInput = {
  priceMin?: string;
  priceMax?: string;
  weekdayMin?: string;
  weekdayMax?: string;
  weekendMin?: string;
  weekendMax?: string;
  sourceUrl?: string;
  note?: string;
};

type DecisionsFile = {
  approved: string[];
  rejected: string[];
  manualPrices?: Record<string, ManualPriceInput>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function sanitizePrice(value: string | undefined): string {
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  return digits;
}

function parseNoteValue(line: string, key: string): string {
  const match = line.match(new RegExp(`${key}=([^\\s]+)`, "i"));
  return match?.[1] ?? "";
}

function parseTextLine(line: string): {
  courseId?: string;
  action?: "approve" | "reject";
  manual?: ManualPriceInput;
} {
  const trimmed = line.trim();
  if (!trimmed) return {};

  const simple = trimmed.match(/^(gc-[a-f0-9]+)\s+(승인|거부|approve|reject)$/i);
  if (simple) {
    return {
      courseId: simple[1],
      action: simple[2] === "승인" || simple[2].toLowerCase() === "approve" ? "approve" : "reject",
    };
  }

  const approve = trimmed.match(/^(gc-[a-f0-9]+)\s+승인(?:\s+(.+))?$/i);
  if (!approve) return {};

  const courseId = approve[1];
  const rest = approve[2] ?? "";
  const manual: ManualPriceInput = {
    sourceUrl: parseNoteValue(rest, "url"),
    note: parseNoteValue(rest, "note"),
  };

  const weekday = rest.match(/평일\s+(\d+)\s+(\d+)/);
  if (weekday) {
    manual.weekdayMin = weekday[1];
    manual.weekdayMax = weekday[2];
  }

  const weekend = rest.match(/주말\s+(\d+)\s+(\d+)/);
  if (weekend) {
    manual.weekendMin = weekend[1];
    manual.weekendMax = weekend[2];
  }

  if (!weekday && !weekend) {
    const overall = rest.match(/(?:^|\s)(\d{4,7})(?:\s+(\d{4,7}))?(?:\s|$)/);
    if (overall) {
      manual.priceMin = overall[1];
      manual.priceMax = overall[2] || overall[1];
    }
  }

  return { courseId, action: "approve", manual };
}

function parseTextDecisions(raw: string): DecisionsFile {
  const approved: string[] = [];
  const rejected: string[] = [];
  const manualPrices: Record<string, ManualPriceInput> = {};

  for (const line of raw.split(/\r?\n/)) {
    const parsed = parseTextLine(line);
    if (!parsed.courseId || !parsed.action) continue;
    if (parsed.action === "approve") {
      approved.push(parsed.courseId);
      if (parsed.manual && hasManualPrice(parsed.manual)) {
        manualPrices[parsed.courseId] = normalizeManualPrice(parsed.manual);
      }
    } else {
      rejected.push(parsed.courseId);
    }
  }

  return { approved, rejected, manualPrices };
}

function normalizeManualPrice(input: ManualPriceInput): ManualPriceInput {
  return {
    priceMin: sanitizePrice(input.priceMin),
    priceMax: sanitizePrice(input.priceMax),
    weekdayMin: sanitizePrice(input.weekdayMin),
    weekdayMax: sanitizePrice(input.weekdayMax),
    weekendMin: sanitizePrice(input.weekendMin),
    weekendMax: sanitizePrice(input.weekendMax),
    sourceUrl: input.sourceUrl?.trim() ?? "",
    note: input.note?.trim() ?? "",
  };
}

function hasManualPrice(input: ManualPriceInput): boolean {
  const normalized = normalizeManualPrice(input);
  return Boolean(
    normalized.priceMin ||
      normalized.priceMax ||
      normalized.weekdayMin ||
      normalized.weekdayMax ||
      normalized.weekendMin ||
      normalized.weekendMax,
  );
}

function loadDecisions(): DecisionsFile {
  if (!fs.existsSync(DECISIONS_PATH)) {
    throw new Error(`decisions file not found: ${DECISIONS_PATH}`);
  }
  const raw = fs.readFileSync(DECISIONS_PATH, "utf8").trim();
  if (raw.startsWith("{")) {
    const parsed = readJson<DecisionsFile>(DECISIONS_PATH);
    const manualPrices: Record<string, ManualPriceInput> = {};
    for (const [courseId, value] of Object.entries(parsed.manualPrices ?? {})) {
      manualPrices[courseId] = normalizeManualPrice(value);
    }
    return {
      approved: parsed.approved ?? [],
      rejected: parsed.rejected ?? [],
      manualPrices,
    };
  }
  return parseTextDecisions(raw);
}

function loadCourseNames(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(REVIEW_JSON_PATH)) return map;
  const review = readJson<{
    items: Array<{ courseId: string; courseName: string }>;
    acceptSpotCheck?: Array<{ courseId: string; courseName: string }>;
  }>(REVIEW_JSON_PATH);
  for (const item of [...review.items, ...(review.acceptSpotCheck ?? [])]) {
    map.set(item.courseId, item.courseName);
  }
  return map;
}

function writeDailyResults(rows: DailyResultRow[]): void {
  const body = rowsToCsv(
    [...DAILY_RESULT_HEADERS],
    rows.map((row) => DAILY_RESULT_HEADERS.map((header) => row[header] ?? "")),
  );
  fs.writeFileSync(DEFAULT_DAILY_RESULTS_CSV, `\uFEFF${body}`, "utf8");
}

function emptyDailyRow(courseId: string, courseName: string): DailyResultRow {
  return Object.fromEntries(DAILY_RESULT_HEADERS.map((header) => [header, ""])) as DailyResultRow;
}

function buildManualDailyRow(
  courseId: string,
  courseName: string,
  dayType: "weekday" | "weekend",
  priceMin: string,
  priceMax: string,
  manual: ManualPriceInput,
): DailyResultRow {
  const roundDay = dayType === "weekday" ? "2026-06-29" : "2026-06-27";
  const row = emptyDailyRow(courseId, courseName);
  row.id = courseId;
  row.name = courseName;
  row.round_day = roundDay;
  row.day_type = dayType;
  row.status = "success";
  row.review_action = "accept_price";
  row.price_source = "manual_review";
  row.price_scope = "manual_entry";
  row.price_min = priceMin;
  row.price_max = priceMax || priceMin;
  row.sale_price_candidates = priceMax && priceMax !== priceMin ? `${priceMin} | ${priceMax}` : priceMin;
  row.detail_url = manual.sourceUrl ?? "";
  row.collected_at = new Date().toISOString();
  row.review_reason = manual.note ? `manual:${manual.note}` : "manual_review_entry";
  return row;
}

function applyManualPricesToDaily(
  daily: DailyResultRow[],
  courseId: string,
  courseName: string,
  manual: ManualPriceInput,
): DailyResultRow[] {
  const withoutCourse = daily.filter((row) => row.id !== courseId);
  const rows: DailyResultRow[] = [];

  const weekdayMin = manual.weekdayMin || "";
  const weekdayMax = manual.weekdayMax || manual.weekdayMin || "";
  const weekendMin = manual.weekendMin || "";
  const weekendMax = manual.weekendMax || manual.weekendMin || "";

  if (weekdayMin) {
    rows.push(
      buildManualDailyRow(courseId, courseName, "weekday", weekdayMin, weekdayMax, manual),
    );
  }
  if (weekendMin) {
    rows.push(
      buildManualDailyRow(courseId, courseName, "weekend", weekendMin, weekendMax, manual),
    );
  }

  if (rows.length === 0 && manual.priceMin) {
    rows.push(
      buildManualDailyRow(
        courseId,
        courseName,
        "weekday",
        manual.priceMin,
        manual.priceMax || manual.priceMin,
        manual,
      ),
    );
  }

  return [...withoutCourse, ...rows];
}

function main(): void {
  const decisions = loadDecisions();
  const approved = new Set(decisions.approved);
  const rejected = new Set(decisions.rejected);
  const manualPrices = decisions.manualPrices ?? {};
  const courseNames = loadCourseNames();

  let daily = readDailyResults(DEFAULT_DAILY_RESULTS_CSV);
  let approvedRows = 0;
  let rejectedRows = 0;
  let manualInserted = 0;

  for (const courseId of approved) {
    const manual = manualPrices[courseId];
    if (manual && hasManualPrice(manual)) {
      const courseName = courseNames.get(courseId) ?? courseId;
      daily = applyManualPricesToDaily(daily, courseId, courseName, manual);
      manualInserted += 1;
    }
  }

  const updated = daily.map((row) => {
    if (!row.id) return row;

    if (approved.has(row.id)) {
      if (row.status === "success" && row.price_min.trim()) {
        approvedRows += 1;
        return { ...row, review_action: "accept_price" };
      }
      if (row.review_action === "manual_review" && row.price_min.trim()) {
        approvedRows += 1;
        return { ...row, review_action: "accept_price" };
      }
      if (row.review_action === "accept_price") {
        approvedRows += 1;
        return row;
      }
    }

    if (rejected.has(row.id)) {
      rejectedRows += 1;
      return {
        ...row,
        review_action: "not_on_source",
        price_min: "",
        price_max: "",
        sale_price_candidates: "",
        status: row.price_min.trim() ? "rejected_review" : row.status,
      };
    }

    return row;
  });

  writeDailyResults(updated);

  const summaries = buildAllSummaries(updated);
  writeSummaryCsv(DEFAULT_SUMMARY_CSV, summaries);
  writeCourseResultsCsv(DEFAULT_COURSE_RESULTS_CSV, summaries);
  const manualReviewRows = buildManualReviewRows(summaries);
  writeManualReviewCsv(DEFAULT_MANUAL_REVIEW_CSV, manualReviewRows);

  const resolved = {
    appliedAt: new Date().toISOString(),
    approved: [...approved],
    rejected: [...rejected],
    manualPrices,
    manualInserted,
    approvedDailyRows: approvedRows,
    rejectedDailyRows: rejectedRows,
    summaryCount: summaries.length,
    manualReviewRemaining: manualReviewRows.length,
  };
  fs.writeFileSync(RESOLVED_PATH, JSON.stringify(resolved, null, 2), "utf8");

  console.log(`Approved courses: ${approved.size} (${approvedRows} daily rows)`);
  console.log(`Manual price entries: ${manualInserted}`);
  console.log(`Rejected courses: ${rejected.size} (${rejectedRows} daily rows)`);
  console.log(`Manual review remaining: ${manualReviewRows.length}`);
  console.log(`Rebuilt summary: ${DEFAULT_SUMMARY_CSV}`);

  if (approved.size > 0 || rejected.size > 0) {
    console.log("Running merge:teescanner-prices --apply-csv true ...");
    execSync("npm run merge:teescanner-prices -- --apply-csv true", {
      cwd: ROOT,
      stdio: "inherit",
    });
  }
}

main();
