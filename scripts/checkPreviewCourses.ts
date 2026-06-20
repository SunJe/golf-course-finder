import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./lib/envUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const PREVIEW_IDS = [
  "gc-fa86c43067e7", // 드림파크CC
  "gc-9b37cfc9caa8", // 뉴스프링빌CC
  "gc-1f14d0ca89b4", // 가산CC
];

async function main(): Promise<void> {
  const env = loadEnvLocal(getProjectRoot());
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Missing Supabase env in .env.local");
    process.exitCode = 1;
    return;
  }

  const supabase = createClient(url, key);
  console.log("=== Supabase live values (preview courses) ===\n");

  for (const id of PREVIEW_IDS) {
    const { data, error } = await supabase
      .from("golf_courses")
      .select("id,name,phone,homepage_url")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.log(`${id}: ERROR ${error.message}`);
      continue;
    }
    if (!data) {
      console.log(`${id}: NOT FOUND`);
      continue;
    }
    console.log(`${data.name} (${id})`);
    console.log(`  phone: ${data.phone ?? "(empty)"}`);
    console.log(`  homepage_url: ${data.homepage_url ?? "(empty)"}`);
    console.log("");
  }
}

main();
