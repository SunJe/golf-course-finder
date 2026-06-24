import type { PromoPageData } from "../../../lib/og/promoTypes";
import { PROMO_IMAGE_SIZE } from "../../../lib/og/promoTypes";

const FONT =
  "Malgun Gothic, Apple SD Gothic Neo, Pretendard, Arial, Helvetica, sans-serif";

/** Title baked into master-reference.png — skip redraw when unchanged */
export const MASTER_DEFAULT_TITLE = "나인홀 골프장";

/** Calibrated for master-reference.png → 1200×1200 square */
export const MASTER_TITLE_PATCH = {
  left: 36,
  top: 592,
  width: 1020,
  height: 308,
} as const;

/** Description-only zone when master title is kept */
export const MASTER_DESC_ONLY_PATCH = {
  left: 64,
  top: 792,
  width: 936,
  height: 68,
} as const;

export function getMasterTextPatch(data: PromoPageData): {
  patch: typeof MASTER_TITLE_PATCH | typeof MASTER_DESC_ONLY_PATCH;
  replaceTitle: boolean;
} {
  const titleUnchanged = data.title.trim() === MASTER_DEFAULT_TITLE;
  const hasDesc = Boolean(data.description?.trim());
  if (titleUnchanged && hasDesc) {
    return { patch: MASTER_DESC_ONLY_PATCH, replaceTitle: false };
  }
  return { patch: MASTER_TITLE_PATCH, replaceTitle: true };
}

const LAYOUT = {
  titleX: 78,
  titleBaseY: 688,
  descY: 818,
  titleLineHeight: 82,
} as const;

const C = {
  forest: "#1B4332",
  green: "#2D6A4F",
  glassPatch: "rgba(255,255,255,0.58)",
} as const;

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
  if (len <= 7) return 80;
  if (len <= 9) return 72;
  if (len <= 12) return 64;
  if (len <= 15) return 54;
  return 46;
}

function wrapTitle(title: string, fontSize: number): string[] {
  const maxChars = fontSize >= 72 ? 8 : fontSize >= 54 ? 10 : 12;
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

/**
 * Text-only overlay on top of the fixed master square.
 * Master PNG already contains frame, logo, map, glass panel, eyebrow, icons.
 */
export function buildMasterTextOverlaySvg(
  data: PromoPageData,
  replaceTitle: boolean,
): string {
  const title = data.title.trim();
  const titleSize = titleFontSize(title);
  const lines = wrapTitle(title, titleSize);
  const titleY =
    lines.length > 1
      ? LAYOUT.titleBaseY - LAYOUT.titleLineHeight * 0.35
      : LAYOUT.titleBaseY;

  const titleTspans = lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : LAYOUT.titleLineHeight;
      return `<tspan x="${LAYOUT.titleX}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const desc = data.description?.trim();
  const descY = replaceTitle
    ? titleY + (lines.length - 1) * LAYOUT.titleLineHeight + (desc ? 36 : 0)
    : LAYOUT.descY;

  const titleMarkup = replaceTitle
    ? `<text x="${LAYOUT.titleX}" y="${titleY}" fill="${C.forest}" font-size="${titleSize}" font-weight="800" font-family="${FONT}">${titleTspans}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PROMO_IMAGE_SIZE}" height="${PROMO_IMAGE_SIZE}" viewBox="0 0 ${PROMO_IMAGE_SIZE} ${PROMO_IMAGE_SIZE}">
  ${titleMarkup}
  ${
    desc
      ? `<text x="${LAYOUT.titleX}" y="${descY}" fill="${C.green}" font-size="22" font-weight="500" font-family="${FONT}">${escapeXml(desc)}</text>`
      : ""
  }
</svg>`;
}
