/**
 * Simplified South Korea mainland silhouette (viewBox 0 0 400 620).
 */
export const KOREA_VIEWBOX = { w: 400, h: 620 };

/** Recognizable SK outline: north-west broad, east coast, south taper */
export const KOREA_SILHOUETTE_PATH =
  "M 118 42 C 138 28 162 24 186 30 L 218 38 244 52 262 72 276 96 284 124 288 154 290 186 286 218 278 250 268 282 254 312 236 340 218 366 196 388 172 404 148 416 124 420 102 418 84 408 70 392 58 372 50 348 46 322 44 294 46 266 52 238 62 210 76 182 92 158 108 136 118 42 Z";

export interface KoreaMapPlacement {
  x: number;
  y: number;
  scale: number;
}

/** GolfBox glass-box 위치에 대응 — 중앙~우측 큰 실루엣 */
export function getDefaultKoreaMapPlacement(): KoreaMapPlacement {
  return { x: 480, y: 18, scale: 1.05 };
}

export function koreaMapTransform(
  placement: KoreaMapPlacement = getDefaultKoreaMapPlacement(),
): string {
  const { x, y, scale } = placement;
  return `translate(${x}, ${y}) scale(${scale})`;
}
