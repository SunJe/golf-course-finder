import fs from "fs";
import path from "path";

/** viewBox from @svg-maps/south-korea (CC BY 4.0, MapSVG) */
export const KOREA_MAP_VIEWBOX = { w: 524, h: 631 } as const;

export interface KoreaMapPlacement {
  x: number;
  y: number;
  scale: number;
}

/** Top-right on 1200×1200 — below FIND YOUR NEXT ROUND */
export function getPromoKoreaMapPlacement(): KoreaMapPlacement {
  return { x: 848, y: 108, scale: 0.5 };
}

let cachedPathDs: string[] | null = null;

function getKoreaMapSvgPath(projectRoot: string): string {
  return path.join(projectRoot, "public/seo-assets/korea-map-outline.svg");
}

/** Province path `d` values from fixed SVG asset (never generated). */
export function loadKoreaMapPathDs(projectRoot: string): string[] {
  if (cachedPathDs) return cachedPathDs;

  const file = getKoreaMapSvgPath(projectRoot);
  if (!fs.existsSync(file)) {
    throw new Error(`Korea map asset missing: ${file}`);
  }

  const svg = fs.readFileSync(file, "utf8");
  const matches = [...svg.matchAll(/\bd="([^"]+)"/g)];
  cachedPathDs = matches.map((m) => m[1]);
  if (cachedPathDs.length === 0) {
    throw new Error(`No paths found in ${file}`);
  }
  return cachedPathDs;
}

function pathsToMarkup(pathDs: string[], attrs: string): string {
  return pathDs.map((d) => `<path d="${d}" ${attrs}/>`).join("\n");
}

/**
 * Accurate Korea map overlay (mainland + Jeju) for SEO/promo cards.
 * Pin near center-south of peninsula in map local coordinates.
 */
export function buildKoreaMapOverlayMarkup(
  projectRoot: string,
  placement: KoreaMapPlacement = getPromoKoreaMapPlacement(),
  clipId = "koreaMapClip",
): string {
  const pathDs = loadKoreaMapPathDs(projectRoot);
  const { x, y, scale } = placement;
  const pinX = 258;
  const pinY = 318;

  const filledPaths = pathsToMarkup(
    pathDs,
    `fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.9)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`,
  );
  const clipPaths = pathsToMarkup(pathDs, "");

  const gridLines = Array.from({ length: 9 }, (_, i) => {
    const gx = 40 + i * 52;
    return `<line x1="${gx}" y1="20" x2="${gx}" y2="610" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`;
  })
    .concat(
      Array.from({ length: 11 }, (_, i) => {
        const gy = 30 + i * 58;
        return `<line x1="20" y1="${gy}" x2="504" y2="${gy}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`;
      }),
    )
    .join("");

  return `
  <g transform="translate(${x}, ${y}) scale(${scale})">
    <defs>
      <clipPath id="${clipId}">
        ${clipPaths}
      </clipPath>
    </defs>
    ${filledPaths}
    <g clip-path="url(#${clipId})">
      ${gridLines}
    </g>
    <g transform="translate(${pinX}, ${pinY}) scale(0.55)">
      <path d="M0,-28 C13,-28 22,-16 22,0 C22,14 0,42 0,42 C0,42 -22,14 -22,0 C-22,-16 -13,-28 0,-28 Z"
            fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.9)" stroke-width="2"/>
      <circle cx="0" cy="0" r="9" fill="#15803D"/>
    </g>
  </g>`;
}
