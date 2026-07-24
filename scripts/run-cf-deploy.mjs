/**
 * Deploy OpenNext worker after production-data build.
 * Relies on keep_vars + dashboard/local vars; does not print secrets.
 */
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
  console.error(`cf:deploy: missing keys: ${missing.join(", ")}`);
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

await run("node", ["scripts/run-cf-build.mjs"]);
await run("npx", ["opennextjs-cloudflare", "deploy"]);
