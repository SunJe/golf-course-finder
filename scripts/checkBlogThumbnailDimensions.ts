/**
 * 블로그 썸네일 source + final 픽셀 검증
 * Usage: npm run check:blog-thumbnails
 */
import fs from "node:fs";
import path from "node:path";
import {
  formatDimensions,
  isSquare,
  readImageDimensions,
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
const META_PATH = path.join(SOURCE_DIR, ".generation-meta.json");

interface GenerationMetaEntry {
  fileName: string;
  aiOriginal: string;
  paddedToSquare: boolean;
  cropUsed: false;
  sourceSaved: string;
}

function loadGenerationMeta(): GenerationMetaEntry[] {
  if (!fs.existsSync(META_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(META_PATH, "utf8")) as GenerationMetaEntry[];
  } catch {
    return [];
  }
}

type CheckResult = { ok: boolean; message: string };

function checkSquareFile(
  label: "source" | "final",
  fileName: string,
  width: number,
  height: number,
  minSize: number,
  expectedFinalSize?: number,
): CheckResult {
  const dims = formatDimensions({ width, height });

  if (width !== height) {
    const reason =
      label === "source"
        ? "source image is not square. Regenerate with square canvas instead of cropping."
        : "final image is not square.";
    return { ok: false, message: `FAIL ${label} ${fileName} ${dims} — ${reason}` };
  }

  if (width < minSize || height < minSize) {
    return {
      ok: false,
      message: `FAIL ${label} ${fileName} ${dims} — below ${minSize}px`,
    };
  }

  if (
    label === "final" &&
    expectedFinalSize != null &&
    (width !== expectedFinalSize || height !== expectedFinalSize)
  ) {
    return {
      ok: false,
      message: `FAIL ${label} ${fileName} ${dims} — expected ${expectedFinalSize}x${expectedFinalSize}`,
    };
  }

  return { ok: true, message: `PASS ${label} ${fileName} ${dims}` };
}

async function main(): Promise<void> {
  let failed = 0;
  const metaByFile = new Map(
    loadGenerationMeta().map((entry) => [entry.fileName, entry]),
  );

  console.log("[check:blog-thumbnails] Checking source + final dimensions…");

  if (metaByFile.size > 0) {
    const paddedCount = [...metaByFile.values()].filter((e) => e.paddedToSquare).length;
    if (paddedCount > 0) {
      console.log(
        `  ${paddedCount} source(s) were padded from non-square AI output — not valid for new generation.`,
      );
    }
  }

  for (const fileName of CANONICAL_BLOG_THUMBNAIL_FILES) {
    const sourcePath = path.join(SOURCE_DIR, fileName);
    const finalPath = path.join(BLOG_DIR, fileName);

    if (!fs.existsSync(sourcePath)) {
      console.log(
        `  FAIL source ${fileName} — missing public/promo-assets/blog/source/${fileName}`,
      );
      failed += 1;
      continue;
    }

    const sourceDims = await readImageDimensions(sourcePath);
    const sourceCheck = checkSquareFile(
      "source",
      fileName,
      sourceDims.width,
      sourceDims.height,
      BLOG_THUMBNAIL_MIN_SIZE,
    );
    console.log(`  ${sourceCheck.message}`);
    if (!sourceCheck.ok) failed += 1;

    const meta = metaByFile.get(fileName);
    if (meta?.paddedToSquare) {
      console.log(
        `  FAIL ${fileName} — AI original was ${meta.aiOriginal}, padded to ${meta.sourceSaved}. Regenerate with native square canvas (1024x1024 or 1200x1200).`,
      );
      failed += 1;
    }

    if (!fs.existsSync(finalPath)) {
      console.log(`  FAIL final ${fileName} — missing final file`);
      failed += 1;
      continue;
    }

    const finalDims = await readImageDimensions(finalPath);
    const finalCheck = checkSquareFile(
      "final",
      fileName,
      finalDims.width,
      finalDims.height,
      BLOG_THUMBNAIL_MIN_SIZE,
      BLOG_THUMBNAIL_SIZE,
    );
    console.log(`  ${finalCheck.message}`);
    if (!finalCheck.ok) failed += 1;

    if (
      !isSquare(sourceDims) &&
      isSquare(finalDims) &&
      finalDims.width === BLOG_THUMBNAIL_SIZE
    ) {
      console.log(
        `  FAIL ${fileName} — non-square source was crop-normalized to final. Regenerate square source.`,
      );
      failed += 1;
    }
  }

  const defaultPath = path.join(BLOG_DIR, "default.png");
  if (fs.existsSync(defaultPath)) {
    const d = await readImageDimensions(defaultPath);
    const r = checkSquareFile(
      "final",
      "default.png",
      d.width,
      d.height,
      BLOG_THUMBNAIL_MIN_SIZE,
      BLOG_THUMBNAIL_SIZE,
    );
    console.log(`  ${r.message}`);
    if (!r.ok) failed += 1;
  }

  if (failed > 0) {
    console.error(`[check:blog-thumbnails] FAIL — ${failed} issue(s)`);
    process.exit(1);
  }

  console.log(
    `[check:blog-thumbnails] OK — ${CANONICAL_BLOG_THUMBNAIL_FILES.length} thumbnails, square sources + ${BLOG_THUMBNAIL_SIZE}px finals`,
  );
}

main().catch((error) => {
  console.error(
    "[check:blog-thumbnails] Error:",
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
});
