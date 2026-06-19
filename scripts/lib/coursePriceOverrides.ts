export const COURSE_PRICE_OVERRIDE_HEADERS = [
  "id",
  "name",
  "price_text",
  "price_min",
  "price_max",
  "price_type",
  "source_url",
  "source",
  "checked_at",
  "note",
] as const;

export type CoursePriceOverridePriceType =
  | "green_fee"
  | "reservation_price"
  | "weekday_green_fee"
  | "weekend_green_fee"
  | "unknown";

export interface CoursePriceOverrideRow {
  id: string;
  name: string;
  price_text: string;
  price_min: string;
  price_max: string;
  price_type: CoursePriceOverridePriceType | string;
  source_url: string;
  source: string;
  checked_at: string;
  note: string;
}

export function coursePriceOverrideToCells(row: CoursePriceOverrideRow): string[] {
  return COURSE_PRICE_OVERRIDE_HEADERS.map((header) => row[header] ?? "");
}

export function rowCellsToCoursePriceOverride(
  cells: string[],
  headers?: string[],
): CoursePriceOverrideRow {
  const get = (name: (typeof COURSE_PRICE_OVERRIDE_HEADERS)[number]): string => {
    if (headers?.length) {
      const idx = headers.findIndex(
        (header) => header.replace(/^\uFEFF/, "").trim() === name,
      );
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    }
    const idx = COURSE_PRICE_OVERRIDE_HEADERS.indexOf(name);
    return idx >= 0 ? (cells[idx] ?? "").trim() : "";
  };

  const row = {} as CoursePriceOverrideRow;
  for (const header of COURSE_PRICE_OVERRIDE_HEADERS) {
    row[header] = get(header);
  }
  return row;
}

export function hasPriceOverrideValues(row: CoursePriceOverrideRow): boolean {
  return Boolean(
    row.price_text.trim() ||
      row.price_min.trim() ||
      row.price_max.trim() ||
      row.price_type.trim(),
  );
}
