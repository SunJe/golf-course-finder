import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";
import {
  hasValidDifficulty,
  isBlankDifficultyValue,
} from "../lib/difficulty";

const CSV_PATH = path.join(
  getProjectRoot(),
  "data/enrichment/course_enrichment_edit.csv",
);

function rowToRecord(headers: string[], row: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = row[index] ?? "";
  });
  return record;
}

function main(): void {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const { content } = readCsvWithEncodingGuess(CSV_PATH);
  const { headers, rows } = parseCsv(content);

  for (const col of ["id", "name", "difficulty"]) {
    if (!headers.includes(col)) {
      console.error(`Missing required column: ${col}`);
      process.exit(1);
    }
  }

  const valueCounts = new Map<string, number>();
  const suspicious: Array<{ id: string; name: string; difficulty: string }> =
    [];
  let withId = 0;
  let validDifficulty = 0;
  let blankDifficulty = 0;

  for (const row of rows) {
    const record = rowToRecord(headers, row);
    const id = record.id.trim();
    if (!id) continue;
    withId += 1;

    const difficulty = record.difficulty?.trim() ?? "";
    const bucket = difficulty || "(empty)";
    valueCounts.set(bucket, (valueCounts.get(bucket) ?? 0) + 1);

    if (hasValidDifficulty(difficulty)) {
      validDifficulty += 1;
    } else {
      blankDifficulty += 1;
    }

    const num = Number.parseFloat(difficulty);
    if (
      difficulty &&
      !isBlankDifficultyValue(difficulty) &&
      (!Number.isFinite(num) || num < 0 || num > 10) &&
      !/[가-힣a-z]/i.test(difficulty)
    ) {
      suspicious.push({
        id,
        name: record.name.trim(),
        difficulty,
      });
    }
  }

  console.log("=== difficulty value distribution ===");
  console.log(`CSV rows: ${rows.length}`);
  console.log(`Rows with id: ${withId}`);
  console.log(`Valid difficulty rows: ${validDifficulty}`);
  console.log(`Blank/invalid difficulty rows: ${blankDifficulty}`);
  console.log("");

  const sorted = [...valueCounts.entries()].sort((a, b) => b[1] - a[1]);
  console.log("Value counts (top 30):");
  for (const [value, count] of sorted.slice(0, 30)) {
    console.log(`  ${count.toString().padStart(4)}  ${value}`);
  }

  if (sorted.length > 30) {
    console.log(`  ... and ${sorted.length - 30} more distinct values`);
  }

  if (suspicious.length > 0) {
    console.log("");
    console.log("Suspicious samples (up to 20):");
    for (const sample of suspicious.slice(0, 20)) {
      console.log(
        `  ${sample.id} | ${sample.name} | difficulty="${sample.difficulty}"`,
      );
    }
  }
}

main();
