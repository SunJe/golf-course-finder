/**
 * Static audit of blog content image references.
 * Fails when blog HTML would still route content images through /_next/image,
 * or when local /promo-assets paths are missing from the repo.
 *
 * Usage: node scripts/auditRenderedBlogImages.mjs
 * Optional: AUDIT_BLOG_IMAGES_HTTP=1 to HEAD-check local public URLs on Production.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

const CONTENT_IMAGE_SRC_RE =
  /(?:src|href)=["']([^"']*promo-assets\/blog[^"']+)["']/g;
const NEXT_IMAGE_CONTENT_RE =
  /_next\/image\?[^"'>\s]*promo-assets(?:%2F|\/)blog/gi;
const BAD_SRC_RE = /(?:src)=["'](undefined|null|)["']/g;

function walk(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filter, out);
    else if (filter(full)) out.push(full);
  }
  return out;
}

function collectFromSourceFiles() {
  const files = [
    ...walk(path.join(root, "lib"), (f) => f.endsWith("blogPosts.ts")),
    ...walk(path.join(root, "data"), (f) =>
      f.endsWith("tourapi-course-images.json"),
    ),
    ...walk(path.join(root, "public", "promo-assets", "blog"), (f) =>
      f.endsWith("visit-korea-meta.json"),
    ),
  ];

  const localPaths = new Set();
  const remoteUrls = new Set();

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const re =
      /["'`](\/promo-assets\/blog\/[^"'`]+)["'`]|["'`](https?:\/\/[^"'`]+)["'`]/g;
    let match;
    while ((match = re.exec(text))) {
      const local = match[1];
      const remote = match[2];
      if (local && !local.includes("${")) localPaths.add(local);
      if (
        remote &&
        (remote.includes("visitkorea") || remote.includes("knto.or.kr"))
      ) {
        remoteUrls.add(remote);
      }
    }
  }

  return { localPaths, remoteUrls };
}

function checkLocalFiles(localPaths) {
  const missing = [];
  for (const src of localPaths) {
    const filePath = path.join(publicDir, src.replace(/^\//, ""));
    if (!fs.existsSync(filePath)) missing.push(src);
  }
  return missing;
}

function checkBuiltHtml() {
  const blogHtmlDir = path.join(root, ".next", "server", "app", "blog");
  const errors = [];
  const warnings = [];
  const seen = new Map();

  if (!fs.existsSync(blogHtmlDir)) {
    warnings.push(
      "No .next/server/app/blog HTML found — run `npm run build` before full HTML audit.",
    );
    return { errors, warnings };
  }

  const htmlFiles = walk(blogHtmlDir, (f) => f.endsWith(".html"));
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const rel = path.relative(root, file);

    if (NEXT_IMAGE_CONTENT_RE.test(html)) {
      errors.push(`${rel}: blog content image still uses /_next/image`);
    }
    NEXT_IMAGE_CONTENT_RE.lastIndex = 0;

    let match;
    while ((match = CONTENT_IMAGE_SRC_RE.exec(html))) {
      const src = match[1].replace(/&amp;/g, "&");
      if (src.includes("/_next/image")) {
        errors.push(`${rel}: content src is optimizer URL (${src})`);
      }
      seen.set(src, (seen.get(src) ?? 0) + 1);
      if (src.startsWith("/promo-assets/")) {
        const filePath = path.join(publicDir, src.replace(/^\//, "").split("?")[0]);
        if (!fs.existsSync(filePath)) {
          errors.push(`${rel}: missing local file ${src}`);
        }
      }
    }
    CONTENT_IMAGE_SRC_RE.lastIndex = 0;

    if (BAD_SRC_RE.test(html)) {
      // only flag empty/undefined content image contexts loosely
    }
    BAD_SRC_RE.lastIndex = 0;
  }

  return { errors, warnings, seen };
}

async function optionalHttpCheck(localPaths) {
  if (process.env.AUDIT_BLOG_IMAGES_HTTP !== "1") return [];
  const base = process.env.AUDIT_BLOG_IMAGES_BASE || "https://golfmap.kr";
  const failures = [];
  for (const src of localPaths) {
    if (!src.startsWith("/promo-assets/blog/")) continue;
    try {
      const res = await fetch(`${base}${src}`, { method: "GET", redirect: "follow" });
      if (!res.ok) failures.push(`${src} -> HTTP ${res.status}`);
    } catch (err) {
      failures.push(`${src} -> ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return failures;
}

async function main() {
  console.log("[audit:blog-images] Scanning blog content image references…");
  const { localPaths, remoteUrls } = collectFromSourceFiles();
  const missing = checkLocalFiles(localPaths);
  const { errors, warnings } = checkBuiltHtml();
  const httpFailures = await optionalHttpCheck(localPaths);

  console.log(
    `[audit:blog-images] local refs=${localPaths.size} remote tourism refs=${remoteUrls.size}`,
  );

  for (const w of warnings) console.warn(`[warning] ${w}`);
  for (const m of missing) errors.push(`missing local file: ${m}`);
  for (const h of httpFailures) errors.push(`HTTP check failed: ${h}`);

  if (errors.length > 0) {
    console.error(`[audit:blog-images] FAIL — ${errors.length} error(s)`);
    for (const e of errors) console.error(`  · ${e}`);
    process.exit(1);
  }

  console.log("[audit:blog-images] OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
