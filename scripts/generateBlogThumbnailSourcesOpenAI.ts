/**
 * OpenAI DALL·E 3로 네이티브 정사각형(1024×1024) 블로그 썸네일 source 생성
 *
 * Requires: OPENAI_API_KEY in .env.local
 * Usage: npm run generate:blog-thumbnail-sources
 *
 * 생성 후:
 *   npm run normalize:blog-thumbnails
 *   npm run check:blog-thumbnails
 */
import fs from "node:fs";
import path from "node:path";
import {
  BLOG_THUMBNAIL_PROMPTS,
  CANONICAL_BLOG_THUMBNAIL_FILES,
} from "../lib/blogThumbnailRules";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const SOURCE_DIR = path.join(ROOT, "public/promo-assets/blog/source");
const META_PATH = path.join(SOURCE_DIR, ".generation-meta.json");

function loadEnvLocal(): void {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function generateOne(
  apiKey: string,
  fileName: string,
  prompt: string,
): Promise<{ width: number; height: number }> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body}`);
  }

  const json = (await response.json()) as {
    data: Array<{ b64_json: string }>;
  };
  const b64 = json.data[0]?.b64_json;
  if (!b64) throw new Error(`No image data for ${fileName}`);

  const buffer = Buffer.from(b64, "base64");
  const outPath = path.join(SOURCE_DIR, fileName);
  fs.writeFileSync(outPath, buffer);

  const sharp = (await import("sharp")).default;
  const meta = await sharp(buffer).metadata();
  return { width: meta.width ?? 0, height: meta.height ?? 0 };
}

async function main(): Promise<void> {
  loadEnvLocal();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      "[generate:blog-thumbnail-sources] OPENAI_API_KEY not set in .env.local",
    );
    console.error(
      "  Cursor GenerateImage는 1536×1024만 반환합니다. 네이티브 1024×1024는 DALL·E 3 등 size 파라미터가 있는 API가 필요합니다.",
    );
    process.exit(1);
  }

  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  const meta: Array<{
    fileName: string;
    aiOriginal: string;
    paddedToSquare: false;
    cropUsed: false;
    sourceSaved: string;
    generator: "openai-dall-e-3";
  }> = [];

  console.log("[generate:blog-thumbnail-sources] DALL·E 3 1024×1024…");

  for (const fileName of CANONICAL_BLOG_THUMBNAIL_FILES) {
    const prompt = BLOG_THUMBNAIL_PROMPTS[fileName];
    if (!prompt) {
      console.error(`  FAIL missing prompt for ${fileName}`);
      process.exit(1);
    }

    console.log(`  generating ${fileName}…`);
    const dims = await generateOne(apiKey, fileName, prompt);
    const label = `${dims.width}x${dims.height}`;
    if (dims.width !== dims.height) {
      console.error(`  FAIL ${fileName} — OpenAI returned non-square ${label}`);
      process.exit(1);
    }
    meta.push({
      fileName,
      aiOriginal: label,
      paddedToSquare: false,
      cropUsed: false,
      sourceSaved: label,
      generator: "openai-dall-e-3",
    });
    console.log(`  OK ${fileName} ${label}`);
  }

  fs.writeFileSync(META_PATH, `${JSON.stringify(meta, null, 2)}\n`, "utf8");
  console.log("[generate:blog-thumbnail-sources] Done. Run normalize + check.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
