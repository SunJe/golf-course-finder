import fs from "fs";
import path from "path";
import sharp from "sharp";
import type { PromoPageData } from "../../../lib/og/promoTypes";
import { PROMO_IMAGE_SIZE } from "../../../lib/og/promoTypes";
import { buildPromoOverlaySvg } from "./promoTemplateSvg";

const BG_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export function resolvePromoBackgroundFile(
  data: PromoPageData,
  projectRoot: string,
): string {
  const backgroundsDir = path.join(projectRoot, "public/promo-assets/backgrounds");

  const candidates: string[] = [];
  if (data.backgroundImage?.trim()) {
    const custom = data.backgroundImage.trim();
    candidates.push(
      path.isAbsolute(custom) ? custom : path.join(projectRoot, "public", custom.replace(/^\//, "")),
    );
  }
  if (data.slug) {
    for (const ext of BG_EXTENSIONS) {
      candidates.push(path.join(backgroundsDir, `${data.slug}${ext}`));
    }
  }
  for (const ext of BG_EXTENSIONS) {
    candidates.push(path.join(backgroundsDir, `default${ext}`));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    `Promo background not found for slug="${data.slug}". Place a file at public/promo-assets/backgrounds/default.jpg`,
  );
}

export async function renderGolfMapPromoPng(
  data: PromoPageData,
  outputPath: string,
  projectRoot: string,
): Promise<void> {
  const backgroundPath = resolvePromoBackgroundFile(data, projectRoot);
  const bgBuffer = await sharp(backgroundPath)
    .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE, { fit: "cover", position: "centre" })
    .jpeg({ quality: 92 })
    .toBuffer();

  const overlaySvg = buildPromoOverlaySvg(data);
  const overlayBuffer = await sharp(Buffer.from(overlaySvg, "utf-8"), { density: 144 })
    .resize(PROMO_IMAGE_SIZE, PROMO_IMAGE_SIZE)
    .png()
    .toBuffer();

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await sharp(bgBuffer)
    .composite([{ input: overlayBuffer, top: 0, left: 0 }])
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);
}
