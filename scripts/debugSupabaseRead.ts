import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/envUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const TABLE = "golf_courses";

function maskProjectRef(url: string): string {
  try {
    const host = new URL(url).hostname;
    const ref = host.split(".")[0] ?? "";
    if (!ref) return "(no ref)";
    if (ref.length <= 6) return `${ref.slice(0, 2)}****`;
    return `${ref.slice(0, 4)}****${ref.slice(-4)}`;
  } catch {
    return "(invalid url)";
  }
}

function hasEnvValue(value: string | undefined): boolean {
  const trimmed = value?.trim();
  return Boolean(trimmed && !trimmed.startsWith("your_"));
}

function printZeroRowDiagnosis(): void {
  console.log("");
  console.log("count = 0 — possible causes:");
  console.log("  - wrong project URL (env points to a different Supabase project)");
  console.log("  - wrong anon key (key from another project or revoked)");
  console.log("  - RLS policy not applied on this project/table");
  console.log("  - table name mismatch (expected: public.golf_courses)");
  console.log("  - data imported to a different schema/table than the client reads");
}

function printError(label: string, error: {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
} | null): void {
  if (!error) return;
  console.log(`${label} error:`);
  console.log(`  code: ${error.code ?? "(none)"}`);
  console.log(`  message: ${error.message ?? "(none)"}`);
  console.log(`  details: ${error.details ?? "(none)"}`);
  if (error.hint) console.log(`  hint: ${error.hint}`);
}

async function main(): Promise<void> {
  const envFile = loadEnvLocal(ROOT);
  const url = envFile.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    envFile.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const urlPresent = hasEnvValue(url);
  const anonKeyPresent = hasEnvValue(anonKey);

  console.log("[debug:supabase-read] Environment");
  console.log(`  NEXT_PUBLIC_SUPABASE_URL present: ${urlPresent}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY present: ${anonKeyPresent}`);

  if (!urlPresent || !anonKeyPresent) {
    console.log("");
    console.log("Missing env in .env.local — cannot create Supabase client.");
    process.exitCode = 1;
    return;
  }

  console.log(`  project ref (masked): ${maskProjectRef(url as string)}`);

  const supabase = createClient(url as string, anonKey as string);

  console.log("");
  console.log("[debug:supabase-read] Count query");
  console.log(`  from: ${TABLE}`);
  console.log('  query: select("*", { count: "exact", head: true })');

  const countResult = await supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true });

  printError("count", countResult.error);
  console.log(`  count: ${countResult.count ?? "(null)"}`);
  console.log(`  status: ${countResult.status}`);
  console.log(`  statusText: ${countResult.statusText}`);

  console.log("");
  console.log("[debug:supabase-read] Sample query");
  console.log('  query: select("id,name,region,latitude,longitude").limit(3)');

  const sampleResult = await supabase
    .from(TABLE)
    .select("id,name,region,latitude,longitude")
    .limit(3);

  printError("sample", sampleResult.error);
  console.log(`  rows returned: ${sampleResult.data?.length ?? 0}`);

  if (sampleResult.data && sampleResult.data.length > 0) {
    console.log("  sample rows:");
    for (const row of sampleResult.data) {
      console.log(
        `    - ${row.id} | ${row.name} | ${row.region} | ${row.latitude}, ${row.longitude}`,
      );
    }
  } else {
    console.log("  sample rows: (none)");
  }

  const count = countResult.count ?? 0;
  const hasError = Boolean(countResult.error || sampleResult.error);

  if (count === 0 && !countResult.error) {
    printZeroRowDiagnosis();
  }

  console.log("");
  console.log("[debug:supabase-read] Summary");
  console.log(`  env URL present: ${urlPresent}`);
  console.log(`  anon key present: ${anonKeyPresent}`);
  console.log(`  count: ${countResult.count ?? "(null)"}`);
  console.log(`  sample rows: ${sampleResult.data?.length ?? 0}`);
  console.log(`  error: ${hasError ? "yes" : "no"}`);

  if (hasError || count === 0) {
    process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error("[debug:supabase-read] Unexpected failure:", err);
  process.exitCode = 1;
});
