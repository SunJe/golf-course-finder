import fs from "node:fs";
import path from "node:path";
import {
  type DownloadFailureRecord,
  writeDownloadFailuresMarkdown,
} from "./lib/reviewWriters";
import {
  getRawFilePath,
  loadSourceRegistry,
  sortSourcesMasterFirst,
  type GolfCourseSource,
} from "./lib/sourceRegistry";
import { writeFileUtf8 } from "./lib/csvUtils";

interface DownloadResult {
  source: GolfCourseSource;
  status: "success" | "skipped" | "failed";
  reason: string;
  notes: string;
}

function fileExistsAndNonEmpty(filePath: string): boolean {
  if (!fs.existsSync(filePath)) return false;
  return fs.statSync(filePath).size > 0;
}

async function downloadFromUrl(
  url: string,
  apiKey?: string,
): Promise<{ ok: true; body: string } | { ok: false; error: string }> {
  try {
    const resolved = apiKey
      ? url.replace("{API_KEY}", encodeURIComponent(apiKey)).replace(
          "{SERVICE_KEY}",
          encodeURIComponent(apiKey),
        )
      : url;

    const response = await fetch(resolved, {
      headers: apiKey ? { Authorization: apiKey } : undefined,
    });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status} ${response.statusText}` };
    }

    const body = await response.text();
    if (!body.trim()) {
      return { ok: false, error: "Empty response body" };
    }

    return { ok: true, body };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function buildManualAction(source: GolfCourseSource): string {
  return `공공데이터/제공처에서 직접 다운로드 후 data/raw/${source.expected_file_name} 로 저장`;
}

async function processSource(
  source: GolfCourseSource,
  apiKey: string | undefined,
): Promise<{ result: DownloadResult; failure?: DownloadFailureRecord }> {
  const rawPath = getRawFilePath(source.expected_file_name);

  if (fileExistsAndNonEmpty(rawPath)) {
    return {
      result: {
        source,
        status: "success",
        reason: "already_present",
        notes: `Existing file: ${rawPath}`,
      },
    };
  }

  if (source.requires_login) {
    return {
      result: {
        source,
        status: "failed",
        reason: "manual_required",
        notes: source.notes ?? "Login or approval required",
      },
      failure: {
        source_id: source.id,
        source_name: source.name,
        expected_file_name: source.expected_file_name,
        reason: "manual_required",
        required_action: buildManualAction(source),
        notes: "requires_login=true. User must download manually.",
      },
    };
  }

  if (
    source.download_method === "manual" &&
    !source.download_url
  ) {
    return {
      result: {
        source,
        status: "failed",
        reason: "manual_required",
        notes: "download_method=manual",
      },
      failure: {
        source_id: source.id,
        source_name: source.name,
        expected_file_name: source.expected_file_name,
        reason: "manual_required",
        required_action: buildManualAction(source),
        notes: source.notes ?? "",
      },
    };
  }

  if (source.requires_api_key && !apiKey) {
    return {
      result: {
        source,
        status: "skipped",
        reason: "skipped_missing_api_key",
        notes: "Set DATA_GO_KR_SERVICE_KEY in .env.local",
      },
      failure: {
        source_id: source.id,
        source_name: source.name,
        expected_file_name: source.expected_file_name,
        reason: "skipped_missing_api_key",
        required_action: `.env.local에 DATA_GO_KR_SERVICE_KEY 설정 후 npm run download:golf-sources 재실행, 또는 ${buildManualAction(source)}`,
        notes: "open_api source without API key",
      },
    };
  }

  if (!source.download_url?.trim()) {
    return {
      result: {
        source,
        status: "failed",
        reason: "no_download_url_in_registry",
        notes: "No download_url configured in registry",
      },
      failure: {
        source_id: source.id,
        source_name: source.name,
        expected_file_name: source.expected_file_name,
        reason: "no_download_url_in_registry",
        required_action: buildManualAction(source),
        notes: source.notes ?? "",
      },
    };
  }

  const downloaded = await downloadFromUrl(source.download_url, apiKey);
  if (!downloaded.ok) {
    return {
      result: {
        source,
        status: "failed",
        reason: "download_failed",
        notes: downloaded.error,
      },
      failure: {
        source_id: source.id,
        source_name: source.name,
        expected_file_name: source.expected_file_name,
        reason: "download_failed",
        required_action: buildManualAction(source),
        notes: downloaded.error,
      },
    };
  }

  writeFileUtf8(rawPath, downloaded.body);
  return {
    result: {
      source,
      status: "success",
      reason: "downloaded",
      notes: `Saved to ${rawPath}`,
    },
  };
}

async function main(): Promise<void> {
  const runAt = new Date().toISOString();
  const registry = loadSourceRegistry();
  const apiKey = process.env.DATA_GO_KR_SERVICE_KEY?.trim();
  const sources = sortSourcesMasterFirst(registry.sources);

  console.log("[download:golf-sources] Phase 1 — raw data collection");
  console.log(`  Registry: ${registry.sources.length} sources`);
  console.log(`  API key: ${apiKey ? "present" : "not set"}`);
  console.log("");

  const results: DownloadResult[] = [];
  const failures: DownloadFailureRecord[] = [];

  for (const source of sources) {
    const { result, failure } = await processSource(source, apiKey);
    results.push(result);
    if (failure && result.status !== "success") {
      failures.push(failure);
    }

    const icon =
      result.status === "success"
        ? "OK"
        : result.status === "skipped"
          ? "SKIP"
          : "FAIL";
    console.log(
      `[${icon}] ${source.id} (${source.role}) → ${source.expected_file_name}`,
    );
    console.log(`      ${result.reason}: ${result.notes}`);
  }

  writeDownloadFailuresMarkdown(failures, runAt);

  const master = sources.find((s) => s.role === "master");
  const masterPath = master ? getRawFilePath(master.expected_file_name) : null;
  const masterReady =
    masterPath !== null && fileExistsAndNonEmpty(masterPath);

  console.log("");
  console.log("Summary:");
  console.log(
    `  success: ${results.filter((r) => r.status === "success").length}`,
  );
  console.log(
    `  skipped: ${results.filter((r) => r.status === "skipped").length}`,
  );
  console.log(
    `  failed:  ${results.filter((r) => r.status === "failed").length}`,
  );
  console.log(`  failures log: data/review/download_failures.md`);

  if (master) {
    console.log("");
    if (masterReady) {
      console.log(
        `  Master source ready: data/raw/${master.expected_file_name}`,
      );
      console.log("  Next: npm run analyze:golf-raw");
    } else {
      console.log(
        `  Master source NOT ready: data/raw/${master.expected_file_name}`,
      );
      console.log(
        "  Phase 2 blocked until master CSV is manually placed. See download_failures.md",
      );
      process.exitCode = 1;
    }
  }
}

main().catch((error) => {
  console.error("[download:golf-sources] Fatal error:", error);
  process.exit(1);
});
