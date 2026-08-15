import { COURSE_PAGE_OVERRIDES } from "@/lib/seo/coursePageOverrides";

const EXPECTED_OVERRIDES = {
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

const EXPECTED_IDS = Object.keys(EXPECTED_OVERRIDES) as Array<
  keyof typeof EXPECTED_OVERRIDES
>;

const errors: string[] = [];

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
  errors.push("기대 override ID 집합과 실제 override ID 집합이 다릅니다.");
}

if (errors.length > 0) {
  console.error("[check:course-page-overrides] FAIL");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `[check:course-page-overrides] OK — ${EXPECTED_IDS.length} course pages`,
);
