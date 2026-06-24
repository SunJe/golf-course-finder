import { PROMO_IMAGE_SIZE } from "../../../lib/og/promoTypes";

/** master-sample.png native size */
export const SAMPLE_SOURCE_SIZE = 1254;

export const SAMPLE_DEFAULT_TITLE = "나인홀 골프장";

const SCALE = PROMO_IMAGE_SIZE / SAMPLE_SOURCE_SIZE;

export type SampleRegion = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function scaleRegion(region: SampleRegion): SampleRegion {
  return {
    left: Math.round(region.left * SCALE),
    top: Math.round(region.top * SCALE),
    width: Math.round(region.width * SCALE),
    height: Math.round(region.height * SCALE),
  };
}

/** Pixel-copied UI strips from sample img (never redrawn in SVG). */
export const SAMPLE_CHROME_REGIONS = {
  frameTop: scaleRegion({ left: 22, top: 22, width: 1210, height: 8 }),
  frameBottom: scaleRegion({ left: 22, top: 1224, width: 1210, height: 8 }),
  frameLeft: scaleRegion({ left: 22, top: 22, width: 8, height: 1210 }),
  frameRight: scaleRegion({ left: 1224, top: 22, width: 8, height: 1210 }),
  cornerTL: scaleRegion({ left: 22, top: 22, width: 58, height: 58 }),
  cornerTR: scaleRegion({ left: 1174, top: 22, width: 58, height: 58 }),
  cornerBL: scaleRegion({ left: 22, top: 1174, width: 58, height: 58 }),
  cornerBR: scaleRegion({ left: 1174, top: 1174, width: 58, height: 58 }),
  logo: scaleRegion({ left: 28, top: 34, width: 404, height: 168 }),
  topRight: scaleRegion({ left: 658, top: 28, width: 586, height: 212 }),
  eyebrow: scaleRegion({ left: 46, top: 514, width: 648, height: 76 }),
  title: scaleRegion({ left: 44, top: 596, width: 992, height: 158 }),
  iconRow: scaleRegion({ left: 34, top: 1002, width: 1186, height: 232 }),
  glassDeco: scaleRegion({ left: 998, top: 552, width: 236, height: 360 }),
} as const;

/** Glass panel clip — slanted top edge from sample */
export const GLASS_CLIP_POINTS = [
  { x: 44, y: 488 },
  { x: 1208, y: 528 },
  { x: 1208, y: 1238 },
  { x: 44, y: 1238 },
].map((p) => ({
  x: Math.round(p.x * SCALE),
  y: Math.round(p.y * SCALE),
}));

export const TITLE_LAYOUT = {
  x: Math.round(58 * SCALE),
  baseY: Math.round(688 * SCALE),
  lineHeight: Math.round(82 * SCALE),
} as const;
