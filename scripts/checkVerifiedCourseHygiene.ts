import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const EXPECTED_ROWS = 532;
const GAYA_PUBLIC = "gc-9bd0f98bfdee";
const GAYA_MEMBER = "gc-5384133fb9bc";
const ADONIS_PUBLIC = "gc-e2614722e86e";
const ACCIDENTAL_IDS = [
  "gc-6edc35233517",
  "gc-eed59bb8d6c7",
  "gc-41ded2b48d1a",
];

type CsvRecord = Record<string, string>;

function loadCsv(relativePath: string): Map<string, CsvRecord> {
  const filePath = path.join(ROOT, relativePath);
  const { headers, rows } = parseCsv(readCsvWithEncodingGuess(filePath).content);
  const records = new Map<string, CsvRecord>();
  for (const cells of rows) {
    const record = Object.fromEntries(
      headers.map((header, index) => [header, (cells[index] ?? "").trim()]),
    );
    assert.ok(record.id, `${relativePath}: missing id`);
    assert.ok(!records.has(record.id), `${relativePath}: duplicate id ${record.id}`);
    records.set(record.id, record);
  }
  return records;
}

function requireRow(rows: Map<string, CsvRecord>, id: string): CsvRecord {
  const row = rows.get(id);
  assert.ok(row, `missing canonical id ${id}`);
  return row;
}

function assertFields(
  label: string,
  row: CsvRecord,
  expected: Record<string, string>,
): void {
  for (const [field, value] of Object.entries(expected)) {
    assert.equal(row[field] ?? "", value, `${label}.${field}`);
  }
}

function assertNoAccidentalIds(...datasets: Map<string, CsvRecord>[]): void {
  for (const rows of datasets) {
    for (const id of ACCIDENTAL_IDS) {
      assert.ok(!rows.has(id), `accidental rehash id present: ${id}`);
    }
  }
}

function main(): void {
  const edit = loadCsv("data/enrichment/course_enrichment_edit.csv");
  const links = loadCsv("data/enrichment/course_links.csv");
  const fullSet = loadCsv("data/enrichment/golf_courses_full_set.csv");
  const upload = loadCsv("data/enrichment/golf_courses_supabase_upload.csv");

  assert.equal(edit.size, EXPECTED_ROWS, "edit row count");
  assert.equal(links.size, EXPECTED_ROWS, "links row count");
  assert.equal(fullSet.size, EXPECTED_ROWS, "full-set row count");
  assert.equal(upload.size, EXPECTED_ROWS, "upload row count");
  assertNoAccidentalIds(edit, links, fullSet, upload);

  const gayaEdit = requireRow(edit, GAYA_PUBLIC);
  assertFields("Gaya Public edit", gayaEdit, {
    name: "가야컨트리클럽 (대중제)",
    change_name_to: "가야CC(퍼블릭)",
    address: "경상남도 김해시 인제로 502",
    latitude: "35.2739312",
    longitude: "128.8981004",
  });

  const gayaLink = requireRow(links, GAYA_PUBLIC);
  assertFields("Gaya Public links", gayaLink, {
    phone: "055-337-0091",
    homepage_url: "https://www.gayacc.com/main_new.php",
    booking_url: "https://www.gayacc.com/reserve.php?location=04",
  });

  assertFields("Gaya Public upload", requireRow(upload, GAYA_PUBLIC), {
    name: "가야CC(퍼블릭)",
    address: "경상남도 김해시 인제로 502",
    latitude: "35.2739312",
    longitude: "128.8981004",
    course_type: "대중제",
    phone: "055-337-0091",
    homepage_url: "https://www.gayacc.com/main_new.php",
    hole_count: "9",
    price_min: "55000",
    price_max: "90000",
    price_text: "티스캐너 예약가 기준 평일 55000~60000원 / 주말 90000원",
    price_type: "reservation_reference",
  });

  const memberEdit = requireRow(edit, GAYA_MEMBER);
  const memberLink = requireRow(links, GAYA_MEMBER);
  assertFields("Gaya Member edit", memberEdit, {
    name: "가야컨트리클럽 (회원제)",
    change_name_to: "가야CC(회원제)",
    address: "김해시 인제로 495",
    latitude: "",
    longitude: "",
  });
  assertFields("Gaya Member links", memberLink, {
    homepage_url: "",
    booking_url: "",
    phone: "",
  });
  assertFields("Gaya Member upload", requireRow(upload, GAYA_MEMBER), {
    name: "가야CC(회원제)",
    address: "김해시 인제로 495",
    latitude: "35.2706641912159",
    longitude: "128.892223791295",
    course_type: "회원제",
    phone: "055-337-0091",
    homepage_url: "http://www.gayacc.com/",
    hole_count: "45",
  });
  assert.notEqual(gayaEdit.address, memberEdit.address, "Gaya addresses merged");
  assert.notEqual(
    `${gayaEdit.latitude},${gayaEdit.longitude}`,
    "35.2706641912159,128.892223791295",
    "Gaya coordinates merged",
  );

  const adonisEdit = requireRow(edit, ADONIS_PUBLIC);
  const adonisLink = requireRow(links, ADONIS_PUBLIC);
  assertFields("Adonis legacy edit", adonisEdit, {
    name: "포천아도니스 대중골프장",
    change_name_to: "포천아도니스CC 퍼블릭",
    address: "경기도 포천시 신북면 포천로 2499",
    latitude: "",
    longitude: "",
    phone: "031-530-9100",
    homepage_url: "http://www.adoniscc.co.kr/",
  });
  assertFields("Adonis links", adonisLink, {
    phone: "031-530-9140",
    homepage_url: "https://www.adoniscc.co.kr/public",
    booking_url: "https://www.adoniscc.co.kr/public/booking",
  });
  assertFields("Adonis upload", requireRow(upload, ADONIS_PUBLIC), {
    name: "포천아도니스CC 퍼블릭",
    address: "경기도 포천시 신북면 포천로 2499",
    latitude: "37.9708954325836",
    longitude: "127.171996614016",
    course_type: "대중제",
    phone: "031-530-9140",
    homepage_url: "https://www.adoniscc.co.kr/public",
    hole_count: "9",
    price_min: "90000",
    price_max: "130000",
    price_text: "티스캐너 예약가 기준 평일 90000~100000원 / 주말 120000~130000원",
    price_type: "reservation_reference",
  });

  const protectedRows: Record<string, Record<string, string>> = {
    "gc-825e9c261de2": {
      name: "코브스윙(참밸리CC)",
      address: "경기도 포천시 삼육사로 1982",
      latitude: "37.8668399230398",
      longitude: "127.136107459732",
      phone: "1899-6200",
      homepage_url: "https://coveswing.com/",
      hole_count: "18",
      price_min: "100000",
      price_max: "200000",
      change_name_to: "코브스윙(참밸리CC)",
    },
    "gc-411771a420e7": {
      name: "골프존카운티 안성W",
      address: "경기도 안성시 양성면 교동길 19-70",
      latitude: "37.0754815069354",
      longitude: "127.195011214835",
      phone: "031-670-0500",
      homepage_url: "https://www.golfzoncounty.com/golfclub/main?golfclubSeq=2",
      hole_count: "18",
      price_min: "80000",
      price_max: "220000",
      change_name_to: "골프존카운티 안성W",
    },
  };
  for (const [id, expected] of Object.entries(protectedRows)) {
    assertFields(`protected ${id}`, requireRow(upload, id), expected);
  }

  const generatedSql = fs.readFileSync(
    path.join(ROOT, "supabase/course_links_update.sql"),
    "utf8",
  );
  const manualSql = fs.readFileSync(
    path.join(ROOT, "supabase/manual_verified_course_hygiene.sql"),
    "utf8",
  );
  for (const value of [
    GAYA_PUBLIC,
    ADONIS_PUBLIC,
    "https://www.gayacc.com/reserve.php?location=04",
    "https://www.adoniscc.co.kr/public/booking",
  ]) {
    assert.ok(generatedSql.includes(value), `generated SQL missing ${value}`);
    assert.ok(manualSql.includes(value), `manual SQL missing ${value}`);
  }
  for (const id of ACCIDENTAL_IDS) {
    assert.ok(manualSql.includes(id), `manual SQL missing accidental-id guard ${id}`);
  }

  console.log(
    "Verified course hygiene PASS: 532 rows, duplicate 0, Gaya/Adonis exact, protected rows unchanged",
  );
}

main();
