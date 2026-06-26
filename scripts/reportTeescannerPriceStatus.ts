/**
 * 티스캐너 가격 크롤 진행 현황 리포트
 * Usage: npm run report:teescanner-price-status
 */
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_DAILY_RESULTS_CSV,
  DEFAULT_MANUAL_REVIEW_CSV,
  DEFAULT_SUMMARY_CSV,
  readDailyResults,
} from "./lib/teescanner/batchIo";
import { buildAllSummaries } from "./lib/teescanner/summary";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const CHECKPOINT_PATH = path.join(ROOT, "data/enrichment/teescanner_price_checkpoint.jsonl");
const INPUT_CSV = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const MERGE_REPORT_PATH = path.join(ROOT, "data/enrichment/teescanner_merge_report.json");
const OUT_PATH = path.join(ROOT, "reports/teescanner-price-status.md");

type CheckpointRow = {
  index: number;
  rowIndex: number;
  golfCourseId: string;
  golfCourseName: string;
  priceStatus: string;
  updatedAt: string;
};

function countCsvRows(filePath: string): number {
  if (!fs.existsSync(filePath)) return 0;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  return Math.max(0, lines.length - 1);
}

function loadCheckpoints(): CheckpointRow[] {
  if (!fs.existsSync(CHECKPOINT_PATH)) return [];
  return fs
    .readFileSync(CHECKPOINT_PATH, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as CheckpointRow);
}

function formatWon(value: string): string {
  const n = Number.parseInt(value.replace(/,/g, ""), 10);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("ko-KR")}원`;
}

function main(): void {
  const totalCourses = countCsvRows(INPUT_CSV);
  const checkpoints = loadCheckpoints();
  const crawledIds = new Set(checkpoints.map((row) => row.golfCourseId));
  const successCheckpoints = checkpoints.filter((row) => row.priceStatus === "success");
  const last = checkpoints[checkpoints.length - 1];

  const daily = readDailyResults(DEFAULT_DAILY_RESULTS_CSV);
  const summaries = buildAllSummaries(daily);

  const acceptPrice = summaries.filter((row) => row.review_action === "accept_price");
  const manualReview = summaries.filter((row) => row.review_action === "manual_review");
  const pricedManual = manualReview.filter((row) => row.price_min.trim().length > 0);
  const unpricedManual = manualReview.filter((row) => !row.price_min.trim());
  const ambiguous = summaries.filter((row) => row.match_status === "ambiguous");
  const partialSlots = summaries.filter((row) =>
    row.price_scope_summary.toLowerCase().includes("partial_day_slots"),
  );

  const mergeReport = fs.existsSync(MERGE_REPORT_PATH)
    ? (JSON.parse(fs.readFileSync(MERGE_REPORT_PATH, "utf8")) as {
        priceUpdatedCount?: number;
        manualReviewCount?: number;
        acceptPriceCount?: number;
        generatedAt?: string;
        appliedToOriginalCsv?: boolean;
      })
    : null;

  const remaining = Math.max(0, totalCourses - crawledIds.size);
  const pct = totalCourses > 0 ? ((crawledIds.size / totalCourses) * 100).toFixed(1) : "0";

  const pricedManualList = pricedManual
    .slice(0, 15)
    .map(
      (row) =>
        `- ${row.name} (\`${row.id}\`) — ${formatWon(row.price_min)}~${formatWon(row.price_max)} / 매칭: ${row.matched_title || "(없음)"}`,
    )
    .join("\n");

  const markdown = `# 티스캐너 가격 크롤 진행 현황

생성: ${new Date().toISOString()}

## 전체 진행

| 항목 | 값 |
|------|-----|
| 전체 골프장 | ${totalCourses} |
| 체크포인트 수집 완료 | **${crawledIds.size}** (${pct}%) |
| 미수집 | ${remaining} |
| 체크포인트 성공 | ${successCheckpoints.length} |
| 마지막 수집 | row ${last?.rowIndex ?? "-"} / ${last?.golfCourseName ?? "-"} |
| 마지막 시각 | ${last?.updatedAt ?? "-"} |

## 요약 CSV 기준 (${summaries.length}건)

| 구분 | 건수 |
|------|------|
| 자동 승인 가능 (\`accept_price\`) | ${acceptPrice.length} |
| 수동 검수 필요 (\`manual_review\`) | ${manualReview.length} |
| └ 가격 있음 (우선 검수) | **${pricedManual.length}** |
| └ 가격 없음 | ${unpricedManual.length} |
| 매칭 ambiguous | ${ambiguous.length} |
| partial_day_slots | ${partialSlots.length} |
| daily 결과 row | ${daily.length} |
| manual_review_list row | ${countCsvRows(DEFAULT_MANUAL_REVIEW_CSV)} |

## enrichment 반영 (마지막 merge)

${
  mergeReport
    ? `- 시각: ${mergeReport.generatedAt ?? "-"}
- CSV 반영: ${mergeReport.appliedToOriginalCsv ? "완료" : "미반영"}
- 가격 업데이트: ${mergeReport.priceUpdatedCount ?? 0}건
- accept_price: ${mergeReport.acceptPriceCount ?? 0}건
- manual_review(가격 있음): ${mergeReport.manualReviewCount ?? 0}건`
    : "- merge 리포트 없음"
}

## 다음 단계

1. **미수집 ${remaining}건** 계속 크롤:
   \`\`\`bash
   npm run collect:teescanner-price-batch -- --start-row ${(last?.rowIndex ?? 0) + 1} --limit 20
   \`\`\`
2. **수동 검수 HTML** 생성 후 브라우저에서 확인:
   \`\`\`bash
   npm run build:teescanner-price-review-page
   \`\`\`
   → \`reports/teescanner-price-review.html\`
3. 검수 완료 후 채팅에 결과 붙여넣기 → \`npm run apply:teescanner-review-decisions\`
4. 전체 반영:
   \`\`\`bash
   npm run apply:teescanner-review-decisions
   npm run merge:teescanner-prices -- --apply-csv true
   \`\`\`

## 가격 있는 수동 검수 샘플 (상위 15)

${pricedManualList || "(없음)"}
`;

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, markdown, "utf8");
  console.log(`saved: ${OUT_PATH}`);
  console.log(
    `crawled=${crawledIds.size}/${totalCourses} accept=${acceptPrice.length} manual=${manualReview.length} pricedManual=${pricedManual.length}`,
  );
}

main();
