import fs from "fs";
import path from "path";
import { buildAllCollectionPromoData, loadPromoPagesFromJson } from "../lib/og/promoPageData";
import type { PromoPageData } from "../lib/og/promoTypes";
import { PROMO_IMAGE_SIZE } from "../lib/og/promoTypes";
import { getProjectRoot } from "./lib/sourceRegistry";
import { renderGolfMapPromoPng } from "./lib/promo/renderGolfMapPromo";
import { renderPromoFromMasterPng } from "./lib/promo/renderPromoFromMaster";
import { renderPromoFromSamplePng } from "./lib/promo/renderPromoFromSample";

const ROOT = getProjectRoot();
const DEFAULT_OUTPUT = path.join(ROOT, "public/promo-images/collections");
const DEFAULT_DATA_JSON = path.join(ROOT, "data/promo/pages.json");

type RenderMode = "sample" | "master" | "svg";

const SAMPLE_SLUGS = [
  "baekdori",
  "beginner",
  "budget",
  "nine-hole",
  "par3",
  "public",
  "near-seoul",
] as const;

function parseArgs(argv: string[]): {
  outputDir: string;
  dataFile: string;
  slugs: string[];
  all: boolean;
  mode: RenderMode;
} {
  let outputDir = DEFAULT_OUTPUT;
  let dataFile = "";
  let all = false;
  let mode: RenderMode = "sample";
  const slugs: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => argv[++i] ?? "";
    if (arg === "--output") outputDir = path.isAbsolute(next()) ? next() : path.join(ROOT, next());
    else if (arg === "--data") dataFile = path.isAbsolute(next()) ? next() : path.join(ROOT, next());
    else if (arg === "--slug") slugs.push(next());
    else if (arg === "--all") all = true;
    else if (arg === "--sample") slugs.push(...SAMPLE_SLUGS);
    else if (arg === "--mode") {
      const value = next();
      if (value === "sample" || value === "master" || value === "svg") mode = value;
      else throw new Error("--mode must be sample, master or svg");
    }
  }

  return { outputDir, dataFile, slugs, all, mode };
}

function resolvePages(options: ReturnType<typeof parseArgs>): PromoPageData[] {
  if (options.dataFile && fs.existsSync(options.dataFile)) {
    return loadPromoPagesFromJson(options.dataFile);
  }
  if (fs.existsSync(DEFAULT_DATA_JSON)) {
    return loadPromoPagesFromJson(DEFAULT_DATA_JSON);
  }

  const all = buildAllCollectionPromoData();
  if (options.all) return all;
  if (options.slugs.length > 0) {
    const set = new Set(options.slugs);
    return all.filter((page) => set.has(page.slug));
  }
  return all.filter((page) =>
    (SAMPLE_SLUGS as readonly string[]).includes(page.slug),
  );
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const pages = resolvePages(options);

  if (pages.length === 0) {
    console.error("No promo pages to generate.");
    process.exit(1);
  }

  fs.mkdirSync(options.outputDir, { recursive: true });

  console.log(`mode: ${options.mode} (1:1 ${PROMO_IMAGE_SIZE}x${PROMO_IMAGE_SIZE})`);

  for (const page of pages) {
    const out = path.join(options.outputDir, `${page.slug}.png`);
    if (options.mode === "sample") {
      await renderPromoFromSamplePng(page, out, ROOT);
    } else if (options.mode === "master") {
      await renderPromoFromMasterPng(page, out, ROOT);
    } else {
      await renderGolfMapPromoPng(page, out, ROOT);
    }
    const { size } = fs.statSync(out);
    const meta = await import("sharp").then((m) => m.default(out).metadata());
    console.log(
      `OK ${page.slug} → ${out} (${meta.width}x${meta.height}, ${(size / 1024).toFixed(1)} KB)`,
    );
  }

  console.log(`\nGenerated ${pages.length} promo image(s) at ${PROMO_IMAGE_SIZE}x${PROMO_IMAGE_SIZE}`);
  console.log(`Output: ${options.outputDir}`);
}

main().catch((error) => {
  console.error("[generate:promo-images] Failed:", error);
  process.exit(1);
});
