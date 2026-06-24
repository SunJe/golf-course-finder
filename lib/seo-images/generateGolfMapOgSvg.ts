import fs from "fs";
import path from "path";
import { loadSvgFragment } from "./svgFragment";
import { EN_FONT_FAMILY, KR_FONT_FAMILY, buildOgFontFaceCss } from "./ogFontConfig";

export type GolfMapOgData = {
  title: string;
  eyebrow?: string;
  brand?: string;
  domain?: string;
  backgroundImageHref?: string;
};

export const GOLFMAP_OG_WIDTH = 1200;
export const GOLFMAP_OG_HEIGHT = 1200;

const PANEL = { x: 48, y: 610, w: 1000, h: 500, rx: 42 } as const;
const PANEL_CENTER_X = PANEL.x + PANEL.w / 2;
const ICON_CENTERS = [170, 420, 670, 920] as const;
const ICON_Y = 980;
const ICON_SIZE = 64;
const LABEL_Y = 1065;
const ICON_LABELS = ["위치", "연락처", "홈페이지", "실시간 요금"] as const;

const BRAND_GREEN = "#053F35";
const TITLE_GREEN = "#053F35";
const TITLE_LETTER_SPACING = -5;

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

function splitTitle(title: string): string[] {
  const text = title.trim();
  const len = [...text].length;
  if (len <= 11) return [text];

  const mid = Math.ceil(len / 2);
  let split = mid;
  for (let i = mid; i < text.length; i += 1) {
    if (text[i] === " ") {
      split = i;
      break;
    }
  }
  for (let i = mid; i >= 0; i -= 1) {
    if (text[i] === " ") {
      split = i;
      break;
    }
  }
  const a = text.slice(0, split).trim();
  const b = text.slice(split).trim();
  if (!a || !b) return [text];
  return [a, b];
}

function estimateTitleWidth(text: string, fontSize: number): number {
  return [...text].length * fontSize * 0.9;
}

function fitTitle(title: string): { fontSize: number; lines: Array<{ text: string; y: number }> } {
  const trimmed = title.trim();
  let lines = splitTitle(trimmed);
  const len = [...trimmed].length;

  let fontSize = 128;
  if (lines.length > 1) {
    fontSize = len > 18 ? 82 : 96;
  } else if (len <= 7) {
    fontSize = 128;
  } else if (len <= 10) {
    fontSize = 118;
  } else if (len <= 13) {
    fontSize = 104;
  } else if (len <= 16) {
    fontSize = 92;
  } else {
    lines = splitTitle(trimmed);
    fontSize = len > 18 ? 82 : 88;
  }

  const maxWidth = PANEL.w - 120;
  while (lines.length === 1 && estimateTitleWidth(lines[0], fontSize) > maxWidth && fontSize > 72) {
    fontSize -= 4;
  }
  if (lines.length === 1 && estimateTitleWidth(lines[0], fontSize) > maxWidth) {
    lines = splitTitle(trimmed);
    fontSize = len > 18 ? 82 : 88;
    while (Math.max(...lines.map((line) => estimateTitleWidth(line, fontSize))) > maxWidth && fontSize > 72) {
      fontSize -= 4;
    }
  }

  if (lines.length === 1) {
    return { fontSize, lines: [{ text: lines[0], y: 850 }] };
  }

  const lineHeight = Math.round(fontSize * 1.14);
  const startY = 850 - Math.round(lineHeight / 2);
  return {
    fontSize,
    lines: lines.map((text, index) => ({
      text,
      y: startY + index * lineHeight,
    })),
  };
}

function assetPath(assetsRoot: string, relative: string): string {
  return path.join(assetsRoot, relative);
}

function stripFilters(markup: string): string {
  return markup.replace(/\sfilter="url\(#[^"]+\)"/g, "");
}

function loadParts(assetsRoot: string) {
  const load = (file: string, prefix: string) => {
    const fragment = loadSvgFragment(assetPath(assetsRoot, file), prefix);
    return { defs: fragment.defs, markup: stripFilters(fragment.markup) };
  };
  return {
    logo: load("golfmap-logo-mark.svg", "logo"),
    koreaMap: load("korea-map-overlay.svg", "map"),
    frame: load("outer-frame.svg", "frame"),
    flag: load("golf-flag-white.svg", "flag"),
    location: load("icons/location.svg", "iconLoc"),
    phone: load("icons/phone.svg", "iconPhone"),
    homepage: load("icons/homepage.svg", "iconHome"),
    price: load("icons/price.svg", "iconPrice"),
  };
}

function iconGraphic(
  fragment: { defs: string; markup: string },
  centerX: number,
): string {
  const scale = ICON_SIZE / 96;
  const left = centerX - ICON_SIZE / 2;
  return `<g transform="translate(${left} ${ICON_Y}) scale(${scale})">
    ${fragment.markup}
  </g>`;
}

function iconLabel(centerX: number, label: string): string {
  return `<text font-family="${KR_FONT_FAMILY}" x="${centerX}" y="${LABEL_Y}" text-anchor="middle" font-size="28" font-weight="700" letter-spacing="-1" fill="${BRAND_GREEN}">${esc(label)}</text>`;
}

function buildTitleMarkup(title: string): string {
  const fit = fitTitle(title);
  if (fit.lines.length === 1) {
    return `<text font-family="${KR_FONT_FAMILY}" x="${PANEL_CENTER_X}" y="${fit.lines[0].y}" text-anchor="middle" font-size="${fit.fontSize}" font-weight="800" fill="${TITLE_GREEN}" letter-spacing="${TITLE_LETTER_SPACING}">${esc(fit.lines[0].text)}</text>`;
  }
  const tspans = fit.lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : Math.round(fit.fontSize * 1.14);
      return `<tspan x="${PANEL_CENTER_X}" dy="${dy}">${esc(line.text)}</tspan>`;
    })
    .join("");
  return `<text font-family="${KR_FONT_FAMILY}" x="${PANEL_CENTER_X}" y="${fit.lines[0].y}" text-anchor="middle" font-size="${fit.fontSize}" font-weight="800" fill="${TITLE_GREEN}" letter-spacing="${TITLE_LETTER_SPACING}">${tspans}</text>`;
}

function fallbackGradientDef(): string {
  return `<linearGradient id="fallbackBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#B9E6FF"/>
      <stop offset="55%" stop-color="#DDF3C9"/>
      <stop offset="100%" stop-color="#8BCF67"/>
    </linearGradient>`;
}

function buildBackgroundLayer(backgroundImageHref?: string): string {
  if (backgroundImageHref) {
    return `<image href="${esc(backgroundImageHref)}" x="0" y="0" width="${GOLFMAP_OG_WIDTH}" height="${GOLFMAP_OG_HEIGHT}" preserveAspectRatio="xMidYMid slice"/>`;
  }
  return `<rect width="${GOLFMAP_OG_WIDTH}" height="${GOLFMAP_OG_HEIGHT}" fill="url(#fallbackBg)"/>`;
}

/**
 * Fixed-layout OG SVG. Pass backgroundImageHref as a data URI or file URI when embedding background.
 */
export function generateGolfMapOgSvg(
  data: GolfMapOgData,
  assetsRoot: string,
  options?: { embedBackground?: boolean; projectRoot?: string },
): string {
  if (!fs.existsSync(assetsRoot)) {
    throw new Error(`SEO SVG assets directory missing: ${assetsRoot}`);
  }

  const eyebrow = esc(data.eyebrow ?? "전국을 연결하는 골프 정보 플랫폼");
  const brand = esc(data.brand ?? "GolfMap Korea");
  const domain = esc(data.domain ?? "golfmap.kr");
  const parts = loadParts(assetsRoot);
  const embedBackground = options?.embedBackground ?? true;
  const projectRoot = options?.projectRoot ?? path.resolve(assetsRoot, "../..");
  const fontFaceCss = buildOgFontFaceCss(projectRoot);

  const allDefs = [
    embedBackground ? fallbackGradientDef() : "",
    parts.logo.defs,
    parts.koreaMap.defs,
    parts.frame.defs,
    parts.flag.defs,
    parts.location.defs,
    parts.phone.defs,
    parts.homepage.defs,
    parts.price.defs,
  ]
    .filter(Boolean)
    .join("\n");

  const iconFragments = [parts.location, parts.phone, parts.homepage, parts.price];
  const iconGraphics = ICON_CENTERS.map((centerX, index) =>
    iconGraphic(iconFragments[index], centerX),
  ).join("\n");
  const iconLabels = ICON_CENTERS.map((centerX, index) =>
    iconLabel(centerX, ICON_LABELS[index]),
  ).join("\n");

  const dividerMarkup = [295, 545, 795]
    .map(
      (x) =>
        `<line x1="${x}" y1="968" x2="${x}" y2="1048" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" opacity="0.9"/>`,
    )
    .join("\n");

  const backgroundLayer = embedBackground ? buildBackgroundLayer(data.backgroundImageHref) : "";

  const hazeLayer = embedBackground
    ? `<rect width="${GOLFMAP_OG_WIDTH}" height="${GOLFMAP_OG_HEIGHT}" fill="rgba(255,255,255,0.08)"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${GOLFMAP_OG_WIDTH}" height="${GOLFMAP_OG_HEIGHT}" viewBox="0 0 ${GOLFMAP_OG_WIDTH} ${GOLFMAP_OG_HEIGHT}">
  <defs>
    ${allDefs}
    <style>
      ${fontFaceCss}
      .kr { font-family: ${KR_FONT_FAMILY}; }
      .en { font-family: ${EN_FONT_FAMILY}; }
    </style>
  </defs>

  ${backgroundLayer}
  ${hazeLayer}

  <g>${parts.frame.markup}</g>

  <g transform="translate(80 80) scale(${88 / 160})">${parts.logo.markup}</g>
  <text class="en" x="180" y="118" font-size="44" font-weight="800" fill="${BRAND_GREEN}">${brand}</text>
  <text class="en" x="180" y="165" font-size="30" font-weight="500" fill="${BRAND_GREEN}">${domain}</text>

  <text class="en" x="1120" y="115" text-anchor="end" font-size="16" letter-spacing="7" font-weight="700" fill="${BRAND_GREEN}" opacity="0.75">FIND YOUR NEXT ROUND</text>

  <g transform="translate(760 165) scale(${380 / 520})" opacity="0.85">${parts.koreaMap.markup}</g>

  <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" rx="${PANEL.rx}" fill="rgba(245,250,232,0.68)" stroke="rgba(255,255,255,0.85)" stroke-width="1.8"/>

  <text font-family="${KR_FONT_FAMILY}" x="${PANEL_CENTER_X}" y="710" text-anchor="middle" font-size="36" font-weight="700" fill="${BRAND_GREEN}">${eyebrow}</text>

  ${buildTitleMarkup(data.title)}

  <g transform="translate(880 750) scale(${180 / 220})" opacity="0.75">${parts.flag.markup}</g>

  <g fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    ${dividerMarkup}
    ${iconGraphics}
  </g>
  ${iconLabels}
</svg>`;
}

export function getSeoAssetsRoot(projectRoot: string): string {
  return path.join(projectRoot, "public/seo-assets");
}

export async function backgroundPathToDataUri(backgroundPath: string): Promise<string> {
  const sharp = (await import("sharp")).default;
  const buffer = await sharp(backgroundPath)
    .resize(GOLFMAP_OG_WIDTH, GOLFMAP_OG_HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88 })
    .toBuffer();
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}
