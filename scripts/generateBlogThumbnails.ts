/**
 * 블로그 썸네일 placeholder 생성 (1:1 PNG)
 * Usage: npx tsx scripts/generateBlogThumbnails.ts
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { BLOG_POSTS } from "../lib/blogPosts";
import {
  BLOG_THUMBNAIL_DEFAULT,
  BLOG_THUMBNAIL_FILE_BY_SLUG,
  BLOG_THUMBNAIL_SIZE,
} from "../lib/blogThumbnailRules";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const OUTPUT_DIR = path.join(ROOT, "public/promo-assets/blog");

const GRADIENTS: Record<string, [string, string]> = {
  "course-guide": ["#d1fae5", "#ecfdf5"],
  "gear-guide": ["#fef3c7", "#fffbeb"],
  "beginner-guide": ["#e0e7ff", "#eef2ff"],
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLabel(text: string, max = 14): string[] {
  if (text.length <= max) return [text];
  const mid = Math.ceil(text.length / 2);
  let split = mid;
  for (let i = mid; i < text.length; i += 1) {
    if (text[i] === " ") {
      split = i;
      break;
    }
  }
  return [text.slice(0, split).trim(), text.slice(split).trim()].filter(Boolean);
}

async function renderThumbnail(
  slug: string,
  label: string,
  category: keyof typeof GRADIENTS,
  outPath: string,
): Promise<void> {
  const [c1, c2] = GRADIENTS[category];
  const lines = wrapLabel(label);
  const lineEls = lines
    .map(
      (line, i) =>
        `<tspan x="600" dy="${i === 0 ? 0 : 52}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  const svg = `<svg width="${BLOG_THUMBNAIL_SIZE}" height="${BLOG_THUMBNAIL_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="980" cy="220" r="180" fill="white" opacity="0.35"/>
  <circle cx="200" cy="1000" r="140" fill="white" opacity="0.25"/>
  <text x="600" y="${lines.length > 1 ? 520 : 560}" text-anchor="middle" font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif" font-size="44" font-weight="700" fill="#1c1917">
    ${lineEls}
  </text>
  <text x="600" y="680" text-anchor="middle" font-family="Malgun Gothic, sans-serif" font-size="28" fill="#57534e">GolfMap Korea</text>
</svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const post of BLOG_POSTS) {
    const fileName = BLOG_THUMBNAIL_FILE_BY_SLUG[post.slug];
    if (!fileName) {
      throw new Error(`No thumbnail file mapping for slug: ${post.slug}`);
    }
    const out = path.join(OUTPUT_DIR, fileName);
    await renderThumbnail(post.slug, post.categoryLabel, post.category, out);
    console.log(`OK ${fileName}`);
  }

  const defaultOut = path.join(ROOT, `public${BLOG_THUMBNAIL_DEFAULT}`);
  await renderThumbnail("default", "블로그", "beginner-guide", defaultOut);
  console.log(`OK default → ${defaultOut}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
