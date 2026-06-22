import { loadEnvLocal } from "./lib/envUtils";

async function main(): Promise<void> {
  const env = loadEnvLocal(process.cwd());
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }

  const { getCoursesForStaticPages } = await import("@/lib/courseRepository");
  const {
    REGION_SLUGS,
    computeRegionCounts,
    getNoindexRegionSlugs,
    getSitemapRegionSlugs,
  } = await import("@/lib/regionIndex");
  const { getRegionLandingBySlug } = await import("@/lib/regionLanding");

  const courses = await getCoursesForStaticPages();
  const counts = computeRegionCounts(courses);
  const noindexSlugs = getNoindexRegionSlugs(counts);
  const sitemapSlugs = getSitemapRegionSlugs(counts);

  console.log("=== GolfMap Korea Region Counts ===\n");
  console.log(`Total courses loaded: ${courses.length}\n`);

  console.log("--- Region counts ---");
  for (const slug of REGION_SLUGS) {
    const config = getRegionLandingBySlug(slug);
    const label = config?.label ?? slug;
    console.log(`  ${slug} (${label}): ${counts[slug]}`);
  }

  console.log("\n--- Noindex targets (0 results) ---");
  if (noindexSlugs.length === 0) {
    console.log("  (none)");
  } else {
    for (const slug of noindexSlugs) {
      console.log(`  /regions/${slug}`);
    }
  }

  console.log("\n--- Sitemap targets ---");
  for (const slug of sitemapSlugs) {
    console.log(`  /regions/${slug} (${counts[slug]} courses)`);
  }

  console.log("\n--- All slugs summary ---");
  for (const slug of REGION_SLUGS) {
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
