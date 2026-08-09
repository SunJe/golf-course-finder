import assert from "node:assert/strict";
import fs from "node:fs";

import { getBlogPostBySlug } from "../lib/blogPosts";

const slug = "seoul-nine-hole-beginner-golf-top-5";
const post = getBlogPostBySlug(slug);
assert(post, `Missing existing post: ${slug}`);

assert.equal(post.slug, slug, "The existing slug must not change");
assert.equal(
  post.title,
  "서울 근교 9홀 골프장 10곳｜9홀만·18홀 반복·2인·노캐디 비교",
);
assert.equal(post.dataCheckedAt, "2026-08-09");
assert.equal(post.showItemRank, false, "Comparison cards must not render ranks");

const courseSection = post.sections.find(
  (section) => section.heading === "서울 근교 9홀 골프장 10곳",
);
assert(courseSection?.items, "Missing ten-course comparison section");
assert.equal(courseSection.items.length, 10);

const expectedIds = [
  "gc-4687a4044d34",
  "gc-8fbc2ee961a0",
  "gc-41b5c15f44da",
  "gc-5ec5b76d3c22",
  "gc-1faa083d0616",
  "gc-4487ee52808c",
  "gc-a862e6d054f2",
  "gc-c77232b99bd6",
  "gc-18640b625b94",
  "gc-29fa36946d15",
];
assert.deepEqual(
  courseSection.items.map((item) => item.relatedCourseId),
  expectedIds,
  "Course order or replacement differs from the approved list",
);

const comparison = post.sections.find(
  (section) => section.heading === "한눈에 보는 서울 근교 9홀 골프장 비교",
);
assert(comparison?.table, "Missing comparison table");
assert.equal(comparison.table.caption, "2026년 8월 9일 기준 공식 안내 요약");
assert.deepEqual(comparison.table.columns, [
  "골프장",
  "지역",
  "기본 코스",
  "예약 가능 홀",
  "18홀 방식",
  "2인",
  "캐디",
  "예약 전 확인",
]);
assert.equal(comparison.table.rows.length, 10);

const faq = post.sections.find((section) => section.heading === "자주 묻는 질문");
assert(faq, "Missing FAQ section");
assert(faq.body.length >= 6, "At least six FAQ entries are required");

const serialized = JSON.stringify(post);
for (const forbidden of [
  "BEST 5",
  "초보자 추천",
  "파주제이퍼블릭",
  "무제한 노캐디",
  "코리아퍼블릭GC 상시 노캐디",
  "완전 18홀화",
]) {
  assert(!serialized.includes(forbidden), `Forbidden legacy wording remains: ${forbidden}`);
}
for (const required of [
  '"relatedCollectionSlug":"nine-hole"',
  '"relatedCollectionSlug":"near-seoul-nine-hole"',
  '"relatedPostSlug":"capital-region-two-person-golf-courses-10"',
  '"relatedPostSlug":"capital-region-no-caddie-golf-courses-10"',
]) {
  assert(serialized.includes(required), `Missing internal link: ${required}`);
}

const bodySource = fs.readFileSync("components/BlogPostBody.tsx", "utf8");
assert(
  bodySource.includes("overflow-x-auto"),
  "Comparison tables must remain horizontally scrollable on mobile",
);

console.log("[check:nine-hole-phase2] OK — slug, 10 courses, table, FAQ, links, and mobile table contract");
