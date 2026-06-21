import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import {
  backupEditCsv,
  buildMergePreview,
  writeCandidatesCsv,
  writeMergePreviewCsv,
} from "./lib/naverMapEnrichment/mergePreview";
import {
  createNaverMapBrowser,
  isRetryableFailureNote,
  scrapeEnrichmentRowWithRetry,
} from "./lib/naverMapEnrichment/enrichmentScraper";
import {
  AccessCircuitBreaker,
  GotoRateLimiter,
  isAccessBlockedNote,
  rowGapWithJitter,
} from "./lib/naverMapEnrichment/accessControl";
import type { EnrichmentInputRow } from "./lib/naverMapEnrichment/types";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const EDIT_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const CANDIDATES_CSV = path.join(
  ROOT,
  "data/enrichment/naver_map_enrichment_candidates.csv",
);
const MERGE_PREVIEW_CSV = path.join(
  ROOT,
  "data/enrichment/course_enrichment_edit_merge_preview.csv",
);
const BACKUP_DIR = path.join(ROOT, "data/enrichment/backups");

const DEFAULT_SLOW_MS = 3000;
const DEFAULT_ROW_GAP_MS = 60_000;
const DEFAULT_GOTO_MIN_INTERVAL_MS = 60_000;
const DEFAULT_GAP_JITTER_MS = 20_000;

interface CliOptions {
  limit?: number;
  offset: number;
  id?: string;
  headful: boolean;
  slowMs: number;
  fillMissingOnly: boolean;
  overwrite: boolean;
  addressFirst: boolean;
  maxRetries: number;
  retryFailed: boolean;
  onlyFailedFrom: string;
  includeSkipped: boolean;
  gapMs: number;
  gapJitterMs: number;
  gotoMinIntervalMs: number;
  allowSearchFallback: boolean;
  skipReservation: boolean;
  contactOnly: boolean;
  candidateOpenMode: import("./lib/naverMapEnrichment/types").CandidateOpenMode;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    offset: 0,
    headful: false,
    slowMs: DEFAULT_SLOW_MS,
    fillMissingOnly: true,
    overwrite: false,
    addressFirst: true,
    maxRetries: 1,
    retryFailed: false,
    onlyFailedFrom: CANDIDATES_CSV,
    includeSkipped: false,
    gapMs: DEFAULT_ROW_GAP_MS,
    gapJitterMs: DEFAULT_GAP_JITTER_MS,
    gotoMinIntervalMs: DEFAULT_GOTO_MIN_INTERVAL_MS,
    allowSearchFallback: false,
    skipReservation: true,
    contactOnly: false,
    candidateOpenMode: "research",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--headful") {
      options.headful = true;
    } else if (arg === "--fill-missing-only") {
      options.fillMissingOnly = true;
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg === "--address-first") {
      options.addressFirst = true;
    } else if (arg === "--no-address-first") {
      options.addressFirst = false;
    } else if (arg === "--limit") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("--limit requires a positive integer.");
      }
      options.limit = value;
      i += 1;
    } else if (arg === "--offset") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--offset requires a non-negative integer.");
      }
      options.offset = value;
      i += 1;
    } else if (arg === "--id") {
      const value = argv[i + 1]?.trim();
      if (!value) throw new Error("--id requires a course id.");
      options.id = value;
      i += 1;
    } else if (arg === "--slow") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--slow requires a non-negative integer (ms).");
      }
      options.slowMs = value;
      i += 1;
    } else if (arg === "--max-retries") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--max-retries requires a non-negative integer.");
      }
      options.maxRetries = value;
      i += 1;
    } else if (arg === "--retry-failed") {
      options.retryFailed = true;
    } else if (arg === "--only-failed-from") {
      const value = argv[i + 1]?.trim();
      if (!value) throw new Error("--only-failed-from requires a CSV path.");
      options.onlyFailedFrom = path.isAbsolute(value)
        ? value
        : path.join(ROOT, value);
      i += 1;
    } else if (arg === "--include-skipped") {
      options.includeSkipped = true;
    } else if (arg === "--gap") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--gap requires a non-negative integer (ms).");
      }
      options.gapMs = value;
      i += 1;
    } else if (arg === "--gap-jitter") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--gap-jitter requires a non-negative integer (ms).");
      }
      options.gapJitterMs = value;
      i += 1;
    } else if (arg === "--goto-min-interval") {
      const value = Number.parseInt(argv[i + 1] ?? "", 10);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--goto-min-interval requires a non-negative integer (ms).");
      }
      options.gotoMinIntervalMs = value;
      i += 1;
    } else if (arg === "--allow-search-fallback") {
      options.allowSearchFallback = true;
    } else if (arg === "--skip-reservation") {
      options.skipReservation = true;
    } else if (arg === "--contact-only") {
      options.contactOnly = true;
      options.skipReservation = true;
    } else if (arg === "--collect-prices") {
      options.skipReservation = false;
    } else if (arg === "--candidate-open-mode") {
      const value = argv[i + 1]?.trim();
      if (value !== "click" && value !== "research") {
        throw new Error("--candidate-open-mode requires 'click' or 'research'.");
      }
      options.candidateOpenMode = value;
      i += 1;
    }
  }

  return options;
}

function loadEditRows(): { headers: string[]; rows: EnrichmentInputRow[] } {
  if (!fs.existsSync(EDIT_CSV)) {
    throw new Error(`Input CSV not found: ${EDIT_CSV}`);
  }
  const { content } = readCsvWithEncodingGuess(EDIT_CSV);
  const { headers, rows } = parseCsv(content);
  const mapped = rows.map((cells) => {
    const get = (name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    };
    return {
      id: get("id"),
      name: get("name"),
      change_name_to: get("change_name_to"),
      address: get("address"),
      phone: get("phone"),
      homepage_url: get("homepage_url"),
      price_text: get("price_text"),
      price_min: get("price_min"),
      price_max: get("price_max"),
      price_type: get("price_type"),
      difficulty: get("difficulty"),
      avg_score: get("avg_score"),
      source_url: get("source_url"),
      confidence: get("confidence"),
      needs_check: get("needs_check"),
      note: get("note"),
    } satisfies EnrichmentInputRow;
  });
  return { headers, rows: mapped };
}

function loadCandidatesFrom(
  filePath: string,
): Map<string, import("./lib/naverMapEnrichment/types").NaverMapEnrichmentRow> {
  const map = new Map<
    string,
    import("./lib/naverMapEnrichment/types").NaverMapEnrichmentRow
  >();
  if (!fs.existsSync(filePath)) return map;

  const { content } = readCsvWithEncodingGuess(filePath);
  const { headers, rows } = parseCsv(content);
  for (const cells of rows) {
    const get = (name: string) => {
      const idx = headers.indexOf(name);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    };
    const id = get("id");
    if (!id) continue;
    map.set(id, {
      id,
      name: get("name"),
      change_name_to: get("change_name_to"),
      address: get("address"),
      search_strategy: get("search_strategy") as import("./lib/naverMapEnrichment/types").SearchStrategy | "",
      search_query: get("search_query"),
      matched_title: get("matched_title"),
      matched_category: get("matched_category"),
      matched_address: get("matched_address"),
      matched_place_url: get("matched_place_url"),
      confidence: get("confidence") as import("./lib/naverMapEnrichment/types").ConfidenceLevel,
      needs_check: get("needs_check"),
      mismatch_reason: get("mismatch_reason"),
      scraped_phone: get("scraped_phone"),
      scraped_homepage_url: get("scraped_homepage_url"),
      scraped_avg_score: get("scraped_avg_score"),
      scraped_difficulty: get("scraped_difficulty"),
      scraped_difficulty_text: get("scraped_difficulty_text"),
      reservation_available: get("reservation_available"),
      scraped_price_text: get("scraped_price_text"),
      scraped_price_min: get("scraped_price_min"),
      scraped_price_max: get("scraped_price_max"),
      scraped_price_type: get("scraped_price_type"),
      scraped_price_checked_at: get("scraped_price_checked_at"),
      note: get("note"),
    });
  }
  return map;
}

function loadExistingCandidates(): Map<
  string,
  import("./lib/naverMapEnrichment/types").NaverMapEnrichmentRow
> {
  return loadCandidatesFrom(CANDIDATES_CSV);
}

function isRetryableCandidateRow(
  row: import("./lib/naverMapEnrichment/types").NaverMapEnrichmentRow,
  includeSkipped: boolean,
): boolean {
  if (isAccessBlockedNote(row.note, row.mismatch_reason)) return false;
  if (row.search_strategy === "failed") {
    return isRetryableFailureNote(row.note, row.mismatch_reason);
  }
  if (includeSkipped && row.search_strategy === "skipped") return true;
  return false;
}

function selectRetryFailedTargets(
  editRows: EnrichmentInputRow[],
  failedCandidates: Map<string, import("./lib/naverMapEnrichment/types").NaverMapEnrichmentRow>,
  includeSkipped: boolean,
  limit?: number,
): EnrichmentInputRow[] {
  const selected: EnrichmentInputRow[] = [];
  for (const row of editRows) {
    const candidate = failedCandidates.get(row.id);
    if (!candidate) continue;
    if (!isRetryableCandidateRow(candidate, includeSkipped)) continue;
    selected.push(row);
    if (limit !== undefined && selected.length >= limit) break;
  }
  return selected;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logRowResult(input: {
  index: number;
  total: number;
  row: EnrichmentInputRow;
  result: import("./lib/naverMapEnrichment/types").NaverMapEnrichmentRow;
  diagnostics: import("./lib/naverMapEnrichment/enrichmentScraper").RowDiagnostics;
}): void {
  const { index, total, row, result, diagnostics } = input;
  console.log("");
  console.log(`--- [${index}/${total}] ${row.id} ---`);
  console.log(`  name: ${row.name}`);
  console.log(`  address: ${row.address}`);
  console.log(`  search_query: ${result.search_query || "-"}`);
  if (result.research_query) {
    console.log(`  research_query: ${result.research_query}`);
  }
  console.log(`  search_strategy: ${result.search_strategy || "(none)"}`);
  console.log(`  candidates: ${diagnostics.candidateCount}`);
  console.log(
    `  selected: ${diagnostics.selectedTitle || result.matched_title || "-"} / ${diagnostics.selectedCategory || result.matched_category || "-"}`,
  );
  console.log(`  detail_entered: ${diagnostics.detailEntered ? "yes" : "no"}`);
  console.log(`  phone: ${result.scraped_phone || "-"}`);
  console.log(`  homepage: ${result.scraped_homepage_url || "-"}`);
  console.log(`  avg_score: ${result.scraped_avg_score || "-"}`);
  console.log(
    `  difficulty: ${result.scraped_difficulty || "-"} (${result.scraped_difficulty_text || "-"})`,
  );
  if (result.search_strategy === "skipped") {
    console.log(`  skipped_reason: ${result.note || result.mismatch_reason || "-"}`);
  } else if (result.search_strategy === "failed") {
    console.log(`  failed_reason: ${result.note || result.mismatch_reason || "-"}`);
  }
  if (result.note && result.search_strategy !== "failed" && result.search_strategy !== "skipped") {
    console.log(`  note: ${result.note}`);
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const { headers, rows: allRows } = loadEditRows();

  let targets = allRows;
  if (options.id) {
    targets = allRows.filter((row) => row.id === options.id);
    if (targets.length === 0) {
      throw new Error(`Course id not found: ${options.id}`);
    }
  } else if (options.retryFailed) {
    const failedSource = loadCandidatesFrom(options.onlyFailedFrom);
    targets = selectRetryFailedTargets(
      allRows,
      failedSource,
      options.includeSkipped,
      options.limit,
    );
    if (targets.length === 0) {
      throw new Error(
        `No retryable failed rows in ${options.onlyFailedFrom}. Use --include-skipped to include skipped rows.`,
      );
    }
  } else {
    targets = allRows.slice(
      options.offset,
      options.limit !== undefined
        ? options.offset + options.limit
        : undefined,
    );
  }

  console.log("=== Naver Map enrichment collector (minimal mode) ===");
  console.log(`input: ${EDIT_CSV}`);
  console.log(`targets: ${targets.length} row(s)`);
  if (options.retryFailed) {
    console.log(`retry-failed from: ${options.onlyFailedFrom}`);
    console.log(`include-skipped: ${options.includeSkipped}`);
  }
  console.log(`mode: ${options.contactOnly ? "contact-only (phone/homepage only)" : "minimal contact+stats only (no reservation/price)"}`);
  console.log(`skip-reservation: ${options.skipReservation}`);
  console.log(`contact-only: ${options.contactOnly}`);
  console.log(`candidate-open-mode: ${options.candidateOpenMode}`);
  console.log(`address-first: ${options.addressFirst}`);
  console.log(`headful: ${options.headful}, slow: ${options.slowMs}ms`);
  console.log(
    `rate limit: gap=${options.gapMs}ms (+0~${options.gapJitterMs}ms jitter), goto-min-interval=${options.gotoMinIntervalMs}ms`,
  );
  console.log(
    `search: ${options.allowSearchFallback ? "address+name fallback chain" : "single search per row (address only if present)"}`,
  );
  console.log(`max-retries: ${options.maxRetries} (click/iframe only, no detail-read retry)`);

  const existingCandidates = loadExistingCandidates();
  const collected = new Map(existingCandidates);

  const circuitBreaker = new AccessCircuitBreaker();
  const gotoRateLimiter = new GotoRateLimiter(options.gotoMinIntervalMs);

  const { browser, context } = await createNaverMapBrowser(options.headful);
  let stoppedEarly = false;

  try {
    for (let i = 0; i < targets.length; i += 1) {
      if (circuitBreaker.tripped) {
        stoppedEarly = true;
        break;
      }

      const row = targets[i];
      const { row: result, diagnostics } = await scrapeEnrichmentRowWithRetry(
        row,
        context,
        {
          headful: options.headful,
          slowMs: options.slowMs,
          timeoutMs: 45_000,
          addressFirst: options.addressFirst,
          maxRetries: options.maxRetries,
          singleSearchPerRow: !options.allowSearchFallback,
          skipReservation: options.skipReservation,
          contactOnly: options.contactOnly,
          candidateOpenMode: options.candidateOpenMode,
          circuitBreaker,
          gotoRateLimiter,
        },
      );

      collected.set(row.id, result);
      logRowResult({
        index: i + 1,
        total: targets.length,
        row,
        result,
        diagnostics,
      });

      if (isAccessBlockedNote(result.note, result.mismatch_reason)) {
        console.warn("");
        console.warn("  ⚠ 차단 감지 — 배치 즉시 중단");
        console.warn(`  ⚠ 감지 문구/단계: ${result.note || circuitBreaker.reason}`);
        console.warn(`  ⚠ 감지 단계: ${diagnostics.blockDetectedAt || "unknown"}`);
        console.warn("  ⚠ 30분 이상 쉬고 headful + --gap 60000 으로 재시도하세요.");
        stoppedEarly = true;
        break;
      }

      if (i < targets.length - 1 && !circuitBreaker.tripped) {
        const gap = rowGapWithJitter(options.gapMs, options.gapJitterMs);
        console.log(`  next row wait: ${Math.round(gap / 1000)}s`);
        await sleep(gap);
      }
    }
  } finally {
    await browser.close();
  }

  const candidateRows = allRows
    .map((row) => collected.get(row.id))
    .filter(
      (
        row,
      ): row is import("./lib/naverMapEnrichment/types").NaverMapEnrichmentRow =>
        row !== undefined,
    );
  const writtenPath = writeCandidatesCsv(CANDIDATES_CSV, candidateRows);
  console.log("");
  console.log(`candidates written: ${writtenPath} (${candidateRows.length} rows)`);

  if (options.overwrite) {
    const backupPath = backupEditCsv(EDIT_CSV, BACKUP_DIR);
    console.log(`backup created: ${backupPath}`);
  }

  const merge = buildMergePreview(allRows, collected, {
    fillMissingOnly: options.fillMissingOnly,
    overwrite: options.overwrite,
    skipPriceFields: options.skipReservation || options.contactOnly,
  });
  writeMergePreviewCsv(MERGE_PREVIEW_CSV, headers, merge.rows);
  console.log(`merge preview written: ${MERGE_PREVIEW_CSV}`);
  console.log(
    `merge stats: filled=${merge.fieldsFilled} skipped_diff=${merge.fieldsSkippedDiff} overwritten=${merge.fieldsOverwritten}`,
  );

  if (stoppedEarly) {
    console.warn("");
    console.warn("WARNING: Batch stopped early (circuit breaker / access restriction).");
    console.warn(
      "Wait 30+ minutes before retrying. Suggested: --headful --gap 60000 --goto-min-interval 60000 --limit 5",
    );
  }

  const successCount = targets.filter((row) => {
    const result = collected.get(row.id);
    return (
      result?.search_strategy &&
      result.search_strategy !== "failed" &&
      result.search_strategy !== "skipped"
    );
  }).length;
  const clubhouseCount = targets.filter((row) => {
    return collected.get(row.id)?.search_strategy === "clubhouse_fallback";
  }).length;
  const skippedCount = targets.filter((row) => {
    return collected.get(row.id)?.search_strategy === "skipped";
  }).length;
  console.log("");
  console.log(
    `done: ${successCount}/${targets.length} collected (${clubhouseCount} clubhouse contact-only), ${skippedCount} skipped`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
