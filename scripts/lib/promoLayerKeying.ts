import sharp from "sharp";

export type LayerKeyMode =
  | "none"
  | "floodGray"
  | "whiteOnGray"
  | "keepColor";

function lum(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function chromaSpread(r: number, g: number, b: number): number {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function isBackgroundGray(r: number, g: number, b: number): boolean {
  const spread = chromaSpread(r, g, b);
  const l = lum(r, g, b);
  return spread < 16 && l > 198;
}

function isBrightLine(r: number, g: number, b: number): boolean {
  const spread = chromaSpread(r, g, b);
  const l = lum(r, g, b);
  return l > 245 || (l > 238 && spread < 8);
}

function hasColorOrDark(r: number, g: number, b: number): boolean {
  const spread = chromaSpread(r, g, b);
  const l = lum(r, g, b);
  return l < 195 || spread >= 16;
}

function floodGrayAlpha(data: Uint8Array, width: number, height: number): Uint8Array {
  const alpha = new Uint8Array(width * height);
  alpha.fill(255);

  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const trySeed = (x: number, y: number) => {
    const idx = y * width + x;
    const i = idx * 4;
    if (!isBackgroundGray(data[i], data[i + 1], data[i + 2])) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x += 1) {
    trySeed(x, 0);
    trySeed(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    trySeed(0, y);
    trySeed(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop()!;
    const x = idx % width;
    const y = (idx - x) / width;
    alpha[idx] = 0;

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const nIdx = ny * width + nx;
      if (visited[nIdx]) continue;
      const i = nIdx * 4;
      if (!isBackgroundGray(data[i], data[i + 1], data[i + 2])) continue;
      visited[nIdx] = 1;
      queue.push(nIdx);
    }
  }

  return alpha;
}

function alphaForPixel(r: number, g: number, b: number, mode: LayerKeyMode, flood: Uint8Array, idx: number): number {
  if (mode === "none") return 255;
  if (mode === "whiteOnGray") {
    if (isBrightLine(r, g, b)) {
      const l = lum(r, g, b);
      return l > 248 ? 255 : Math.min(255, Math.round((l - 235) * 14));
    }
    return 0;
  }
  if (mode === "keepColor") {
    if (hasColorOrDark(r, g, b)) return 255;
    return 0;
  }
  // floodGray
  if (flood[idx] === 0 || isBackgroundGray(r, g, b)) return 0;
  return 255;
}

export async function removeLayerBackground(
  inputPath: string,
  mode: LayerKeyMode,
): Promise<Buffer> {
  if (mode === "none") {
    return sharp(inputPath).ensureAlpha().png().toBuffer();
  }

  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = new Uint8Array(data);
  const flood = floodGrayAlpha(px, info.width, info.height);

  for (let idx = 0; idx < info.width * info.height; idx += 1) {
    const i = idx * 4;
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    px[i + 3] = alphaForPixel(r, g, b, mode, flood, idx);
  }

  return sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}
