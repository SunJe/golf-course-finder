import fs from "fs";
import path from "path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import {
  GOLFMAP_OG_HEIGHT,
  GOLFMAP_OG_WIDTH,
  generateGolfMapOgSvg,
  getSeoAssetsRoot,
} from "../../lib/seo-images/generateGolfMapOgSvg";
import { buildResvgFontOptions } from "../../lib/seo-images/ogFontConfig";
import { buildFallbackBackgroundSvg } from "./seoImageSquareSvg";

export type SeoBackgroundKind = "collections" | "regions" | "courses";

export type SeoCardRenderOptions = {
  title: string;
  eyebrow?: string;
  seed: string;
};

const BACKGROUND_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

function renderOverlayPng(svg: string, projectRoot: string): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: GOLFMAP_OG_WIDTH },
    background: "rgba(0,0,0,0)",
    font: buildResvgFontOptions(projectRoot),
  });
  return Buffer.from(resvg.render().asPng());
}

async function dematteResvgOverlay(buffer: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = new Uint8Array(data);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    let a = px[i + 3];
    if (a === 0) continue;

    if (r < 12 && g < 12 && b < 12) {
      px[i + 3] = 0;
      continue;
    }

    const alpha = a / 255;
    if (alpha >= 0.995) continue;

    const ur = Math.min(255, Math.round(r / alpha));
    const ug = Math.min(255, Math.round(g / alpha));
    const ub = Math.min(255, Math.round(b / alpha));

    if (ur < 24 && ug < 24 && ub < 24) {
      px[i + 3] = 0;
      continue;
    }

    px[i] = ur;
    px[i + 1] = ug;
    px[i + 2] = ub;
  }

  return sharp(px, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function buildBackgroundBuffer(
  backgroundPath: string | null,
  seed: string,
): Promise<Buffer> {
  if (backgroundPath) {
    return sharp(backgroundPath)
      .resize(GOLFMAP_OG_WIDTH, GOLFMAP_OG_HEIGHT, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
  }

  return sharp(Buffer.from(buildFallbackBackgroundSvg(seed), "utf-8"), { density: 144 })
    .resize(GOLFMAP_OG_WIDTH, GOLFMAP_OG_HEIGHT)
    .png()
    .toBuffer();
}

async function buildHazeBuffer(): Promise<Buffer> {
  return sharp({
    create: {
      width: GOLFMAP_OG_WIDTH,
      height: GOLFMAP_OG_HEIGHT,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0.08 },
    },
  })
    .png()
    .toBuffer();
}

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
  const legacyBg = path.join(backgroundsRoot, "..", "..", "background img.png");
  if (fs.existsSync(legacyBg)) return legacyBg;
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

export async function renderSeoCardPng(
  options: SeoCardRenderOptions,
  outputPath: string,
  backgroundPath: string | null,
  _backgroundsRoot: string,
  projectRoot: string,
): Promise<void> {
  const bgBuffer = await buildBackgroundBuffer(backgroundPath, options.seed);
  const hazeBuffer = await buildHazeBuffer();

  const overlaySvg = generateGolfMapOgSvg(
    { title: options.title },
    getSeoAssetsRoot(projectRoot),
    { embedBackground: false, projectRoot },
  );
  const overlayBuffer = await dematteResvgOverlay(renderOverlayPng(overlaySvg, projectRoot));

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await sharp(bgBuffer)
    .composite([
      { input: hazeBuffer, top: 0, left: 0, blend: "over" },
      { input: overlayBuffer, top: 0, left: 0, blend: "over" },
    ])
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);
}

export function getBackgroundsRoot(projectRoot: string): string {
  return path.join(projectRoot, "public/seo-images/backgrounds");
}

export const WIDTH = GOLFMAP_OG_WIDTH;
export const HEIGHT = GOLFMAP_OG_HEIGHT;
