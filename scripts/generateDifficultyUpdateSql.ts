import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csvUtils";
import { readCsvWithEncodingGuess } from "./lib/encodingUtils";
import { getProjectRoot } from "./lib/sourceRegistry";
import { hasValidDifficulty, normalizeDifficulty } from "../lib/difficulty";

const ROOT = getProjectRoot();
const CSV_PATH = path.join(ROOT, "data/enrichment/course_enrichment_edit.csv");
const SQL_OUT = path.join(ROOT, "scripts/sql/update_difficulty_from_enrichment.sql");

function escapeSqlLiteral(value: string): string {
  return value.replace(/'/g, "''");
}

function sqlString(value: string): string {
  return `'${escapeSqlLiteral(value)}'`;
}

function rowToRecord(headers: string[], row: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = row[index] ?? "";
  });
  return record;
}

function buildValuesClause(
  rows: Array<{ id: string; difficulty: string }>,
): string {
  return rows
    .map(
      (row) => `    (${sqlString(row.id)}, ${sqlString(row.difficulty)})`,
    )
    .join(",\n");
}

function main(): void {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    process.exit(1);
  }

  const { content } = readCsvWithEncodingGuess(CSV_PATH);
  const { headers, rows } = parseCsv(content);

  for (const col of ["id", "difficulty"]) {
    if (!headers.includes(col)) {
      console.error(`Missing required column: ${col}`);
      process.exit(1);
    }
  }

  const updates: Array<{ id: string; difficulty: string }> = [];
  const valueCounts = new Map<string, number>();
  let withId = 0;
  let skipped = 0;

  for (const row of rows) {
    const record = rowToRecord(headers, row);
    const id = record.id.trim();
    if (!id) {
      skipped += 1;
      continue;
    }
    withId += 1;

    const difficulty = normalizeDifficulty(record.difficulty);
    if (!difficulty) {
      skipped += 1;
      continue;
    }

    updates.push({ id, difficulty });
    valueCounts.set(difficulty, (valueCounts.get(difficulty) ?? 0) + 1);
  }

  const generatedAt = new Date().toISOString();
  const valuesClause = buildValuesClause(updates);

  const sql = `-- Generated: ${generatedAt}
-- Source CSV: data/enrichment/course_enrichment_edit.csv
-- CSV rows: ${rows.length}
-- Rows with id: ${withId}
-- Update targets (valid difficulty): ${updates.length}
-- Skipped rows: ${skipped}
-- Column updated: difficulty ONLY (avg_score and other fields untouched)

begin;

with incoming(id, difficulty) as (
  values
${valuesClause}
),
preview as (
  select
    g.id,
    g.name,
    g.difficulty as old_difficulty,
    i.difficulty as new_difficulty
  from public.golf_courses g
  join incoming i on i.id = g.id
  where i.difficulty is not null
    and trim(i.difficulty) <> ''
)
select * from preview
order by name
limit 100;

with incoming(id, difficulty) as (
  values
${valuesClause}
)
update public.golf_courses as g
set
  difficulty = i.difficulty
from incoming i
where g.id = i.id
  and i.difficulty is not null
  and trim(i.difficulty) <> ''
  and lower(trim(i.difficulty)) not in ('-', '정보 없음', '미확인', 'n/a', 'na', 'null', 'undefined');

select
  count(*) filter (where difficulty is not null and trim(difficulty) <> '') as difficulty_count,
  count(*) as total_count
from public.golf_courses;

commit;
`;

  fs.mkdirSync(path.dirname(SQL_OUT), { recursive: true });
  fs.writeFileSync(SQL_OUT, sql, "utf8");

  console.log("=== difficulty SQL generation report ===");
  console.log(`CSV rows: ${rows.length}`);
  console.log(`Rows with id: ${withId}`);
  console.log(`Valid difficulty rows: ${updates.length}`);
  console.log(`Skipped rows: ${skipped}`);
  console.log("");
  console.log("Difficulty value counts (top 15):");
  for (const [value, count] of [...valueCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)) {
    console.log(`  ${count.toString().padStart(4)}  ${value}`);
  }
  console.log("");
  console.log(`Output: ${SQL_OUT}`);
}

main();
