import assert from "node:assert/strict";
import type { Course } from "../types/course";
import {
  getCourses,
  getCoursesForStaticPages,
  getNearbyCoursesForCourseWithDiagnostics,
} from "../lib/courseRepository";
import {
  getNearbyCourses,
  searchNearbyCoursesAdaptive,
  type NearbyCourseCandidateLoader,
  type SphericalBoundingBox,
} from "../lib/nearbyCourses";

const FIXTURE_IDS = [
  "gc-4687a4044d34", // 지산퍼블릭
  "gc-0665bc0c6cce", // 고령유니밸리CC
  "gc-bc41a2489944", // 칠곡아이위시CC
  "gc-9655898af6a6", // 포웰CC프린세스
  "gc-d780ed19a4d0", // 제주
  "gc-a80360466b97", // 수도권
] as const;

const BEFORE_FIXTURES: Record<string, string[]> = {
  "gc-4687a4044d34": [
    "gc-20c1df4aa8fb",
    "gc-897c73dbf41b",
    "gc-25de9ff08a30",
    "gc-82563fee9804",
    "gc-d76bd69feda5",
    "gc-a53c3fecd592",
  ],
  "gc-0665bc0c6cce": [
    "gc-043cdfb2fdcd",
    "gc-8809b27cc2be",
    "gc-385ee578118d",
    "gc-2a08fd4bdc5e",
    "gc-cd6b63162f39",
    "gc-98e3f829ab99",
  ],
  "gc-bc41a2489944": [
    "gc-66dd9ef01893",
    "gc-e2e76f635c4a",
    "gc-385ee578118d",
    "gc-1f14d0ca89b4",
    "gc-a944350f5db1",
    "gc-6a587177a23c",
  ],
  "gc-9655898af6a6": [
    "gc-1e8879a575c1",
    "gc-2b09ff38b37c",
    "gc-e401cda7a8ad",
    "gc-46caa66a0c89",
    "gc-dc3aed15fe4c",
    "gc-7681bcbcf45d",
  ],
  "gc-d780ed19a4d0": [
    "gc-4949c11c28bf",
    "gc-d03e2b710be0",
    "gc-5f82bbc964a8",
    "gc-cf50ab88350d",
    "gc-aff117457c45",
    "gc-baa4851e3f89",
  ],
  "gc-a80360466b97": [
    "gc-3b60b2dadb3f",
    "gc-1faa083d0616",
    "gc-27324df1736a",
    "gc-8fbc2ee961a0",
    "gc-41b5c15f44da",
    "gc-18640b625b94",
  ],
};

function isInBounds(course: Course, bounds: SphericalBoundingBox): boolean {
  return (
    course.latitude >= bounds.minLatitude &&
    course.latitude <= bounds.maxLatitude &&
    bounds.longitudeRanges.some(
      (range) =>
        course.longitude >= range.min && course.longitude <= range.max,
    )
  );
}

function createMemoryLoader(courses: Course[]): NearbyCourseCandidateLoader {
  return {
    async fetchWithinBounds(bounds) {
      return courses.filter((course) => isInBounds(course, bounds));
    },
    async fetchAll() {
      return courses;
    },
  };
}

function createCourse(
  id: string,
  latitude: number,
  longitude: number,
): Course {
  return {
    id,
    name: id,
    region: "test",
    city: "test",
    address: "test",
    latitude,
    longitude,
    courseType: "기타",
    tags: [],
    source: "manual",
    updatedAt: "2026-08-15T00:00:00.000Z",
  };
}

async function main(): Promise<void> {
  const courses = await getCoursesForStaticPages();
  assert.ok(courses.length >= 500, "Production dataset is below its safety floor");
  const unchangedGetCourses = await getCourses();
  assert.deepEqual(
    unchangedGetCourses.map(({ id }) => id),
    courses.map(({ id }) => id),
    "getCourses must keep its existing full-list behavior",
  );

  const memoryLoader = createMemoryLoader(courses);
  let comparableCount = 0;
  for (const current of courses) {
    const expected = getNearbyCourses(courses, current, 6).map(({ id }) => id);
    const actual = (
      await searchNearbyCoursesAdaptive(current, memoryLoader, 6)
    ).courses.map(({ id }) => id);
    assert.deepEqual(actual, expected, `All-course parity failed: ${current.id}`);
    comparableCount += 1;
  }

  const productionQueryDiagnostics: Record<string, unknown> = {};
  for (const id of FIXTURE_IDS) {
    const current = courses.find((course) => course.id === id);
    assert.ok(current, `Missing fixture course: ${id}`);
    assert.deepEqual(
      getNearbyCourses(courses, current, 6).map((course) => course.id),
      BEFORE_FIXTURES[id],
      `Before fixture changed: ${id}`,
    );
    const queried = await getNearbyCoursesForCourseWithDiagnostics(current, 6);
    assert.deepEqual(
      queried.courses.map((course) => course.id),
      BEFORE_FIXTURES[id],
      `Production query parity failed: ${id}`,
    );
    productionQueryDiagnostics[id] = queried.diagnostics;
  }

  const denseCurrent = createCourse("dense-current", 37.5, 127);
  const dense = [
    denseCurrent,
    ...Array.from({ length: 8 }, (_, index) =>
      createCourse(`dense-${index}`, 37.5 + (index + 1) * 0.01, 127),
    ),
  ];
  const denseResult = await searchNearbyCoursesAdaptive(
    denseCurrent,
    createMemoryLoader(dense),
  );
  assert.equal(denseResult.diagnostics.completedRadiusKm, 50);
  assert.equal(denseResult.diagnostics.queryCount, 1);
  assert.equal(denseResult.courses.length, 6);
  assert.ok(denseResult.courses.every((course) => course.id !== denseCurrent.id));

  const sparseCurrent = createCourse("sparse-current", 0, 0);
  const sparse = [
    sparseCurrent,
    ...Array.from({ length: 6 }, (_, index) =>
      createCourse(`sparse-${index}`, 10 + index, 0),
    ),
  ];
  const sparseResult = await searchNearbyCoursesAdaptive(
    sparseCurrent,
    createMemoryLoader(sparse),
  );
  assert.equal(sparseResult.diagnostics.usedGlobalFallback, true);
  assert.equal(sparseResult.diagnostics.queryCount, 6);
  assert.equal(sparseResult.courses.length, 6);

  const limited = await searchNearbyCoursesAdaptive(
    denseCurrent,
    createMemoryLoader(dense),
    3,
  );
  assert.equal(limited.courses.length, 3);

  let invalidLoaderCalled = false;
  const invalid = await searchNearbyCoursesAdaptive(
    createCourse("invalid", Number.NaN, 127),
    {
      async fetchWithinBounds() {
        invalidLoaderCalled = true;
        return [];
      },
      async fetchAll() {
        invalidLoaderCalled = true;
        return [];
      },
    },
  );
  assert.deepEqual(invalid.courses, []);
  assert.equal(invalidLoaderCalled, false);

  console.log(
    JSON.stringify(
      {
        productionCourseCount: courses.length,
        allCourseParityCount: comparableCount,
        fixtureIds: FIXTURE_IDS,
        productionQueryDiagnostics,
        dense: denseResult.diagnostics,
        sparse: sparseResult.diagnostics,
        assertions: {
          exactOrder: "pass",
          selfExclusion: "pass",
          limit: "pass",
          invalidCoordinates: "pass",
          denseSearch: "pass",
          sparseFallback: "pass",
          getCoursesUnchanged: "pass",
        },
      },
      null,
      2,
    ),
  );
}

void main();
