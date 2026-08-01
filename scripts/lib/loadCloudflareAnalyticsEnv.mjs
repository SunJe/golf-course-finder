import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Load ignored local env for Cloudflare analytics reporting.
 * Never logs secret values.
 */
export function parseDotEnv(contents) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

export const CLOUDFLARE_ANALYTICS_ENV_CANDIDATES = [
  ".env.cloudflare-analytics.local",
  ".env.cloudflare-preview.local",
  ".env.local",
];

export function loadCloudflareAnalyticsEnv(options = {}) {
  const cwd = options.cwd || process.cwd();
  /** @type {Record<string, string>} */
  const loaded = {};
  /** @type {string[]} */
  const sources = [];

  for (const name of CLOUDFLARE_ANALYTICS_ENV_CANDIDATES) {
    const path = resolve(cwd, name);
    if (!existsSync(path)) continue;
    Object.assign(loaded, parseDotEnv(readFileSync(path, "utf8")));
    sources.push(name);
  }

  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }

  return { sources, keysPresent: Object.keys(loaded).sort() };
}

export function requireKeys(keys) {
  return keys.filter((key) => !process.env[key]?.trim());
}
