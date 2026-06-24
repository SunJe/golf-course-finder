import fs from "fs";
import path from "path";
import { parseCsv, readFileUtf8 } from "./lib/csvUtils";
import { renderGolfMapTitleOg, logTitleFontResolution } from "./lib/golfMapTitleOgRender";
import { getProjectRoot } from "./lib/sourceRegistry";

function resolvePath(root: string, value: string): string {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function parseArgs(argv: string[]): {
  base: string;
  csv: string;
  title?: string;
  out?: string;
  limit: number;
  slug?: string;
} {
  let base = "public/seo-assets/golfmap_og_base_no_title.png";
  let csv = "data/seo-image-titles.csv";
  let title: string | undefined;
  let out: string | undefined;
  let limit = 0;
  let slug: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--base" && argv[i + 1]) {
      base = argv[++i] ?? base;
    } else if (arg === "--csv" && argv[i + 1]) {
      csv = argv[++i] ?? csv;
    } else if (arg === "--title" && argv[i + 1]) {
      title = argv[++i];
    } else if (arg === "--out" && argv[i + 1]) {
      out = argv[++i];
    } else if (arg === "--limit" && argv[i + 1]) {
      limit = Number(argv[++i]) || 0;
    } else if (arg === "--slug" && argv[i + 1]) {
      slug = argv[++i];
    }
  }

  return { base, csv, title, out, limit, slug };
}

async function main(): Promise<void> {
  const root = getProjectRoot();
  const args = parseArgs(process.argv.slice(2));
  const basePath = resolvePath(root, args.base);

  if (!fs.existsSync(basePath)) {
    throw new Error(`Base image not found: ${basePath}`);
  }

  logTitleFontResolution();

  if (args.title && args.out) {
    const outPath = resolvePath(root, args.out);
    await renderGolfMapTitleOg(basePath, args.title, outPath, root, {
      logOutput: true,
    });
    return;
  }

  const csvPath = resolvePath(root, args.csv);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV not found: ${csvPath}`);
  }

  const { headers, rows } = parseCsv(readFileUtf8(csvPath));
  const slugIndex = headers.indexOf("slug");
  const titleIndex = headers.indexOf("title");
  const outputIndex = headers.indexOf("output_path");
  if (titleIndex < 0) {
    throw new Error("CSV must include a title column");
  }

  const slice = args.limit > 0 ? rows.slice(0, args.limit) : rows;
  let written = 0;

  for (let index = 0; index < slice.length; index += 1) {
    const row = slice[index] ?? [];
    const title = (row[titleIndex] ?? "").trim();
    if (!title) {
      const slug = slugIndex >= 0 ? row[slugIndex] : `row-${index + 1}`;
      console.log(`[skip] row ${index + 1}: empty title (slug=${slug})`);
      continue;
    }

    const slug =
      slugIndex >= 0 ? (row[slugIndex] ?? `row-${index + 1}`).trim() : `row-${index + 1}`;
    if (args.slug && slug !== args.slug) {
      continue;
    }

    const outputValue =
      outputIndex >= 0 ? (row[outputIndex] ?? "").trim() : "";
    const outPath = outputValue
      ? resolvePath(root, outputValue)
      : path.join(root, "public/seo-images", `${slug}.png`);

    await renderGolfMapTitleOg(basePath, title, outPath, root, {
      logOutput: written === 0,
    });
    written += 1;
    if (written <= 5 || written % 100 === 0 || written === slice.length) {
      console.log(`[${written}/${slice.length}] ${path.relative(root, outPath)}`);
    }
  }

  console.log(`Done. Generated ${written} image(s) from ${path.relative(root, csvPath)}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
