import { COURSE_PAGE_OVERRIDES } from "@/lib/seo/coursePageOverrides";

const EXPECTED_IDS = [
  "gc-bc41a2489944",
  "gc-9655898af6a6",
  "gc-0665bc0c6cce",
] as const;

const errors: string[] = [];

for (const id of EXPECTED_IDS) {
  const override = COURSE_PAGE_OVERRIDES[id];
  if (!override) {
    errors.push(`${id}: override가 없습니다.`);
    continue;
  }

  if (override.seoTitle.length < 20 || override.seoTitle.length > 60) {
    errors.push(`${id}: SEO 제목 길이가 20~60자 범위를 벗어났습니다.`);
  }
  if (
    override.metaDescription.length < 50 ||
    override.metaDescription.length > 150
  ) {
    errors.push(`${id}: meta description 길이가 50~150자 범위를 벗어났습니다.`);
  }
  if (!override.bookingUrl.startsWith("https://")) {
    errors.push(`${id}: 공식 예약 URL은 HTTPS여야 합니다.`);
  }
  if (override.faq.length < 3) {
    errors.push(`${id}: FAQ가 3개 미만입니다.`);
  }

  const questions = new Set(override.faq.map((item) => item.question));
  if (questions.size !== override.faq.length) {
    errors.push(`${id}: 중복 FAQ 질문이 있습니다.`);
  }
}

if (Object.keys(COURSE_PAGE_OVERRIDES).length !== EXPECTED_IDS.length) {
  errors.push("검증 대상과 실제 override 개수가 다릅니다.");
}

if (errors.length > 0) {
  console.error("[check:course-page-overrides] FAIL");
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `[check:course-page-overrides] OK — ${EXPECTED_IDS.length} course pages`,
);
