import fs from "node:fs";
import path from "node:path";
import { rowsToCsv, writeFileUtf8BomWithFallback } from "../csvUtils";
import { assessScoreDifficultySwap } from "./scoreSwap";
import type { EnrichmentInputRow, NaverMapEnrichmentRow } from "./types";
import { NAVER_MAP_ENRICHMENT_HEADERS } from "./types";

type FieldMapping = Array<{
  editField: keyof EnrichmentInputRow;
  scrapedField: keyof NaverMapEnrichmentRow;
}>;

const FIELD_MAP: FieldMapping = [
  { editField: "phone", scrapedField: "scraped_phone" },
  { editField: "homepage_url", scrapedField: "scraped_homepage_url" },
  { editField: "avg_score", scrapedField: "scraped_avg_score" },
  { editField: "difficulty", scrapedField: "scraped_difficulty" },
];

const FIELD_MAP_WITH_PRICE: FieldMapping = [
  ...FIELD_MAP,
  { editField: "price_text", scrapedField: "scraped_price_text" },
  { editField: "price_min", scrapedField: "scraped_price_min" },
  { editField: "price_max", scrapedField: "scraped_price_max" },
  { editField: "price_type", scrapedField: "scraped_price_type" },
];

const CONTACT_FIELD_MAP: FieldMapping = [
  { editField: "phone", scrapedField: "scraped_phone" },
  { editField: "homepage_url", scrapedField: "scraped_homepage_url" },
];

function fieldsForCandidate(
  candidate: NaverMapEnrichmentRow,
  skipPriceFields: boolean,
): FieldMapping {
  if (candidate.search_strategy === "clubhouse_fallback") {
    return CONTACT_FIELD_MAP;
  }
  return skipPriceFields ? FIELD_MAP : FIELD_MAP_WITH_PRICE;
}

function isFilled(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

export interface MergePreviewResult {
  rows: EnrichmentInputRow[];
  notesAdded: number;
  fieldsFilled: number;
  fieldsSkippedDiff: number;
  fieldsOverwritten: number;
}

export function buildMergePreview(
  editRows: EnrichmentInputRow[],
  candidates: Map<string, NaverMapEnrichmentRow>,
  options: { fillMissingOnly: boolean; overwrite: boolean; skipPriceFields?: boolean },
): MergePreviewResult {
  const skipPriceFields = options.skipPriceFields ?? true;
  let notesAdded = 0;
  let fieldsFilled = 0;
  let fieldsSkippedDiff = 0;
  let fieldsOverwritten = 0;

  const rows = editRows.map((row) => {
    const candidate = candidates.get(row.id);
    if (!candidate) return { ...row };

    const merged = { ...row };
    const noteParts: string[] = [];

    let candidateForMerge = candidate;
    if (
      candidate.search_strategy !== "clubhouse_fallback" &&
      candidate.scraped_avg_score.trim() &&
      candidate.scraped_difficulty.trim()
    ) {
      const swap = assessScoreDifficultySwap(
        candidate.scraped_avg_score,
        candidate.scraped_difficulty,
      );
      if (swap.suspected) {
        candidateForMerge = {
          ...candidate,
          scraped_avg_score: swap.correctedAvgScore,
          scraped_difficulty: swap.correctedDifficulty,
        };
        noteParts.push(swap.note);
      }
    }

    const editSwap = assessScoreDifficultySwap(merged.avg_score, merged.difficulty);
    if (editSwap.suspected) {
      noteParts.push(
        `edit_csv_swap_suspected; corrected_avg_score=${editSwap.correctedAvgScore}; corrected_difficulty=${editSwap.correctedDifficulty}`,
      );
    }

    for (const { editField, scrapedField } of fieldsForCandidate(
      candidateForMerge,
      skipPriceFields,
    )) {
      const existing = merged[editField]?.trim() ?? "";
      const scraped = candidateForMerge[scrapedField]?.trim() ?? "";
      if (!scraped) continue;

      if (!existing) {
        merged[editField] = scraped;
        fieldsFilled += 1;
        continue;
      }

      if (existing === scraped) continue;

      if (options.overwrite) {
        merged[editField] = scraped;
        noteParts.push(`${editField}: ${existing} -> ${scraped}`);
        fieldsOverwritten += 1;
      } else if (options.fillMissingOnly) {
        noteParts.push(`${editField} diff kept existing (${existing} vs scraped ${scraped})`);
        fieldsSkippedDiff += 1;
      }
    }

    if (noteParts.length > 0) {
      const prefix = merged.note.trim() ? `${merged.note.trim()}; ` : "";
      merged.note = `${prefix}${noteParts.join("; ")}`;
      notesAdded += 1;
    }

    return merged;
  });

  return {
    rows,
    notesAdded,
    fieldsFilled,
    fieldsSkippedDiff,
    fieldsOverwritten,
  };
}

export function backupEditCsv(sourcePath: string, backupDir: string): string {
  fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "")
    .replace("T", "_");
  const dest = path.join(
    backupDir,
    `course_enrichment_edit.before_merge_${timestamp}.csv`,
  );
  fs.copyFileSync(sourcePath, dest);
  return dest;
}

export function writeMergePreviewCsv(
  filePath: string,
  editHeaders: string[],
  rows: EnrichmentInputRow[],
): void {
  const cells = rows.map((row) =>
    editHeaders.map((header) => {
      const key = header as keyof EnrichmentInputRow;
      return row[key] ?? "";
    }),
  );
  writeFileUtf8BomWithFallback(filePath, rowsToCsv(editHeaders, cells));
}

export function writeCandidatesCsv(
  filePath: string,
  rows: NaverMapEnrichmentRow[],
): string {
  const cells = rows.map((row) =>
    NAVER_MAP_ENRICHMENT_HEADERS.map((header) => row[header] ?? ""),
  );
  return writeFileUtf8BomWithFallback(
    filePath,
    rowsToCsv([...NAVER_MAP_ENRICHMENT_HEADERS], cells),
  );
}
