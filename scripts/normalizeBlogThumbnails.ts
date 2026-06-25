/**
 * 블로그 썸네일 final 생성 — source/ 의 1:1 원본만 허용, crop 금지.
 * Usage: npm run normalize:blog-thumbnails
 *
 * 신규 생성 플로우:
 * 1. source/ 에 정사각형 원본 배치 (AI 생성 또는 import)
 * 2. npm run check:blog-thumbnails (source 검증)
 * 3. npm run normalize:blog-thumbnails (resize only)
 */
import fs from "node:fs";
import path from "node:path";
import {
  assertSquareSource,
  formatDimensions,
  readImageDimensions,
  resizeSquareSourceToFinal,
} from "./lib/blogThumbnailDimensions";
import {
  BLOG_THUMBNAIL_MIN_SIZE,
  BLOG_THUMBNAIL_SIZE,
  CANONICAL_BLOG_THUMBNAIL_FILES,
} from "../lib/blogThumbnailRules";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const BLOG_DIR = path.join(ROOT, "public/promo-assets/blog");
const SOURCE_DIR = path.join(BLOG_DIR, "source");

async function normalizeOne(fileName: string): Promise<void> {
  const sourcePath = path.join(SOURCE_DIR, fileName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Missing source: public/promo-assets/blog/source/${fileName}. Generate a square 1:1 image first.`,
    );
  }

  const sourceDims = await readImageDimensions(sourcePath);
  assertSquareSource(`source ${fileName}`, sourceDims, BLOG_THUMBNAIL_MIN_SIZE);

  const outputPath = path.join(BLOG_DIR, fileName);
  const finalDims = await resizeSquareSourceToFinal(
    sourcePath,
    outputPath,
    BLOG_THUMBNAIL_SIZE,
  );

  console.log(
    `  ${fileName}: source ${formatDimensions(sourceDims)} → final ${formatDimensions(finalDims)} (resize only, no crop)`,
  );
}

async function normalizeDefault(): Promise<void> {
  const sourcePath = path.join(SOURCE_DIR, "seoul-beginner-golf.png");
  const outputPath = path.join(BLOG_DIR, "default.png");
  const finalDims = await resizeSquareSourceToFinal(
    sourcePath,
    outputPath,
    BLOG_THUMBNAIL_SIZE,
  );
  console.log(`  default.png ← seoul-beginner-golf.png → ${formatDimensions(finalDims)}`);
}

async function main(): Promise<void> {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  console.log(
    "[normalize:blog-thumbnails] Square source → 1200×1200 final (fill resize, crop forbidden)…",
  );

  for (const file of CANONICAL_BLOG_THUMBNAIL_FILES) {
    await normalizeOne(file);
  }

  await normalizeDefault();
  console.log("[normalize:blog-thumbnails] Done.");
}

main().catch((error) => {
  console.error(
    "[normalize:blog-thumbnails] Failed:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
