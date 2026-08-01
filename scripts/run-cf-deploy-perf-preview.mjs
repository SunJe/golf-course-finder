/**
 * Deploy OpenNext build to isolated Preview Worker (no custom domains).
 * Does NOT modify golfmap-korea-preview / Production routes.
 */
import { spawn } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  loadCloudflarePreviewEnv,
  requireKeys,
} from "./loadCloudflarePreviewEnv.mjs";

loadCloudflarePreviewEnv();
process.env.GOLFMAP_DATA_MODE = "production";

const missing = requireKeys([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]);
if (missing.length) {
  console.error(`cf:deploy-perf-preview: missing keys: ${missing.join(", ")}`);
  process.exit(1);
}

const CONFIG = "wrangler.perf-preview.jsonc";
const WORKER = "golfmap-korea-map-opt";

function run(command, args, opts = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      stdio: opts.stdio || "inherit",
      shell: true,
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

function runCapture(command, args) {
  return new Promise((resolvePromise, reject) => {
    let out = "";
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      shell: true,
      env: process.env,
    });
    child.stdout.on("data", (d) => {
      out += d;
      process.stdout.write(d);
    });
    child.stderr.on("data", (d) => {
      out += d;
      process.stderr.write(d);
    });
    child.on("exit", (code) => {
      if (code === 0) resolvePromise(out);
      else reject(new Error(`${command} exited ${code}`));
    });
  });
}

await run("node", ["scripts/run-cf-build.mjs"]);
const deployOut = await runCapture("npx", [
  "opennextjs-cloudflare",
  "deploy",
  "-c",
  CONFIG,
]);

// Sync public secrets needed at runtime (same as Production Dashboard)
const secretKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_MAP_PROVIDER",
  "NEXT_PUBLIC_KAKAO_MAP_APP_KEY",
];

for (const key of secretKeys) {
  const value = process.env[key]?.trim();
  if (!value) {
    console.warn(`skip secret ${key}: missing`);
    continue;
  }
  await new Promise((resolvePromise, reject) => {
    const child = spawn(
      "npx",
      ["wrangler", "secret", "put", key, "-c", CONFIG],
      { stdio: ["pipe", "inherit", "inherit"], shell: true, env: process.env },
    );
    child.stdin.write(value);
    child.stdin.end();
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`secret put ${key} exited ${code}`));
    });
  });
  console.log(`secret synced: ${key}`);
}

const versionMatch = deployOut.match(/Current Version ID:\s*([a-f0-9-]+)/i);
console.log(
  JSON.stringify(
    {
      ok: true,
      worker: WORKER,
      config: CONFIG,
      version: versionMatch?.[1] || null,
      url: `https://${WORKER}.sun15002000.workers.dev`,
      productionUntouched: "golfmap-korea-preview @ be560e3a…",
    },
    null,
    2,
  ),
);
