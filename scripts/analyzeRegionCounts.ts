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
  const { getNormalizedRegionLabel } = await import("@/lib/regionUtils");
  const { resolveCourseRegionSlug } = await import("@/lib/regionNormalize");

  const courses = await getCoursesForStaticPages();
  const counts = computeRegionCounts(courses);
  const noindexSlugs = getNoindexRegionSlugs(counts);
  const sitemapSlugs = getSitemapRegionSlugs(counts);

  const labelCounts = new Map<string, number>();
  for (const course of courses) {
    const label = getNormalizedRegionLabel(course) ?? "(미분류)";
    labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1);
  }

  const incheonAddressGyeonggiRegion = courses.filter((course) => {
    const address = course.address ?? "";
    const regionField = course.region?.trim() ?? "";
    const normalized = getNormalizedRegionLabel(course);
    return /인천/.test(address) && normalized === "경기";
  });

  const incheonAddressRawGyeonggiField = courses.filter((course) => {
    const address = course.address ?? "";
    const regionField = course.region?.trim() ?? "";
    return /인천/.test(address) && regionField === "경기";
  });

  console.log("=== GolfMap Korea Region Counts ===\n");
  console.log(`Total courses loaded: ${courses.length}\n`);

  console.log("--- Normalized region labels ---");
  for (const [label, count] of [...labelCounts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "ko"),
  )) {
    console.log(`  ${label}: ${count}`);
  }

  console.log("\n--- Region slug counts ---");
  for (const slug of REGION_SLUGS) {
    const config = getRegionLandingBySlug(slug);
    const label = config?.label ?? slug;
    console.log(`  ${slug} (${label}): ${counts[slug]}`);
  }

  console.log(`\n  경기 (slug gyeonggi): ${counts.gyeonggi}`);
  console.log(`  인천 (slug incheon): ${counts.incheon}`);

  console.log("\n--- Data quality checks ---");
  if (incheonAddressGyeonggiRegion.length === 0) {
    console.log("  OK: no course with 인천 in address normalized as 경기");
  } else {
    console.log(
      `  ERROR: ${incheonAddressGyeonggiRegion.length} course(s) with 인천 address normalized as 경기`,
    );
    for (const course of incheonAddressGyeonggiRegion.slice(0, 20)) {
      console.log(
        `    - ${course.name} | region=${course.region} | city=${course.city} | slug=${resolveCourseRegionSlug(course)}`,
      );
    }
  }

  if (incheonAddressRawGyeonggiField.length > 0) {
    console.log(
      `\n  Note: ${incheonAddressRawGyeonggiField.length} course(s) have raw region=경기 but 인천 address (normalized separately):`,
    );
    for (const course of incheonAddressRawGyeonggiField.slice(0, 10)) {
      console.log(
        `    - ${course.name} | normalized=${getNormalizedRegionLabel(course)} | ${course.address}`,
      );
    }
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
