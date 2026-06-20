import type { Course, CourseFilters } from "@/types/course";
import { EMPTY_FILTERS } from "@/types/course";
import { filterCourses, matchesPriceRange } from "@/lib/filterCourses";

function course(id: string, priceMin?: number, region = "경기"): Course {
  return {
    id,
    name: id,
    region,
    city: region,
    address: "test",
    latitude: 37,
    longitude: 127,
    courseType: "대중제",
    tags: [],
    source: "manual",
    updatedAt: new Date().toISOString(),
    priceMin,
  };
}

function countWithFilters(
  courses: Course[],
  patch: Partial<CourseFilters>,
): number {
  return filterCourses(courses, { ...EMPTY_FILTERS, ...patch }).length;
}

function main(): void {
  const all = [
    course("no-price"),
    course("under-10", 90_000),
    course("exact-10", 100_000),
    course("mid-12", 120_000),
    course("mid-18", 180_000),
    course("over-20", 250_000, "강원"),
  ];

  console.log("=== price filter verification ===\n");

  const noFilter = countWithFilters(all, {});
  console.log(`1. no price filter: ${noFilter} (expect 6)`);

  const under10 = countWithFilters(all, { priceRanges: ["10만원 이하"] });
  console.log(`2. <=10만: ${under10} (expect 2: 90k, 100k)`);

  const multi = countWithFilters(all, {
    priceRanges: ["10~15만원", "15~20만원"],
  });
  console.log(`3. 10~15 + 15~20: ${multi} (expect 2: 120k, 180k)`);

  const over20 = countWithFilters(all, { priceRanges: ["20만원 이상"] });
  console.log(`4. >20만: ${over20} (expect 1: 250k)`);

  const regionPrice = countWithFilters(all, {
    regions: ["경기", "강원"],
    priceRanges: ["20만원 이상"],
  });
  console.log(`5. region OR + price >20: ${regionPrice} (expect 1: 250k 강원)`);

  const rangeChecks = [
    { price: 100_000, option: "10만원 이하", expected: true },
    { price: 100_001, option: "10~15만원", expected: true },
    { price: 150_000, option: "10~15만원", expected: true },
    { price: 150_001, option: "15~20만원", expected: true },
    { price: 200_001, option: "20만원 이상", expected: true },
    { price: 100_000, option: "10~15만원", expected: false },
  ];

  let failed = 0;
  for (const check of rangeChecks) {
    const ok = matchesPriceRange(check.price, check.option) === check.expected;
    if (!ok) {
      failed += 1;
      console.error(
        `FAIL matchesPriceRange(${check.price}, ${check.option}) expected ${check.expected}`,
      );
    }
  }

  const totals = [noFilter, under10, multi, over20, regionPrice];
  const expected = [6, 2, 2, 1, 1];
  for (let i = 0; i < totals.length; i += 1) {
    if (totals[i] !== expected[i]) failed += 1;
  }

  if (failed > 0) {
    console.error(`\n${failed} assertion(s) failed`);
    process.exitCode = 1;
    return;
  }

  console.log("\nAll price filter checks passed.");
}

main();
