import fs from "fs";
import path from "path";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import sharp from "sharp";

const WINDOWS_MALGUN_BD = "C:\\Windows\\Fonts\\malgunbd.ttf";
const CANVAS_FONT_FAMILY = "Malgun Gothic";
const TITLE_COLOR = "#024136";
const MAX_WIDTH = 760;
const TEXT_X = 75;

let fontRegistered = false;

export type TitleFontResolution = {
  fontPath: string;
  fontExists: boolean;
  fontFamilyRequested: string;
  renderer: string;
};

export function resolveTitleFontPath(): string {
  if (fs.existsSync(WINDOWS_MALGUN_BD)) {
    return WINDOWS_MALGUN_BD;
  }

  throw new Error(
    `[seo-title-og] Title font not found: ${WINDOWS_MALGUN_BD}\n` +
      "Malgun Gothic Bold (malgunbd.ttf) is required for title rendering.",
  );
}

function ensureTitleFontRegistered(fontPath: string): void {
  if (fontRegistered) return;
  GlobalFonts.registerFromPath(fontPath, CANVAS_FONT_FAMILY);
  fontRegistered = true;
}

export function getTitleFontResolution(): TitleFontResolution {
  const fontPath = resolveTitleFontPath();
  return {
    fontPath,
    fontExists: fs.existsSync(fontPath),
    fontFamilyRequested: CANVAS_FONT_FAMILY,
    renderer: "canvas+malgunbd.ttf",
  };
}

export function logTitleFontResolution(): void {
  const info = getTitleFontResolution();
  console.log("[seo-title-og] renderer: tsx");
  console.log(`[seo-title-og] text engine: @napi-rs/canvas (direct TTF)`);
  console.log(`[seo-title-og] title font path: ${info.fontPath}`);
  console.log(`[seo-title-og] title font exists: ${info.fontExists}`);
  console.log(
    `[seo-title-og] title font family requested: ${info.fontFamilyRequested}`,
  );
}

function createTextContext(fontPath: string, fontSize: number) {
  ensureTitleFontRegistered(fontPath);
  const canvas = createCanvas(1200, 1200);
  const ctx = canvas.getContext("2d");
  ctx.font = `bold ${fontSize}px "${CANVAS_FONT_FAMILY}"`;
  ctx.textBaseline = "top";
  return ctx;
}

function measureTextWidth(text: string, fontPath: string, fontSize: number): number {
  const ctx = createTextContext(fontPath, fontSize);
  return ctx.measureText(text).width;
}

export function splitBalancedTwoLines(
  title: string,
  fontSize: number,
  fontPath: string,
): [string, string] {
  const words = title.trim().split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    let bestSplit = 1;
    let bestDiff = Number.POSITIVE_INFINITY;

    for (let i = 1; i < words.length; i += 1) {
      const line1 = words.slice(0, i).join(" ");
      const line2 = words.slice(i).join(" ");
      const diff = Math.abs(
        measureTextWidth(line1, fontPath, fontSize) -
          measureTextWidth(line2, fontPath, fontSize),
      );
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSplit = i;
      }
    }

    return [words.slice(0, bestSplit).join(" "), words.slice(bestSplit).join(" ")];
  }

  const text = title.trim();
  let bestSplit = Math.max(1, Math.floor(text.length / 2));
  let bestDiff = Number.POSITIVE_INFINITY;

  for (let i = 1; i < text.length; i += 1) {
    const line1 = text.slice(0, i);
    const line2 = text.slice(i);
    const diff = Math.abs(
      measureTextWidth(line1, fontPath, fontSize) -
        measureTextWidth(line2, fontPath, fontSize),
    );
    if (diff < bestDiff) {
      bestDiff = diff;
      bestSplit = i;
    }
  }

  return [text.slice(0, bestSplit), text.slice(bestSplit)];
}

export function fitTitleLines(
  title: string,
  fontPath: string,
  maxWidth = MAX_WIDTH,
  start = 126,
  minSize = 74,
): { fontSize: number; lines: string[] } {
  for (let size = start; size >= minSize; size -= 2) {
    if (measureTextWidth(title, fontPath, size) <= maxWidth) {
      return { fontSize: size, lines: [title] };
    }
  }

  for (let size = 96; size >= 62; size -= 2) {
    const [line1, line2] = splitBalancedTwoLines(title, size, fontPath);
    const widths = [line1, line2].map((line) =>
      measureTextWidth(line, fontPath, size),
    );
    if (Math.max(...widths) <= maxWidth) {
      return { fontSize: size, lines: [line1, line2] };
    }
  }

  const [line1, line2] = splitBalancedTwoLines(title, 64, fontPath);
  return { fontSize: 64, lines: [line1, line2] };
}

function renderTitleOverlay(
  lines: string[],
  fontSize: number,
  fontPath: string,
): Buffer {
  ensureTitleFontRegistered(fontPath);
  const canvas = createCanvas(1200, 1200);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, 1200, 1200);
  ctx.font = `bold ${fontSize}px "${CANVAS_FONT_FAMILY}"`;
  ctx.fillStyle = TITLE_COLOR;
  ctx.textBaseline = "top";

  if (lines.length === 1) {
    const y = 768 - Math.max(0, fontSize - 118) * 0.25;
    ctx.fillText(lines[0] ?? "", TEXT_X, y);
  } else {
    let y = 730;
    for (const line of lines) {
      ctx.fillText(line, TEXT_X, y);
      y += fontSize + 4;
    }
  }

  return canvas.toBuffer("image/png");
}

export async function renderGolfMapTitleOg(
  basePath: string,
  title: string,
  outPath: string,
  projectRoot: string,
  options?: { logOutput?: boolean },
): Promise<void> {
  const fontPath = resolveTitleFontPath();
  const { fontSize, lines } = fitTitleLines(title, fontPath);
  const overlay = renderTitleOverlay(lines, fontSize, fontPath);

  const composed = await sharp(basePath)
    .ensureAlpha()
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, composed);

  if (options?.logOutput) {
    console.log(`[seo-title-og] output: ${path.relative(projectRoot, outPath)}`);
    console.log(
      `[seo-title-og] canvas font-family: ${CANVAS_FONT_FAMILY} (bold, malgunbd.ttf)`,
    );
  }
}

export function getSvgTitleFontFamily(): string {
  return CANVAS_FONT_FAMILY;
}
