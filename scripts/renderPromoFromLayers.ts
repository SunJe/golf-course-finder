import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  DEFAULT_PROMO_BRAND,
  DEFAULT_PROMO_DOMAIN,
  DEFAULT_PROMO_EYEBROW,
  DEFAULT_PROMO_TOP_RIGHT,
} from "../lib/og/promoTypes";
import { HEIGHT, WIDTH } from "./lib/seoImageComposite";
import {
  ICON_ROW_BOX,
  LAYER_BOXES,
  LAYER_KEY_MODES,
  PROMO_LAYER_FILES,
  SEPARATOR_BOX,
  TEXT_LAYOUT,
  promoLayerPath,
} from "./lib/promoLayerAssets";
import { removeLayerBackground } from "./lib/promoLayerKeying";
import { getProjectRoot } from "./lib/sourceRegistry";

const FONT =
  "Malgun Gothic, Apple SD Gothic Neo, Pretendard, Arial, Helvetica, sans-serif";

export type PromoLayerRenderOptions = {
  title: string;
  eyebrow?: string;
  brand?: string;
  domain?: string;
  topRight?: string;
};

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
  if (len <= 7) return Math.round(76 * (WIDTH / 1254));
  if (len <= 9) return Math.round(68 * (WIDTH / 1254));
  if (len <= 12) return Math.round(60 * (WIDTH / 1254));
  if (len <= 15) return Math.round(52 * (WIDTH / 1254));
  return Math.round(44 * (WIDTH / 1254));
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

function buildTextOverlaySvg(options: PromoLayerRenderOptions): string {
  const title = options.title.trim();
  const eyebrow = options.eyebrow?.trim() || DEFAULT_PROMO_EYEBROW;
  const brand = options.brand?.trim() || DEFAULT_PROMO_BRAND;
  const domain = options.domain?.trim() || DEFAULT_PROMO_DOMAIN;
  const topRight = options.topRight?.trim() || DEFAULT_PROMO_TOP_RIGHT;

  const titleSize = titleFontSize(title);
  const lines = wrapTitle(title, titleSize);
  const titleY =
    lines.length > 1
      ? TEXT_LAYOUT.titleBaseY - TEXT_LAYOUT.titleLineHeight * 0.35
      : TEXT_LAYOUT.titleBaseY;

  const titleTspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : TEXT_LAYOUT.titleLineHeight;
      return `<tspan x="${TEXT_LAYOUT.titleX}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <g font-family="${FONT}">
    <text x="${TEXT_LAYOUT.brandX}" y="${TEXT_LAYOUT.brandY}" fill="#1B4332" font-size="${Math.round(38 * (WIDTH / 1254))}" font-weight="800">${escapeXml(brand)}</text>
    <text x="${TEXT_LAYOUT.brandX}" y="${TEXT_LAYOUT.domainY}" fill="#2D6A4F" font-size="${Math.round(22 * (WIDTH / 1254))}" font-weight="500">${escapeXml(domain)}</text>
    <text x="${TEXT_LAYOUT.topRightX}" y="${TEXT_LAYOUT.topRightY}" text-anchor="end" fill="#1B4332" font-size="${Math.round(14 * (WIDTH / 1254))}" font-weight="600" letter-spacing="3">${escapeXml(topRight)}</text>
    <text x="${TEXT_LAYOUT.eyebrowX}" y="${TEXT_LAYOUT.eyebrowY}" fill="#1B4332" font-size="${Math.round(34 * (WIDTH / 1254))}" font-weight="600">${escapeXml(eyebrow)}</text>
    <text x="${TEXT_LAYOUT.titleX}" y="${titleY}" fill="#1B4332" font-size="${titleSize}" font-weight="800">${titleTspans}</text>
  </g>
</svg>`;
}

async function loadBackgroundLayer(filePath: string): Promise<Buffer> {
  return sharp(filePath).resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" }).png().toBuffer();
}

async function loadKeyedSquareLayer(
  filePath: string,
  keyMode: (typeof LAYER_KEY_MODES)[keyof typeof LAYER_KEY_MODES],
): Promise<Buffer> {
  const keyed = await removeLayerBackground(filePath, keyMode);
  return sharp(keyed)
    .resize(WIDTH, HEIGHT, { fit: "fill", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function loadPlacedLayer(
  filePath: string,
  box: { left: number; top: number; width: number; height: number },
  keyMode: (typeof LAYER_KEY_MODES)[keyof typeof LAYER_KEY_MODES],
): Promise<sharp.OverlayOptions> {
  const keyed = await removeLayerBackground(filePath, keyMode);
  const input = await sharp(keyed)
    .resize(box.width, box.height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return { input, top: box.top, left: box.left };
}

async function loadTextOverlay(options: PromoLayerRenderOptions): Promise<Buffer> {
  const svg = buildTextOverlaySvg(options);
  return sharp(Buffer.from(svg, "utf-8"), { density: 144 })
    .resize(WIDTH, HEIGHT)
    .png()
    .toBuffer();
}

/**
 * Stack fixed PNG layers from public/ and swap title (plus fixed chrome text via SVG).
 */
export async function renderPromoFromLayersPng(
  options: PromoLayerRenderOptions,
  outputPath: string,
  projectRoot: string,
): Promise<void> {
  const layers = PROMO_LAYER_FILES;
  const paths = Object.fromEntries(
    Object.entries(layers).map(([key, file]) => [key, promoLayerPath(projectRoot, key as keyof typeof layers)]),
  ) as Record<keyof typeof layers, string>;

  for (const filePath of Object.values(paths)) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Promo layer missing: ${filePath}`);
    }
  }

  const background = await loadBackgroundLayer(paths.background);
  const frame = await loadKeyedSquareLayer(paths.frame, LAYER_KEY_MODES.frame);
  const glassPanel = await loadKeyedSquareLayer(paths.glassPanel, LAYER_KEY_MODES.glassPanel);
  const logo = await loadPlacedLayer(paths.logo, LAYER_BOXES.logo, LAYER_KEY_MODES.logo);
  const koreaMap = await loadPlacedLayer(paths.koreaMap, LAYER_BOXES.koreaMap, LAYER_KEY_MODES.koreaMap);
  const separator = await loadPlacedLayer(paths.separator, SEPARATOR_BOX, LAYER_KEY_MODES.separator);
  const iconRow = await loadPlacedLayer(paths.iconRow, ICON_ROW_BOX, LAYER_KEY_MODES.iconRow);
  const golfFlag = await loadPlacedLayer(paths.golfFlag, LAYER_BOXES.golfFlag, LAYER_KEY_MODES.golfFlag);
  const dotGrid = await loadPlacedLayer(paths.dotGrid, LAYER_BOXES.dotGrid, LAYER_KEY_MODES.dotGrid);
  const textOverlay = await loadTextOverlay(options);

  const composites: sharp.OverlayOptions[] = [
    { input: frame, top: 0, left: 0 },
    { input: glassPanel, top: 0, left: 0 },
    logo,
    koreaMap,
    separator,
    { input: textOverlay, top: 0, left: 0 },
    iconRow,
    golfFlag,
    dotGrid,
  ];

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await sharp(background)
    .composite(composites)
    .png({ compressionLevel: 9, palette: false })
    .toFile(outputPath);

  const meta = await sharp(outputPath).metadata();
  if (meta.width !== WIDTH || meta.height !== HEIGHT) {
    throw new Error(`Output is not ${WIDTH}x${HEIGHT}: got ${meta.width}x${meta.height}`);
  }
}

function parseArgs(argv: string[]): { title: string; output: string } {
  let title = "백돌이 골프장";
  let output = path.join(getProjectRoot(), "public/seo-images/collections/baekdori-layered.png");

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i] ?? "";
    if (arg === "--title") title = next();
    else if (arg === "--output") {
      const value = next();
      output = path.isAbsolute(value) ? value : path.join(getProjectRoot(), value);
    }
  }

  return { title, output };
}

async function main(): Promise<void> {
  const root = getProjectRoot();
  const { title, output } = parseArgs(process.argv.slice(2));

  await renderPromoFromLayersPng({ title }, output, root);

  const { size } = fs.statSync(output);
  console.log(`Rendered layered promo: ${title}`);
  console.log(`Output: ${output} (${WIDTH}x${HEIGHT}, ${(size / 1024).toFixed(1)} KB)`);
}

main().catch((error) => {
  console.error("[render:promo-sample] Failed:", error);
  process.exit(1);
});
