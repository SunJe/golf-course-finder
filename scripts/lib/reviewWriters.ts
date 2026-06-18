import fs from "node:fs";
import path from "node:path";
import { getProjectRoot } from "./sourceRegistry";

export interface DownloadFailureRecord {
  source_id: string;
  source_name: string;
  expected_file_name: string;
  reason: string;
  required_action: string;
  notes: string;
}

export function getDownloadFailuresPath(): string {
  return path.join(getProjectRoot(), "data/review/download_failures.md");
}

export function writeDownloadFailuresMarkdown(
  records: DownloadFailureRecord[],
  runAt: string,
): void {
  const lines: string[] = [
    "# Download Failures & Manual Actions",
    "",
    `> Last updated: ${runAt}`,
    "",
    "Phase 1 — raw data collection. Failed, skipped, and manual-download sources.",
    "",
    "| source_id | source_name | expected_file_name | reason | required_action | notes |",
    "|-----------|-------------|-------------------|--------|-----------------|-------|",
  ];

  if (records.length === 0) {
    lines.push(
      "| — | — | — | none | All registry sources accounted for | — |",
    );
  } else {
    for (const r of records) {
      lines.push(
        `| ${escapeCell(r.source_id)} | ${escapeCell(r.source_name)} | ${escapeCell(r.expected_file_name)} | ${escapeCell(r.reason)} | ${escapeCell(r.required_action)} | ${escapeCell(r.notes)} |`,
      );
    }
  }

  lines.push("");
  lines.push("## Reason codes");
  lines.push("");
  lines.push("- `no_download_url_in_registry` — registry에 URL 없음, 수동 다운로드 필요");
  lines.push("- `manual_required` — 로그인/활용신청 또는 manual download_method");
  lines.push("- `skipped_missing_api_key` — `DATA_GO_KR_SERVICE_KEY` 미설정");
  lines.push("- `download_failed` — URL fetch 실패");
  lines.push("- `already_present` — (성공) raw 파일 이미 존재");
  lines.push("");

  const outPath = getDownloadFailuresPath();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}
