import fs from "fs";
import path from "path";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import {
  generateGolfMapOgSvg,
  getSeoAssetsRoot,
  GOLFMAP_OG_HEIGHT,
  GOLFMAP_OG_WIDTH,
} from "../lib/seo-images/generateGolfMapOgSvg";
import { getProjectRoot } from "./lib/sourceRegistry";
import { resolveBackgroundPath, getBackgroundsRoot } from "./lib/seoImageComposite";

async function main(): Promise<void> {
  const root = getProjectRoot();
  const bgPath = resolveBackgroundPath("collections", "baekdori", getBackgroundsRoot(root));
  const assetsRoot = getSeoAssetsRoot(root);
  const outDir = path.join(root, "public/seo-images/collections");

  const overlaySvg = generateGolfMapOgSvg({ title: "백돌이 골프장" }, assetsRoot, {
    embedBackground: false,
  });

  const resvgOverlay = new Resvg(overlaySvg, {
    fitTo: { mode: "width", value: GOLFMAP_OG_WIDTH },
    font: { loadSystemFonts: true },
  });
  const overlayPng = resvgOverlay.render().asPng();
  await fs.promises.writeFile(path.join(outDir, "_overlay-resvg.png"), overlayPng);

  const overlayStats = await sharp(overlayPng).stats();
  console.log("resvg overlay alpha", overlayStats.channels[3]);

  const bgBuffer = await sharp(bgPath!)
    .resize(GOLFMAP_OG_WIDTH, GOLFMAP_OG_HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90 })
    .toBuffer();

  await sharp(bgBuffer)
    .composite([{ input: overlayPng, top: 0, left: 0, blend: "over" }])
    .png()
    .toFile(path.join(outDir, "_baekdori-resvg-test.png"));

  console.log("wrote _overlay-resvg.png and _baekdori-resvg-test.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
