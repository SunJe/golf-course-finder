import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./lib/csvUtils";
import {
  checkGeocodingEnvKeys,
  loadEnvLocal,
  type GeocodingEnvKeys,
} from "./lib/envUtils";
import {
  buildQualityReport,
  countStatuses,
  SAMPLE_RESULTS_HEADERS,
  sampleResultToRow,
  type SampleGeocodingResult,
} from "./lib/geocodingQuality";
import {
  buildRegionalQualityReport,
  selectRegionalSampleRows,
} from "./lib/geocodingRegionalQuality";
import {
  buildFullQualityReport,
  buildGeocodedImportCsv,
  createAbortState,
  isRateLimitError,
  resultToGeocodingResultsRow,
  updateAbortState,
} from "./lib/geocodingFullRun";
import {
  GEOCODING_FAILURES_HEADERS,
  GEOCODING_REQUEST_DELAY_MS,
  GEOCODING_RESULTS_HEADERS,
  GeocodingCache,
  GeocodingInputRow,
  GEOCODING_MAX_RETRIES,
  loadGeocodingCache,
  saveGeocodingCache,
} from "./lib/geocodingUtils";
import {
  buildDebugSampleMarkdown,
  geocodeRowWithKakaoFallback,
  KAKAO_ADDRESS_ENDPOINT,
} from "./lib/kakaoGeocoder";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const GEOCODING_DIR = path.join(ROOT, "data/geocoding");
const INPUT_PATH = path.join(GEOCODING_DIR, "geocoding_input.csv");
const SAMPLE_RESULTS_PATH = path.join(GEOCODING_DIR, "geocoding_sample_results.csv");
const RESULTS_PATH = path.join(GEOCODING_DIR, "geocoding_results.csv");
const FAILURES_PATH = path.join(GEOCODING_DIR, "geocoding_failures.csv");
const CACHE_PATH = path.join(GEOCODING_DIR, "geocoding_cache.json");
const QUALITY_REPORT_PATH = path.join(ROOT, "data/review/geocoding_quality_report.md");
const REGIONAL_SAMPLE_RESULTS_PATH = path.join(
  GEOCODING_DIR,
  "geocoding_regional_sample_results.csv",
);
const REGIONAL_QUALITY_REPORT_PATH = path.join(
  ROOT,
  "data/review/geocoding_regional_quality_report.md",
);
const DEBUG_REPORT_PATH = path.join(ROOT, "data/review/geocoding_debug_sample.md");
const DATA_QUALITY_REPORT_PATH = path.join(ROOT, "data/review/data_quality_report.md");
const GEOCODED_IMPORT_PATH = path.join(ROOT, "data/golf_courses_import_geocoded.csv");
const IMPORT_PATH = path.join(ROOT, "data/golf_courses_import.csv");

interface CliOptions {
  execute: boolean;
  debug: boolean;
  limit: number | null;
  offset: number;
  provider: "kakao" | "naver";
  sampleByRegion: boolean;
  limitPerRegion: number;
  all: boolean;
  confirmAll: boolean;
}

interface GeocodeBatchStats {
  sampleResults: SampleGeocodingResult[];
  failureRows: string[][];
  apiCallCount: number;
  totalAddressSearchHits: number;
  totalKeywordSearchHits: number;
  cacheHits: number;
  aborted: boolean;
  abortReason: string;
}

function parseCliOptions(): CliOptions {
  const args = process.argv.slice(2);
  const execute = args.includes("--execute");
  const debug = args.includes("--debug");
  const sampleByRegion = args.includes("--sample-by-region");
  const all = args.includes("--all");
  const confirmAll = args.includes("--confirm-all");
  const limitArg = args.find((arg) => arg.startsWith("--limit"));
  const limitPerRegionArg = args.find((arg) =>
    arg.startsWith("--limit-per-region"),
  );
  const offsetArg = args.find((arg) => arg.startsWith("--offset"));
  const providerArg = args.find((arg) => arg.startsWith("--provider"));

  let limit: number | null = null;
  if (limitArg) {
    const value = limitArg.includes("=")
      ? limitArg.split("=")[1]
      : args[args.indexOf(limitArg) + 1];
    limit = Number(value);
    if (!Number.isFinite(limit) || limit <= 0) {
      throw new Error("Invalid --limit value");
    }
  }

  let offset = 0;
  if (offsetArg) {
    const value = offsetArg.includes("=")
      ? offsetArg.split("=")[1]
      : args[args.indexOf(offsetArg) + 1];
    offset = Number(value);
    if (!Number.isFinite(offset) || offset < 0) {
      throw new Error("Invalid --offset value");
    }
  }

  let provider: "kakao" | "naver" = "kakao";
  if (providerArg) {
    const value = providerArg.includes("=")
      ? providerArg.split("=")[1]
      : args[args.indexOf(providerArg) + 1];
    if (value === "naver" || value === "kakao") {
      provider = value;
    } else {
      throw new Error("Invalid --provider (use kakao or naver)");
    }
  }

  let limitPerRegion = 5;
  if (limitPerRegionArg) {
    const value = limitPerRegionArg.includes("=")
      ? limitPerRegionArg.split("=")[1]
      : args[args.indexOf(limitPerRegionArg) + 1];
    limitPerRegion = Number(value);
    if (!Number.isFinite(limitPerRegion) || limitPerRegion <= 0) {
      throw new Error("Invalid --limit-per-region value");
    }
  }

  return {
    execute,
    debug,
    limit,
    offset,
    provider,
    sampleByRegion,
    limitPerRegion,
    all,
    confirmAll,
  };
}

function resolveProvider(
  keys: GeocodingEnvKeys,
  preferred: "kakao" | "naver",
): "kakao" | "naver" | null {
  if (preferred === "kakao" && keys.kakaoRestApiKey) return "kakao";
  if (
    preferred === "naver" &&
    keys.naverClientId &&
    keys.naverClientSecret
  ) {
    return "naver";
  }
  return null;
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

function sliceRows(
  rows: GeocodingInputRow[],
  offset: number,
  limit: number | null,
): GeocodingInputRow[] {
  const sliced = rows.slice(offset);
  return limit === null ? sliced : sliced.slice(0, limit);
}

function runDryRun(
  allRows: GeocodingInputRow[],
  targetRows: GeocodingInputRow[],
  cache: GeocodingCache,
  keys: GeocodingEnvKeys,
  options: CliOptions,
): void {
  const provider = resolveProvider(keys, options.provider);
  const uniqueQueries = new Set(targetRows.map((row) => row.query));
  const cacheHits = [...uniqueQueries].filter((query) => cache[query]).length;

  fs.writeFileSync(
    DEBUG_REPORT_PATH,
    buildDebugSampleMarkdown(targetRows, KAKAO_ADDRESS_ENDPOINT),
    "utf8",
  );

  console.log("[geocode:golf-courses] DRY-RUN mode (no API calls)");
  console.log("");
  console.log("  Total input rows:     ", allRows.length);
  console.log("  Target rows:          ", targetRows.length);
  console.log("  Offset:               ", options.offset);
  if (options.all) {
    console.log("  Mode:                 FULL (--all)");
    console.log(
      "  Execute requires:     --execute --all --confirm-all",
    );
  } else {
    console.log("  Limit:                ", options.limit ?? "(none)");
  }
  console.log("  Unique queries:       ", uniqueQueries.size);
  console.log("  Cache hits:           ", cacheHits);
  console.log("");
  console.log("  API key status:");
  console.log("    KAKAO_REST_API_KEY:     ", keys.kakaoRestApiKey);
  console.log("    NAVER_CLIENT_ID:        ", keys.naverClientId);
  console.log("    NAVER_CLIENT_SECRET:    ", keys.naverClientSecret);
  console.log("");
  console.log("  Fallback strategy:");
  console.log("    1. address search (normalized address + 시도 접두)");
  console.log("    2. keyword search (name + city / region / name)");
  console.log("    3. keyword search (name + normalized address)");
  console.log(`  Debug report: ${DEBUG_REPORT_PATH}`);
  console.log("");
  console.log("  Sample execute:");
  console.log(
    "    npm run geocode:golf-courses -- --execute --limit 20 --provider kakao --debug",
  );
  if (options.all) {
    console.log("  Full execute:");
    console.log(
      "    npm run geocode:golf-courses -- --execute --provider kakao --all --confirm-all",
    );
  }
}

function assertExecuteAllowed(options: CliOptions): void {
  if (options.all) {
    if (!options.confirmAll) {
      console.error(
        "[geocode:golf-courses] Full --all requires --confirm-all.",
      );
      console.error(
        "  npm run geocode:golf-courses -- --execute --provider kakao --all --confirm-all",
      );
      process.exit(1);
    }
    return;
  }

  if (!options.sampleByRegion && options.limit === null) {
    console.error(
      "[geocode:golf-courses] Full execute blocked. Use --limit N, --sample-by-region, or --all --confirm-all.",
    );
    process.exit(1);
  }
}

async function geocodeBatch(
  targetRows: GeocodingInputRow[],
  cache: GeocodingCache,
  provider: "kakao",
  apiKey: string,
  options: CliOptions & { fullRun?: boolean },
): Promise<GeocodeBatchStats> {
  const sampleResults: SampleGeocodingResult[] = [];
  const failureRows: string[][] = [];
  const now = new Date().toISOString();
  let apiCallCount = 0;
  let totalAddressSearchHits = 0;
  let totalKeywordSearchHits = 0;
  let cacheHits = 0;
  let apiRowsProcessed = 0;
  let aborted = false;
  let abortReason = "";
  const abortState = options.fullRun ? createAbortState() : null;

  for (const [index, row] of targetRows.entries()) {
    const cacheKey = `${row.id}|${row.address}`;
    const cached = cache[cacheKey];

    if (cached && cached.confidence === "high") {
      sampleResults.push({
        id: row.id,
        name: row.name,
        region: row.region,
        city: row.city,
        address: row.address,
        query: cached.query,
        latitude: String(cached.latitude),
        longitude: String(cached.longitude),
        provider: cached.provider,
        confidence: "70+",
        matchedAddress: cached.matched_address ?? "",
        rawPlaceName: cached.raw_place_name ?? "",
        status: "skipped",
        note: "cache hit",
      });
      cacheHits += 1;
      if (options.debug) {
        console.log(`[${index + 1}] ${row.name} — skipped (cache)`);
      } else if (options.fullRun && (index + 1) % 50 === 0) {
        console.log(`  ... ${index + 1}/${targetRows.length} processed`);
      }
      continue;
    }

    if (apiRowsProcessed > 0) {
      await sleep(GEOCODING_REQUEST_DELAY_MS);
    }

    try {
      const attempt = await geocodeRowWithKakaoFallback(row, apiKey);
      apiCallCount += attempt.steps.length;
      totalAddressSearchHits += attempt.addressSearchHits;
      totalKeywordSearchHits += attempt.keywordSearchHits;

      const result: SampleGeocodingResult = {
        id: row.id,
        name: row.name,
        region: row.region,
        city: row.city,
        address: row.address,
        query: attempt.winningQuery || row.query,
        latitude: attempt.candidate ? String(attempt.candidate.latitude) : "",
        longitude: attempt.candidate ? String(attempt.candidate.longitude) : "",
        provider,
        confidence: String(attempt.assessment.score),
        matchedAddress: attempt.candidate?.matchedAddress ?? "",
        rawPlaceName: attempt.candidate?.rawPlaceName ?? "",
        status: attempt.assessment.status,
        note: `${attempt.assessment.note}; endpoint=${attempt.winningEndpoint || "none"}; steps=${attempt.steps.length}`,
      };

      sampleResults.push(result);
      apiRowsProcessed += 1;

      if (abortState) {
        const check = updateAbortState(abortState, result);
        if (check.abort) {
          aborted = true;
          abortReason = check.reason;
        }
      }

      if (options.debug) {
        console.log(`[${index + 1}] ${row.name}`);
        console.log(`  address: ${row.address}`);
        console.log(`  normalized: ${attempt.normalizedAddress}`);
        console.log(`  steps:`);
        for (const step of attempt.steps) {
          console.log(
            `    - ${step.endpoint.includes("address") ? "address" : "keyword"} query="${step.query}" hits=${step.candidateCount}`,
          );
        }
        console.log(
          `  selected: ${result.matchedAddress || "(none)"} confidence=${result.confidence} status=${result.status}`,
        );
      }

      if (result.status === "success" && attempt.candidate) {
        cache[cacheKey] = {
          query: attempt.winningQuery,
          latitude: attempt.candidate.latitude,
          longitude: attempt.candidate.longitude,
          provider,
          confidence: "high",
          geocoded_at: now,
          matched_address: attempt.candidate.matchedAddress,
          raw_place_name: attempt.candidate.rawPlaceName,
        };
      } else if (result.status !== "success") {
        failureRows.push([
          row.id,
          row.name,
          row.address,
          attempt.winningQuery || row.query,
          result.status,
          row.source,
        ]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "api_error";
      sampleResults.push({
        id: row.id,
        name: row.name,
        region: row.region,
        city: row.city,
        address: row.address,
        query: row.query,
        latitude: "",
        longitude: "",
        provider,
        confidence: "0",
        matchedAddress: "",
        rawPlaceName: "",
        status: "api_error",
        note: message,
      });
      failureRows.push([
        row.id,
        row.name,
        row.address,
        row.query,
        message,
        row.source,
      ]);
      apiRowsProcessed += 1;

      if (abortState) {
        const check = updateAbortState(abortState, sampleResults[sampleResults.length - 1], message);
        if (check.abort) {
          aborted = true;
          abortReason = check.reason;
        } else if (isRateLimitError(message)) {
          aborted = true;
          abortReason = `API rate limit/quota 감지: ${message}`;
        }
      }

      if (options.debug) {
        console.log(`[${index + 1}] ${row.name} — api_error: ${message}`);
      }
    }

    if (options.fullRun && (index + 1) % 10 === 0) {
      saveGeocodingCache(CACHE_PATH, cache);
    }

    if (aborted) {
      console.error(`[geocode:golf-courses] ABORT: ${abortReason}`);
      break;
    }

    if (options.fullRun && !options.debug && (index + 1) % 50 === 0) {
      console.log(`  ... ${index + 1}/${targetRows.length} processed`);
    }
  }

  return {
    sampleResults,
    failureRows,
    apiCallCount,
    totalAddressSearchHits,
    totalKeywordSearchHits,
    cacheHits,
    aborted,
    abortReason,
  };
}

async function runExecute(
  allRows: GeocodingInputRow[],
  targetRows: GeocodingInputRow[],
  cache: GeocodingCache,
  keys: GeocodingEnvKeys,
  options: CliOptions,
): Promise<void> {
  assertExecuteAllowed(options);

  const provider = resolveProvider(keys, options.provider);
  if (!provider) {
    console.error("[geocode:golf-courses] Geocoding API key not configured.");
    process.exit(1);
  }

  if (provider !== "kakao") {
    console.error(
      "[geocode:golf-courses] Fallback strategy currently implemented for kakao only.",
    );
    process.exit(1);
  }

  const env = loadEnvLocal(ROOT);
  const apiKey = env.KAKAO_REST_API_KEY ?? "";
  const now = new Date().toISOString();

  fs.writeFileSync(
    DEBUG_REPORT_PATH,
    buildDebugSampleMarkdown(targetRows, KAKAO_ADDRESS_ENDPOINT),
    "utf8",
  );

  console.log(`[geocode:golf-courses] EXECUTE mode — provider: ${provider}`);
  console.log(`  Processing ${targetRows.length} rows (limit=${options.limit})`);

  const batch = await geocodeBatch(targetRows, cache, provider, apiKey, options);

  saveGeocodingCache(CACHE_PATH, cache);

  writeFileUtf8(
    SAMPLE_RESULTS_PATH,
    rowsToCsv(
      [...SAMPLE_RESULTS_HEADERS],
      batch.sampleResults.map(sampleResultToRow),
    ),
  );

  writeFileUtf8(
    FAILURES_PATH,
    rowsToCsv([...GEOCODING_FAILURES_HEADERS], batch.failureRows),
  );

  const statusCounts = countStatuses(batch.sampleResults);
  let qualityReport = buildQualityReport(batch.sampleResults, {
    runAt: now,
    mode: "execute",
    provider,
    limit: options.limit ?? targetRows.length,
    offset: options.offset,
    totalInputRows: allRows.length,
    apiKeys: keys,
    sampleExecuted: true,
  });

  qualityReport += [
    "",
    "## Fallback 통계",
    "",
    `- address search 총 hit: ${batch.totalAddressSearchHits}`,
    `- keyword search 총 hit: ${batch.totalKeywordSearchHits}`,
    `- API step calls: ${batch.apiCallCount}`,
    "",
  ].join("\n");

  fs.writeFileSync(QUALITY_REPORT_PATH, qualityReport, "utf8");
  appendPhase3ToDataQualityReport({
    runAt: now,
    sampleExecuted: true,
    sampleRows: batch.sampleResults.length,
    statusCounts,
    apiKeys: keys,
    provider,
    addressHits: batch.totalAddressSearchHits,
    keywordHits: batch.totalKeywordSearchHits,
  });

  console.log("");
  console.log("  API step calls:       ", batch.apiCallCount);
  console.log("  address search hits:  ", batch.totalAddressSearchHits);
  console.log("  keyword search hits:  ", batch.totalKeywordSearchHits);
  console.log("  success:              ", statusCounts.success);
  console.log("  no_result:            ", statusCounts.no_result);
  console.log("  low_confidence:       ", statusCounts.low_confidence);
  console.log("  multiple_candidates:  ", statusCounts.multiple_candidates);
  console.log("  api_error:            ", statusCounts.api_error);
  console.log("  skipped (cache):      ", statusCounts.skipped);
  console.log(`  Output: ${SAMPLE_RESULTS_PATH}`);
  console.log(`  Report: ${QUALITY_REPORT_PATH}`);
  console.log(`  Debug:  ${DEBUG_REPORT_PATH}`);
  console.log("  NOTE: golf_courses_import.csv was NOT modified.");
}

async function runRegionalExecute(
  allRows: GeocodingInputRow[],
  targetRows: GeocodingInputRow[],
  cache: GeocodingCache,
  keys: GeocodingEnvKeys,
  options: CliOptions,
): Promise<void> {
  assertExecuteAllowed(options);

  const provider = resolveProvider(keys, options.provider);
  if (!provider) {
    console.error("[geocode:golf-courses] Geocoding API key not configured.");
    process.exit(1);
  }

  if (provider !== "kakao") {
    console.error(
      "[geocode:golf-courses] Fallback strategy currently implemented for kakao only.",
    );
    process.exit(1);
  }

  const env = loadEnvLocal(ROOT);
  const apiKey = env.KAKAO_REST_API_KEY ?? "";
  const now = new Date().toISOString();

  fs.writeFileSync(
    DEBUG_REPORT_PATH,
    buildDebugSampleMarkdown(targetRows, KAKAO_ADDRESS_ENDPOINT),
    "utf8",
  );

  console.log(
    `[geocode:golf-courses] REGIONAL SAMPLE EXECUTE — provider: ${provider}`,
  );
  console.log(
    `  Processing ${targetRows.length} rows (limit-per-region=${options.limitPerRegion})`,
  );

  const batch = await geocodeBatch(targetRows, cache, provider, apiKey, options);

  saveGeocodingCache(CACHE_PATH, cache);

  writeFileUtf8(
    REGIONAL_SAMPLE_RESULTS_PATH,
    rowsToCsv(
      [...SAMPLE_RESULTS_HEADERS],
      batch.sampleResults.map(sampleResultToRow),
    ),
  );

  const statusCounts = countStatuses(batch.sampleResults);
  const regionalReport = buildRegionalQualityReport({
    runAt: now,
    results: batch.sampleResults,
    totalInputRows: allRows.length,
    limitPerRegion: options.limitPerRegion,
    addressSearchHits: batch.totalAddressSearchHits,
    keywordSearchHits: batch.totalKeywordSearchHits,
    apiStepCalls: batch.apiCallCount,
  });

  fs.writeFileSync(REGIONAL_QUALITY_REPORT_PATH, regionalReport, "utf8");

  console.log("");
  console.log("  API step calls:       ", batch.apiCallCount);
  console.log("  address search hits:  ", batch.totalAddressSearchHits);
  console.log("  keyword search hits:  ", batch.totalKeywordSearchHits);
  console.log("  success:              ", statusCounts.success);
  console.log("  no_result:            ", statusCounts.no_result);
  console.log("  low_confidence:       ", statusCounts.low_confidence);
  console.log("  multiple_candidates:  ", statusCounts.multiple_candidates);
  console.log("  api_error:            ", statusCounts.api_error);
  console.log("  skipped (cache):      ", statusCounts.skipped);
  console.log(`  Output: ${REGIONAL_SAMPLE_RESULTS_PATH}`);
  console.log(`  Report: ${REGIONAL_QUALITY_REPORT_PATH}`);
  console.log(`  Debug:  ${DEBUG_REPORT_PATH}`);
  console.log("  NOTE: golf_courses_import.csv was NOT modified.");
}

function buildResultsMapFromBatchAndCache(
  batchResults: SampleGeocodingResult[],
  cache: GeocodingCache,
  allRows: GeocodingInputRow[],
): Map<string, SampleGeocodingResult> {
  const map = new Map<string, SampleGeocodingResult>();
  for (const result of batchResults) {
    map.set(result.id, result);
  }

  for (const row of allRows) {
    if (map.has(row.id)) continue;
    const cacheKey = `${row.id}|${row.address}`;
    const cached = cache[cacheKey];
    if (cached && cached.confidence === "high") {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        region: row.region,
        city: row.city,
        address: row.address,
        query: cached.query,
        latitude: String(cached.latitude),
        longitude: String(cached.longitude),
        provider: cached.provider,
        confidence: "70+",
        matchedAddress: cached.matched_address ?? "",
        rawPlaceName: cached.raw_place_name ?? "",
        status: "skipped",
        note: "cache hit",
      });
    }
  }

  return map;
}

async function runFullExecute(
  allRows: GeocodingInputRow[],
  cache: GeocodingCache,
  keys: GeocodingEnvKeys,
  options: CliOptions,
): Promise<void> {
  assertExecuteAllowed(options);

  const provider = resolveProvider(keys, options.provider);
  if (!provider) {
    console.error("[geocode:golf-courses] Geocoding API key not configured.");
    process.exit(1);
  }

  if (provider !== "kakao") {
    console.error(
      "[geocode:golf-courses] Fallback strategy currently implemented for kakao only.",
    );
    process.exit(1);
  }

  const env = loadEnvLocal(ROOT);
  const apiKey = env.KAKAO_REST_API_KEY ?? "";
  const now = new Date().toISOString();

  console.log(`[geocode:golf-courses] FULL EXECUTE — provider: ${provider}`);
  console.log(`  Total target rows: ${allRows.length}`);
  console.log(`  KAKAO_REST_API_KEY configured: ${keys.kakaoRestApiKey}`);

  const batch = await geocodeBatch(allRows, cache, provider, apiKey, {
    ...options,
    fullRun: true,
  });

  saveGeocodingCache(CACHE_PATH, cache);

  const resultsMap = buildResultsMapFromBatchAndCache(
    batch.sampleResults,
    cache,
    allRows,
  );

  writeFileUtf8(
    RESULTS_PATH,
    rowsToCsv(
      [...GEOCODING_RESULTS_HEADERS],
      [...resultsMap.values()].map((result) =>
        resultToGeocodingResultsRow(result, now),
      ),
    ),
  );

  writeFileUtf8(
    FAILURES_PATH,
    rowsToCsv([...GEOCODING_FAILURES_HEADERS], batch.failureRows),
  );

  const { rowCount, rowsWithoutCoords } = buildGeocodedImportCsv({
    importPath: IMPORT_PATH,
    outputPath: GEOCODED_IMPORT_PATH,
    resultsById: resultsMap,
  });

  const statusCounts = countStatuses(batch.sampleResults);
  const fullReport = buildFullQualityReport(batch.sampleResults, {
    runAt: now,
    provider,
    totalInputRows: allRows.length,
    processedRows: batch.sampleResults.length,
    apiStepCalls: batch.apiCallCount,
    cacheHits: batch.cacheHits,
    addressSearchHits: batch.totalAddressSearchHits,
    keywordSearchHits: batch.totalKeywordSearchHits,
    aborted: batch.aborted,
    abortReason: batch.abortReason,
    geocodedImportRows: rowCount,
    rowsWithoutCoords,
    apiKeys: keys,
  });

  fs.writeFileSync(QUALITY_REPORT_PATH, fullReport, "utf8");

  console.log("");
  console.log("  API step calls:       ", batch.apiCallCount);
  console.log("  cache hits:           ", batch.cacheHits);
  console.log("  address search hits:  ", batch.totalAddressSearchHits);
  console.log("  keyword search hits:  ", batch.totalKeywordSearchHits);
  console.log("  success:              ", statusCounts.success);
  console.log("  no_result:            ", statusCounts.no_result);
  console.log("  low_confidence:       ", statusCounts.low_confidence);
  console.log("  multiple_candidates:  ", statusCounts.multiple_candidates);
  console.log("  api_error:            ", statusCounts.api_error);
  console.log("  skipped (cache):      ", statusCounts.skipped);
  console.log(`  geocoded import rows:  ${rowCount}`);
  console.log(`  rows without coords:   ${rowsWithoutCoords}`);
  if (batch.aborted) {
    console.log(`  ABORTED: ${batch.abortReason}`);
    console.log("  Re-run with same command to resume via cache.");
  }
  console.log(`  Output: ${RESULTS_PATH}`);
  console.log(`  Output: ${GEOCODED_IMPORT_PATH}`);
  console.log(`  Report: ${QUALITY_REPORT_PATH}`);
  console.log("  NOTE: golf_courses_import.csv was NOT modified.");
}

function appendPhase3ToDataQualityReport(input: {
  runAt: string;
  sampleExecuted: boolean;
  sampleRows: number;
  statusCounts: ReturnType<typeof countStatuses>;
  apiKeys: GeocodingEnvKeys;
  provider: string;
  addressHits?: number;
  keywordHits?: number;
}): void {
  const fullReady = input.sampleExecuted && input.statusCounts.success >= 10;

  const section = [
    "",
    "---",
    "",
    "## Phase 3 — Geocoding Sample",
    "",
    `- **실행 일시:** ${input.runAt}`,
    `- **geocoding sample completed:** ${input.sampleExecuted}`,
    `- **샘플 처리 행 수:** ${input.sampleRows}`,
    `- **success:** ${input.statusCounts.success}`,
    `- **no_result:** ${input.statusCounts.no_result}`,
    `- **low_confidence:** ${input.statusCounts.low_confidence}`,
    `- **multiple_candidates:** ${input.statusCounts.multiple_candidates}`,
    `- **address search hits:** ${input.addressHits ?? 0}`,
    `- **keyword search hits:** ${input.keywordHits ?? 0}`,
    `- **provider:** ${input.provider}`,
    `- **KAKAO_REST_API_KEY:** ${input.apiKeys.kakaoRestApiKey}`,
    `- **manual questions remaining:** 7`,
    `- **전체 geocoding 전 manual_questions 검토:** 필수`,
    `- **전체 geocoding 실행 가능:** ${fullReady ? "조건부 가능 (success>=10)" : "아직 불가"}`,
    `- **golf_courses_import.csv 수정:** 없음`,
    "",
  ].join("\n");

  const existing = fs.readFileSync(DATA_QUALITY_REPORT_PATH, "utf8");
  const marker = "## Phase 3 — Geocoding Sample";
  const withoutOld = existing.includes(marker)
    ? existing.slice(0, existing.indexOf(marker) - 4)
    : existing;
  fs.writeFileSync(
    DATA_QUALITY_REPORT_PATH,
    `${withoutOld.trimEnd()}${section}\n`,
    "utf8",
  );
}

function writeDryRunQualityReport(
  targetRows: GeocodingInputRow[],
  allRows: GeocodingInputRow[],
  keys: GeocodingEnvKeys,
  options: CliOptions,
): void {
  const now = new Date().toISOString();
  const placeholderResults: SampleGeocodingResult[] = targetRows.map((row) => ({
    id: row.id,
    name: row.name,
    region: row.region,
    city: row.city,
    address: row.address,
    query: row.query,
    latitude: "",
    longitude: "",
    provider: "",
    confidence: "",
    matchedAddress: "",
    rawPlaceName: "",
    status: "skipped",
    note: "dry-run — API 미호출",
  }));

  fs.writeFileSync(
    QUALITY_REPORT_PATH,
    buildQualityReport(placeholderResults, {
      runAt: now,
      mode: "dry-run",
      provider: options.provider,
      limit: options.limit ?? targetRows.length,
      offset: options.offset,
      totalInputRows: allRows.length,
      apiKeys: keys,
      sampleExecuted: false,
    }),
    "utf8",
  );
}

async function main(): Promise<void> {
  const options = parseCliOptions();
  const allRows = loadInputRows();
  const cache = loadGeocodingCache(CACHE_PATH);
  const keys = checkGeocodingEnvKeys(ROOT);

  if (options.all) {
    if (options.execute) {
      await runFullExecute(allRows, cache, keys, options);
    } else {
      runDryRun(allRows, allRows, cache, keys, options);
    }
    return;
  }

  if (options.sampleByRegion) {
    const targetRows = selectRegionalSampleRows(
      allRows,
      options.limitPerRegion,
    );

    if (options.execute) {
      await runRegionalExecute(allRows, targetRows, cache, keys, options);
    } else {
      runDryRun(allRows, targetRows, cache, keys, {
        ...options,
        limit: targetRows.length,
      });
      console.log(
        `  Regional sample rows: ${targetRows.length} (limit-per-region=${options.limitPerRegion})`,
      );
      console.log(
        "    npm run geocode:golf-courses -- --execute --provider kakao --sample-by-region --limit-per-region 5 --debug",
      );
    }
    return;
  }

  const effectiveLimit = options.execute ? options.limit : (options.limit ?? 20);
  const targetRows = sliceRows(allRows, options.offset, effectiveLimit);

  if (options.execute) {
    await runExecute(allRows, targetRows, cache, keys, options);
  } else {
    runDryRun(allRows, targetRows, cache, keys, options);
    writeDryRunQualityReport(targetRows, allRows, keys, options);
  }
}

main().catch((error) => {
  console.error("[geocode:golf-courses] Failed:", error);
  process.exit(1);
});
