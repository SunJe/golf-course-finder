import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import {
  buildHeaderMap,
  COLUMN_ALIASES,
  ERROR_HEADERS,
  OUTPUT_HEADERS,
  pickColumn,
  rowToRecord,
  transformPublicRecord,
} from "./lib/golfCourseTransform";

const ROOT = path.resolve(__dirname, "..");
const INPUT_PATH = path.join(ROOT, "data/raw/golf_courses_public.csv");
const IMPORT_PATH = path.join(ROOT, "data/golf_courses_import.csv");
const ERRORS_PATH = path.join(ROOT, "data/golf_courses_errors.csv");
const GEOCODING_PATH = path.join(ROOT, "data/golf_courses_needs_geocoding.csv");

function main(): void {
  let rawContent: string;
  try {
    rawContent = readFileUtf8(INPUT_PATH);
  } catch {
    console.error(
      `[convert:golf-courses] 입력 파일을 찾을 수 없습니다: ${INPUT_PATH}`,
    );
    console.error("공공데이터 CSV를 data/raw/golf_courses_public.csv 로 저장한 뒤 다시 실행하세요.");
    process.exit(1);
  }

  const { headers, rows } = parseCsv(rawContent);
  if (headers.length === 0) {
    console.error("[convert:golf-courses] CSV 헤더를 읽을 수 없습니다.");
    process.exit(1);
  }

  const headerMap = buildHeaderMap(headers);

  const timestamp = new Date().toISOString();
  const idRegistry = new Map<string, number>();
  const importRows: string[][] = [];
  const errorRows: string[][] = [];
  const geocodingRows: string[][] = [];

  for (const values of rows) {
    const record = rowToRecord(headers, values);
    const result = transformPublicRecord(record, headerMap, timestamp, idRegistry);

    if (!result.ok) {
      errorRows.push([
        result.reason,
        pickColumn(record, headerMap, COLUMN_ALIASES.name),
        pickColumn(record, headerMap, COLUMN_ALIASES.address),
        ...result.partialRow,
      ]);
      continue;
    }

    importRows.push(result.row);
    if (result.needsGeocoding) {
      geocodingRows.push(result.row);
    }
  }

  writeFileUtf8(IMPORT_PATH, rowsToCsv([...OUTPUT_HEADERS], importRows));
  writeFileUtf8(ERRORS_PATH, rowsToCsv([...ERROR_HEADERS], errorRows));
  writeFileUtf8(
    GEOCODING_PATH,
    rowsToCsv([...OUTPUT_HEADERS], geocodingRows),
  );

  console.log("[convert:golf-courses] 변환 완료");
  console.log(`  입력: ${INPUT_PATH}`);
  console.log(`  성공: ${importRows.length}행 → ${IMPORT_PATH}`);
  console.log(`  오류: ${errorRows.length}행 → ${ERRORS_PATH}`);
  console.log(`  좌표 보강 필요: ${geocodingRows.length}행 → ${GEOCODING_PATH}`);
}

main();
