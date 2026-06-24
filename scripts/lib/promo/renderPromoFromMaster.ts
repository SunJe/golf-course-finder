import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { PromoPageData } from "../../../lib/og/promoTypes";
import { PROMO_IMAGE_SIZE } from "../../../lib/og/promoTypes";
import {
  buildMasterTextOverlaySvg,
  getMasterTextPatch,
} from "./promoFromMaster";

export function getMasterReferencePath(projectRoot: string): string {
  return path.join(projectRoot, "public/promo-assets/master-reference.png");
}

export function getMasterSquarePath(projectRoot: string): string {
  return path.join(projectRoot, "public/promo-assets/master-square-1200.png");
}

/** Crop/resize master reference to exact 1:1 square (cached). */
export async function ensureMasterSquare(projectRoot: string): Promise<string> {
  const source = getMasterReferencePath(projectRoot);
  const output = getMasterSquarePath(projectRoot);

  if (!fs.existsSync(source)) {
    throw new Error(`Master reference missing: ${source}`);
  }

  const meta = await sharp(source).metadata();
  const needsRebuild =
    !fs.existsSync(output) ||
    meta.width !== PROMO_IMAGE_SIZE ||
    meta.height !== PROMO_IMAGE_SIZE;

  if (needsRebuild) {
    await sharp(source)
      .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE, {
        fit: "cover",
        position: "centre",
      })
      .png({ compressionLevel: 9 })
      .toFile(output);
  }

  return output;
}

export async function renderPromoFromMasterPng(
  data: PromoPageData,
  outputPath: string,
  projectRoot: string,
): Promise<void> {
  const masterSquare = await ensureMasterSquare(projectRoot);
  const { patch, replaceTitle } = getMasterTextPatch(data);

  let baseBuffer = await sharp(masterSquare).png().toBuffer();

  if (replaceTitle) {
    const blurredPatch = await sharp(masterSquare)
      .extract({ left: patch.left, top: patch.top, width: patch.width, height: patch.height })
      .blur(36)
      .toBuffer();

    baseBuffer = await sharp(baseBuffer)
      .composite([{ input: blurredPatch, left: patch.left, top: patch.top }])
      .png()
      .toBuffer();

    const frostSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PROMO_IMAGE_SIZE}" height="${PROMO_IMAGE_SIZE}">
  <rect x="${patch.left}" y="${patch.top}" width="${patch.width}" height="${patch.height}"
        fill="rgba(252,250,245,0.97)" rx="4"/>
</svg>`;
    const frostBuffer = await sharp(Buffer.from(frostSvg, "utf-8"), { density: 144 })
      .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE)
      .png()
      .toBuffer();

    baseBuffer = await sharp(baseBuffer)
      .composite([{ input: frostBuffer, top: 0, left: 0 }])
      .png()
      .toBuffer();
  }

  const textSvg = buildMasterTextOverlaySvg(data, replaceTitle);
  const textBuffer = await sharp(Buffer.from(textSvg, "utf-8"), { density: 144 })
    .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE)
    .png()
    .toBuffer();

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await sharp(baseBuffer)
    .composite([{ input: textBuffer, top: 0, left: 0 }])
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  if (meta.width !== PROMO_IMAGE_SIZE || meta.height !== PROMO_IMAGE_SIZE) {
    throw new Error(
      `Output is not square: ${meta.width}x${meta.height} (expected ${PROMO_IMAGE_SIZE}x${PROMO_IMAGE_SIZE})`,
    );
  }
}
