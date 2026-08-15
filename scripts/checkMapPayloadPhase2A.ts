import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getCourses, getMapCourses } from "../lib/courseRepository";
import { toHomeCourses } from "../lib/homeCourse";
import { MAP_COURSE_SELECT } from "../lib/mapCourse";
import { filterCourses } from "../lib/filterCourses";
import { getSearchSuggestions } from "../lib/searchSuggestions";
import {
  COLLECTION_SLUGS,
  type CollectionSlug,
} from "../lib/collectionLanding";
import { applyCollectionFilter } from "../lib/collectionFilters";
import { computeCollectionCounts } from "../lib/collectionIndex";
import { computeRegionCounts, REGION_SLUGS } from "../lib/regionIndex";
import { formatCardReservationPriceParts } from "../lib/coursePrice";
import { formatHoleCount } from "../lib/courseDisplay";
import { formatCourseLocationLabel } from "../lib/regionUtils";
import {
  getKakaoMapSearchUrl,
  getNaverMapSearchUrl,
} from "../lib/externalMapLinks";
import {
  COURSE_TYPE_OPTIONS,
  HOLE_OPTIONS,
  REGIONS,
  TAG_OPTIONS,
} from "../lib/constants";
import { FILTER_PRICE_OPTIONS } from "../lib/filterChips";
import type { Course, CourseFilters } from "../types/course";

const EXPECTED_PRODUCTION_COUNT = 532;
const PUBLIC_KEYS = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "latitude",
  "longitude",
  "courseType",
  "holeCount",
  "phone",
  "homepageUrl",
  "tags",
  "priceMin",
  "priceMax",
  "priceText",
  "weekdayGreenFeeMin",
  "nightRound",
  "noCaddie",
  "twoPlayerAllowed",
  "resort",
  "description",
  "source",
  "updatedAt",
] as const;

const FORBIDDEN_KEYS = [
  "bookingUrl",
  "weekendGreenFeeMin",
  "caddieFee",
  "cartFee",
  "imageUrl",
  "businessStatus",
  "priceType",
  "priceSourceUrl",
  "priceUpdatedAt",
  "difficulty",
  "changeNameTo",
  "searchAliases",
  "searchKeywords",
] as const;

function ids(courses: Course[]): string[] {
  return courses.map((course) => course.id);
}

function emptyFilters(): CourseFilters {
  return {
    query: "",
    regions: [],
    holeCounts: [],
    courseTypes: [],
    priceRanges: [],
    tags: [],
  };
}

function addFilterCases(courses: Course[]): CourseFilters[] {
  const cases: CourseFilters[] = [emptyFilters()];
  const regions = REGIONS.filter((value) => value !== "전체").slice(0, 8);
  const holes = HOLE_OPTIONS.filter((value) => value !== "전체");
  const types = COURSE_TYPE_OPTIONS.filter((value) => value !== "전체");
  const tags = TAG_OPTIONS.slice(0, 6);

  for (const region of regions) cases.push({ ...emptyFilters(), regions: [region] });
  for (const hole of holes) cases.push({ ...emptyFilters(), holeCounts: [hole] });
  for (const type of types) cases.push({ ...emptyFilters(), courseTypes: [type] });
  for (const price of FILTER_PRICE_OPTIONS) {
    cases.push({ ...emptyFilters(), priceRanges: [price] });
  }
  for (const tag of tags) cases.push({ ...emptyFilters(), tags: [tag] });

  const samples = courses.slice(0, 5);
  for (const course of samples) {
    cases.push({
      ...emptyFilters(),
      query: course.name,
      regions: course.region ? [course.region] : [],
    });
  }
  return cases;
}

function searchQueries(courses: Course[]): string[] {
  const queries = new Set<string>();
  for (const course of courses) {
    queries.add(course.name);
    if (course.city.trim()) queries.add(course.city.trim());
    if (course.region.trim()) queries.add(course.region.trim());
    if (course.name.length >= 3) queries.add(course.name.slice(0, 3));
    if (queries.size >= 24) break;
  }
  return [...queries].slice(0, 24);
}

function cardSnapshot(course: Course) {
  return {
    id: course.id,
    name: course.name,
    location: formatCourseLocationLabel(course),
    address: course.address,
    courseType: course.courseType,
    holes: formatHoleCount(course.holeCount),
    price: formatCardReservationPriceParts(course),
    detailHref: `/courses/${course.id}`,
    kakaoHref: getKakaoMapSearchUrl(course),
    naverHref: getNaverMapSearchUrl(course),
    marker: [course.latitude, course.longitude, course.weekdayGreenFeeMin],
  };
}

async function main() {
  assert.equal(
    process.env.GOLFMAP_DATA_MODE,
    "production",
    "Run with GOLFMAP_DATA_MODE=production",
  );

  const [fullCourses, apiCourses] = await Promise.all([
    getCourses(),
    getMapCourses(),
  ]);
  const beforeCourses = toHomeCourses(fullCourses);

  assert.equal(fullCourses.length, EXPECTED_PRODUCTION_COUNT);
  assert.equal(apiCourses.length, EXPECTED_PRODUCTION_COUNT);
  assert.deepEqual(apiCourses, beforeCourses, "narrow query must equal old map DTO");
  assert.deepEqual(ids(apiCourses), ids(beforeCourses), "ID/order parity");
  assert.equal(new Set(ids(apiCourses)).size, apiCourses.length, "duplicate IDs");
  assert(!MAP_COURSE_SELECT.includes("*"), "map query must not use select(*)");

  for (const course of apiCourses) {
    const keys = Object.keys(course).sort();
    const expectedKeys = [...PUBLIC_KEYS].sort();
    assert.deepEqual(keys, expectedKeys, `unexpected DTO key set for ${course.id}`);
    for (const key of FORBIDDEN_KEYS) {
      assert(!(key in course), `forbidden DTO key ${key} on ${course.id}`);
    }
    assert(course.id && course.name && course.region && course.city);
    assert(Number.isFinite(course.latitude) && Number.isFinite(course.longitude));
  }

  const filterCases = addFilterCases(beforeCourses);
  assert(filterCases.length >= 20);
  for (const filters of filterCases) {
    assert.deepEqual(
      ids(filterCourses(apiCourses, filters)),
      ids(filterCourses(beforeCourses, filters)),
      `filter parity: ${JSON.stringify(filters)}`,
    );
  }

  const queries = searchQueries(beforeCourses);
  assert(queries.length >= 20);
  for (const query of queries) {
    const filters = { ...emptyFilters(), query };
    assert.deepEqual(
      ids(filterCourses(apiCourses, filters)),
      ids(filterCourses(beforeCourses, filters)),
      `search parity: ${query}`,
    );
    assert.deepEqual(
      getSearchSuggestions(apiCourses, query),
      getSearchSuggestions(beforeCourses, query),
      `suggestion parity: ${query}`,
    );
  }

  assert.deepEqual(
    computeCollectionCounts(apiCourses),
    computeCollectionCounts(beforeCourses),
  );
  for (const slug of COLLECTION_SLUGS as readonly CollectionSlug[]) {
    assert.deepEqual(
      ids(applyCollectionFilter(apiCourses, slug)),
      ids(applyCollectionFilter(beforeCourses, slug)),
      `collection parity: ${slug}`,
    );
  }
  assert.deepEqual(computeRegionCounts(apiCourses), computeRegionCounts(beforeCourses));
  for (const slug of REGION_SLUGS) {
    assert.equal(
      computeRegionCounts(apiCourses)[slug],
      computeRegionCounts(beforeCourses)[slug],
    );
  }

  const savedIds = new Set(beforeCourses.filter((_, index) => index % 37 === 0).map((c) => c.id));
  assert.deepEqual(
    ids(apiCourses.filter((course) => savedIds.has(course.id))),
    ids(beforeCourses.filter((course) => savedIds.has(course.id))),
    "favorites/visited ID filtering parity",
  );
  assert.deepEqual(
    apiCourses.slice(0, 10).map(cardSnapshot),
    beforeCourses.slice(0, 10).map(cardSnapshot),
    "list/marker snapshot parity",
  );

  const pageSource = fs.readFileSync(path.join(process.cwd(), "app/map/page.tsx"), "utf8");
  assert(!pageSource.includes("courseRepository"));
  assert(!pageSource.includes("getCourses("));
  assert(!pageSource.includes("courses={"));
  const routeSource = fs.readFileSync(
    path.join(process.cwd(), "app/api/map/courses/route.ts"),
    "utf8",
  );
  assert(routeSource.includes('dynamic = "force-dynamic"'));
  assert(routeSource.includes('"Cache-Control"'));
  const loaderSource = fs.readFileSync(
    path.join(process.cwd(), "components/MapDataLoader.tsx"),
    "utf8",
  );
  assert(loaderSource.includes("AbortController"));
  assert(loaderSource.includes("다시 시도"));

  console.log(
    `[check:map-payload-phase2a] PASS: ${apiCourses.length} courses, ${filterCases.length} filter cases, ${queries.length} search/suggestion queries, ${COLLECTION_SLUGS.length} collections, ${REGION_SLUGS.length} regions`,
  );
}

void main();
