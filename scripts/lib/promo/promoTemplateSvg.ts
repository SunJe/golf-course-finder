import type { PromoPageData } from "../../../lib/og/promoTypes";
import {
  DEFAULT_PROMO_BRAND,
  DEFAULT_PROMO_DOMAIN,
  DEFAULT_PROMO_EYEBROW,
  DEFAULT_PROMO_TOP_RIGHT,
  PROMO_ICON_LABELS,
  PROMO_IMAGE_SIZE,
} from "../../../lib/og/promoTypes";

export const PROMO_WIDTH = PROMO_IMAGE_SIZE;
export const PROMO_HEIGHT = PROMO_IMAGE_SIZE;

const C = {
  forest: "#1B4332",
  green: "#2D6A4F",
  greenLight: "#40916C",
  white: "#FFFFFF",
  glass: "rgba(255,255,255,0.54)",
  glassStroke: "rgba(255,255,255,0.88)",
  line: "rgba(255,255,255,0.72)",
  lineSoft: "rgba(255,255,255,0.38)",
  mapStroke: "rgba(255,255,255,0.82)",
  mapGrid: "rgba(255,255,255,0.22)",
} as const;

const FONT =
  "Malgun Gothic, Apple SD Gothic Neo, Pretendard, Arial, Helvetica, sans-serif";

/** Simplified Korea outline for top-right identity graphic */
const KOREA_PROMO_PATH =
  "M 118 42 C 138 28 162 24 186 30 L 218 38 244 52 262 72 276 96 284 124 288 154 290 186 286 218 278 250 268 282 254 312 236 340 218 366 196 388 172 404 148 416 124 420 102 418 84 408 70 392 58 372 50 348 46 322 44 294 46 266 52 238 62 210 76 182 92 158 108 136 118 42 Z";

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
  if (len <= 8) return 78;
  if (len <= 11) return 68;
  if (len <= 14) return 58;
  if (len <= 18) return 50;
  return 42;
}

function buildDecorativeFrame(): string {
  const m = 28;
  const w = PROMO_WIDTH - m * 2;
  const h = PROMO_HEIGHT - m * 2;
  const corner = 28;

  return `
  <rect x="${m}" y="${m}" width="${w}" height="${h}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <path d="M ${m} ${m + corner} L ${m} ${m} L ${m + corner} ${m}" fill="none" stroke="${C.white}" stroke-width="2.5"/>
  <path d="M ${PROMO_WIDTH - m - corner} ${m} L ${PROMO_WIDTH - m} ${m} L ${PROMO_WIDTH - m} ${m + corner}" fill="none" stroke="${C.white}" stroke-width="2.5"/>
  <path d="M ${m} ${PROMO_HEIGHT - m - corner} L ${m} ${PROMO_HEIGHT - m} L ${m + corner} ${PROMO_HEIGHT - m}" fill="none" stroke="${C.white}" stroke-width="2.5"/>
  <path d="M ${PROMO_WIDTH - m - corner} ${PROMO_HEIGHT - m} L ${PROMO_WIDTH - m} ${PROMO_HEIGHT - m} L ${PROMO_WIDTH - m} ${PROMO_HEIGHT - m - corner}" fill="none" stroke="${C.white}" stroke-width="2.5"/>`;
}

function buildBrandLogo(x: number, y: number): string {
  return `
  <g transform="translate(${x}, ${y})">
    <circle cx="0" cy="0" r="34" fill="${C.forest}" stroke="${C.white}" stroke-width="2"/>
    <g transform="translate(0, 2) scale(0.62)">
      <path d="M0,-34 C16,-34 28,-22 28,0 C28,20 0,50 0,50 C0,50 -28,20 -28,0 C-28,-22 -16,-34 0,-34 Z" fill="${C.white}"/>
      <circle cx="0" cy="-2" r="9" fill="${C.green}"/>
      <circle cx="0" cy="-10" r="5" fill="${C.white}" stroke="${C.green}" stroke-width="1"/>
    </g>
  </g>`;
}

function buildKoreaMapIdentity(): string {
  return `
  <g transform="translate(868, 118) scale(0.62)">
    <path d="${KOREA_PROMO_PATH}" fill="none" stroke="${C.mapStroke}" stroke-width="3"/>
    <g clip-path="url(#koreaPromoClip)" opacity="0.9">
      <defs>
        <clipPath id="koreaPromoClip"><path d="${KOREA_PROMO_PATH}"/></clipPath>
      </defs>
      ${Array.from({ length: 7 }, (_, i) => {
        const x = 50 + i * 42;
        return `<line x1="${x}" y1="30" x2="${x}" y2="400" stroke="${C.mapGrid}" stroke-width="1"/>`;
      }).join("")}
      ${Array.from({ length: 8 }, (_, i) => {
        const y = 40 + i * 48;
        return `<line x1="40" y1="${y}" x2="360" y2="${y}" stroke="${C.mapGrid}" stroke-width="1"/>`;
      }).join("")}
    </g>
    <g transform="translate(205, 175)">
      <path d="M0,-24 C12,-24 22,-12 22,0 C22,14 0,38 0,38 C0,38 -22,14 -22,0 C-22,-12 -12,-24 0,-24 Z" fill="${C.white}" opacity="0.95"/>
      <circle cx="0" cy="0" r="8" fill="${C.green}"/>
    </g>
  </g>`;
}

function buildIconRow(panelX: number, panelY: number, panelW: number, panelH: number): string {
  const rowY = panelY + panelH - 118;
  const iconY = rowY + 8;
  const labelY = rowY + 58;
  const colW = panelW / 4;
  const icons = [
    // location
    `<g transform="translate(0,0)"><rect x="-18" y="-12" width="36" height="28" rx="3" fill="none" stroke="${C.forest}" stroke-width="2"/><path d="M0,10 C8,10 14,4 14,-4 C14,-12 0,-22 0,-22 C0,-22 -14,-12 -14,-4 C-14,4 -8,10 0,10 Z" fill="none" stroke="${C.forest}" stroke-width="2"/><circle cx="0" cy="-4" r="3" fill="${C.forest}"/></g>`,
    // phone
    `<g transform="translate(0,0)"><path d="M-12,-18 C-12,-18 -8,-22 0,-22 C8,-22 12,-18 12,-18 L12,18 C12,18 8,22 0,22 C-8,22 -12,18 -12,18 Z" fill="none" stroke="${C.forest}" stroke-width="2"/><circle cx="0" cy="14" r="2" fill="${C.forest}"/></g>`,
    // homepage
    `<g transform="translate(0,0)"><rect x="-18" y="-14" width="36" height="26" rx="2" fill="none" stroke="${C.forest}" stroke-width="2"/><line x1="-18" y1="-8" x2="18" y2="-8" stroke="${C.forest}" stroke-width="2"/><circle cx="12" cy="-12" r="1.5" fill="${C.forest}"/></g>`,
    // price
    `<g transform="translate(0,0)"><ellipse cx="-8" cy="6" rx="10" ry="5" fill="none" stroke="${C.forest}" stroke-width="2"/><ellipse cx="8" cy="2" rx="10" ry="5" fill="none" stroke="${C.forest}" stroke-width="2"/><ellipse cx="0" cy="-6" rx="10" ry="5" fill="none" stroke="${C.forest}" stroke-width="2"/></g>`,
  ];

  return PROMO_ICON_LABELS.map((label, i) => {
    const cx = panelX + colW * i + colW / 2;
    return `
    <g transform="translate(${cx}, ${iconY})">${icons[i]}</g>
    <text x="${cx}" y="${labelY}" text-anchor="middle" fill="${C.forest}" font-size="17" font-weight="600" font-family="${FONT}">${escapeXml(label)}</text>
    ${i < 3 ? `<line x1="${panelX + colW * (i + 1)}" y1="${rowY}" x2="${panelX + colW * (i + 1)}" y2="${rowY + 78}" stroke="${C.lineSoft}" stroke-width="1"/>` : ""}`;
  }).join("");
}

function buildDotGrid(x: number, y: number): string {
  const dots: string[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      dots.push(
        `<circle cx="${x + col * 18}" cy="${y + row * 18}" r="2.5" fill="${C.white}" opacity="0.55"/>`,
      );
    }
  }
  return dots.join("");
}

function buildGlassPanel(data: PromoPageData): string {
  const panelX = 72;
  const panelY = 518;
  const panelW = 1056;
  const panelH = 580;
  const eyebrow = data.eyebrow?.trim() || DEFAULT_PROMO_EYEBROW;
  const title = data.title.trim();
  const titleSize = titleFontSize(title);
  const titleY = panelY + 198;
  const eyebrowY = panelY + 78;

  return `
  <g>
    <rect x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="26"
          fill="${C.glass}" stroke="${C.glassStroke}" stroke-width="1.5"/>
    <rect x="${panelX + 1}" y="${panelY + 1}" width="${panelW - 2}" height="${panelH - 2}" rx="25"
          fill="none" stroke="${C.white}" stroke-width="1" opacity="0.45"/>

    <text x="${panelX + 56}" y="${eyebrowY}" fill="${C.forest}" font-size="24" font-weight="600" font-family="${FONT}">${escapeXml(eyebrow)}</text>
    <line x1="${panelX + 56}" y1="${eyebrowY + 18}" x2="${panelX + 420}" y2="${eyebrowY + 18}" stroke="${C.forest}" stroke-width="2" opacity="0.35"/>

    <text x="${panelX + 56}" y="${titleY}" fill="${C.forest}" font-size="${titleSize}" font-weight="800" font-family="${FONT}">${escapeXml(title)}</text>

    ${data.description?.trim() ? `<text x="${panelX + 56}" y="${titleY + 56}" fill="${C.green}" font-size="22" font-weight="500" font-family="${FONT}" opacity="0.9">${escapeXml(data.description.trim())}</text>` : ""}

    ${buildDotGrid(panelX + panelW - 96, panelY + panelH - 150)}
    ${buildIconRow(panelX, panelY, panelW, panelH)}

    <g transform="translate(${panelX + panelW - 180}, ${panelY + 250})" opacity="0.14">
      <line x1="0" y1="0" x2="0" y2="120" stroke="${C.forest}" stroke-width="4"/>
      <polygon points="0,0 56,16 0,32" fill="${C.green}"/>
    </g>
  </g>`;
}

/** Fixed overlay — background is composited separately */
export function buildPromoOverlaySvg(data: PromoPageData): string {
  const brand = data.brandText?.trim() || DEFAULT_PROMO_BRAND;
  const domain = data.domainText?.trim() || DEFAULT_PROMO_DOMAIN;
  const topRight = data.topRightCopy?.trim() || DEFAULT_PROMO_TOP_RIGHT;
  const mapEnabled = data.mapOverlayEnabled !== false;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PROMO_WIDTH}" height="${PROMO_HEIGHT}" viewBox="0 0 ${PROMO_WIDTH} ${PROMO_HEIGHT}">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>

  ${buildDecorativeFrame()}

  <rect width="${PROMO_WIDTH}" height="220" fill="url(#topFade)"/>

  ${buildBrandLogo(92, 92)}
  <g font-family="${FONT}">
    <text x="148" y="86" fill="${C.forest}" font-size="30" font-weight="800">${escapeXml(brand)}</text>
    <text x="148" y="116" fill="${C.green}" font-size="18" font-weight="500">${escapeXml(domain)}</text>
  </g>

  <text x="868" y="78" text-anchor="end" fill="${C.forest}" font-size="15" font-weight="600" letter-spacing="3" font-family="${FONT}">${escapeXml(topRight)}</text>
  ${mapEnabled ? buildKoreaMapIdentity() : ""}

  ${buildGlassPanel(data)}
</svg>`;
}
