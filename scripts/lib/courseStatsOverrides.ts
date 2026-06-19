export const COURSE_STATS_OVERRIDE_HEADERS = [
  "id",
  "name",
  "difficulty",
  "avg_score",
  "reservation_prices_text",
  "source_url",
  "source",
  "checked_at",
  "note",
] as const;

export interface CourseStatsOverrideRow {
  id: string;
  name: string;
  difficulty: string;
  avg_score: string;
  reservation_prices_text: string;
  source_url: string;
  source: string;
  checked_at: string;
  note: string;
}

export function courseStatsOverrideToCells(row: CourseStatsOverrideRow): string[] {
  return COURSE_STATS_OVERRIDE_HEADERS.map((header) => row[header] ?? "");
}

export function rowCellsToCourseStatsOverride(
  cells: string[],
  headers?: string[],
): CourseStatsOverrideRow {
  const get = (name: (typeof COURSE_STATS_OVERRIDE_HEADERS)[number]): string => {
    if (headers?.length) {
      const idx = headers.findIndex(
        (header) => header.replace(/^\uFEFF/, "").trim() === name,
      );
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    }
    const idx = COURSE_STATS_OVERRIDE_HEADERS.indexOf(name);
    return idx >= 0 ? (cells[idx] ?? "").trim() : "";
  };

  const row = {} as CourseStatsOverrideRow;
  for (const header of COURSE_STATS_OVERRIDE_HEADERS) {
    row[header] = get(header);
  }
  return row;
}

export function hasStatsOverrideValues(row: CourseStatsOverrideRow): boolean {
  return Boolean(
    row.difficulty.trim() ||
      row.avg_score.trim() ||
      row.reservation_prices_text.trim(),
  );
}
