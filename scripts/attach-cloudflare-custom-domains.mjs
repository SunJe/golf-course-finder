/**
 * Fast path after conflicting Vercel A/CNAME are deleted:
 * attach golfmap.kr + www.golfmap.kr custom domains using existing .open-next build.
 * Does not print secrets.
 */
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
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
  console.error(`attach-domains: missing keys: ${missing.join(", ")}`);
  process.exit(1);
}

if (!existsSync(".open-next/worker.js")) {
  console.error("attach-domains: missing .open-next/worker.js — run cf:deploy build first");
  process.exit(1);
}

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

console.log(
  JSON.stringify(
    {
      phase: "attach-custom-domains",
      hostnames: ["golfmap.kr", "www.golfmap.kr"],
      note: "requires conflicting apex A / www CNAME already deleted",
    },
    null,
    2,
  ),
);

await run("npx", ["wrangler", "deploy", ".open-next/worker.js", "--config", "wrangler.jsonc"]);
console.log("attach-domains: OK");
