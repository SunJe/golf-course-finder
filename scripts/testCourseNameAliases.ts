import type { Course } from "@/types/course";
import { matchCourseSearch } from "@/lib/courseSearch";
import { buildCourseNameAliases } from "@/lib/seo/courseNameAliases";

function assertIncludes(label: string, aliases: string[], expected: string[]): void {
  for (const item of expected) {
    if (!aliases.includes(item)) {
      throw new Error(`${label}: missing alias "${item}" in [${aliases.join(", ")}]`);
    }
  }
  console.log(`[ok] ${label}: ${aliases.join(" | ")}`);
}

function assertSearch(label: string, course: Course, query: string): void {
  const result = matchCourseSearch(course, query);
  if (!result.matched) {
    throw new Error(`${label}: "${query}" did not match ${course.name}`);
  }
  console.log(`[ok] ${label}: "${query}" → ${course.name} (${result.reason}, ${result.score})`);
}

function courseFixture(
  name: string,
  changeNameTo?: string,
): Course {
  const searchAliases = buildCourseNameAliases({
    name,
    changeNameTo,
  });
  return {
    id: `fixture-${name}`,
    name,
    changeNameTo,
    searchAliases,
    region: "경기",
    city: "용인시",
    address: "경기도 용인시 예시로 1",
    latitude: 37.2,
    longitude: 127.1,
    courseType: "대중제",
    tags: [],
    source: "manual",
    updatedAt: new Date().toISOString(),
  };
}

function main(): void {
  const theban = buildCourseNameAliases({ name: "더반골프클럽" });
  assertIncludes("더반골프클럽", theban, [
    "더반골프클럽",
    "더반CC",
    "더반GC",
    "더반컨트리클럽",
    "더반골프장",
  ]);

  const vista = buildCourseNameAliases({ name: "비에이비스타CC(회원제)" });
  assertIncludes("비에이비스타CC", vista, [
    "비에이비스타CC",
    "비에이비스타GC",
    "비에이비스타컨트리클럽",
    "비에이비스타골프클럽",
  ]);

  const hillmaru = buildCourseNameAliases({ name: "힐마루골프클럽&리조트" });
  assertIncludes("힐마루골프클럽&리조트", hillmaru, [
    "힐마루CC",
    "힐마루GC",
    "힐마루컨트리클럽",
    "힐마루골프클럽",
  ]);

  const lakeside = buildCourseNameAliases({ name: "레이크사이드CC(퍼블릭)" });
  assertIncludes("레이크사이드CC", lakeside, [
    "레이크사이드CC",
    "레이크사이드GC",
    "레이크사이드컨트리클럽",
  ]);

  const thebanCourse = courseFixture("더반골프클럽");
  assertSearch("더반CC 검색", thebanCourse, "더반CC");
  assertSearch("더반GC 검색", thebanCourse, "더반GC");

  const vistaCourse = courseFixture("비에이비스타골프장(회원)", "비에이비스타CC(회원제)");
  assertSearch("비에이비스타GC 검색", vistaCourse, "비에이비스타GC");

  const hillmaruCourse = courseFixture("힐마루컨트리클럽 (대중제)", "힐마루CC(퍼블릭)");
  assertSearch("힐마루컨트리클럽 검색", hillmaruCourse, "힐마루컨트리클럽");

  console.log("\nAll course alias tests passed.");
}

main();
