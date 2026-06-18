import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

type EnvMap = Record<string, string>;

function parseDotEnv(contents: string): EnvMap {
  const out: EnvMap = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    // strip wrapping quotes (basic)
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key) out[key] = value;
  }
  return out;
}

function hasNonEmpty(env: EnvMap, key: string): boolean {
  const v = env[key];
  return typeof v === "string" && v.trim().length > 0;
}

function line(key: string, ok: boolean, note?: string) {
  const status = ok ? "OK" : "MISSING";
  const suffix = note ? ` (${note})` : "";
  // never print values
  console.log(`${key}: ${status}${suffix}`);
}

const REQUIRED_PUBLIC_ENVS = [
  "NEXT_PUBLIC_MAP_PROVIDER",
  "NEXT_PUBLIC_KAKAO_MAP_APP_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function main() {
  const envLocalPath = resolve(process.cwd(), ".env.local");
  const fileEnv: EnvMap = existsSync(envLocalPath)
    ? parseDotEnv(readFileSync(envLocalPath, "utf8"))
    : {};

  // prefer real runtime env, fallback to .env.local
  const combined: EnvMap = { ...fileEnv, ...process.env } as EnvMap;

  let missing = 0;
  for (const key of REQUIRED_PUBLIC_ENVS) {
    const ok = hasNonEmpty(combined, key);
    line(key, ok);
    if (!ok) missing += 1;
  }

  // informational (local-only)
  const kakaoRestLocalOnly = hasNonEmpty(combined, "KAKAO_REST_API_KEY");
  console.log(
    `KAKAO_REST_API_KEY: ${kakaoRestLocalOnly ? "OK" : "NOT SET"} (local only, not required for deployment)`,
  );
  console.log("SUPABASE_SERVICE_ROLE_KEY: DO NOT SET (never for Vercel)");

  if (!existsSync(envLocalPath)) {
    console.log(".env.local: NOT FOUND (this is fine on Vercel)");
  }

  if (missing > 0) {
    console.log(`\nMissing required public env(s): ${missing}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll required public envs: OK");
  }
}

main();

