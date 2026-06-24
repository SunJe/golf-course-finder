import path from "path";
import { WIDTH, HEIGHT } from "./seoImageComposite";
import type { LayerKeyMode } from "./promoLayerKeying";

/** Native design canvas for ChatGPT layer exports */
export const SOURCE_SIZE = 1254;
export const SCALE = WIDTH / SOURCE_SIZE;

const CHATGPT_PREFIX = "ChatGPT Image 2026년 6월 24일 오후 02_24_24";

export const PROMO_LAYER_FILES = {
  background: "background img.png",
  /** (1) green map-pin + golf ball logo */
  logo: `${CHATGPT_PREFIX} (1).png`,
  /** (2) Korea map outline + grid + center pin */
  koreaMap: `${CHATGPT_PREFIX} (2).png`,
  /** (3) cream/glass card panel */
  glassPanel: `${CHATGPT_PREFIX} (3).png`,
  /** (4) white decorative frame border */
  frame: `${CHATGPT_PREFIX} (4).png`,
  /** (5) icon row — 위치/연락처/홈페이지/실시간 요금 */
  iconRow: `${CHATGPT_PREFIX} (5).png`,
  /** (6) white golf flag watermark */
  golfFlag: `${CHATGPT_PREFIX} (6).png`,
  /** (7) dot grid accent */
  dotGrid: `${CHATGPT_PREFIX} (7).png`,
  /** (8) eyebrow separator line with dot — note: numbered export differs from brief */
  separator: `${CHATGPT_PREFIX} (8).png`,
  /** (9) green rounded title bar (unused in sample-style layout) */
  titleBar: `${CHATGPT_PREFIX} (9).png`,
} as const;

/** Background removal mode per overlay layer (background uses none). */
export const LAYER_KEY_MODES: Record<Exclude<keyof typeof PROMO_LAYER_FILES, "background">, LayerKeyMode> = {
  frame: "whiteOnGray",
  glassPanel: "floodGray",
  logo: "floodGray",
  koreaMap: "whiteOnGray",
  iconRow: "whiteOnGray",
  golfFlag: "whiteOnGray",
  dotGrid: "whiteOnGray",
  separator: "keepColor",
  titleBar: "keepColor",
};

export function promoLayerPath(projectRoot: string, key: keyof typeof PROMO_LAYER_FILES): string {
  return path.join(projectRoot, "public", PROMO_LAYER_FILES[key]);
}

/** Horizontal strip placement — scaled from sample img layout */
export const ICON_ROW_BOX = {
  left: Math.round((WIDTH - Math.round(1010 * SCALE)) / 2),
  top: Math.round(1012 * SCALE),
  width: Math.round(1010 * SCALE),
  height: Math.round(198 * SCALE),
} as const;

/** Calibrated from sample img.png — assets are centered in 1254² exports */
export const LAYER_BOXES = {
  logo: {
    left: Math.round(28 * SCALE),
    top: Math.round(34 * SCALE),
    width: Math.round(132 * SCALE),
    height: Math.round(160 * SCALE),
  },
  koreaMap: {
    left: Math.round(658 * SCALE),
    top: Math.round(28 * SCALE),
    width: Math.round(586 * SCALE),
    height: Math.round(212 * SCALE),
  },
  separator: {
    left: Math.round(58 * SCALE),
    top: Math.round(562 * SCALE),
    width: Math.round(420 * SCALE),
    height: Math.round(28 * SCALE),
  },
  golfFlag: {
    left: Math.round(998 * SCALE),
    top: Math.round(552 * SCALE),
    width: Math.round(236 * SCALE),
    height: Math.round(360 * SCALE),
  },
  dotGrid: {
    left: Math.round(1030 * SCALE),
    top: Math.round(1088 * SCALE),
    width: Math.round(180 * SCALE),
    height: Math.round(120 * SCALE),
  },
} as const;

export const SEPARATOR_BOX = LAYER_BOXES.separator;

export const TEXT_LAYOUT = {
  brandX: Math.round(148 * SCALE),
  brandY: Math.round(86 * SCALE),
  domainY: Math.round(122 * SCALE),
  topRightX: WIDTH - Math.round(36 * SCALE),
  topRightY: Math.round(72 * SCALE),
  eyebrowX: Math.round(58 * SCALE),
  eyebrowY: Math.round(538 * SCALE),
  titleX: Math.round(58 * SCALE),
  titleBaseY: Math.round(688 * SCALE),
  titleLineHeight: Math.round(82 * SCALE),
} as const;
