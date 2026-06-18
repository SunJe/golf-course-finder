import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import { isValidWgs84Coordinate } from "./lib/geocodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const GEOCODED_PATH = path.join(ROOT, "data/golf_courses_import_geocoded.csv");
const DECISIONS_PATH = path.join(ROOT, "data/geocoding/manual_geocoding_decisions.csv");
const FINAL_PATH = path.join(ROOT, "data/golf_courses_import_geocoded_final.csv");
const REPORT_PATH = path.join(ROOT, "data/review/manual_geocoding_apply_report.md");

const VALID_DECISIONS = new Set([
  "use_candidate",
  "manual_coordinate",
  "retry_with_query",
  "keep_unresolved",
  "exclude_from_import",
]);

const APPLY_DECISIONS = new Set(["use_candidate", "manual_coordinate"]);

interface RowPatch {
  name?: string;
  address?: string;
  holeCount?: string;
  description?: string;
}

const ROW_PATCHES: Record<string, RowPatch> = {
  "gc-01d6a94bf335": {
    name: "골프존카운티 청통",
    address: "경상북도 영천시 청통면 은해사로 49-77",
    description: "골프존카운티 청통은(는) 경상 지역의 대중제 골프장입니다.",
  },
  "gc-716264430902": {
    name: "태기산 나인CC",
    address: "강원특별자치도 평창군 봉평면 태기로 174",
    holeCount: "9",
    description: "태기산 나인CC은(는) 강원 지역의 대중제 골프장입니다.",
  },
  "gc-bf183cd699c7": {
    name: "로얄링스 CC",
    address: "충남 태안군 태안읍 기업도시6길 43",
    holeCount: "36",
    description: "로얄링스 CC은(는) 충청 지역의 대중제 골프장입니다.",
  },
  "gc-167a7f95d402": {
    name: "솔라고CC",
    address: "충남 태안군 태안읍 소곳이길 92-234",
    holeCount: "36",
    description: "솔라고CC은(는) 충청 지역의 대중제 골프장입니다.",
  },
};

interface DecisionRow {
  id: string;
  name: string;
  selectedLatitude: string;
  selectedLongitude: string;
  selectedAddress: string;
  decision: string;
  note: string;
}

function loadDecisions(): Map<string, DecisionRow> {
  if (!fs.existsSync(DECISIONS_PATH)) {
    throw new Error("manual_geocoding_decisions.csv not found");
  }

  const { headers, rows } = parseCsv(readFileUtf8(DECISIONS_PATH));
  const index = (name: string) => headers.indexOf(name);
  const map = new Map<string, DecisionRow>();

  for (const values of rows) {
    const decision = values[index("decision")]?.trim() ?? "";
    if (!decision) continue;
    map.set(values[index("id")] ?? "", {
      id: values[index("id")] ?? "",
      name: values[index("name")] ?? "",
      selectedLatitude: values[index("selected_latitude")] ?? "",
      selectedLongitude: values[index("selected_longitude")] ?? "",
      selectedAddress: values[index("selected_address")] ?? "",
      decision,
      note: values[index("note")] ?? "",
    });
  }

  return map;
}

function main(): void {
  const runAt = new Date().toISOString();
  const { headers, rows } = parseCsv(readFileUtf8(GEOCODED_PATH));
  const idIndex = headers.indexOf("id");
  const nameIndex = headers.indexOf("name");
  const addressIndex = headers.indexOf("address");
  const holeCountIndex = headers.indexOf("hole_count");
  const descriptionIndex = headers.indexOf("description");
  const latIndex = headers.indexOf("latitude");
  const lngIndex = headers.indexOf("longitude");
  const decisions = loadDecisions();

  const applied: string[] = [];
  const skipped: string[] = [];
  const invalid: string[] = [];
  const excluded: string[] = [];
  const patched: string[] = [];

  let outputRows = rows.map((values) => {
    const next = [...values];
    const id = values[idIndex] ?? "";
    const decision = decisions.get(id);
    if (!decision) return next;

    if (decision.decision === "exclude_from_import") {
      excluded.push(`${decision.name} (${id})`);
      return null;
    }

    if (!APPLY_DECISIONS.has(decision.decision)) {
      skipped.push(`${decision.name} (${decision.decision})`);
      return next;
    }

    if (!VALID_DECISIONS.has(decision.decision)) {
      invalid.push(`${decision.name} (invalid decision)`);
      return next;
    }

    const lat = Number(decision.selectedLatitude);
    const lng = Number(decision.selectedLongitude);
    if (!isValidWgs84Coordinate(lat, lng)) {
      invalid.push(`${decision.name} (invalid coordinates)`);
      return next;
    }

    next[latIndex] = String(lat);
    next[lngIndex] = String(lng);
    applied.push(`${decision.name} → ${lat}, ${lng}`);

    const patch = ROW_PATCHES[id];
    if (patch) {
      if (patch.name) next[nameIndex] = patch.name;
      if (patch.address) next[addressIndex] = patch.address;
      if (patch.holeCount) next[holeCountIndex] = patch.holeCount;
      if (patch.description) next[descriptionIndex] = patch.description;
      patched.push(`${id} → ${patch.name ?? decision.name}`);
    } else if (decision.selectedAddress.trim()) {
      next[addressIndex] = decision.selectedAddress;
    }

    return next;
  }).filter((row): row is string[] => row !== null);

  writeFileUtf8(FINAL_PATH, rowsToCsv(headers, outputRows));

  const rowsWithoutCoords = outputRows.filter(
    (row) => !row[latIndex]?.trim() || !row[lngIndex]?.trim(),
  ).length;

  const report = [
    "# Manual Geocoding Apply Report",
    "",
    `> Generated: ${runAt}`,
    "",
    "## 입력",
    "",
    `- **source:** ${GEOCODED_PATH}`,
    `- **decisions:** ${DECISIONS_PATH}`,
    `- **output:** ${FINAL_PATH}`,
    "",
    "## 결과",
    "",
    `- **총 행 수:** ${outputRows.length}`,
    `- **반영 건수:** ${applied.length}`,
    `- **병합/이름 패치:** ${patched.length}`,
    `- **제외 (exclude_from_import):** ${excluded.length}`,
    `- **스킵 (decision 미적용):** ${skipped.length}`,
    `- **무효 (좌표/decision):** ${invalid.length}`,
    `- **좌표 없는 행:** ${rowsWithoutCoords}`,
    "",
    "## 반영 목록",
    "",
    ...(applied.length === 0 ? ["_없음_"] : applied.map((line) => `- ${line}`)),
    "",
    "## 병합/패치 목록",
    "",
    ...(patched.length === 0 ? ["_없음_"] : patched.map((line) => `- ${line}`)),
    "",
    "## 제외 목록",
    "",
    ...(excluded.length === 0
      ? ["_없음_"]
      : excluded.map((line) => `- ${line}`)),
    "",
    "## 스킵 목록",
    "",
    ...(skipped.length === 0
      ? ["_없음_"]
      : skipped.slice(0, 30).map((line) => `- ${line}`)),
    "",
    "## 무효 목록",
    "",
    ...(invalid.length === 0
      ? ["_없음_"]
      : invalid.map((line) => `- ${line}`)),
    "",
    "## 참고",
    "",
    "- `golf_courses_import_geocoded.csv`는 수정하지 않음",
    "- `use_candidate` / `manual_coordinate`만 좌표 반영",
    "",
  ].join("\n");

  fs.writeFileSync(REPORT_PATH, report, "utf8");

  console.log("[apply:manual-geocoding] Complete");
  console.log(`  Applied: ${applied.length}`);
  console.log(`  Patched: ${patched.length}`);
  console.log(`  Excluded: ${excluded.length}`);
  console.log(`  Rows without coords: ${rowsWithoutCoords}`);
  console.log(`  Output: ${FINAL_PATH}`);
  console.log(`  Report: ${REPORT_PATH}`);
}

main();
