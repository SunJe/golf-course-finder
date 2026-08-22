import { createHash } from "node:crypto";
import {
  applyCoursePageOverride,
  COURSE_PAGE_OVERRIDES,
  getCoursePageOverride,
} from "@/lib/seo/coursePageOverrides";
import type { Course } from "@/types/course";

const EXPECTED_OVERRIDES = {
  "gc-825e9c261de2": {
    courseName: "코브스윙",
    bookingHostname: "www.coveswing.com",
    displayName: "코브스윙",
  },
  "gc-e2614722e86e": {
    courseName: "아도니스 퍼블릭",
    bookingHostname: "www.adoniscc.co.kr",
    displayName: "아도니스 퍼블릭",
  },
  "gc-9bd0f98bfdee": {
    courseName: "가야CC 퍼블릭",
    bookingHostname: "www.gayacc.com",
    displayName: "가야컨트리클럽 퍼블릭",
  },
  "gc-411771a420e7": {
    courseName: "골프존카운티 안성W",
    bookingHostname: "www.golfzoncounty.com",
  },
  "gc-bc41a2489944": {
    courseName: "칠곡 아이위시CC",
    bookingHostname: "www.iwishcc.com",
  },
  "gc-9655898af6a6": {
    courseName: "포웰CC 프린세스",
    bookingHostname: "www.princessgc.co.kr",
  },
  "gc-0665bc0c6cce": {
    courseName: "고령 유니밸리CC",
    bookingHostname: "www.univalley.co.kr",
  },
} as const;

const LEGACY_OVERRIDE_SHA256 = {
  "gc-bc41a2489944":
    "050c397e9159be63b3072da91ad1f806a067b82f0a4b726494994dbf21551b6f",
  "gc-9655898af6a6":
    "28d23b1b9db00312479107039761dbdaad633567d8daf419e711a3ed6a779f77",
  "gc-0665bc0c6cce":
    "eb3a932bd631ae28b09271e409b380ce4924e18d57cfc8248eda8de6f15b990c",
} as const;

const EXPECTED_IDS = Object.keys(EXPECTED_OVERRIDES) as Array<
  keyof typeof EXPECTED_OVERRIDES
>;

const MUTABLE_PRICE_TARGET_IDS = [
  "gc-825e9c261de2",
  "gc-e2614722e86e",
  "gc-9bd0f98bfdee",
  "gc-411771a420e7",
] as const;

const NON_TARGET_REGRESSION_IDS = [
  "gc-4687a4044d34", // 지산퍼블릭
  "gc-3d63d3179c0f", // 태광CC 퍼블릭
  "gc-46caa66a0c89", // 골드리버CC
  "gc-25f812ff383a", // 계룡산골프클럽
  "gc-5384133fb9bc", // 가야CC 회원제 sibling
  "gc-60319bf1693c", // 인천그랜드CC
] as const;

const errors: string[] = [];

function hashOverride(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

for (const id of EXPECTED_IDS) {
  const expected = EXPECTED_OVERRIDES[id];
  const override = COURSE_PAGE_OVERRIDES[id];
  if (!override) {
    errors.push(`${id}: override가 없습니다.`);
    continue;
  }

  if (override.seoTitle.length < 15 || override.seoTitle.length > 40) {
    errors.push(`${id}: SEO 제목 길이가 15~40자 범위를 벗어났습니다.`);
  }
  if (!override.seoTitle.includes(expected.courseName)) {
    errors.push(`${id}: SEO 제목에 기대 골프장명이 없습니다.`);
  }
  if (
    override.metaDescription.length < 40 ||
    override.metaDescription.length > 80
  ) {
    errors.push(`${id}: meta description 길이가 40~80자 범위를 벗어났습니다.`);
  }

  if (
    "displayName" in expected &&
    override.displayName !== expected.displayName
  ) {
    errors.push(`${id}: target 표시명이 기대값과 다릅니다.`);
  }

  try {
    const bookingUrl = new URL(override.bookingUrl);
    if (bookingUrl.protocol !== "https:") {
      errors.push(`${id}: 공식 예약 URL은 HTTPS여야 합니다.`);
    }
    if (bookingUrl.hostname !== expected.bookingHostname) {
      errors.push(
        `${id}: 공식 예약 URL hostname이 ${expected.bookingHostname}이 아닙니다.`,
      );
    }
  } catch {
    errors.push(`${id}: 공식 예약 URL을 파싱할 수 없습니다.`);
  }

  if (override.faq.length !== 4) {
    errors.push(`${id}: FAQ가 정확히 4개가 아닙니다.`);
  }

  for (const [index, item] of override.faq.entries()) {
    if (item.question.trim().length === 0) {
      errors.push(`${id}: ${index + 1}번째 FAQ 질문이 비어 있습니다.`);
    }
    if (item.answer.trim().length === 0) {
      errors.push(`${id}: ${index + 1}번째 FAQ 답변이 비어 있습니다.`);
    }
  }

  const questions = new Set(override.faq.map((item) => item.question.trim()));
  if (questions.size !== override.faq.length) {
    errors.push(`${id}: 중복 FAQ 질문이 있습니다.`);
  }
}

const actualIds = Object.keys(COURSE_PAGE_OVERRIDES).sort();
const expectedIds = [...EXPECTED_IDS].sort();
if (
  actualIds.length !== expectedIds.length ||
  actualIds.some((id, index) => id !== expectedIds[index])
) {
  errors.push("기대 override ID 7개와 실제 override ID 집합이 다릅니다.");
}

for (const [id, expectedHash] of Object.entries(LEGACY_OVERRIDE_SHA256)) {
  const actualHash = hashOverride(COURSE_PAGE_OVERRIDES[id]);
  if (actualHash !== expectedHash) {
    errors.push(`${id}: PR #28 override가 기준값에서 변경되었습니다.`);
  }
}

const cove = COURSE_PAGE_OVERRIDES["gc-825e9c261de2"];
const coveText = [
  cove.seoTitle,
  cove.metaDescription,
  ...(cove.searchAliases ?? []),
  ...cove.faq.flatMap((item) => [item.question, item.answer]),
].join(" ");
if (!coveText.includes("코브스윙") || !coveText.includes("참밸리CC")) {
  errors.push("코브스윙 override에 현재 이름과 구 참밸리CC가 모두 필요합니다.");
}

const gaya = COURSE_PAGE_OVERRIDES["gc-9bd0f98bfdee"];
if (gaya.address !== "경상남도 김해시 인제로 502") {
  errors.push("가야 퍼블릭 target 주소는 경상남도 김해시 인제로 502여야 합니다.");
}

const adonisText = COURSE_PAGE_OVERRIDES["gc-e2614722e86e"].faq
  .flatMap((item) => [item.question, item.answer])
  .join(" ");
if (
  !adonisText.includes("2인 예약") ||
  !adonisText.includes("1~3인") ||
  !adonisText.includes("조인")
) {
  errors.push(
    "아도니스 FAQ에는 2인 예약 가능과 1~3인 조인 조건이 함께 있어야 합니다.",
  );
}
if (/2인(?:만)?\s*단독(?:\s*플레이)?\s*(?:가능|보장)/.test(adonisText)) {
  errors.push("아도니스에 2인 단독 플레이를 상시 보장하는 문구가 있습니다.");
}

const anseongText = JSON.stringify(
  COURSE_PAGE_OVERRIDES["gc-411771a420e7"],
);
if (
  /(?:상시|항상).{0,8}(?:노캐디|셀프)|(?:노캐디|셀프).{0,8}(?:상시|항상)/.test(
    anseongText,
  )
) {
  errors.push("안성W에 상시 노캐디/셀프를 주장하는 문구가 있습니다.");
}

for (const id of MUTABLE_PRICE_TARGET_IDS) {
  const copy = JSON.stringify(COURSE_PAGE_OVERRIDES[id]);
  if (/(?:₩|\d[\d,]*\s*원(?:\/|\s|[.,]|$))/.test(copy)) {
    errors.push(`${id}: 변동 대상 copy에 고정 금액 주장이 있습니다.`);
  }
}

const syntheticBase = {
  id: "synthetic",
  name: "원본 이름",
  searchAliases: ["원본 별칭"],
  region: "경기",
  city: "테스트",
  address: "원본 주소",
  latitude: 37,
  longitude: 127,
  phone: "000-0000-0000",
  homepageUrl: "https://example.com/",
  courseType: "대중제",
  tags: [],
  source: "manual",
  updatedAt: "2026-08-15T00:00:00.000Z",
} satisfies Course;

for (const id of NON_TARGET_REGRESSION_IDS) {
  const course = { ...syntheticBase, id };
  if (getCoursePageOverride(id) !== null) {
    errors.push(`${id}: 비대상 코스에 override가 누출됐습니다.`);
  }
  if (applyCoursePageOverride(course) !== course) {
    errors.push(`${id}: 비대상 코스 객체가 변경되었습니다.`);
  }
}

for (const id of Object.keys(LEGACY_OVERRIDE_SHA256)) {
  const course = { ...syntheticBase, id };
  const applied = applyCoursePageOverride(course);
  if (
    applied.name !== course.name ||
    applied.address !== course.address ||
    applied.phone !== course.phone ||
    applied.homepageUrl !== course.homepageUrl ||
    applied.searchAliases !== course.searchAliases
  ) {
    errors.push(`${id}: PR #28 코스의 기존 표시/data 필드가 변경되었습니다.`);
  }
}

if (errors.length > 0) {
  console.error("[check:course-page-overrides] FAIL");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `[check:course-page-overrides] OK — ${EXPECTED_IDS.length} course pages; PR #28 and 6 non-target regressions protected`,
);
