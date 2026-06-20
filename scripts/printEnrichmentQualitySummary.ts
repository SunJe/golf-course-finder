import {
  inspectEnrichmentState,
  printEnrichmentStateReport,
} from "./lib/naverEnrichmentInspect";
import {
  computeCoverageReport,
  printCoverageReport,
} from "./lib/naverCoverage";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { buildBatchQualityReport } from "./lib/enrichmentQualityReport";
import {
  normalizeCsvHeader,
  rowCellsToCandidate,
  type NaverPriceCandidateRow,
} from "./lib/naverPriceCandidates";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
const CANDIDATES_CSV = `${ROOT}/data/enrichment/naver_price_candidates.csv`;

function loadAllCandidates(): NaverPriceCandidateRow[] {
  const encoding = readCsvWithEncodingGuess(CANDIDATES_CSV);
  const parsed = parseCsv(encoding.content);
  const headers = parsed.headers.map((header) => normalizeCsvHeader(header));
  return parsed.rows.map((cells) => rowCellsToCandidate(cells, headers));
}

function main(): void {
  printEnrichmentStateReport(inspectEnrichmentState(ROOT));
  const coverage = computeCoverageReport(ROOT);
  printCoverageReport(coverage);

  const rows = loadAllCandidates();
  const report = buildBatchQualityReport(rows);

  console.log("");
  console.log("=== Final quality summary ===");
  console.log(
    `Coverage progress   : ${((coverage.collectedUniqueIds / coverage.masterCourseCount) * 100).toFixed(1)}% (${coverage.collectedUniqueIds}/${coverage.masterCourseCount})`,
  );
  console.log(
    `Confidence          : high=${report.confidenceHigh}, medium=${report.confidenceMedium}, low=${report.confidenceLow}`,
  );
  console.log(`Empty price rows    : ${report.emptyPrice}/${report.total}`);

  console.log("");
  console.log("=== Low confidence (Review UI check) ===");
  const low = rows.filter((row) => row.candidate_confidence === "low");
  if (low.length === 0) {
    console.log("none");
  } else {
    for (const row of low) {
      console.log(
        ` - ${row.name} (${row.id}) | matched=${row.matched_query || row.query_variant}`,
      );
    }
  }

  console.log("");
  console.log("=== Needs attention top 20 ===");
  const scored = rows
    .map((row) => {
      let score = 0;
      if (row.candidate_confidence === "low") score += 10;
      if (row.candidate_confidence === "medium") score += 3;
      if (!row.candidate_phone.trim()) score += 2;
      if (!row.candidate_homepage_url.trim()) score += 1;
      if (!row.candidate_price_text.trim()) score += 1;
      if (!row.candidate_title.trim()) score += 5;
      return { row, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  for (const { row } of scored) {
    const issues: string[] = [];
    if (row.candidate_confidence === "low") issues.push("low");
    if (!row.candidate_phone.trim()) issues.push("no phone");
    if (!row.candidate_title.trim()) issues.push("no title");
    if (!row.candidate_homepage_url.trim()) issues.push("no homepage");
    console.log(` - ${row.name} (${row.id}) [${issues.join(", ")}]`);
  }
}

main();
