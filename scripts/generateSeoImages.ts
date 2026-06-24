import fs from "fs";
import path from "path";
import { collectionLandingPages } from "../lib/collectionLanding";
import { regionLandingPages } from "../lib/regionLanding";
import { parseCsv, readFileUtf8 } from "./lib/csvUtils";
import {
  getBackgroundsRoot,
  renderSeoCardPng,
  resolveBackgroundPath,
  resolveCourseBackgroundPath,
  resolveRegionFallbackForCourse,
} from "./lib/seoImageComposite";
import { getProjectRoot } from "./lib/sourceRegistry";
import { logOgFontResolution } from "../lib/seo-images/ogFontConfig";

const DEFAULT_EYEBROW = "전국을 연결하는 골프 정보 플랫폼";

const SAMPLE_COLLECTION_SLUGS = [
  "nine-hole",
  "baekdori",
  "beginner",
  "budget",
  "public",
  "near-seoul",
  "near-seoul-public",
] as const;

const ROOT = getProjectRoot();
const CSV_PATH = path.join(ROOT, "data/golf_courses_import_geocoded_final.csv");
const PUBLIC_DIR = path.join(ROOT, "public/seo-images");
const BACKGROUNDS_ROOT = getBackgroundsRoot(ROOT);

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function parseArgs(argv: string[]): { sampleOnly: boolean } {
  let sampleOnly = false;
  for (const arg of argv) {
    if (arg === "--sample-collections") sampleOnly = true;
  }
  return { sampleOnly };
}

async function renderCard(
  slug: string,
  outputPath: string,
  title: string,
  backgroundKind: "collections" | "regions" | "courses",
  regionSlug?: string,
): Promise<void> {
  let bgPath = resolveBackgroundPath(backgroundKind, slug, BACKGROUNDS_ROOT);
  if (!bgPath && backgroundKind === "courses") {
    bgPath =
      resolveCourseBackgroundPath(slug, BACKGROUNDS_ROOT) ??
      resolveRegionFallbackForCourse(regionSlug, BACKGROUNDS_ROOT);
  }

  await renderSeoCardPng(
    {
      title,
      eyebrow: DEFAULT_EYEBROW,
      seed: slug,
    },
    outputPath,
    bgPath,
    BACKGROUNDS_ROOT,
    ROOT,
  );
}

async function generateCollectionImages(sampleOnly: boolean): Promise<number> {
  const dir = path.join(PUBLIC_DIR, "collections");
  ensureDir(dir);

  const pages = sampleOnly
    ? collectionLandingPages.filter((p) =>
        (SAMPLE_COLLECTION_SLUGS as readonly string[]).includes(p.slug),
      )
    : collectionLandingPages;

  for (const config of pages) {
    await renderCard(
      config.slug,
      path.join(dir, `${config.slug}.png`),
      config.h1 || config.title,
      "collections",
    );
  }

  return pages.length;
}

async function generateRegionImages(): Promise<number> {
  const dir = path.join(PUBLIC_DIR, "regions");
  ensureDir(dir);

  for (const config of regionLandingPages) {
    await renderCard(
      config.slug,
      path.join(dir, `${config.slug}.png`),
      `${config.label} 골프장`,
      "regions",
    );
  }

  return regionLandingPages.length;
}

function guessRegionSlugFromAddress(address: string): string | undefined {
  const a = address.trim();
  if (a.startsWith("서울")) return "seoul";
  if (a.startsWith("경기")) return "gyeonggi";
  if (a.startsWith("인천")) return "incheon";
  if (a.startsWith("강원")) return "gangwon";
  if (a.startsWith("충청") || a.startsWith("충북") || a.startsWith("충남") || a.startsWith("세종"))
    return "chungcheong";
  if (a.startsWith("전라") || a.startsWith("전북") || a.startsWith("전남")) return "jeolla";
  if (
    a.startsWith("경상") ||
    a.startsWith("경북") ||
    a.startsWith("경남") ||
    a.startsWith("울산") ||
    a.startsWith("대구")
  )
    return "gyeongsang";
  if (a.startsWith("제주")) return "jeju";
  if (a.startsWith("부산")) return "busan";
  return undefined;
}

async function generateCourseImages(): Promise<number> {
  const dir = path.join(PUBLIC_DIR, "courses");
  ensureDir(dir);

  const { rows } = parseCsv(readFileUtf8(CSV_PATH));
  let count = 0;

  for (const row of rows) {
    const [id, name, , address] = row;
    if (!id?.trim() || !name?.trim()) continue;

    const regionSlug = guessRegionSlugFromAddress(address ?? "");

    await renderCard(
      id.trim(),
      path.join(dir, `${id.trim()}.png`),
      name.trim(),
      "courses",
      regionSlug,
    );
    count += 1;
  }

  return count;
}

async function main(): Promise<void> {
  const { sampleOnly } = parseArgs(process.argv.slice(2));
  ensureDir(PUBLIC_DIR);
  ensureDir(BACKGROUNDS_ROOT);
  logOgFontResolution(ROOT);

  const collections = await generateCollectionImages(sampleOnly);
  const regions = sampleOnly ? 0 : await generateRegionImages();
  const courses = sampleOnly ? 0 : await generateCourseImages();

  const total = collections + regions + courses;
  console.log(`Generated SEO images: ${total} total (1:1 ${1200}x${1200})`);
  console.log(`  collections: ${collections}`);
  if (!sampleOnly) {
    console.log(`  regions: ${regions}`);
    console.log(`  courses: ${courses}`);
  }
  console.log(`Backgrounds root: ${BACKGROUNDS_ROOT}`);
  console.log(`Output: ${PUBLIC_DIR}`);
}

main().catch((error) => {
  console.error("[generate:seo-images] Failed:", error);
  process.exit(1);
});
