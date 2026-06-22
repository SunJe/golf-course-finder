import { loadEnvLocal } from "./lib/envUtils";
import {
  COLLECTION_SLUGS,
  computeCollectionStats,
  buildCollectionFaqItems,
  getCollectionBySlug,
} from "@/lib/collectionLanding";
import { applyCollectionFilter } from "@/lib/collectionFilters";
import {
  regionLandingPages,
  buildRegionFaqItems,
  filterCoursesByRegion,
  computeRegionStats,
} from "@/lib/regionLanding";
import { buildCourseJsonLdDescription } from "@/lib/courseSeoCopy";
import { getPriceMin, hasPrice } from "@/lib/priceFormat";
import { isValidCourseCoordinates } from "@/lib/focusCourse";

const JSON_LD_LIST_LIMIT = 30;

type Issue = {
  target: string;
  field: string;
  problem: string;
};

function isBadValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "number" && Number.isNaN(value)) return true;
  return false;
}

function auditCourse(courseId: string, course: {
  name: string;
  difficulty?: number | null;
  avgScore?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  priceMin?: number | null;
}): Issue[] {
  const issues: Issue[] = [];
  const target = `/courses/${courseId}`;

  if (isBadValue(course.name?.trim())) {
    issues.push({ target, field: "name", problem: "empty name" });
  }

  const desc = buildCourseJsonLdDescription(course as Parameters<typeof buildCourseJsonLdDescription>[0]);
  if (isBadValue(desc)) {
    issues.push({ target, field: "description", problem: "empty JSON-LD description" });
  }

  if (isValidCourseCoordinates(course as Parameters<typeof isValidCourseCoordinates>[0])) {
    const lat = course.latitude;
    const lng = course.longitude;
    if (typeof lat === "number" && Number.isNaN(lat)) {
      issues.push({ target, field: "geo.latitude", problem: "NaN latitude" });
    }
    if (typeof lng === "number" && Number.isNaN(lng)) {
      issues.push({ target, field: "geo.longitude", problem: "NaN longitude" });
    }
  }

  if (hasPrice(course as Parameters<typeof hasPrice>[0])) {
    const min = getPriceMin(course as Parameters<typeof getPriceMin>[0]);
    if (min != null && Number.isNaN(min)) {
      issues.push({ target, field: "priceRange", problem: "NaN price min" });
    }
  }

  return issues;
}

async function main(): Promise<void> {
  const env = loadEnvLocal(process.cwd());
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }

  const { getCoursesForStaticPages } = await import("@/lib/courseRepository");
  const courses = await getCoursesForStaticPages();
  const issues: Issue[] = [];

  console.log("=== GolfMap Korea Structured Data Audit ===\n");
  console.log(`Courses loaded: ${courses.length}\n`);

  console.log("--- Collection pages ---");
  for (const slug of COLLECTION_SLUGS) {
    const config = getCollectionBySlug(slug);
    if (!config) continue;

    const filtered = applyCollectionFilter(courses, slug);
    const stats = computeCollectionStats(filtered);
    const faqItems = buildCollectionFaqItems(config, stats);
    const screenFaqCount = config.faq.length;
    const jsonLdItemCount = Math.min(filtered.length, JSON_LD_LIST_LIMIT);
    const target = `/collections/${slug}`;

    console.log(
      `  ${target}: ItemList ${jsonLdItemCount}/${filtered.length}, FAQ ${faqItems.length} (config ${screenFaqCount})`,
    );

    if (faqItems.length !== screenFaqCount) {
      issues.push({
        target,
        field: "FAQPage.mainEntity",
        problem: `FAQ count mismatch: rendered ${screenFaqCount}, JSON-LD ${faqItems.length}`,
      });
    }

    if (filtered.length > 0 && jsonLdItemCount === 0) {
      issues.push({
        target,
        field: "ItemList.itemListElement",
        problem: "courses exist but ItemList is empty",
      });
    }

    for (const course of filtered.slice(0, JSON_LD_LIST_LIMIT)) {
      if (isBadValue(course.name?.trim())) {
        issues.push({
          target,
          field: `ItemList.${course.id}.name`,
          problem: "empty course name in ItemList",
        });
      }
    }
  }

  console.log("\n--- Region pages ---");
  for (const config of regionLandingPages) {
    const filtered = filterCoursesByRegion(courses, config);
    const stats = computeRegionStats(filtered);
    const faqItems = buildRegionFaqItems(config.label, stats);
    const jsonLdItemCount = Math.min(filtered.length, JSON_LD_LIST_LIMIT);
    const target = `/regions/${config.slug}`;

    console.log(
      `  ${target}: ItemList ${jsonLdItemCount}/${filtered.length}, FAQ ${faqItems.length}`,
    );
  }

  console.log("\n--- Course detail sample (first 50) ---");
  let courseIssueCount = 0;
  for (const course of courses.slice(0, 50)) {
    const courseIssues = auditCourse(course.id, course);
    if (courseIssues.length > 0) {
      courseIssueCount += courseIssues.length;
      issues.push(...courseIssues);
    }
  }
  console.log(`  Sampled 50 courses, ${courseIssueCount} issue(s)`);

  console.log("\n--- OG image ---");
  const fs = await import("fs");
  const path = await import("path");
  const ogPath = path.join(process.cwd(), "public", "og-image.png");
  const ogExists = fs.existsSync(ogPath);
  console.log(`  public/og-image.png: ${ogExists ? "exists" : "MISSING"}`);
  if (!ogExists) {
    issues.push({
      target: "/",
      field: "openGraph.images",
      problem: "og-image.png missing",
    });
  }

  console.log("\n--- Summary ---");
  if (issues.length === 0) {
    console.log("  No issues found.");
  } else {
    console.log(`  ${issues.length} issue(s):`);
    for (const issue of issues) {
      console.log(`    [${issue.target}] ${issue.field}: ${issue.problem}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
