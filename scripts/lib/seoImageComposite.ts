import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  HEIGHT,
  WIDTH,
  buildFallbackBackgroundSvg,
  buildSeoOverlaySvg,
} from "./seoImageSquareSvg";
import type { SeoCardSvgOptions } from "./seoImageSquareSvg";

export type SeoBackgroundKind = "collections" | "regions" | "courses";

const BACKGROUND_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export function resolveBackgroundPath(
  kind: SeoBackgroundKind,
  slug: string,
  backgroundsRoot: string,
): string | null {
  const baseDir = path.join(backgroundsRoot, kind);
  for (const ext of BACKGROUND_EXTENSIONS) {
    const candidate = path.join(baseDir, `${slug}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  for (const ext of BACKGROUND_EXTENSIONS) {
    const candidate = path.join(baseDir, `default${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  const promoDefault = path.join(
    backgroundsRoot,
    "..",
    "promo-assets",
    "backgrounds",
    "default.png",
  );
  if (fs.existsSync(promoDefault)) return promoDefault;
  return null;
}

export function resolveCourseBackgroundPath(
  courseId: string,
  backgroundsRoot: string,
): string | null {
  const direct = resolveBackgroundPath("courses", courseId, backgroundsRoot);
  if (direct) return direct;

  const poolDir = path.join(backgroundsRoot, "courses", "_pool");
  if (!fs.existsSync(poolDir)) return null;

  let hash = 0;
  for (let i = 0; i < courseId.length; i += 1) {
    hash = (hash * 31 + courseId.charCodeAt(i)) | 0;
  }
  const index = (Math.abs(hash) % 12) + 1;

  for (const ext of BACKGROUND_EXTENSIONS) {
    const candidate = path.join(poolDir, `${index}${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function resolveRegionFallbackForCourse(
  regionSlug: string | undefined,
  backgroundsRoot: string,
): string | null {
  if (!regionSlug) return null;
  return resolveBackgroundPath("regions", regionSlug, backgroundsRoot);
}

async function loadBackgroundBuffer(backgroundPath: string): Promise<Buffer> {
  return sharp(backgroundPath)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90 })
    .toBuffer();
}

async function buildFallbackBackgroundBuffer(seed: string): Promise<Buffer> {
  const svg = buildFallbackBackgroundSvg(seed);
  return sharp(Buffer.from(svg, "utf-8"), { density: 144 })
    .resize(WIDTH, HEIGHT)
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function renderSeoCardPng(
  options: SeoCardSvgOptions,
  outputPath: string,
  backgroundPath: string | null,
  backgroundsRoot: string,
  projectRoot: string,
): Promise<void> {
  const bgBuffer = backgroundPath
    ? await loadBackgroundBuffer(backgroundPath)
    : await buildFallbackBackgroundBuffer(options.seed);

  const overlaySvg = buildSeoOverlaySvg(options, projectRoot);
  const overlayBuffer = await sharp(Buffer.from(overlaySvg, "utf-8"), {
    density: 144,
  })
    .resize(WIDTH, HEIGHT)
    .png()
    .toBuffer();

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await sharp(bgBuffer)
    .composite([{ input: overlayBuffer, top: 0, left: 0 }])
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);
}

export function getBackgroundsRoot(projectRoot: string): string {
  return path.join(projectRoot, "public/seo-images/backgrounds");
}

export { WIDTH, HEIGHT };
