import fs from "fs";
import path from "path";

const SCALE = 1200 / 1254;

/** Raster chrome extracted from master-sample.png (pixel-identical to design reference). */
export const SEO_CHROME_ASSETS = {
  koreaMapIdentity: "public/seo-assets/korea-map-identity.png",
  promoIconsRow: "public/seo-assets/promo-icons-row.png",
} as const;

/** Placement on 1200×1200 canvas (scaled from 1254 master-sample crops). */
export const KOREA_MAP_IDENTITY_BOX = {
  x: Math.round(818 * SCALE),
  y: Math.round(142 * SCALE),
  width: Math.round(385 * SCALE),
  height: Math.round(215 * SCALE),
} as const;

export const PROMO_ICONS_ROW_BOX = {
  x: Math.round(95 * SCALE),
  y: Math.round(1012 * SCALE),
  width: Math.round(1010 * SCALE),
  height: Math.round(198 * SCALE),
} as const;

function readPngDataUri(projectRoot: string, relPath: string): string {
  const file = path.join(projectRoot, relPath);
  if (!fs.existsSync(file)) {
    throw new Error(`SEO chrome asset missing: ${file}`);
  }
  const buf = fs.readFileSync(file);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

/** Korea map + grid + pin — from master sample, not generated SVG. */
export function buildKoreaMapIdentityImageMarkup(projectRoot: string): string {
  const href = readPngDataUri(projectRoot, SEO_CHROME_ASSETS.koreaMapIdentity);
  const b = KOREA_MAP_IDENTITY_BOX;
  return `<image href="${href}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" preserveAspectRatio="xMidYMid meet"/>`;
}

/** 위치 / 연락처 / 홈페이지 / 실시간 요금 icon row from master sample. */
export function buildPromoIconsRowImageMarkup(projectRoot: string): string {
  const href = readPngDataUri(projectRoot, SEO_CHROME_ASSETS.promoIconsRow);
  const b = PROMO_ICONS_ROW_BOX;
  const cx = (1200 - b.width) / 2;
  const cy = b.y;
  return `<image href="${href}" x="${Math.round(cx)}" y="${cy}" width="${b.width}" height="${b.height}" preserveAspectRatio="xMidYMid meet"/>`;
}
