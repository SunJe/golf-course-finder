import path from "path";
import sharp from "sharp";
import { getProjectRoot } from "./lib/sourceRegistry";

/**
 * Extract Korea map + icon row from master-sample.png and key backgrounds transparent.
 * Run after updating public/promo-assets/master-sample.png
 */
async function extractAndKey(
  inputBuf: Buffer,
  crop: { left: number; top: number; width: number; height: number },
  out: string,
  mode: "map" | "icons",
): Promise<void> {
  const { data, info } = await sharp(inputBuf)
    .extract(crop)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = new Uint8Array(data);
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    if (mode === "map") {
      const isSky = b > r + 15 && b > g - 5 && lum < 235;
      const isWhite = lum > 175 && sat < 0.45;
      if (isWhite) px[i + 3] = Math.min(255, Math.round((lum - 160) * 4));
      else if (isSky) px[i + 3] = 0;
      else px[i + 3] = lum > 200 ? Math.round(lum - 120) : 0;
    } else {
      const isLine = lum < 120 || (lum > 150 && sat < 0.55);
      if (isLine) px[i + 3] = lum < 120 ? 255 : Math.min(255, Math.round((lum - 100) * 2.5));
      else px[i + 3] = 0;
    }
  }

  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(out);
}

async function main(): Promise<void> {
  const root = getProjectRoot();
  const sample = path.join(root, "public/promo-assets/master-sample.png");
  const outDir = path.join(root, "public/seo-assets");
  const buf = await sharp(sample).toBuffer();

  await extractAndKey(
    buf,
    { left: 818, top: 142, width: 385, height: 215 },
    path.join(outDir, "korea-map-identity.png"),
    "map",
  );
  await extractAndKey(
    buf,
    { left: 95, top: 1012, width: 1010, height: 198 },
    path.join(outDir, "promo-icons-row.png"),
    "icons",
  );

  console.log("Built SEO chrome assets from master-sample.png");
}

main().catch((error) => {
  console.error("[build:seo-chrome-assets] Failed:", error);
  process.exit(1);
});
