/**
 * Push required public Worker vars from ignored local env without printing values.
 * Uses wrangler secret bulk for encrypted storage of public keys that must exist
 * at runtime if Next did not inline them. GOLFMAP_DATA_MODE stays in wrangler vars.
 *
 * Note: NEXT_PUBLIC_* are not confidential; encrypted Worker secrets still avoid
 * committing values to git. Prefer Dashboard + keep_vars as source of truth after first sync.
 */
import { spawn } from "node:child_process";
import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  loadCloudflarePreviewEnv,
  requireKeys,
} from "./loadCloudflarePreviewEnv.mjs";

loadCloudflarePreviewEnv();
process.env.GOLFMAP_DATA_MODE = "production";

const keys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_MAP_PROVIDER",
  "NEXT_PUBLIC_KAKAO_MAP_APP_KEY",
];
const missing = requireKeys(keys);
if (missing.length) {
  console.error(`sync-cf-preview-vars: missing ${missing.join(", ")}`);
  process.exit(1);
}

const payload = {};
for (const key of keys) payload[key] = process.env[key];

const tmp = resolve(process.cwd(), `.wrangler-secrets-sync.${process.pid}.json`);
writeFileSync(tmp, JSON.stringify(payload));

console.log(
  JSON.stringify(
    {
      phase: "sync-cf-preview-vars",
      keys: keys,
      method: "wrangler secret bulk",
      note: "values not printed",
    },
    null,
    2,
  ),
);

try {
  await new Promise((resolvePromise, reject) => {
    const child = spawn(
      "npx",
      ["wrangler", "secret", "bulk", tmp, "--name", "golfmap-korea-preview"],
      { stdio: ["ignore", "inherit", "inherit"], shell: true, env: process.env },
    );
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`wrangler secret bulk exited ${code}`));
    });
  });
} finally {
  if (existsSync(tmp)) unlinkSync(tmp);
}

console.log("sync-cf-preview-vars: OK");
