import type { Course } from "@/types/course";
import { matchCourseSearch, courseMatchesSearchQuery } from "@/lib/courseSearch";
import { filterCourses } from "@/lib/filterCourses";
import { EMPTY_FILTERS } from "@/types/course";

function course(
  id: string,
  name: string,
  address: string,
  city = "",
  region = "",
): Course {
  return {
    id,
    name,
    region,
    city,
    address,
    latitude: 36.7,
    longitude: 127.0,
    courseType: "대중제",
    tags: [],
    source: "manual",
    updatedAt: new Date().toISOString(),
  };
}

interface Case {
  label: string;
  query: string;
  mustInclude: string[];
  mustExclude: string[];
}

const CASES: Case[] = [
  {
    label: "도고 — 도고CC만, 경기도/고령/고양 오매칭 없음",
    query: "도고",
    mustInclude: ["도고"],
    mustExclude: ["123골프", "고령오펠", "고령유니밸리", "고양컨트리"],
  },
  {
    label: "고양 — 고양 지역 포함 가능",
    query: "고양",
    mustInclude: ["고양"],
    mustExclude: [],
  },
  {
    label: "고령 — 고령오펠 포함 가능",
    query: "고령",
    mustInclude: ["고령"],
    mustExclude: [],
  },
  {
    label: "레이크 — 레이크사이드 포함 가능",
    query: "레이크",
    mustInclude: ["레이크"],
    mustExclude: [],
  },
];

const FIXTURES: Course[] = [
  course(
    "gc-dogo",
    "도고CC",
    "충남 아산시 선장면 삼봉산길 188",
    "선장면",
    "충청",
  ),
  course(
    "gc-dogo-old",
    "도고컨트리 구락부",
    "선장면 삼봉산길 188",
    "선장면",
    "충청",
  ),
  course(
    "gc-123",
    "123골프클럽",
    "경기도 고양시 덕양구 통일로 43-168",
    "고양시",
    "경기",
  ),
  course(
    "gc-goryeong",
    "고령오펠GC",
    "경상북도 고령군 가산면 학하2길 54-171",
    "고령군",
    "경상",
  ),
  course(
    "gc-goryeong-uni",
    "고령유니밸리CC",
    "경상북도 고령군 왜관읍 봉계로 263",
    "고령군",
    "경상",
  ),
  course(
    "gc-goyang",
    "고양컨트리클럽",
    "경기도 고양시 덕양구 고양대로 123",
    "고양시",
    "경기",
  ),
  course(
    "gc-lake",
    "레이크사이드CC(퍼블릭)",
    "경기도 용인시 처인구 모현읍 능원로 181",
    "용인시",
    "경기",
  ),
];

function namesMatching(courses: Course[], query: string): string[] {
  return filterCourses(courses, { ...EMPTY_FILTERS, query }).map((c) => c.name);
}

function haystackFalsePositiveCheck(): void {
  const victim = FIXTURES.find((c) => c.name === "123골프클럽");
  if (!victim) throw new Error("fixture missing");
  const joined = [victim.name, victim.address, victim.region, victim.city]
    .join(" ")
    .replace(/\s+/g, "");
  if (joined.includes("도고")) {
    console.log(
      "note: legacy haystack would false-match 123골프클럽 (경기도+고양시 → 도고)",
    );
  }
}

function main(): void {
  console.log("=== course search verification ===\n");
  haystackFalsePositiveCheck();

  let failed = 0;

  for (const testCase of CASES) {
    const matchedNames = namesMatching(FIXTURES, testCase.query);
    console.log(`query: ${testCase.query}`);
    console.log(`  results: ${matchedNames.join(", ") || "(none)"}`);

    for (const needle of testCase.mustInclude) {
      const ok = matchedNames.some((name) => name.includes(needle));
      if (!ok) {
        failed += 1;
        console.error(`  FAIL expected include: ${needle}`);
      }
    }

    for (const needle of testCase.mustExclude) {
      const bad = matchedNames.filter((name) => name.includes(needle));
      if (bad.length > 0) {
        failed += 1;
        console.error(`  FAIL must exclude ${needle}: got ${bad.join(", ")}`);
        for (const name of bad) {
          const courseRow = FIXTURES.find((row) => row.name === name);
          if (courseRow) {
            const debug = matchCourseSearch(courseRow, testCase.query);
            console.error(`    reason: ${debug.reason ?? "unknown"}`);
          }
        }
      }
    }

    console.log("");
  }

  const dogoOnly = namesMatching(FIXTURES, "도고");
  console.log(`도고 result count: ${dogoOnly.length} (expect 2)`);
  if (dogoOnly.length !== 2) failed += 1;

  const goyangNotDogo =
    courseMatchesSearchQuery(
      FIXTURES.find((c) => c.name.includes("고양컨트리"))!,
      "도고",
    ) === false;
  if (!goyangNotDogo) {
    failed += 1;
    console.error("FAIL: 고양컨트리클럽 matched 도고");
  }

  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed`);
    process.exit(1);
  }

  console.log("All search checks passed.");
}

main();
