/**
 * Cloudflare preview build with production data env loaded from ignored files.
 * Never prints secret values.
 */
import { spawn } from "node:child_process";
import {
  loadCloudflarePreviewEnv,
  requireKeys,
} from "./loadCloudflarePreviewEnv.mjs";

const { sources } = loadCloudflarePreviewEnv();
process.env.GOLFMAP_DATA_MODE = "production";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_MAP_PROVIDER",
  "NEXT_PUBLIC_KAKAO_MAP_APP_KEY",
];
const missing = requireKeys(required);
if (missing.length) {
  console.error(
    `cf:build: missing required env keys: ${missing.join(", ")}`,
  );
  console.error(
    "Create .env.cloudflare-preview.local (gitignored) from Vercel/local production public envs. Do not paste values into chat.",
  );
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      phase: "cf:build",
      golfmapDataMode: process.env.GOLFMAP_DATA_MODE,
      envSources: sources,
      requiredKeysPresent: required,
    },
    null,
    2,
  ),
);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
  });
}

await run("node", ["scripts/assert-production-course-data.mjs"]);
await run("npx", ["opennextjs-cloudflare", "build"]);
