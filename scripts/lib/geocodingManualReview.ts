import type { GeocodingInputRow } from "./geocodingUtils";
import { normalizeAddress } from "./addressNormalize";

function nameVariants(name: string): string[] {
  const variants = new Set<string>([name]);
  const replacements: Array<[RegExp, string]> = [
    [/컨트리클럽/g, "CC"],
    [/골프클럽/g, "GC"],
    [/골프장/g, "GC"],
    [/대중골프장/g, "퍼블릭"],
    [/비회원제/g, "대중제"],
    [/회원제/g, ""],
    [/\(비회원제\)/g, ""],
    [/\(회원제\)/g, ""],
  ];

  for (const [pattern, replacement] of replacements) {
    if (pattern.test(name)) {
      variants.add(name.replace(pattern, replacement).replace(/\s+/g, " ").trim());
    }
  }

  variants.add(name.replace(/\s+/g, ""));
  return [...variants].filter(Boolean);
}

export function buildNoResultRetryQueries(row: GeocodingInputRow): string[] {
  const queries = new Set<string>();
  const normalizedAddress = normalizeAddress(
    row.address,
    row.region,
    row.city,
  );

  for (const name of nameVariants(row.name)) {
    queries.add(name);
    queries.add(`${name} 골프장`);
    queries.add(`${name} CC`);
    queries.add(`${name} 컨트리클럽`);
    if (row.city) queries.add(`${name} ${row.city}`);
    if (row.region) queries.add(`${name} ${row.region}`);
    if (row.city) queries.add(`${row.city} ${name}`);
    if (normalizedAddress) queries.add(`${name} ${normalizedAddress}`);
  }

  if (normalizedAddress) queries.add(normalizedAddress);
  if (row.address.trim()) queries.add(row.address.trim());

  return [...queries].filter((query) => query.trim().length >= 2);
}

export interface ImportRowCounts {
  importDataRows: number;
  geocodingInputRows: number;
  geocodedOutputRows: number;
  importIds: string[];
  geocodingInputIds: string[];
  geocodedOutputIds: string[];
  missingInGeocodingInput: string[];
  extraInGeocodingInput: string[];
  missingInGeocodedOutput: string[];
  extraInGeocodedOutput: string[];
}

export function compareImportRowCounts(input: {
  importRows: string[][];
  importHeaders: string[];
  geocodingInputRows: string[][];
  geocodingInputHeaders: string[];
  geocodedOutputRows: string[][];
  geocodedOutputHeaders: string[];
}): ImportRowCounts {
  const importIdIndex = input.importHeaders.indexOf("id");
  const geoIdIndex = input.geocodingInputHeaders.indexOf("id");
  const outIdIndex = input.geocodedOutputHeaders.indexOf("id");

  const importIds = input.importRows.map((row) => row[importIdIndex] ?? "");
  const geocodingInputIds = input.geocodingInputRows.map(
    (row) => row[geoIdIndex] ?? "",
  );
  const geocodedOutputIds = input.geocodedOutputRows.map(
    (row) => row[outIdIndex] ?? "",
  );

  const importIdSet = new Set(importIds);
  const geoIdSet = new Set(geocodingInputIds);
  const outIdSet = new Set(geocodedOutputIds);

  return {
    importDataRows: input.importRows.length,
    geocodingInputRows: input.geocodingInputRows.length,
    geocodedOutputRows: input.geocodedOutputRows.length,
    importIds,
    geocodingInputIds,
    geocodedOutputIds,
    missingInGeocodingInput: importIds.filter((id) => !geoIdSet.has(id)),
    extraInGeocodingInput: geocodingInputIds.filter((id) => !importIdSet.has(id)),
    missingInGeocodedOutput: importIds.filter((id) => !outIdSet.has(id)),
    extraInGeocodedOutput: geocodedOutputIds.filter((id) => !importIdSet.has(id)),
  };
}

export function buildRowCountReconciliationReport(input: {
  counts: ImportRowCounts;
  importRowsById: Map<string, Record<string, string>>;
  runAt: string;
  historicalNote: string;
  actionTaken: string;
}): string {
  const describeMissing = (ids: string[]) =>
    ids.length === 0
      ? "_없음_"
      : ids
          .map((id) => {
            const row = input.importRowsById.get(id);
            if (!row) return `- \`${id}\``;
            return `- \`${id}\` — ${row.name} (${row.region}/${row.city}) — ${row.address}`;
          })
          .join("\n");

  return [
    "# Row Count Reconciliation",
    "",
    `> Generated: ${input.runAt}`,
    "",
    "## 행 수",
    "",
    `- **기준 import (data rows):** ${input.counts.importDataRows}`,
    `- **geocoding_input.csv:** ${input.counts.geocodingInputRows}`,
    `- **golf_courses_import_geocoded.csv:** ${input.counts.geocodedOutputRows}`,
    "",
    "## ID 비교",
    "",
    "### import에만 있음 (geocoding_input 누락)",
    "",
    describeMissing(input.counts.missingInGeocodingInput),
    "",
    "### geocoding_input에만 있음 (import에 없음)",
    "",
    describeMissing(input.counts.extraInGeocodingInput),
    "",
    "### import에만 있음 (geocoded output 누락)",
    "",
    describeMissing(input.counts.missingInGeocodedOutput),
    "",
    "### geocoded output에만 있음",
    "",
    describeMissing(input.counts.extraInGeocodedOutput),
    "",
    "## 원인",
    "",
    input.historicalNote,
    "",
    "## 조치",
    "",
    input.actionTaken,
    "",
  ].join("\n");
}
