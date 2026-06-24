import fs from "fs";
import path from "path";
import { loadEnvLocal } from "./lib/envUtils";
import {
  COLLECTION_SLUGS,
  collectionLandingPages,
} from "@/lib/collectionLanding";
import {
  computeCollectionCounts,
  getNoindexCollectionSlugs,
  getSitemapCollectionSlugs,
} from "@/lib/collectionIndex";
import {
  computeRegionCounts,
  getNoindexRegionSlugs,
  getSitemapRegionSlugs,
  REGION_SLUGS,
} from "@/lib/regionIndex";
import { getRegionLandingBySlug } from "@/lib/regionLanding";
import {
  buildCollectionMetadata,
  buildHomeMetadata,
  buildRegionMetadata,
  buildStaticPageMetadata,
} from "@/lib/seoMetadata";
import { buildCourseMetadata } from "@/lib/seoMetadata";
import { getCollectionSeoImagePath, getRegionSeoImagePath } from "@/lib/seoImages";

interface PageAudit {
  path: string;
  title?: string;
  description?: string;
  hasOgImage: boolean;
  wordCount?: number;
}

interface ScoreLeak {
  file: string;
  line: number;
  match: string;
}

export interface AdSenseReadinessReport {
  totalPagesChecked: number;
  missingTitle: string[];
  missingDescription: string[];
  missingOgImage: string[];
  zeroCountIndexablePages: string[];
  thinPages: string[];
  noindexInPopularLinks: string[];
  publicInternalScoreLeaks: ScoreLeak[];
}

const STATIC_PAGES = [
  { path: "/", build: () => buildHomeMetadata() },
  {
    path: "/about",
    build: () =>
      buildStaticPageMetadata({
        title: "서비스 소개",
        description: "GolfMap Korea 서비스 소개",
        path: "/about",
      }),
  },
  {
    path: "/contact",
    build: () =>
      buildStaticPageMetadata({
        title: "문의",
        description: "GolfMap Korea 문의",
        path: "/contact",
      }),
  },
  {
    path: "/privacy",
    build: () =>
      buildStaticPageMetadata({
        title: "개인정보처리방침",
        description: "GolfMap Korea 개인정보처리방침",
        path: "/privacy",
      }),
  },
  {
    path: "/disclaimer",
    build: () =>
      buildStaticPageMetadata({
        title: "이용 고지",
        description: "GolfMap Korea 이용 고지",
        path: "/disclaimer",
      }),
  },
] as const;

const POPULAR_LINK_SOURCES = [
  "components/HomeIntro.tsx",
  "components/CollectionLinks.tsx",
  "components/RegionLinks.tsx",
  "components/Footer.tsx",
  "components/HomeClient.tsx",
  "components/MobileHomeHub.tsx",
];

const SCORE_LEAK_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bavg_score\b/, label: "avg_score" },
  { pattern: /참고 점수/, label: "참고 점수" },
  { pattern: /난이도 정보 없음/, label: "난이도 정보 없음" },
  { pattern: /난이도 정보/, label: "난이도 정보" },
  { pattern: /formatDifficultyForDisplay/, label: "formatDifficultyForDisplay" },
  { pattern: /course\.difficulty/, label: "course.difficulty" },
  { pattern: /\bdifficulty:\s*course/, label: "difficulty: course" },
];

const PUBLIC_SCAN_DIRS = ["app", "components"] as const;
const PUBLIC_SCAN_SKIP = new Set([
  "components/admin",
  "app/admin",
  "lib/enrichment",
]);

function metadataTitle(metadata: { title?: unknown }): string {
  const title = metadata.title;
  if (typeof title === "string") return title.trim();
  if (title && typeof title === "object" && "default" in title) {
    const value = (title as { default?: string }).default;
    return value?.trim() ?? "";
  }
  return "";
}

function metadataDescription(metadata: { description?: unknown }): string {
  return typeof metadata.description === "string"
    ? metadata.description.trim()
    : "";
}

function metadataHasOgImage(metadata: {
  openGraph?: { images?: unknown };
}): boolean {
  const images = metadata.openGraph?.images;
  if (!images) return false;
  if (Array.isArray(images)) return images.length > 0;
  return Boolean(images);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readThinContentPages(): Map<string, number> {
  const thin = new Map<string, number>();
  const staticPaths = [
    "app/about/page.tsx",
    "app/contact/page.tsx",
    "app/privacy/page.tsx",
    "app/disclaimer/page.tsx",
  ];

  for (const rel of staticPaths) {
    const filePath = path.join(process.cwd(), rel);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, "utf8");
    const text = source
      .replace(/<[^>]+>/g, " ")
      .replace(/\{[^}]+\}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = countWords(text);
    const route = `/${rel.split("/")[1]}`;
    if (words < 120) thin.set(route, words);
  }

  return thin;
}

function extractInternalLinks(source: string): string[] {
  const links = new Set<string>();
  const hrefPattern = /href=["'{`](\/(?:collections|regions)\/[^"'`}\s]+)["'`}]/g;
  let match: RegExpExecArray | null;
  while ((match = hrefPattern.exec(source)) !== null) {
    links.add(match[1].split("#")[0]);
  }
  const templatePattern = /href=\{`(\/(?:collections|regions)\/[^`]+)`\}/g;
  while ((match = templatePattern.exec(source)) !== null) {
    links.add(match[1].split("#")[0]);
  }
  return [...links];
}

function scanPublicScoreLeaks(root: string): ScoreLeak[] {
  const leaks: ScoreLeak[] = [];

  function walk(dir: string): void {
    const rel = path.relative(root, dir).replace(/\\/g, "/");
    if (PUBLIC_SCAN_SKIP.has(rel)) return;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const relPath = path.relative(root, full).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        if (PUBLIC_SCAN_SKIP.has(relPath)) continue;
        walk(full);
        continue;
      }

      if (!/\.(tsx|ts|jsx|js)$/.test(entry.name)) continue;
      if (relPath.includes("/admin/")) continue;

      const lines = fs.readFileSync(full, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        if (line.trim().startsWith("//")) return;
        if (line.includes("체감 난이도") || line.includes("실제 난이도")) return;

        for (const { pattern, label } of SCORE_LEAK_PATTERNS) {
          if (pattern.test(line)) {
            leaks.push({
              file: relPath,
              line: index + 1,
              match: label,
            });
            break;
          }
        }
      });
    }
  }

  for (const dir of PUBLIC_SCAN_DIRS) {
    const full = path.join(root, dir);
    if (fs.existsSync(full)) walk(full);
  }

  return leaks;
}

async function main(): Promise<void> {
  const root = process.cwd();
  const env = loadEnvLocal(root);
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }

  const audits: PageAudit[] = [];
  const titleMap = new Map<string, string[]>();

  for (const page of STATIC_PAGES) {
    const metadata = page.build();
    const title = metadataTitle(metadata);
    const description = metadataDescription(metadata);
    const hasOgImage = metadataHasOgImage(metadata);

    audits.push({
      path: page.path,
      title,
      description,
      hasOgImage,
    });

    if (title) {
      const paths = titleMap.get(title) ?? [];
      paths.push(page.path);
      titleMap.set(title, paths);
    }
  }

  let courses: Awaited<
    ReturnType<typeof import("@/lib/courseRepository").getCoursesForStaticPages>
  > = [];

  try {
    const { getCoursesForStaticPages } = await import("@/lib/courseRepository");
    courses = await getCoursesForStaticPages();
  } catch (error) {
    console.warn("[audit] Failed to load courses:", error);
  }

  const collectionCounts = computeCollectionCounts(courses);
  const regionCounts = computeRegionCounts(courses);
  const sitemapCollections = new Set(getSitemapCollectionSlugs(collectionCounts));
  const noindexCollections = new Set(getNoindexCollectionSlugs(collectionCounts));
  const sitemapRegions = new Set(getSitemapRegionSlugs(regionCounts));
  const noindexRegions = new Set(getNoindexRegionSlugs(regionCounts));

  const zeroCountIndexablePages: string[] = [];
  for (const slug of COLLECTION_SLUGS) {
    if (collectionCounts[slug] === 0 && sitemapCollections.has(slug)) {
      zeroCountIndexablePages.push(`/collections/${slug}`);
    }
  }
  for (const slug of REGION_SLUGS) {
    if (regionCounts[slug] === 0 && sitemapRegions.has(slug)) {
      zeroCountIndexablePages.push(`/regions/${slug}`);
    }
  }

  for (const config of collectionLandingPages) {
    const count = collectionCounts[config.slug];
    const metadata = buildCollectionMetadata(config, {
      noindex: count === 0,
    });
    const title = metadataTitle(metadata);
    const description = metadataDescription(metadata);
    const imagePath = getCollectionSeoImagePath(config.slug);
    const hasOgImage =
      metadataHasOgImage(metadata) ||
      fs.existsSync(path.join(root, "public", imagePath.replace(/^\//, ""))) ||
      fs.existsSync(path.join(root, "public", "og-image.png"));

    audits.push({
      path: `/collections/${config.slug}`,
      title,
      description,
      hasOgImage,
      wordCount: count === 0 ? 0 : undefined,
    });

    if (title) {
      const paths = titleMap.get(title) ?? [];
      paths.push(`/collections/${config.slug}`);
      titleMap.set(title, paths);
    }

    if (count === 0) {
      audits[audits.length - 1].wordCount = 0;
    }
  }

  for (const slug of REGION_SLUGS) {
    const config = getRegionLandingBySlug(slug);
    if (!config) continue;
    const count = regionCounts[slug];
    const metadata = buildRegionMetadata(config, [], { noindex: count === 0 });
    const title = metadataTitle(metadata);
    const description = metadataDescription(metadata);
    const imagePath = getRegionSeoImagePath(slug);
    const hasOgImage =
      metadataHasOgImage(metadata) ||
      fs.existsSync(path.join(root, "public", imagePath.replace(/^\//, ""))) ||
      fs.existsSync(path.join(root, "public", "og-image.png"));

    audits.push({
      path: `/regions/${slug}`,
      title,
      description,
      hasOgImage,
      wordCount: count === 0 ? 0 : undefined,
    });

    if (title) {
      const paths = titleMap.get(title) ?? [];
      paths.push(`/regions/${slug}`);
      titleMap.set(title, paths);
    }

    if (count === 0) {
      audits[audits.length - 1].wordCount = 0;
    }
  }

  if (courses.length > 0) {
    const sample = courses.slice(0, 5);
    for (const course of sample) {
      const metadata = buildCourseMetadata(course);
      const title = metadataTitle(metadata);
      const description = metadataDescription(metadata);
      audits.push({
        path: `/courses/${course.id}`,
        title,
        description,
        hasOgImage: metadataHasOgImage(metadata),
      });
      if (title) {
        const paths = titleMap.get(title) ?? [];
        paths.push(`/courses/${course.id}`);
        titleMap.set(title, paths);
      }
    }
  }

  const missingTitle = audits
    .filter((page) => !page.title)
    .map((page) => page.path);
  const missingDescription = audits
    .filter((page) => !page.description)
    .map((page) => page.path);
  const missingOgImage = audits
    .filter((page) => !page.hasOgImage)
    .map((page) => page.path);

  const thinPages = [
    ...audits
      .filter((page) => page.wordCount === 0)
      .map((page) => page.path),
    ...[...readThinContentPages().entries()].map(
      ([route, words]) => `${route} (${words} words)`,
    ),
  ];

  const duplicateTitles = [...titleMap.entries()]
    .filter(([, paths]) => paths.length > 1)
    .map(([title, paths]) => `${title} → ${paths.join(", ")}`);

  const noindexPaths = new Set<string>([
    ...[...noindexCollections].map((slug) => `/collections/${slug}`),
    ...[...noindexRegions].map((slug) => `/regions/${slug}`),
  ]);

  const noindexInPopularLinks: string[] = [];
  for (const rel of POPULAR_LINK_SOURCES) {
    const filePath = path.join(root, rel);
    if (!fs.existsSync(filePath)) continue;
    const source = fs.readFileSync(filePath, "utf8");
    for (const href of extractInternalLinks(source)) {
      if (noindexPaths.has(href)) {
        noindexInPopularLinks.push(`${rel} → ${href}`);
      }
    }
  }

  const publicInternalScoreLeaks = scanPublicScoreLeaks(root);

  const report: AdSenseReadinessReport = {
    totalPagesChecked: audits.length,
    missingTitle,
    missingDescription,
    missingOgImage,
    zeroCountIndexablePages,
    thinPages,
    publicInternalScoreLeaks,
  };

  console.log("=== GolfMap Korea AdSense Readiness Audit ===\n");
  console.log(JSON.stringify(report, null, 2));

  if (noindexInPopularLinks.length > 0) {
    console.log("\n--- Noindex pages in popular internal links ---");
    for (const item of noindexInPopularLinks) console.log(`  ${item}`);
  }

  if (duplicateTitles.length > 0) {
    console.log("\n--- Duplicate titles ---");
    for (const item of duplicateTitles) console.log(`  ${item}`);
  }

  const issueCount =
    report.missingTitle.length +
    report.missingDescription.length +
    report.missingOgImage.length +
    report.zeroCountIndexablePages.length +
    noindexInPopularLinks.length +
    report.publicInternalScoreLeaks.length;

  console.log(`\nSummary: ${issueCount} issue(s) across ${report.totalPagesChecked} pages`);
  process.exit(issueCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
