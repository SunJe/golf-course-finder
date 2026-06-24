import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  COLLECTION_SEO_SLUGS,
  getCollectionSeoImagePath,
  getCourseSeoImagePath,
  getRegionSeoImagePath,
  getSeoImageAbsoluteUrl,
  REGION_SEO_SLUGS,
  SEO_IMAGE_HEIGHT,
  SEO_IMAGE_WIDTH,
} from "../lib/seoImages";
import { parseCsv, readFileUtf8 } from "./lib/csvUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const PUBLIC_DIR = path.join(ROOT, "public");
const CSV_PATH = path.join(ROOT, "data/golf_courses_import_geocoded_final.csv");
const MIN_FILE_SIZE_BYTES = 5 * 1024;

interface CheckFailure {
  kind: string;
  detail: string;
}

const failures: CheckFailure[] = [];
let collectionsOk = 0;
let regionsOk = 0;
let coursesOk = 0;
let coursesMissing = 0;

function publicPath(relativePath: string): string {
  return path.join(PUBLIC_DIR, relativePath.replace(/^\//, ""));
}

async function checkImageFile(
  kind: string,
  relativePath: string,
): Promise<boolean> {
  const filePath = publicPath(relativePath);

  if (!fs.existsSync(filePath)) {
    failures.push({ kind, detail: `missing file: ${relativePath}` });
    return false;
  }

  const { size } = fs.statSync(filePath);
  if (size < MIN_FILE_SIZE_BYTES) {
    failures.push({
      kind,
      detail: `file too small (${size} bytes): ${relativePath}`,
    });
    return false;
  }

  const meta = await sharp(filePath).metadata();
  if (meta.width !== SEO_IMAGE_WIDTH || meta.height !== SEO_IMAGE_HEIGHT) {
    failures.push({
      kind,
      detail: `invalid dimensions ${meta.width}x${meta.height}: ${relativePath}`,
    });
    return false;
  }

  return true;
}

async function checkCollections(): Promise<void> {
  for (const slug of COLLECTION_SEO_SLUGS) {
    const relativePath = getCollectionSeoImagePath(slug);
    if (await checkImageFile("collection", relativePath)) {
      collectionsOk += 1;
    }
  }
}

async function checkRegions(): Promise<void> {
  for (const slug of REGION_SEO_SLUGS) {
    const relativePath = getRegionSeoImagePath(slug);
    if (await checkImageFile("region", relativePath)) {
      regionsOk += 1;
    }
  }
}

async function checkCourses(): Promise<void> {
  const { rows } = parseCsv(readFileUtf8(CSV_PATH));

  for (const row of rows) {
    const [id] = row;
    if (!id?.trim()) continue;

    const relativePath = getCourseSeoImagePath(id.trim());
    if (await checkImageFile("course", relativePath)) {
      coursesOk += 1;
    } else {
      coursesMissing += 1;
    }
  }
}

function checkAbsoluteUrlGeneration(): void {
  const sampleSlug = COLLECTION_SEO_SLUGS[0];
  if (!sampleSlug) {
    failures.push({
      kind: "og:url",
      detail: "no collection slugs available for URL check",
    });
    return;
  }

  const relativePath = getCollectionSeoImagePath(sampleSlug);
  const absolute = getSeoImageAbsoluteUrl(relativePath);

  if (!absolute.startsWith("http")) {
    failures.push({
      kind: "og:url",
      detail: `absolute URL must start with http: ${absolute}`,
    });
    return;
  }

  if (!absolute.includes(relativePath)) {
    failures.push({
      kind: "og:url",
      detail: `absolute URL missing path: ${absolute}`,
    });
  }
}

async function main(): Promise<void> {
  await checkCollections();
  await checkRegions();
  await checkCourses();
  checkAbsoluteUrlGeneration();

  const sampleSlug = COLLECTION_SEO_SLUGS[0];
  const sampleAbsoluteUrl = sampleSlug
    ? getSeoImageAbsoluteUrl(getCollectionSeoImagePath(sampleSlug))
    : "(none)";

  console.log("SEO image check summary");
  console.log(`  collections: ${collectionsOk}/${COLLECTION_SEO_SLUGS.length} ok`);
  console.log(`  regions: ${regionsOk}/${REGION_SEO_SLUGS.length} ok`);
  console.log(
    `  courses: ${coursesOk} ok${coursesMissing > 0 ? `, ${coursesMissing} missing` : ""}`,
  );
  console.log(`  sample og:image absolute URL: ${sampleAbsoluteUrl}`);

  if (failures.length > 0) {
    console.error(`\n${failures.length} failure(s):`);
    for (const failure of failures.slice(0, 20)) {
      console.error(`  [${failure.kind}] ${failure.detail}`);
    }
    if (failures.length > 20) {
      console.error(`  ... and ${failures.length - 20} more`);
    }
    process.exit(1);
  }

  console.log("\nAll SEO image checks passed.");
}

main().catch((error) => {
  console.error("[check:seo-images] Failed:", error);
  process.exit(1);
});
