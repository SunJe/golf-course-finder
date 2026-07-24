/**
 * Fail-fast before OpenNext/Cloudflare production-mode builds.
 * Fetches golf_courses via Supabase REST (anon) and validates count/IDs.
 * Never prints secret values.
 */
import {
  loadCloudflarePreviewEnv,
  requireKeys,
} from "./loadCloudflarePreviewEnv.mjs";

const MIN_COUNT = 500;
const KNOWN_IDS = ["gc-9d709ff43c33", "gc-437ea8156737"];
const KNOWN_NAME = "인천그랜드";
const FALLBACK_NAMES = [
  "강남 센트럴 골프클럽",
  "경기 광주CC",
  "한강 컨트리클럽",
  "북한산 시티 골프장",
];

const { sources } = loadCloudflarePreviewEnv();
const missing = requireKeys([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
]);

if (process.env.GOLFMAP_DATA_MODE?.trim() !== "production") {
  console.error(
    "assert-production-course-data: GOLFMAP_DATA_MODE must be production",
  );
  process.exit(1);
}

if (missing.length) {
  console.error(
    `assert-production-course-data: missing env keys: ${missing.join(", ")}`,
  );
  console.error(
    "Provide via .env.cloudflare-preview.local (gitignored) or process env. Do not paste values into chat.",
  );
  process.exit(1);
}

const base = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const url = `${base}/rest/v1/golf_courses?select=id,name`;

const response = await fetch(url, {
  headers: {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
  },
});

if (!response.ok) {
  console.error(
    `assert-production-course-data: Supabase HTTP ${response.status}`,
  );
  process.exit(1);
}

const rows = await response.json();
if (!Array.isArray(rows)) {
  console.error("assert-production-course-data: unexpected response shape");
  process.exit(1);
}

const errors = [];
if (rows.length < MIN_COUNT) {
  errors.push(`count ${rows.length} < ${MIN_COUNT}`);
}

const ids = new Set(rows.map((row) => row.id));
for (const id of KNOWN_IDS) {
  if (!ids.has(id)) errors.push(`missing id ${id}`);
}

const names = rows.map((row) => String(row.name || "").trim());
if (!names.some((name) => name.includes(KNOWN_NAME))) {
  errors.push(`missing name marker ${KNOWN_NAME}`);
}

for (const name of FALLBACK_NAMES) {
  if (names.includes(name)) errors.push(`fallback-only name present: ${name}`);
}

console.log(
  JSON.stringify(
    {
      ok: errors.length === 0,
      envSources: sources,
      golfmapDataMode: "production",
      courseCount: rows.length,
      knownIdsPresent: KNOWN_IDS.every((id) => ids.has(id)),
      errors,
    },
    null,
    2,
  ),
);

if (errors.length) process.exit(1);
