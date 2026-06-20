import type { NaverPriceCandidateRow } from "./naverPriceCandidates";
import { countCandidateFieldStats } from "./naverPriceCandidates";

export interface BatchQualityReport {
  total: number;
  failed: number;
  phoneRate: number;
  homepageRate: number;
  priceRate: number;
  difficultyRate: number;
  avgScoreRate: number;
  confidenceHigh: number;
  confidenceMedium: number;
  confidenceLow: number;
  emptyPrice: number;
  sourceUrlOnly: number;
  queryVariants: Array<{ variant: string; count: number }>;
  matchedQueries: Array<{ query: string; count: number }>;
}

function pct(filled: number, total: number): string {
  if (total === 0) return "0%";
  return `${((filled / total) * 100).toFixed(1)}% (${filled}/${total})`;
}

function isSourceUrlOnly(row: NaverPriceCandidateRow): boolean {
  const hasContact =
    row.candidate_phone.trim() ||
    row.candidate_homepage_url.trim() ||
    row.candidate_price_text.trim() ||
    row.candidate_difficulty.trim() ||
    row.candidate_avg_score.trim();
  return Boolean(row.source_url.trim()) && !hasContact && !row.candidate_title.trim();
}

export function buildBatchQualityReport(
  rows: NaverPriceCandidateRow[],
  options?: { failed?: number },
): BatchQualityReport {
  const stats = countCandidateFieldStats(rows);
  const confidenceHigh = rows.filter(
    (row) => row.candidate_confidence === "high",
  ).length;
  const confidenceMedium = rows.filter(
    (row) => row.candidate_confidence === "medium",
  ).length;
  const confidenceLow = rows.filter(
    (row) => row.candidate_confidence === "low",
  ).length;
  const emptyPrice = rows.filter((row) => !row.candidate_price_text.trim()).length;
  const sourceUrlOnly = rows.filter(isSourceUrlOnly).length;

  const variantCounts = new Map<string, number>();
  const matchedCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.query_variant.trim()) {
      variantCounts.set(
        row.query_variant.trim(),
        (variantCounts.get(row.query_variant.trim()) ?? 0) + 1,
      );
    }
    if (row.matched_query.trim()) {
      const key = row.matched_query.trim().slice(0, 60);
      matchedCounts.set(key, (matchedCounts.get(key) ?? 0) + 1);
    }
  }

  const topVariants = [...variantCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([variant, count]) => ({ variant, count }));

  const topMatched = [...matchedCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([query, count]) => ({ query, count }));

  return {
    total: rows.length,
    failed: options?.failed ?? 0,
    phoneRate: stats.phone,
    homepageRate: stats.homepage,
    priceRate: stats.price,
    difficultyRate: stats.difficulty,
    avgScoreRate: stats.avg_score,
    confidenceHigh,
    confidenceMedium,
    confidenceLow,
    emptyPrice,
    sourceUrlOnly,
    queryVariants: topVariants,
    matchedQueries: topMatched,
  };
}

export function printBatchQualityReport(
  label: string,
  rows: NaverPriceCandidateRow[],
  options?: { failed?: number },
): BatchQualityReport {
  const report = buildBatchQualityReport(rows, options);

  console.log("");
  console.log(`=== ${label} ===`);
  console.log(`Rows analyzed       : ${report.total}`);
  if (options?.failed !== undefined) {
    console.log(`Failed this batch   : ${options.failed}`);
  }
  console.log(`Phone fill          : ${pct(report.phoneRate, report.total)}`);
  console.log(`Homepage fill       : ${pct(report.homepageRate, report.total)}`);
  console.log(`Price fill          : ${pct(report.priceRate, report.total)}`);
  console.log(`Difficulty fill     : ${pct(report.difficultyRate, report.total)}`);
  console.log(`Avg score fill      : ${pct(report.avgScoreRate, report.total)}`);
  console.log(
    `Confidence          : high=${report.confidenceHigh}, medium=${report.confidenceMedium}, low=${report.confidenceLow}`,
  );
  console.log(`Empty price         : ${report.emptyPrice}/${report.total}`);
  console.log(`Source URL only     : ${report.sourceUrlOnly}/${report.total}`);

  if (report.queryVariants.length > 0) {
    console.log("Top query_variant:");
    for (const entry of report.queryVariants) {
      console.log(`  ${entry.variant}: ${entry.count}`);
    }
  }

  if (report.matchedQueries.length > 0) {
    console.log("Top matched_query:");
    for (const entry of report.matchedQueries) {
      console.log(`  ${entry.query}: ${entry.count}`);
    }
  }

  return report;
}
