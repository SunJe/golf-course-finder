import path from "path";
import sharp from "sharp";
import { getProjectRoot } from "./lib/sourceRegistry";

async function px(file: string, x: number, y: number): Promise<number[]> {
  const buf = await sharp(file).extract({ left: x, top: y, width: 1, height: 1 }).raw().toBuffer();
  return [...buf];
}

async function main(): Promise<void> {
  const root = getProjectRoot();
  const dir = path.join(root, "public/seo-images/collections");
  const points = [
    [100, 100],
    [500, 50],
    [600, 300],
    [400, 400],
    [900, 50],
    [600, 800],
    [170, 1065],
  ] as const;

  for (const [x, y] of points) {
    const overlay = await px(path.join(dir, "_overlay-resvg.png"), x, y);
    const final = await px(path.join(dir, "baekdori.png"), x, y);
    console.log(`(${x},${y}) overlay=${overlay.join(",")} final=${final.join(",")}`);
  }
}

main();
