import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const FINAL_PATH = path.join(ROOT, "data/golf_courses_import_geocoded_final.csv");
const SCHEMA_PATH = path.join(ROOT, "supabase/schema.sql");
const REPORT_PATH = path.join(ROOT, "data/review/final_sanity_check_report.md");

const SEARCH_PATTERNS: Array<{ label: string; test: (text: string) => boolean; blocking?: boolean }> = [
  {
    label: "ounty (Latin fragment)",
    test: (t) => /[a-zA-Z]*ounty[a-zA-Z]*/i.test(t) && !/골프존카운티/.test(t),
    blocking: true,
  },
  {
    label: "카ounty (Latin mixed)",
    test: (t) => /카ounty/i.test(t) || /골프존카[a-zA-Z]/.test(t),
    blocking: true,
  },
  {
    label: "골프존카+Latin (should be 골프존카운티)",
    test: (t) => /골프존카[a-zA-Z]/.test(t),
    blocking: true,
  },
  { label: "replacement char (�)", test: (t) => t.includes("\uFFFD"), blocking: true },
  { label: "Ã (mojibake)", test: (t) => t.includes("Ã"), blocking: true },
  { label: "ë (mojibake)", test: (t) => t.includes("ë"), blocking: true },
  { label: "ì (mojibake)", test: (t) => t.includes("ì"), blocking: true },
  { label: "û (mojibake)", test: (t) => t.includes("û"), blocking: true },
  { label: "literal undefined", test: (t) => /\bundefined\b/i.test(t), blocking: true },
  { label: "literal null", test: (t) => /\bnull\b/i.test(t), blocking: true },
  { label: "literal NaN", test: (t) => /\bNaN\b/.test(t), blocking: true },
];

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
];

const BOOLEAN_COLUMNS = [
  "night_round",
  "no_caddie",
  "two_player_allowed",
  "resort",
];

const INTEGER_COLUMNS = [
  "hole_count",
  "weekday_green_fee_min",
  "weekend_green_fee_min",
  "caddie_fee",
  "cart_fee",
];

interface Hit {
  pattern: string;
  id: string;
  column: string;
  value: string;
}

function extractSchemaColumns(): string[] {
  const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
  const tableMatch = sql.match(
    /create table if not exists public\.golf_courses \(([\s\S]*?)\);/i,
  );
  if (!tableMatch) return SCHEMA_COLUMNS;

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
  return columns.length > 0 ? columns : SCHEMA_COLUMNS;
}

function colIndex(headers: string[], name: string): number {
  return headers.indexOf(name);
}

function main(): void {
  const runAt = new Date().toISOString();
  let csvText = readFileUtf8(FINAL_PATH);
  const { headers, rows } = parseCsv(csvText);
  const hits: Hit[] = [];
  let fixedLatinGolfzon = 0;

  const wrongPrefix = "골프존카" + "ounty";
  const correctPrefix = "골프존카운티";

  if (csvText.includes(wrongPrefix)) {
    csvText = csvText.split(wrongPrefix).join(correctPrefix);
    fixedLatinGolfzon += (readFileUtf8(FINAL_PATH).match(new RegExp(wrongPrefix, "g")) ?? [])
      .length;
    fs.writeFileSync(FINAL_PATH, csvText, "utf8");
  }

  const golfzonLatin = /골프존카[a-zA-Z]+/g;
  if (golfzonLatin.test(csvText)) {
    const reparsed = parseCsv(csvText);
    const idIdxFix = colIndex(reparsed.headers, "id");
    const nameIdxFix = colIndex(reparsed.headers, "name");
    const descIdxFix = colIndex(reparsed.headers, "description");
    for (const row of reparsed.rows) {
      const name = row[nameIdxFix] ?? "";
      if (!/골프존카[a-zA-Z]/.test(name)) continue;
      const fixedName = name.replace(/골프존카[a-zA-Z]+/g, correctPrefix);
      row[nameIdxFix] = fixedName;
      if (row[descIdxFix]) {
        row[descIdxFix] = row[descIdxFix].replace(/골프존카[a-zA-Z]+/g, correctPrefix);
      }
      fixedLatinGolfzon += 1;
    }
    writeFileUtf8(FINAL_PATH, rowsToCsv(reparsed.headers, reparsed.rows));
    csvText = readFileUtf8(FINAL_PATH);
  }

  const parsed = parseCsv(csvText);
  const idIdx = colIndex(parsed.headers, "id");
  const nameIdx = colIndex(parsed.headers, "name");

  for (const row of parsed.rows) {
    const id = row[idIdx] ?? "";
    for (let c = 0; c < parsed.headers.length; c += 1) {
      const value = row[c] ?? "";
      for (const pattern of SEARCH_PATTERNS) {
        if (pattern.test(value)) {
          hits.push({
            pattern: pattern.label,
            id,
            column: parsed.headers[c],
            value: value.length > 120 ? `${value.slice(0, 120)}…` : value,
          });
        }
      }
    }
  }

  const golfzonRows = parsed.rows.filter((row) =>
    (row[nameIdx] ?? "").includes("골프존카운티"),
  );
  const golfzonChecks = golfzonRows.map((row) => {
    const name = row[nameIdx] ?? "";
    const chars = [...name.replace("골프존카운티", "").trim()]
      .slice(0, 5)
      .map((ch) => `${ch}(U+${ch.codePointAt(0)?.toString(16)})`)
      .join(" ");
    return {
      id: row[idIdx],
      name,
      hasLatin: /[a-zA-Z]/.test(name.replace(/CC|GC|cc|gc|G\.C|H|W/g, "")),
    };
  });

  const schemaColumns = extractSchemaColumns();
  const headerOrderMatch =
    parsed.headers.length === schemaColumns.length &&
    parsed.headers.every((header, i) => header === schemaColumns[i]);

  let invalidBooleans = 0;
  let invalidIntegers = 0;
  let invalidTags = 0;

  for (const row of parsed.rows) {
    for (const col of BOOLEAN_COLUMNS) {
      const value = row[colIndex(parsed.headers, col)]?.trim() ?? "";
      if (value !== "true" && value !== "false") invalidBooleans += 1;
    }
    for (const col of INTEGER_COLUMNS) {
      const value = row[colIndex(parsed.headers, col)]?.trim() ?? "";
      if (value && !Number.isFinite(Number(value))) invalidIntegers += 1;
    }
    const tags = row[colIndex(parsed.headers, "tags")]?.trim() ?? "";
    if (tags !== "{}" && tags !== "" && !/^\{.*\}$/.test(tags)) invalidTags += 1;
  }

  const blockingHits = hits.filter((hit) => {
    const pattern = SEARCH_PATTERNS.find((p) => p.label === hit.pattern);
    return pattern?.blocking !== false;
  });

  const tagsEmptyCount = parsed.rows.filter(
    (r) => (r[colIndex(parsed.headers, "tags")] ?? "") === "{}",
  ).length;

  const report = [
    "# Final Sanity Check Report",
    "",
    `> Generated: ${runAt}`,
    "",
    "## 대상 파일",
    "",
    `- \`data/golf_courses_import_geocoded_final.csv\` (${parsed.rows.length} rows)`,
    "",
    "## 문자열 검색 결과",
    "",
    "| 패턴 | 발견 건수 |",
    "|------|-----------|",
    ...SEARCH_PATTERNS.map((pattern) => {
      const count = hits.filter((hit) => hit.pattern === pattern.label).length;
      return `| ${pattern.label} | ${count} |`;
    }),
    "",
    "## 골프존카운티 표기 확인",
    "",
    `- **골프존카운티 포함 행:** ${golfzonRows.length}건`,
    `- **Latin 혼입 자동 수정:** ${fixedLatinGolfzon}건`,
    `- **골프존카+Latin 잔존:** ${hits.filter((h) => h.pattern.includes("골프존카")).length}건`,
    "",
    ...(golfzonRows.length > 0
      ? [
          "### 골프존카운티 행 샘플",
          "",
          ...golfzonChecks.slice(0, 8).map(
            (item) =>
              `- \`${item.id}\` **${item.name}** — Latin 잔존: ${item.hasLatin ? "yes (약어 가능)" : "no"}`,
          ),
          ...(golfzonRows.length > 8
            ? [`- … 외 ${golfzonRows.length - 8}건`]
            : []),
          "",
        ]
      : []),
    "",
    "## Schema / CSV 형식 확인",
    "",
    `- **schema columns:** ${schemaColumns.length}`,
    `- **CSV columns:** ${parsed.headers.length}`,
    `- **이름/순서 일치:** ${headerOrderMatch ? "yes" : "no"}`,
    `- **boolean 형식 (true/false):** ${invalidBooleans === 0 ? "통과" : `${invalidBooleans}건 이상`}`,
    `- **integer 형식 (숫자 또는 빈 값):** ${invalidIntegers === 0 ? "통과" : `${invalidIntegers}건 이상`}`,
    `- **tags 형식 ({} 빈 배열):** ${invalidTags === 0 ? `통과 (${tagsEmptyCount}/${parsed.rows.length} rows = {})` : `${invalidTags}건 이상`}`,
    "",
    "> **tags import 참고:** CSV 값 `{}`는 PostgreSQL `text[]` 빈 배열 리터럴과 동일합니다. Supabase Table Editor CSV import에서 거부되면 SQL `COPY` 또는 `{}` → 빈 칸 후 default 사용을 검토하세요.",
    "",
    "## 판정",
    "",
    blockingHits.length === 0
      ? "- **업로드 직전 sanity check: 통과** — blocking 이상 문자열 없음"
      : "- **업로드 직전 sanity check: 확인 필요** — 아래 상세 참고",
    "",
    "## 상세 hit 목록",
    "",
    ...(blockingHits.length === 0
      ? ["_blocking hit 없음_"]
      : blockingHits.map(
          (hit) =>
            `- **${hit.pattern}** | \`${hit.id}\` | ${hit.column} | \`${hit.value}\``,
        )),
    "",
    "## CC/GC 등 정상 약어",
    "",
    "CC, GC, C.C, G.C 등은 수정하지 않았습니다. name quality warning은 `data/review/final_name_quality_warnings.csv`를 참고하세요.",
    "",
  ].join("\n");

  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log("[final-sanity-check] Complete");
  console.log(`  Rows: ${parsed.rows.length}`);
  console.log(`  Blocking hits: ${blockingHits.length}`);
  console.log(`  Golfzon Latin fixes: ${fixedLatinGolfzon}`);
  console.log(`  Schema header match: ${headerOrderMatch}`);
  console.log(`  Report: ${REPORT_PATH}`);
}

main();
