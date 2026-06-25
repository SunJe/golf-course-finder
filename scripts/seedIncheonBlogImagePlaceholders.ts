/**
 * Visit Korea 이미지 수집 전 임시 placeholder (동일 썸네일 리사이즈)
 * Usage: npx tsx scripts/seedIncheonBlogImagePlaceholders.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const OUT_DIR = path.join(ROOT, "public/promo-assets/blog/incheon");
const SOURCE = path.join(ROOT, "public/promo-assets/blog/incheon-golf-top5.png");

const FILES = [
  "incheon-grand.jpg",
  "dream-park.jpg",
  "bears-best-cheongna.jpg",
  "songdo.jpg",
  "orange-dunes-yeongjong.jpg",
  "jack-nicklaus.jpg",
] as const;

async function main(): Promise<void> {
  if (!fs.existsSync(SOURCE)) {
    throw new Error("Missing incheon-golf-top5.png thumbnail");
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const file of FILES) {
    await sharp(SOURCE)
      .resize(1200, 800, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toFile(path.join(OUT_DIR, file));
    console.log(`  ${file}`);
  }
  console.log("[seed] Placeholder images ready — replace via fetch:visit-korea-incheon-golf");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
