/**
 * assets/ PNG → source/ (정사각형 검증)
 *
 * AI가 비정사각형(예: 1536×1024)을 반환하면 crop 없이 패딩만으로 정사각형 source 생성.
 * crop(fit:cover)은 사용하지 않습니다.
 *
 * Usage: npm run import:blog-thumbnail-sources -- assets
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  assertSquareSource,
  formatDimensions,
  isSquare,
  readImageDimensions,
} from "./lib/blogThumbnailDimensions";
import {
  BLOG_THUMBNAIL_MIN_SIZE,
  CANONICAL_BLOG_THUMBNAIL_FILES,
} from "../lib/blogThumbnailRules";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const SOURCE_DIR = path.join(ROOT, "public/promo-assets/blog/source");
const META_PATH = path.join(SOURCE_DIR, ".generation-meta.json");

interface SourceMetaEntry {
  fileName: string;
  aiOriginal: string;
  paddedToSquare: boolean;
  cropUsed: false;
  sourceSaved: string;
}

async function padToSquareWithoutCrop(
  inputPath: string,
  outputPath: string,
): Promise<{ from: string; to: string }> {
  const { width, height } = await readImageDimensions(inputPath);
  if (isSquare({ width, height })) {
    fs.copyFileSync(inputPath, outputPath);
    return { from: formatDimensions({ width, height }), to: formatDimensions({ width, height }) };
  }

  const size = Math.max(width, height);
  const padTop = Math.floor((size - height) / 2);
  const padBottom = size - height - padTop;
  const padLeft = Math.floor((size - width) / 2);
  const padRight = size - width - padLeft;

  await sharp(inputPath)
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 214, g: 232, b: 206 },
    })
    .png()
    .toFile(outputPath);

  const out = await readImageDimensions(outputPath);
  return {
    from: formatDimensions({ width, height }),
    to: formatDimensions(out),
  };
}

async function main(): Promise<void> {
  const importDir = path.resolve(ROOT, process.argv[2] ?? "assets");
  const padToSquare = process.argv.includes("--pad-to-square");
  fs.mkdirSync(SOURCE_DIR, { recursive: true });

  const meta: SourceMetaEntry[] = [];
  let failed = 0;

  console.log(`[import:blog-thumbnail-sources] From ${path.relative(ROOT, importDir)}`);
  if (padToSquare) {
    console.log("  (--pad-to-square: non-square AI → pad, never crop; check will still fail padded sources)");
  } else {
    console.log("  (strict: non-square AI output is rejected; use --pad-to-square for legacy fallback only)");
  }

  for (const fileName of CANONICAL_BLOG_THUMBNAIL_FILES) {
    const from = path.join(importDir, fileName);
    const to = path.join(SOURCE_DIR, fileName);

    if (!fs.existsSync(from)) {
      console.error(`  FAIL missing ${fileName}`);
      failed += 1;
      continue;
    }

    const aiDims = await readImageDimensions(from);
    if (!isSquare(aiDims) && !padToSquare) {
      console.error(
        `  FAIL ${fileName} — AI output is ${formatDimensions(aiDims)}. Regenerate with square canvas (1024x1024 or 1200x1200).`,
      );
      failed += 1;
      continue;
    }

    const padded = !isSquare(aiDims);
    const { from: fromLabel, to: toLabel } = await padToSquareWithoutCrop(from, to);

    const sourceDims = await readImageDimensions(to);
    try {
      assertSquareSource(fileName, sourceDims, BLOG_THUMBNAIL_MIN_SIZE);
    } catch (error) {
      console.error(
        `  FAIL ${fileName} — ${error instanceof Error ? error.message : error}`,
      );
      failed += 1;
      continue;
    }

    meta.push({
      fileName,
      aiOriginal: fromLabel,
      paddedToSquare: padded,
      cropUsed: false,
      sourceSaved: toLabel,
    });

    const note = padded
      ? ` (AI ${fromLabel} → padded ${toLabel}, no crop)`
      : ` (native square ${toLabel})`;
    console.log(`  OK source ${fileName}${note}`);
  }

  fs.writeFileSync(META_PATH, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

  if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
