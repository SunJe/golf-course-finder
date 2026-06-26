import fs from "fs";
import path from "path";
import {
  BLOG_POSTS,
  HOME_BLOG_SLUGS,
  type BlogPost,
  type BlogPostCategory,
} from "../lib/blogPosts";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const MIN_CHARS = 900;
const REQUIRED_SLUGS = [
  "seoul-beginner-golf-best-5",
  "seoul-budget-golf-best-5",
  "incheon-golf-top-5",
  "gapyeong-golf-best-6",
  "goyang-golf-best-5",
  "seoul-nine-hole-beginner-golf-top-5",
  "seoul-par3-practice-range-top-10",
  "beginner-golf-ball-top-5",
  "pro-tour-driver-brands-men",
  "pro-tour-driver-brands-women",
  "beginner-iron-top-5",
  "beginner-golf-essentials-checklist",
] as const;

const CATEGORY_COUNTS: Record<BlogPostCategory, number> = {
  "course-guide": 0,
  "gear-guide": 0,
  "beginner-guide": 0,
};

const GEAR_SLUGS = new Set([
  "beginner-golf-ball-top-5",
  "pro-tour-driver-brands-men",
  "pro-tour-driver-brands-women",
  "beginner-iron-top-5",
]);

const PRICE_DISCLAIMER = "가격과 재고는 변동될 수 있습니다";

function postCharCount(post: BlogPost): number {
  let total = post.title.length + post.description.length;
  for (const section of post.sections) {
    for (const p of section.body) total += p.length;
    for (const item of section.items ?? []) {
      total += item.title.length + item.description.length;
      for (const reason of item.recommendationReasons ?? []) {
        total += reason.length;
      }
      for (const point of item.cons ?? []) {
        total += point.length;
      }
    }
  }
  return total;
}

function fail(message: string): never {
  console.error(`[check:blog-posts] FAIL: ${message}`);
  process.exit(1);
}

function checkThumbnailExists(thumbnail: string): void {
  const relative = thumbnail.startsWith("/") ? thumbnail.slice(1) : thumbnail;
  const filePath = path.join(ROOT, "public", relative);
  if (!fs.existsSync(filePath)) {
    fail(`Missing thumbnail file: public/${relative}`);
  }
}

function main(): void {
  console.log("[check:blog-posts] Validating blog posts…");

  if (BLOG_POSTS.length !== 12) {
    fail(`Expected 12 posts, got ${BLOG_POSTS.length}`);
  }

  const slugs = new Set(BLOG_POSTS.map((p) => p.slug));
  for (const slug of REQUIRED_SLUGS) {
    if (!slugs.has(slug)) fail(`Missing required slug: ${slug}`);
  }

  for (const post of BLOG_POSTS) {
    CATEGORY_COUNTS[post.category] += 1;

    const chars = postCharCount(post);
    if (chars < MIN_CHARS) {
      fail(`${post.slug}: content too short (${chars} < ${MIN_CHARS})`);
    }

    if (!post.thumbnail.startsWith("/promo-assets/blog/")) {
      fail(`${post.slug}: thumbnail must be under /promo-assets/blog/`);
    }
    checkThumbnailExists(post.thumbnail);

    if (!post.categoryLabel.trim()) {
      fail(`${post.slug}: categoryLabel is required`);
    }

    if (GEAR_SLUGS.has(post.slug)) {
      const text = JSON.stringify(post.sections);
      if (!text.includes(PRICE_DISCLAIMER)) {
        fail(`${post.slug}: gear post must include "${PRICE_DISCLAIMER}"`);
      }
    }
  }

  if (CATEGORY_COUNTS["course-guide"] !== 7) {
    fail(`Expected 7 course-guide posts, got ${CATEGORY_COUNTS["course-guide"]}`);
  }
  if (CATEGORY_COUNTS["gear-guide"] !== 4) {
    fail(`Expected 4 gear-guide posts, got ${CATEGORY_COUNTS["gear-guide"]}`);
  }
  if (CATEGORY_COUNTS["beginner-guide"] !== 1) {
    fail(
      `Expected 1 beginner-guide post, got ${CATEGORY_COUNTS["beginner-guide"]}`,
    );
  }

  for (const slug of HOME_BLOG_SLUGS) {
    if (!slugs.has(slug)) fail(`Home blog slug missing from posts: ${slug}`);
  }

  console.log("[check:blog-posts] OK — 12 posts, categories, thumbnails, content length");
  for (const post of BLOG_POSTS) {
    console.log(`  · ${post.slug} (${postCharCount(post)} chars, ${post.category})`);
  }
}

main();
