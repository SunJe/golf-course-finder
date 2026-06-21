import { loadEnvLocal } from "./lib/envUtils";
import {
  COLLECTION_SLUGS,
  NATIONAL_COLLECTION_SLUGS,
  NEAR_SEOUL_COLLECTION_SLUGS,
} from "@/lib/collectionLanding";
import {
  BUDGET_BOTTOM_PERCENT,
  BUDGET_MAX_COURSES,
} from "@/lib/collectionFilters";

function formatWon(value: number | null): string {
  if (value == null) return "n/a";
  if (value % 10000 === 0) return `${value / 10000}만원`;
  return `${Math.round(value / 10000)}만원`;
}

async function main(): Promise<void> {
  const env = loadEnvLocal(process.cwd());
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }

  const { getCoursesForStaticPages } = await import("@/lib/courseRepository");
  const {
    computeCollectionCounts,
    getBudgetAnalysis,
    getNoindexCollectionSlugs,
    getScoreThresholdAnalysis,
    getSitemapCollectionSlugs,
  } = await import("@/lib/collectionIndex");

  const courses = await getCoursesForStaticPages();
  const counts = computeCollectionCounts(courses);
  const noindexSlugs = getNoindexCollectionSlugs(counts);
  const sitemapSlugs = getSitemapCollectionSlugs(counts);
  const budget = getBudgetAnalysis(courses);
  const thresholds = getScoreThresholdAnalysis(courses);

  console.log("=== GolfMap Korea Collection Counts ===\n");
  console.log(`Total courses loaded: ${courses.length}\n`);

  console.log("--- National collections ---");
  for (const slug of NATIONAL_COLLECTION_SLUGS) {
    console.log(`  ${slug}: ${counts[slug]}`);
  }
  console.log(`  near-seoul (base): ${counts["near-seoul"]}`);

  console.log("\n--- Near-Seoul combo collections ---");
  for (const slug of NEAR_SEOUL_COLLECTION_SLUGS) {
    if (slug === "near-seoul") continue;
    console.log(`  ${slug}: ${counts[slug]}`);
  }

  console.log("\n--- Par3 status ---");
  console.log(`  par3: ${counts.par3} (${counts.par3 === 0 ? "ZERO" : "ok"})`);
  console.log(
    `  near-seoul-par3: ${counts["near-seoul-par3"]} (${counts["near-seoul-par3"] === 0 ? "ZERO" : "ok"})`,
  );

  console.log("\n--- Score thresholds (applied) ---");
  console.log(`  beginner (national): >= ${thresholds.beginnerNational}`);
  console.log(`  baekdori (national): >= ${thresholds.baekdoriNational}`);
  console.log(`  beginner (near-seoul): >= ${thresholds.beginnerNearSeoul}`);
  console.log(`  baekdori (near-seoul): >= ${thresholds.baekdoriNearSeoul}`);

  console.log("\n--- Budget filter ---");
  console.log(
    `  bottom ${BUDGET_BOTTOM_PERCENT * 100}% capped at ${BUDGET_MAX_COURSES}`,
  );
  console.log(
    `  national: ${budget.national.takeCount}/${budget.national.eligibleCount} courses, cutoff ${formatWon(budget.national.cutoffPrice)}`,
  );
  console.log(
    `  near-seoul: ${budget.nearSeoul.takeCount}/${budget.nearSeoul.eligibleCount} courses, cutoff ${formatWon(budget.nearSeoul.cutoffPrice)}`,
  );

  console.log("\n--- Noindex targets (0 results) ---");
  if (noindexSlugs.length === 0) {
    console.log("  (none)");
  } else {
    for (const slug of noindexSlugs) {
      console.log(`  /collections/${slug}`);
    }
  }

  console.log("\n--- Sitemap targets ---");
  for (const slug of sitemapSlugs) {
    console.log(`  /collections/${slug} (${counts[slug]} courses)`);
  }

  console.log("\n--- All slugs summary ---");
  for (const slug of COLLECTION_SLUGS) {
    const flags = [
      counts[slug] === 0 ? "noindex" : null,
      sitemapSlugs.includes(slug) ? "sitemap" : null,
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`  ${slug}: ${counts[slug]}${flags ? ` [${flags}]` : ""}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
