import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { PromoPageData } from "../../../lib/og/promoTypes";
import { PROMO_IMAGE_SIZE } from "../../../lib/og/promoTypes";
import { resolvePromoBackgroundFile } from "./renderGolfMapPromo";
import {
  GLASS_CLIP_POINTS,
  SAMPLE_CHROME_REGIONS,
  SAMPLE_DEFAULT_TITLE,
  SAMPLE_SOURCE_SIZE,
  TITLE_LAYOUT,
} from "./sampleChromeRegions";

const FONT =
  "Malgun Gothic, Apple SD Gothic Neo, Pretendard, Arial, Helvetica, sans-serif";

function getMasterSamplePath(projectRoot: string): string {
  return path.join(projectRoot, "public/promo-assets/master-sample.png");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function titleFontSize(title: string): number {
  const len = title.trim().length;
  if (len <= 7) return Math.round(76 * (PROMO_IMAGE_SIZE / SAMPLE_SOURCE_SIZE));
  if (len <= 9) return Math.round(68 * (PROMO_IMAGE_SIZE / SAMPLE_SOURCE_SIZE));
  if (len <= 12) return Math.round(60 * (PROMO_IMAGE_SIZE / SAMPLE_SOURCE_SIZE));
  if (len <= 15) return Math.round(52 * (PROMO_IMAGE_SIZE / SAMPLE_SOURCE_SIZE));
  return Math.round(44 * (PROMO_IMAGE_SIZE / SAMPLE_SOURCE_SIZE));
}

function wrapTitle(title: string, fontSize: number): string[] {
  const maxChars = fontSize >= 64 ? 8 : fontSize >= 50 ? 10 : 12;
  const t = title.trim();
  if (t.length <= maxChars) return [t];
  const mid = Math.ceil(t.length / 2);
  let split = mid;
  for (let i = mid; i < t.length; i += 1) {
    if (t[i] === " ") {
      split = i;
      break;
    }
  }
  return [t.slice(0, split).trim(), t.slice(split).trim()].filter(Boolean);
}

function buildGlassClipSvg(): string {
  const pts = GLASS_CLIP_POINTS.map((p) => `${p.x},${p.y}`).join(" ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PROMO_IMAGE_SIZE}" height="${PROMO_IMAGE_SIZE}">
  <polygon points="${pts}" fill="white"/>
</svg>`;
}

function buildTitleSvg(title: string): string {
  const titleSize = titleFontSize(title);
  const lines = wrapTitle(title, titleSize);
  const titleY =
    lines.length > 1
      ? TITLE_LAYOUT.baseY - TITLE_LAYOUT.lineHeight * 0.35
      : TITLE_LAYOUT.baseY;

  const titleTspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : TITLE_LAYOUT.lineHeight;
      return `<tspan x="${TITLE_LAYOUT.x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PROMO_IMAGE_SIZE}" height="${PROMO_IMAGE_SIZE}" viewBox="0 0 ${PROMO_IMAGE_SIZE} ${PROMO_IMAGE_SIZE}">
  <text x="${TITLE_LAYOUT.x}" y="${titleY}" fill="#1B4332" font-size="${titleSize}" font-weight="800" font-family="${FONT}">${titleTspans}</text>
</svg>`;
}

async function buildGlassLayer(background: Buffer): Promise<Buffer> {
  const clipSvg = buildGlassClipSvg();
  const clipMask = await sharp(Buffer.from(clipSvg, "utf-8"), { density: 144 })
    .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE)
    .png()
    .toBuffer();

  const blurred = await sharp(background).blur(14).png().toBuffer();

  const tintSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PROMO_IMAGE_SIZE}" height="${PROMO_IMAGE_SIZE}">
  <polygon points="${GLASS_CLIP_POINTS.map((p) => `${p.x},${p.y}`).join(" ")}" fill="rgba(255,255,255,0.56)"/>
</svg>`;
  const tint = await sharp(Buffer.from(tintSvg, "utf-8"), { density: 144 })
    .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE)
    .png()
    .toBuffer();

  const glassBlur = await sharp(blurred)
    .composite([{ input: tint, blend: "over" }])
    .png()
    .toBuffer();

  return sharp(glassBlur)
    .composite([{ input: clipMask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function extractRegion(sample: Buffer, region: {
  left: number;
  top: number;
  width: number;
  height: number;
}): Promise<Buffer> {
  return sharp(sample)
    .extract({
      left: region.left,
      top: region.top,
      width: Math.min(region.width, PROMO_IMAGE_SIZE - region.left),
      height: Math.min(region.height, PROMO_IMAGE_SIZE - region.top),
    })
    .png()
    .toBuffer();
}

/**
 * Pixel-perfect promo: swappable background + chrome strips copied from master-sample.png.
 * Title uses sample pixels when unchanged; otherwise SVG matched to sample typography.
 */
export async function renderPromoFromSamplePng(
  data: PromoPageData,
  outputPath: string,
  projectRoot: string,
): Promise<void> {
  const samplePath = getMasterSamplePath(projectRoot);
  if (!fs.existsSync(samplePath)) {
    throw new Error(`Master sample missing: ${samplePath}`);
  }

  const backgroundPath = resolvePromoBackgroundFile(data, projectRoot);
  const background = await sharp(backgroundPath)
    .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const sample = await sharp(samplePath)
    .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE, { fit: "fill" })
    .png()
    .toBuffer();

  const glass = await buildGlassLayer(background);

  const composites: sharp.OverlayOptions[] = [{ input: glass, top: 0, left: 0 }];

  const chromeKeys = [
    "frameTop",
    "frameBottom",
    "frameLeft",
    "frameRight",
    "cornerTL",
    "cornerTR",
    "cornerBL",
    "cornerBR",
    "logo",
    "topRight",
    "eyebrow",
    "iconRow",
    "glassDeco",
  ] as const;

  for (const key of chromeKeys) {
    const region = SAMPLE_CHROME_REGIONS[key];
    const strip = await extractRegion(sample, region);
    composites.push({ input: strip, top: region.top, left: region.left });
  }

  const titleUnchanged = data.title.trim() === SAMPLE_DEFAULT_TITLE;
  if (titleUnchanged) {
    const region = SAMPLE_CHROME_REGIONS.title;
    const titleStrip = await extractRegion(sample, region);
    composites.push({ input: titleStrip, top: region.top, left: region.left });
  } else {
    const titleSvg = buildTitleSvg(data.title);
    const titleBuffer = await sharp(Buffer.from(titleSvg, "utf-8"), { density: 144 })
      .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE)
      .png()
      .toBuffer();
    composites.push({ input: titleBuffer, top: 0, left: 0 });
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await sharp(background).composite(composites).png({ compressionLevel: 9 }).toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  if (meta.width !== PROMO_IMAGE_SIZE || meta.height !== PROMO_IMAGE_SIZE) {
    throw new Error(
      `Output is not square: ${meta.width}x${meta.height} (expected ${PROMO_IMAGE_SIZE})`,
    );
  }
}
