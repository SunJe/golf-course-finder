import fs from "node:fs";
import path from "node:path";
import { getEnrichmentPaths } from "./naverEnrichmentInspect";
import { getProjectRoot } from "./sourceRegistry";

export interface BackupResult {
  created: string[];
  offsetTag: number;
  timestamp: string;
}

function formatTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

function copyIfExists(source: string, dest: string): boolean {
  if (!fs.existsSync(source)) {
    return false;
  }
  fs.copyFileSync(source, dest);
  return true;
}

export function backupEnrichmentCsvs(
  offsetTag: number,
  root = getProjectRoot(),
): BackupResult {
  const paths = getEnrichmentPaths(root);
  const backupDir = path.join(root, "data/enrichment/backups");
  fs.mkdirSync(backupDir, { recursive: true });

  const timestamp = formatTimestamp(new Date());
  const suffix = `before_offset_${offsetTag}_${timestamp}.csv`;
  const created: string[] = [];

  const files: Array<{ source: string; base: string }> = [
    { source: paths.candidates, base: "naver_price_candidates" },
    { source: paths.review, base: "naver_price_review" },
    { source: paths.courseLinks, base: "course_links" },
    { source: paths.priceOverrides, base: "course_price_overrides" },
    { source: paths.statsOverrides, base: "course_stats_overrides" },
  ];

  for (const file of files) {
    const dest = path.join(backupDir, `${file.base}.${suffix}`);
    if (copyIfExists(file.source, dest)) {
      created.push(dest);
    }
  }

  if (created.length === 0) {
    throw new Error("Backup failed: no enrichment CSV files found to copy.");
  }

  return { created, offsetTag, timestamp };
}

export function printBackupResult(result: BackupResult): void {
  console.log("");
  console.log("=== CSV backup ===");
  for (const filePath of result.created) {
    console.log(`backup created: ${filePath}`);
  }
}
