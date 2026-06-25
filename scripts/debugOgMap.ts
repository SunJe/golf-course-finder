import fs from "fs";
import path from "path";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";
import { generateGolfMapOgSvg, getSeoAssetsRoot } from "../lib/seo-images/generateGolfMapOgSvg";
import { buildResvgFontOptions } from "../lib/seo-images/ogFontConfig";
import { getProjectRoot } from "./lib/sourceRegistry";

async function px(file: string, x: number, y: number): Promise<string> {
  const b = await sharp(file).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer();
  return [...b].join(",");
}

async function main(): Promise<void> {
  const root = getProjectRoot();
  const svg = generateGolfMapOgSvg({ title: "test" }, getSeoAssetsRoot(root), {
    embedBackground: false,
    projectRoot: root,
  });
  const out = path.join(root, "public/seo-images/collections/_overlay-only.png");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    background: "rgba(0,0,0,0)",
    font: buildResvgFontOptions(root),
  });
  await fs.promises.writeFile(out, resvg.render().asPng());
  for (const [x, y] of [
    [950, 250],
    [900, 300],
    [600, 50],
  ] as const) {
    console.log(`overlay (${x},${y})`, await px(out, x, y));
  }
}

main();
