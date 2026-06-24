import {
  DEFAULT_PROMO_BRAND,
  DEFAULT_PROMO_DOMAIN,
  DEFAULT_PROMO_EYEBROW,
  DEFAULT_PROMO_TOP_RIGHT,
} from "../../lib/og/promoTypes";
import {
  buildKoreaMapIdentityImageMarkup,
  buildPromoIconsRowImageMarkup,
  KOREA_MAP_IDENTITY_BOX,
} from "./seoChromeAssets";

export const WIDTH = 1200;
export const HEIGHT = 1200;

export type SeoImageKind = "collection" | "region" | "course";

/** Master template data — only title (and optional eyebrow) vary per page */
export interface SeoCardSvgOptions {
  title: string;
  eyebrow?: string;
  brand?: string;
  domain?: string;
  seed: string;
  kind?: SeoImageKind;
  /** @deprecated Not rendered on image — kept for script compatibility */
  headline?: string;
  subtitle?: string;
  categoryLabel?: string;
  badge?: string;
}

const FONT =
  "Malgun Gothic, Apple SD Gothic Neo, Pretendard, Arial, Helvetica, sans-serif";

const C = {
  forest: "#1B4332",
  green: "#2D6A4F",
  white: "#FFFFFF",
  glass: "rgba(245, 250, 238, 0.72)",
  glassStroke: "rgba(255,255,255,0.78)",
  line: "rgba(255,255,255,0.72)",
  lineSoft: "rgba(255,255,255,0.38)",
} as const;

const PANEL = {
  x: 36,
  y: 612,
  w: 1128,
  h: 552,
  rx: 42,
} as const;

const CX = WIDTH / 2;

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function titleFontSize(title: string): number {
  const len = title.trim().length;
  if (len <= 5) return 148;
  if (len <= 7) return 138;
  if (len <= 9) return 128;
  if (len <= 11) return 118;
  if (len <= 14) return 104;
  if (len <= 17) return 92;
  return 80;
}

function wrapTitle(title: string, fontSize: number): string[] {
  const maxChars = fontSize >= 118 ? 7 : fontSize >= 92 ? 9 : 11;
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

function buildDecorativeFrame(): string {
  const m = 28;
  const w = WIDTH - m * 2;
  const h = HEIGHT - m * 2;
  const corner = 28;

  return `
  <rect x="${m}" y="${m}" width="${w}" height="${h}" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  <path d="M ${m} ${m + corner} L ${m} ${m} L ${m + corner} ${m}" fill="none" stroke="${C.white}" stroke-width="2.5"/>
  <path d="M ${WIDTH - m - corner} ${m} L ${WIDTH - m} ${m} L ${WIDTH - m} ${m + corner}" fill="none" stroke="${C.white}" stroke-width="2.5"/>
  <path d="M ${m} ${HEIGHT - m - corner} L ${m} ${HEIGHT - m} L ${m + corner} ${HEIGHT - m}" fill="none" stroke="${C.white}" stroke-width="2.5"/>
  <path d="M ${WIDTH - m - corner} ${HEIGHT - m} L ${WIDTH - m} ${HEIGHT - m} L ${WIDTH - m} ${HEIGHT - m - corner}" fill="none" stroke="${C.white}" stroke-width="2.5"/>`;
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

function buildIconRow(projectRoot: string): string {
  return buildPromoIconsRowImageMarkup(projectRoot);
}

function buildGlassPanel(title: string, eyebrow: string, projectRoot: string): string {
  const titleSize = titleFontSize(title);
  const lines = wrapTitle(title, titleSize);
  const lineHeight = Math.round(titleSize * 1.08);
  const eyebrowY = PANEL.y + 78;
  const sepY = eyebrowY + 28;
  const titleBlockH = lines.length * lineHeight;
  const titleY = PANEL.y + Math.round(PANEL.h * 0.46) - Math.round(titleBlockH / 2) + lineHeight * 0.82;

  const titleTspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : lineHeight;
      return `<tspan x="${CX}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  return `
  <g>
    <rect x="${PANEL.x}" y="${PANEL.y}" width="${PANEL.w}" height="${PANEL.h}" rx="${PANEL.rx}"
          fill="${C.glass}" stroke="${C.glassStroke}" stroke-width="2"/>
    <rect x="${PANEL.x + 2}" y="${PANEL.y + 2}" width="${PANEL.w - 4}" height="${PANEL.h - 4}" rx="${PANEL.rx - 2}"
          fill="none" stroke="${C.white}" stroke-width="1" opacity="0.45"/>

    <text x="${CX}" y="${eyebrowY}" text-anchor="middle" fill="${C.forest}" font-size="38" font-weight="600" font-family="${FONT}">${escapeXml(eyebrow)}</text>
    <line x1="${CX - 180}" y1="${sepY}" x2="${CX + 180}" y2="${sepY}" stroke="${C.forest}" stroke-width="2" opacity="0.32"/>

    <text x="${CX}" y="${titleY}" text-anchor="middle" fill="${C.forest}" font-size="${titleSize}" font-weight="800" font-family="${FONT}">${titleTspans}</text>

    ${buildIconRow(projectRoot)}

    <g transform="translate(${PANEL.x + PANEL.w - 120}, ${PANEL.y + 200})" opacity="0.12">
      <line x1="0" y1="0" x2="0" y2="110" stroke="${C.forest}" stroke-width="4"/>
      <polygon points="0,0 50,14 0,28" fill="${C.green}"/>
    </g>
  </g>`;
}

export function buildSeoOverlaySvg(
  options: SeoCardSvgOptions,
  projectRoot: string,
): string {
  const title = (options.title || options.headline || "").trim();
  const eyebrow = options.eyebrow?.trim() || DEFAULT_PROMO_EYEBROW;
  const brand = options.brand?.trim() || DEFAULT_PROMO_BRAND;
  const domain = options.domain?.trim() || DEFAULT_PROMO_DOMAIN;
  const topRight = DEFAULT_PROMO_TOP_RIGHT;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>

  ${buildDecorativeFrame()}
  <rect width="${WIDTH}" height="240" fill="url(#topFade)"/>

  ${buildBrandLogo(92, 92)}
  <g font-family="${FONT}">
    <text x="148" y="86" fill="${C.forest}" font-size="38" font-weight="800">${escapeXml(brand)}</text>
    <text x="148" y="122" fill="${C.green}" font-size="22" font-weight="500">${escapeXml(domain)}</text>
  </g>

  <text x="${KOREA_MAP_IDENTITY_BOX.x + KOREA_MAP_IDENTITY_BOX.width}" y="72" text-anchor="end" fill="${C.forest}" font-size="14" font-weight="600" letter-spacing="3" font-family="${FONT}">${escapeXml(topRight)}</text>
  ${buildKoreaMapIdentityImageMarkup(projectRoot)}

  ${buildGlassPanel(title, eyebrow, projectRoot)}
</svg>`;
}

export function buildFallbackBackgroundSvg(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const cloudX = 120 + (Math.abs(hash) % 180);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7EC8F0"/>
      <stop offset="100%" stop-color="#C5E4F8"/>
    </linearGradient>
    <linearGradient id="fairway" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4CAF50"/>
      <stop offset="100%" stop-color="#1B5E20"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
  <ellipse cx="${cloudX}" cy="140" rx="140" ry="42" fill="#fff" opacity="0.75"/>
  <ellipse cx="${cloudX + 100}" cy="110" rx="100" ry="32" fill="#fff" opacity="0.6"/>
  <path d="M0,520 Q360,440 720,500 T1200,460 L1200,${HEIGHT} L0,${HEIGHT} Z" fill="url(#fairway)"/>
  <path d="M0,620 Q420,560 840,610 T1200,580 L1200,${HEIGHT} L0,${HEIGHT} Z" fill="#2E7D32" opacity="0.88"/>
</svg>`;
}

/** @deprecated Use buildSeoOverlaySvg */
export function buildSeoCardSvg(options: SeoCardSvgOptions, projectRoot: string): string {
  return buildSeoOverlaySvg(options, projectRoot);
}
