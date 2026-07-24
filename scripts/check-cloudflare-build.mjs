import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, ".open-next", "worker.js");
const assetsPath = path.join(root, ".open-next", "assets");

const maxAssets = 20_000;
const maxAssetBytes = 25 * 1024 * 1024;
const rawWorkerGuide = 3 * 1024 * 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(current));
    if (entry.isFile()) result.push(current);
  }
  return result;
}

async function main() {
  const worker = await stat(workerPath).catch(() => null);
  if (!worker) throw new Error(`Missing ${workerPath}`);

  const assetsDir = await stat(assetsPath).catch(() => null);
  if (!assetsDir?.isDirectory()) throw new Error(`Missing ${assetsPath}`);

  const files = await walk(assetsPath);
  let largest = { path: "", bytes: 0 };

  for (const file of files) {
    const info = await stat(file);
    if (info.size > largest.bytes) {
      largest = { path: path.relative(root, file), bytes: info.size };
    }
    if (info.size > maxAssetBytes) {
      throw new Error(`Asset exceeds 25 MiB: ${file}`);
    }
  }

  if (files.length >= maxAssets) {
    throw new Error(`Asset count must be below ${maxAssets}: ${files.length}`);
  }

  console.log(JSON.stringify({
    workerRawBytes: worker.size,
    workerRawWarning:
      worker.size > rawWorkerGuide
        ? "Raw worker.js exceeds 3 MiB; verify Wrangler final upload size."
        : null,
    staticAssetCount: files.length,
    largestAsset: largest
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

