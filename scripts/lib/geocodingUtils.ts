import fs from "node:fs";
import path from "node:path";
import { parseCsv, readFileUtf8, rowsToCsv, writeFileUtf8 } from "./csvUtils";

export const GEOCODING_INPUT_HEADERS = [
  "id",
  "name",
  "region",
  "city",
  "address",
  "query",
  "source",
] as const;

export const GEOCODING_RESULTS_HEADERS = [
  "id",
  "name",
  "address",
  "query",
  "latitude",
  "longitude",
  "provider",
  "confidence",
  "geocoded_at",
] as const;

export const GEOCODING_FAILURES_HEADERS = [
  "id",
  "name",
  "address",
  "query",
  "reason",
  "source",
] as const;

export const AMBIGUOUS_GEOCODING_HEADERS = [
  "id",
  "name",
  "address",
  "query",
  "candidate_count",
  "candidates_json",
  "reason",
] as const;

export interface GeocodingInputRow {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  query: string;
  source: string;
}

export interface GeocodingCacheEntry {
  query: string;
  latitude: number;
  longitude: number;
  provider: string;
  confidence: "high" | "medium" | "low";
  geocoded_at: string;
}

export type GeocodingCache = Record<string, GeocodingCacheEntry>;

const MIN_ADDRESS_LENGTH = 12;
const PROVINCE_PATTERN = /(특별|광역|자치|도)/;

/** address가 짧거나 행정구역 접두가 없으면 name+city를 보조해 query 생성 */
export function buildGeocodingQuery(
  name: string,
  city: string,
  address: string,
): string {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) return "";

  const needsAugment =
    trimmedAddress.length < MIN_ADDRESS_LENGTH ||
    !PROVINCE_PATTERN.test(trimmedAddress);

  if (!needsAugment) return trimmedAddress;

  const parts = [name.trim()];
  if (city.trim() && !trimmedAddress.startsWith(city.trim())) {
    parts.push(city.trim());
  }
  parts.push(trimmedAddress);
  return parts.filter(Boolean).join(" ");
}

export function loadGeocodingCache(cachePath: string): GeocodingCache {
  if (!fs.existsSync(cachePath)) return {};
  try {
    return JSON.parse(readFileUtf8(cachePath)) as GeocodingCache;
  } catch {
    return {};
  }
}

export function saveGeocodingCache(
  cachePath: string,
  cache: GeocodingCache,
): void {
  writeFileUtf8(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

export function isValidWgs84Coordinate(
  latitude: number,
  longitude: number,
): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= 33 &&
    latitude <= 39.5 &&
    longitude >= 124 &&
    longitude <= 132.5
  );
}

export function recordToImportRow(
  headers: string[],
  values: string[],
): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = values[index] ?? "";
  });
  return record;
}

export function prepareGeocodingFiles(
  needsGeocodingPath: string,
  geocodingDir: string,
): {
  inputRows: GeocodingInputRow[];
  failureRows: string[][];
  inputCount: number;
  failureCount: number;
} {
  const { headers, rows } = parseCsv(readFileUtf8(needsGeocodingPath));
  const inputRows: GeocodingInputRow[] = [];
  const failureRows: string[][] = [];

  for (const values of rows) {
    const record = recordToImportRow(headers, values);
    const id = record.id ?? "";
    const name = record.name ?? "";
    const region = record.region ?? "";
    const city = record.city ?? "";
    const address = record.address ?? "";
    const source = record.source ?? "public_data";

    if (!address.trim()) {
      failureRows.push([
        id,
        name,
        address,
        "",
        "empty_address",
        source,
      ]);
      continue;
    }

    const query = buildGeocodingQuery(name, city, address);
    if (!query.trim()) {
      failureRows.push([
        id,
        name,
        address,
        "",
        "empty_query",
        source,
      ]);
      continue;
    }

    inputRows.push({ id, name, region, city, address, query, source });
  }

  const inputCsvRows = inputRows.map((row) => [
    row.id,
    row.name,
    row.region,
    row.city,
    row.address,
    row.query,
    row.source,
  ]);

  writeFileUtf8(
    path.join(geocodingDir, "geocoding_input.csv"),
    rowsToCsv([...GEOCODING_INPUT_HEADERS], inputCsvRows),
  );

  writeFileUtf8(
    path.join(geocodingDir, "geocoding_results.csv"),
    rowsToCsv([...GEOCODING_RESULTS_HEADERS], []),
  );

  writeFileUtf8(
    path.join(geocodingDir, "geocoding_failures.csv"),
    rowsToCsv([...GEOCODING_FAILURES_HEADERS], failureRows),
  );

  const cachePath = path.join(geocodingDir, "geocoding_cache.json");
  if (!fs.existsSync(cachePath)) {
    saveGeocodingCache(cachePath, {});
  }

  return {
    inputRows,
    failureRows,
    inputCount: inputRows.length,
    failureCount: failureRows.length,
  };
}

/** Geocoding API 호출 간격 (ms) */
export const GEOCODING_REQUEST_DELAY_MS = 350;

/** 실패 시 최대 재시도 횟수 */
export const GEOCODING_MAX_RETRIES = 2;
