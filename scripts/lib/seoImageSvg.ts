import {
  KOREA_SILHOUETTE_PATH,
  getDefaultKoreaMapPlacement,
  koreaMapTransform,
} from "./koreaMapPath";

export const WIDTH = 1200;
export const HEIGHT = 630;

/** GolfBox-inspired teal palette → GolfMap Korea */
const C = {
  tealDark: "#1E4545",
  tealInk: "#234848",
  tealMuted: "#4A6666",
  footerLeft: "#9DBFA8",
  footerRight: "#1E4545",
  white: "#FFFFFF",
  glass: "rgba(255,255,255,0.58)",
  glassStroke: "rgba(255,255,255,0.92)",
  wire: "rgba(60,90,90,0.28)",
  wireLight: "rgba(255,255,255,0.45)",
  brandGreen: "#15803D",
  brandHex: "#1E4545",
} as const;

const FONT =
  "Malgun Gothic, Apple SD Gothic Neo, Pretendard, Arial, Helvetica, sans-serif";

export type SeoImageKind = "collection" | "region" | "course";

export interface SeoCardSvgOptions {
  headline: string;
  subtitle: string;
  categoryLabel?: string;
  badge?: string;
  seed: string;
  kind?: SeoImageKind;
}

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function maxCharsForFontSize(fontSize: number): number {
  if (fontSize >= 58) return 12;
  if (fontSize >= 44) return 16;
  return 28;
}

function truncateLine(line: string, maxChars: number): string {
  const trimmed = line.trim();
  if (trimmed.length <= maxChars) return trimmed;
  if (maxChars <= 3) return trimmed.slice(0, maxChars);
  return `${trimmed.slice(0, maxChars - 1).trimEnd()}…`;
}

export function wrapTextToLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number,
): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  const pushLine = (line: string): boolean => {
    if (!line.trim()) return lines.length >= maxLines;
    lines.push(truncateLine(line, maxCharsPerLine));
    return lines.length >= maxLines;
  };

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }
    if (current) {
      if (pushLine(current)) return lines;
      current = word;
    } else {
      if (pushLine(word)) return lines;
      current = "";
    }
  }

  if (current && lines.length < maxLines) pushLine(current);
  if (lines.length === 0) {
    return [truncateLine(normalized, maxCharsPerLine * maxLines)];
  }
  return lines.slice(0, maxLines);
}

function buildTextLines(text: string, fontSize: number, maxLines: number): string[] {
  return wrapTextToLines(text, maxCharsForFontSize(fontSize), maxLines);
}

function renderTspans(
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
  fill: string,
  fontSize: number,
  fontWeight: number | string,
): string {
  if (lines.length === 0) return "";
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  return `<text x="${x}" y="${startY}" fill="${fill}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="${FONT}">${tspans}</text>`;
}

function buildGolfMapLogo(x: number, y: number): string {
  return `
  <g transform="translate(${x}, ${y})">
    <polygon points="0,-22 19,-11 19,11 0,22 -19,11 -19,-11"
             fill="${C.brandHex}" stroke="${C.white}" stroke-width="1.5"/>
    <g transform="scale(0.5)">
      <path d="M0,-32 C14,-32 26,-20 26,0 C26,18 0,48 0,48 C0,48 -26,18 -26,0 C-26,-20 -14,-32 0,-32 Z" fill="${C.white}"/>
      <circle cx="0" cy="-2" r="9" fill="${C.brandGreen}"/>
    </g>
  </g>`;
}

/** Korea-map “glass panel” — GolfBox 3D box 대체 */
function buildKoreaMapGlassPanel(): string {
  const tf = koreaMapTransform(getDefaultKoreaMapPlacement());

  return `
  <g transform="${tf}">
    <!-- Depth wire (back layer) -->
    <path d="${KOREA_SILHOUETTE_PATH}" fill="none" stroke="${C.wire}" stroke-width="2.5"
          transform="translate(10, 12)" opacity="0.55"/>
    <path d="${KOREA_SILHOUETTE_PATH}" fill="none" stroke="${C.wireLight}" stroke-width="1.5"
          transform="translate(-8, -6)" opacity="0.35"/>

    <!-- Main glass fill -->
    <path d="${KOREA_SILHOUETTE_PATH}" fill="${C.white}" fill-opacity="0.58"/>
    <path d="${KOREA_SILHOUETTE_PATH}" fill="none" stroke="${C.glassStroke}" stroke-width="2.5"/>

    <!-- Inner highlight edge -->
    <path d="${KOREA_SILHOUETTE_PATH}" fill="none" stroke="${C.white}" stroke-width="1"
          transform="translate(-3, -3)" opacity="0.35"/>

    <!-- Subtle map grid inside silhouette (clip) -->
    <defs>
      <clipPath id="koreaClip">
        <path d="${KOREA_SILHOUETTE_PATH}"/>
      </clipPath>
    </defs>
    <g clip-path="url(#koreaClip)" opacity="0.12" stroke="${C.tealDark}" stroke-width="1">
      ${Array.from({ length: 8 }, (_, i) => {
        const x = 40 + i * 42;
        return `<line x1="${x}" y1="20" x2="${x}" y2="580"/>`;
      }).join("")}
      ${Array.from({ length: 10 }, (_, i) => {
        const y = 40 + i * 55;
        return `<line x1="20" y1="${y}" x2="380" y2="${y}"/>`;
      }).join("")}
    </g>

    <!-- Map pins inside Korea shape -->
    <g clip-path="url(#koreaClip)" opacity="0.55">
      <g transform="translate(180, 200) scale(0.55)">
        <path d="M0,-36 C16,-36 28,-24 28,0 C28,20 0,52 0,52 C0,52 -28,20 -28,0 C-28,-24 -16,-36 0,-36 Z" fill="${C.brandGreen}"/>
        <circle cx="0" cy="0" r="10" fill="${C.white}"/>
      </g>
      <g transform="translate(240, 320) scale(0.45)">
        <path d="M0,-36 C16,-36 28,-24 28,0 C28,20 0,52 0,52 C0,52 -28,20 -28,0 C-28,-24 -16,-36 0,-36 Z" fill="${C.tealDark}"/>
      </g>
      <g transform="translate(130, 380) scale(0.4)">
        <path d="M0,-36 C16,-36 28,-24 28,0 C28,20 0,52 0,52 C0,52 -28,20 -28,0 C-28,-24 -16,-36 0,-36 Z" fill="${C.brandGreen}"/>
      </g>
    </g>
  </g>`;
}

function buildFooter(seed: string): string {
  const h = hashSeed(seed);
  const taglines = [
    "전국 골프장 위치·요금·홈페이지를 한눈에, GolfMap Korea",
    "프리미엄 골프장 큐레이션 지도, GolfMap Korea",
    "최고의 라운딩 준비를 위한 골프장 정보 가이드",
  ];
  const tagline = taglines[h % taglines.length];
  const footerY = HEIGHT - 74;

  return `
  <rect x="0" y="${footerY}" width="${WIDTH}" height="74" fill="${C.footerRight}"/>
  <rect x="0" y="${footerY}" width="780" height="74" fill="${C.footerLeft}"/>
  <text x="36" y="${footerY + 46}" fill="${C.tealDark}" font-size="18" font-weight="600" font-family="${FONT}">${escapeXml(tagline)}</text>
  <text x="820" y="${footerY + 46}" fill="${C.white}" font-size="20" font-weight="700" font-family="${FONT}">golfmap.kr</text>`;
}

function buildCategoryTag(label: string, x: number, y: number): string {
  const w = Math.min(label.length * 16 + 36, 360);
  return `
  <rect x="${x}" y="${y}" width="${w}" height="38" fill="${C.tealDark}"/>
  <text x="${x + 18}" y="${y + 26}" fill="${C.white}" font-size="16" font-weight="700" font-family="${FONT}">${escapeXml(label)}</text>`;
}

/**
 * Transparent overlay: Korea-map glass + typography + footer.
 * Composited over AI / photo background via sharp.
 */
export function buildSeoOverlaySvg(options: SeoCardSvgOptions): string {
  const kind = options.kind ?? "collection";
  const categoryLabel =
    options.categoryLabel?.trim() ||
    (kind === "region" ? "지역 골프장" : kind === "course" ? "골프장 정보" : "골프장 큐레이션");

  const headlineLines = buildTextLines(options.headline, 58, 2);
  const subtitleLines = buildTextLines(options.subtitle, 22, 2);

  const textX = 72;
  const tagY = 368;
  const headlineY = 448;
  const headlineLH = 64;
  const subtitleY = headlineY + headlineLines.length * headlineLH + 16;

  const headlineBlock = renderTspans(
    headlineLines,
    textX,
    headlineY,
    headlineLH,
    C.tealInk,
    58,
    800,
  );
  const subtitleBlock = renderTspans(
    subtitleLines,
    textX,
    subtitleY,
    30,
    C.tealMuted,
    22,
    500,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  ${buildKoreaMapGlassPanel()}

  <!-- Brand: top-right (GolfBox 레이아웃 대응) -->
  <g font-family="${FONT}">
    ${buildGolfMapLogo(1040, 72)}
    <text x="1010" y="58" fill="${C.tealInk}" font-size="28" font-weight="800" text-anchor="end" letter-spacing="2">GOLF MAP</text>
    <text x="1010" y="118" fill="${C.tealMuted}" font-size="14" font-weight="600" text-anchor="end">KOREA</text>
  </g>

  ${buildCategoryTag(categoryLabel, textX, tagY)}

  <g font-family="${FONT}">
    ${headlineBlock}
    ${subtitleBlock}
  </g>

  ${buildFooter(options.seed)}
</svg>`;
}

/** Fallback when AI background file is missing */
export function buildFallbackBackgroundSvg(seed: string): string {
  const h = hashSeed(seed);
  const cloudX = 100 + (h % 200);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6BB3E8"/>
      <stop offset="100%" stop-color="#B8DCF5"/>
    </linearGradient>
    <linearGradient id="fairway" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3D8B47"/>
      <stop offset="100%" stop-color="#1B5E20"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sky)"/>
  <ellipse cx="${cloudX}" cy="90" rx="120" ry="35" fill="#fff" opacity="0.7"/>
  <ellipse cx="${cloudX + 80}" cy="75" rx="90" ry="28" fill="#fff" opacity="0.55"/>
  <path d="M0,320 Q300,260 600,300 T1200,280 L1200,${HEIGHT} L0,${HEIGHT} Z" fill="url(#fairway)"/>
  <path d="M0,380 Q400,340 800,370 T1200,350 L1200,${HEIGHT} L0,${HEIGHT} Z" fill="#2E7D32" opacity="0.85"/>
  <ellipse cx="950" cy="480" rx="70" ry="25" fill="#E8DCC4" opacity="0.7"/>
</svg>`;
}

/** @deprecated Use renderSeoCardPng with background composite */
export function buildSeoCardSvg(options: SeoCardSvgOptions): string {
  return buildSeoOverlaySvg(options);
}
