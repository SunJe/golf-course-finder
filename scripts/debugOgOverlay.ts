import path from "path";
import sharp from "sharp";
import { generateGolfMapOgSvg, getSeoAssetsRoot } from "../lib/seo-images/generateGolfMapOgSvg";
import { getProjectRoot } from "./lib/sourceRegistry";

async function main(): Promise<void> {
  const root = getProjectRoot();
  const svg = generateGolfMapOgSvg(
    { title: "백돌이 골프장" },
    getSeoAssetsRoot(root),
    { embedBackground: false },
  );
  const out = path.join(root, "public/seo-images/collections/_overlay-debug.png");
  await sharp(Buffer.from(svg, "utf-8"), { density: 144 }).resize(1200, 1200).png().toFile(out);
  const meta = await sharp(out).stats();
  console.log("overlay written", out);
  console.log("channels", meta.channels.map((c) => ({ mean: c.mean, min: c.min, max: c.max })));
}

main();
