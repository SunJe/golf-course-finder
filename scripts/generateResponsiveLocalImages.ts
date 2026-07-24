/**
 * Generate 480/768/1200 WebP derivatives for local promo/home images.
 * Usage: npx tsx scripts/generateResponsiveLocalImages.ts [glob...]
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { RESPONSIVE_WIDTHS } from "../lib/responsiveLocalImage";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const DEFAULT_DIRS = [
  "public/promo-assets/recommended",
  "public/promo-assets/blog/thumbnails",
  "public/seo-assets/courses",
];

async function processFile(filePath: string): Promise<number> {
  const ext = path.extname(filePath).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return 0;

  const base = filePath.slice(0, filePath.length - ext.length);
  let created = 0;
  const input = sharp(filePath).rotate();

  for (const width of RESPONSIVE_WIDTHS) {
    const out = `${base}-${width}w.webp`;
    if (fs.existsSync(out)) continue;
    await input
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(out);
    created += 1;
  }
  return created;
}

async function walk(dir: string, files: string[]): Promise<void> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
      continue;
    }
    if (/-\d+w\.webp$/i.test(entry.name)) continue;
    files.push(full);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const targets =
    args.length > 0
      ? args.map((arg) => path.resolve(ROOT, arg))
      : DEFAULT_DIRS.map((dir) => path.join(ROOT, dir));

  const files: string[] = [];
  for (const target of targets) {
    const stat = fs.existsSync(target) ? fs.statSync(target) : null;
    if (!stat) continue;
    if (stat.isFile()) files.push(target);
    else await walk(target, files);
  }

  let created = 0;
  for (const file of files) {
    created += await processFile(file);
  }
  console.log(
    `[generate:responsive-images] scanned=${files.length} created=${created}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
