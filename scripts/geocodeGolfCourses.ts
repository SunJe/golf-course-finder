import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import { checkGeocodingEnvKeys, getGeocodingProvider, loadEnvLocal } from "./lib/envUtils";
import {
  AMBIGUOUS_GEOCODING_HEADERS,
  GEOCODING_FAILURES_HEADERS,
  GEOCODING_REQUEST_DELAY_MS,
  GEOCODING_RESULTS_HEADERS,
  GeocodingCache,
  GeocodingInputRow,
  GEOCODING_MAX_RETRIES,
  loadGeocodingCache,
  saveGeocodingCache,
  isValidWgs84Coordinate,
} from "./lib/geocodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const GEOCODING_DIR = path.join(ROOT, "data/geocoding");
const INPUT_PATH = path.join(GEOCODING_DIR, "geocoding_input.csv");
const RESULTS_PATH = path.join(GEOCODING_DIR, "geocoding_results.csv");
const FAILURES_PATH = path.join(GEOCODING_DIR, "geocoding_failures.csv");
const AMBIGUOUS_PATH = path.join(GEOCODING_DIR, "ambiguous_geocoding.csv");
const CACHE_PATH = path.join(GEOCODING_DIR, "geocoding_cache.json");
const GEOCODED_IMPORT_PATH = path.join(ROOT, "data/golf_courses_import_geocoded.csv");

interface GeocodeApiResult {
  latitude: number;
  longitude: number;
  confidence: "high" | "medium" | "low";
  candidateCount: number;
  candidates?: Array<{ latitude: number; longitude: number; address: string }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadInputRows(): GeocodingInputRow[] {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(
      "geocoding_input.csv not found. Run: npm run prepare:phase25-review",
    );
  }

  const { headers, rows } = parseCsv(readFileUtf8(INPUT_PATH));
  const index = (name: string): number => headers.indexOf(name);

  return rows.map((values) => ({
    id: values[index("id")] ?? "",
    name: values[index("name")] ?? "",
    region: values[index("region")] ?? "",
    city: values[index("city")] ?? "",
    address: values[index("address")] ?? "",
    query: values[index("query")] ?? "",
    source: values[index("source")] ?? "",
  }));
}

function loadExistingFailures(): string[][] {
  if (!fs.existsSync(FAILURES_PATH)) return [];
  const { headers, rows } = parseCsv(readFileUtf8(FAILURES_PATH));
  if (headers[0] !== "id") return [];
  return rows;
}

async function geocodeWithKakao(
  query: string,
  apiKey: string,
): Promise<GeocodeApiResult | null> {
  const url = new URL("https://dapi.kakao.com/v2/local/search/address.json");
  url.searchParams.set("query", query);

  const response = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`Kakao API HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    documents?: Array<{ x: string; y: string; address_name?: string }>;
  };

  const documents = data.documents ?? [];
  if (documents.length === 0) return null;

  const candidates = documents.map((doc) => ({
    longitude: Number(doc.x),
    latitude: Number(doc.y),
    address: doc.address_name ?? "",
  }));

  const first = candidates[0];
  if (!isValidWgs84Coordinate(first.latitude, first.longitude)) {
    return null;
  }

  return {
    latitude: first.latitude,
    longitude: first.longitude,
    confidence: documents.length === 1 ? "high" : "medium",
    candidateCount: documents.length,
    candidates,
  };
}

async function geocodeWithNaver(
  query: string,
  clientId: string,
  clientSecret: string,
): Promise<GeocodeApiResult | null> {
  const url = new URL("https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode");
  url.searchParams.set("query", query);

  const response = await fetch(url.toString(), {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": clientId,
      "X-NCP-APIGW-API-KEY": clientSecret,
    },
  });

  if (!response.ok) {
    throw new Error(`Naver API HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    addresses?: Array<{ x: string; y: string; roadAddress?: string; jibunAddress?: string }>;
  };

  const addresses = data.addresses ?? [];
  if (addresses.length === 0) return null;

  const candidates = addresses.map((item) => ({
    longitude: Number(item.x),
    latitude: Number(item.y),
    address: item.roadAddress || item.jibunAddress || "",
  }));

  const first = candidates[0];
  if (!isValidWgs84Coordinate(first.latitude, first.longitude)) {
    return null;
  }

  return {
    latitude: first.latitude,
    longitude: first.longitude,
    confidence: addresses.length === 1 ? "high" : "medium",
    candidateCount: addresses.length,
    candidates,
  };
}

async function geocodeQuery(
  query: string,
  provider: "kakao" | "naver",
  env: Record<string, string>,
): Promise<GeocodeApiResult | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= GEOCODING_MAX_RETRIES; attempt += 1) {
    try {
      if (provider === "kakao") {
        return await geocodeWithKakao(query, env.KAKAO_REST_API_KEY ?? "");
      }
      return await geocodeWithNaver(
        query,
        env.NAVER_CLIENT_ID ?? "",
        env.NAVER_CLIENT_SECRET ?? "",
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < GEOCODING_MAX_RETRIES) {
        await sleep(GEOCODING_REQUEST_DELAY_MS * (attempt + 2));
      }
    }
  }

  throw lastError ?? new Error("geocoding failed");
}

function runDryRun(
  inputRows: GeocodingInputRow[],
  cache: GeocodingCache,
  keys: ReturnType<typeof checkGeocodingEnvKeys>,
): void {
  const provider = getGeocodingProvider(keys);
  const uniqueQueries = new Set(inputRows.map((row) => row.query));
  const cacheHits = [...uniqueQueries].filter((query) => cache[query]).length;
  const apiCallsNeeded = uniqueQueries.size - cacheHits;

  console.log("[geocode:golf-courses] DRY-RUN mode (no API calls)");
  console.log("");
  console.log("  Input rows:           ", inputRows.length);
  console.log("  Unique queries:       ", uniqueQueries.size);
  console.log("  Cache hits:           ", cacheHits);
  console.log("  Estimated API calls:  ", apiCallsNeeded);
  console.log("");
  console.log("  API key status:");
  console.log("    KAKAO_REST_API_KEY:     ", keys.kakaoRestApiKey);
  console.log("    NAVER_CLIENT_ID:        ", keys.naverClientId);
  console.log("    NAVER_CLIENT_SECRET:    ", keys.naverClientSecret);
  console.log("    Selected provider:      ", provider ?? "(none — add API key to .env.local)");
  console.log("");
  console.log("  Safety policies (execute mode):");
  console.log("    - cache-first (geocoding_cache.json)");
  console.log("    - same query not called twice per run");
  console.log(`    - request delay: ${GEOCODING_REQUEST_DELAY_MS}ms`);
  console.log(`    - max retries: ${GEOCODING_MAX_RETRIES}`);
  console.log("    - 0 results → geocoding_failures.csv");
  console.log("    - multiple low-confidence → ambiguous_geocoding.csv");
  console.log("    - WGS84 bounds check (Korea)");
  console.log("    - output: geocoding_results.csv (not overwriting import)");
  console.log("    - merged import: golf_courses_import_geocoded.csv");
  console.log("");
  console.log("  To run actual geocoding:");
  console.log("    npm run geocode:golf-courses -- --execute");
}

async function runExecute(
  inputRows: GeocodingInputRow[],
  cache: GeocodingCache,
  keys: ReturnType<typeof checkGeocodingEnvKeys>,
): Promise<void> {
  const provider = getGeocodingProvider(keys);
  if (!provider) {
    console.error(
      "[geocode:golf-courses] No geocoding API key in .env.local. Add KAKAO_REST_API_KEY or NAVER credentials.",
    );
    process.exit(1);
  }

  const env = loadEnvLocal(ROOT);
  const queriedThisRun = new Set<string>();
  const resultRows: string[][] = [];
  const failureRows = loadExistingFailures();
  const ambiguousRows: string[][] = [];
  const now = new Date().toISOString();

  console.log(`[geocode:golf-courses] EXECUTE mode — provider: ${provider}`);
  console.log(`  Processing ${inputRows.length} rows...`);

  for (const [index, row] of inputRows.entries()) {
    const query = row.query;

    if (cache[query]) {
      const cached = cache[query];
      resultRows.push([
        row.id,
        row.name,
        row.address,
        query,
        String(cached.latitude),
        String(cached.longitude),
        cached.provider,
        cached.confidence,
        cached.geocoded_at,
      ]);
      continue;
    }

    if (queriedThisRun.has(query)) {
      const cached = cache[query];
      if (cached) {
        resultRows.push([
          row.id,
          row.name,
          row.address,
          query,
          String(cached.latitude),
          String(cached.longitude),
          cached.provider,
          cached.confidence,
          cached.geocoded_at,
        ]);
      }
      continue;
    }

    queriedThisRun.add(query);

    if (index > 0) {
      await sleep(GEOCODING_REQUEST_DELAY_MS);
    }

    try {
      const result = await geocodeQuery(query, provider, env);

      if (!result) {
        failureRows.push([
          row.id,
          row.name,
          row.address,
          query,
          "zero_results",
          row.source,
        ]);
        continue;
      }

      if (result.candidateCount > 1 && result.confidence !== "high") {
        ambiguousRows.push([
          row.id,
          row.name,
          row.address,
          query,
          String(result.candidateCount),
          JSON.stringify(result.candidates ?? []),
          "multiple_candidates_low_confidence",
        ]);
      }

      cache[query] = {
        query,
        latitude: result.latitude,
        longitude: result.longitude,
        provider,
        confidence: result.confidence,
        geocoded_at: now,
      };

      resultRows.push([
        row.id,
        row.name,
        row.address,
        query,
        String(result.latitude),
        String(result.longitude),
        provider,
        result.confidence,
        now,
      ]);
    } catch (error) {
      failureRows.push([
        row.id,
        row.name,
        row.address,
        query,
        error instanceof Error ? error.message : "api_error",
        row.source,
      ]);
    }
  }

  saveGeocodingCache(CACHE_PATH, cache);
  writeFileUtf8(RESULTS_PATH, rowsToCsv([...GEOCODING_RESULTS_HEADERS], resultRows));
  writeFileUtf8(FAILURES_PATH, rowsToCsv([...GEOCODING_FAILURES_HEADERS], failureRows));
  writeFileUtf8(
    AMBIGUOUS_PATH,
    rowsToCsv([...AMBIGUOUS_GEOCODING_HEADERS], ambiguousRows),
  );

  mergeGeocodedImport(resultRows);

  console.log("");
  console.log("  Results:   ", resultRows.length);
  console.log("  Failures:  ", failureRows.length);
  console.log("  Ambiguous: ", ambiguousRows.length);
  console.log(`  Output: ${RESULTS_PATH}`);
  console.log(`  Merged: ${GEOCODED_IMPORT_PATH}`);
}

function mergeGeocodedImport(resultRows: string[][]): void {
  const importPath = path.join(ROOT, "data/golf_courses_import.csv");
  if (!fs.existsSync(importPath)) return;

  const coordById = new Map<string, { lat: string; lng: string }>();
  for (const row of resultRows) {
    coordById.set(row[0], { lat: row[4], lng: row[5] });
  }

  const { headers, rows } = parseCsv(readFileUtf8(importPath));
  const latIndex = headers.indexOf("latitude");
  const lngIndex = headers.indexOf("longitude");
  const idIndex = headers.indexOf("id");

  const merged = rows.map((values) => {
    const id = values[idIndex];
    const coords = coordById.get(id);
    if (!coords) return values;
    const next = [...values];
    next[latIndex] = coords.lat;
    next[lngIndex] = coords.lng;
    return next;
  });

  writeFileUtf8(importPath.replace(".csv", "_geocoded.csv"), rowsToCsv(headers, merged));
}

async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const inputRows = loadInputRows();
  const cache = loadGeocodingCache(CACHE_PATH);
  const keys = checkGeocodingEnvKeys(ROOT);

  if (execute) {
    await runExecute(inputRows, cache, keys);
  } else {
    runDryRun(inputRows, cache, keys);
  }
}

main().catch((error) => {
  console.error("[geocode:golf-courses] Failed:", error);
  process.exit(1);
});
