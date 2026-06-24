import {
  DEFAULT_COURSE_RESULTS_CSV,
  DEFAULT_DAILY_RESULTS_CSV,
  DEFAULT_MANUAL_REVIEW_CSV,
  DEFAULT_SUMMARY_CSV,
  readDailyResults,
  writeCourseResultsCsv,
  writeManualReviewCsv,
  writeSummaryCsv,
} from "./lib/teescanner/batchIo";
import { buildAllSummaries, buildManualReviewRows } from "./lib/teescanner/summary";

function main(): void {
  const daily = readDailyResults(DEFAULT_DAILY_RESULTS_CSV);
  const summaries = buildAllSummaries(daily);
  writeSummaryCsv(DEFAULT_SUMMARY_CSV, summaries);
  writeCourseResultsCsv(DEFAULT_COURSE_RESULTS_CSV, summaries);
  const manualReviewRows = buildManualReviewRows(summaries);
  writeManualReviewCsv(DEFAULT_MANUAL_REVIEW_CSV, manualReviewRows);
  console.log(`Rebuilt ${summaries.length} summary row(s).`);
  console.log(`Rebuilt ${manualReviewRows.length} manual review row(s).`);
}

main();
