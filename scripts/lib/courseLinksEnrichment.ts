export const COURSE_LINKS_HEADERS = [
  "id",
  "name",
  "homepage_url",
  "booking_url",
  "phone",
  "source_url",
  "note",
] as const;

export const COURSE_LINKS_UPDATE_FIELDS = [
  "homepage_url",
  "booking_url",
  "phone",
] as const;

export type CourseLinksEnrichmentValues = {
  homepage_url: string;
  booking_url: string;
  phone: string;
  source_url: string;
  note: string;
};

export type CourseLinksRow = {
  id: string;
  name: string;
} & CourseLinksEnrichmentValues;

export function normalizeCsvHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim();
}

export function hasCourseLinksUpdateValues(row: CourseLinksRow): boolean {
  return COURSE_LINKS_UPDATE_FIELDS.some((field) => row[field].trim().length > 0);
}

export function rowCellsToCourseLinks(cells: string[]): CourseLinksRow {
  const get = (index: number) => (cells[index] ?? "").trim();
  return {
    id: get(0),
    name: get(1),
    homepage_url: get(2),
    booking_url: get(3),
    phone: get(4),
    source_url: get(5),
    note: get(6),
  };
}

export function courseLinksToCells(row: CourseLinksRow): string[] {
  return [
    row.id,
    row.name,
    row.homepage_url,
    row.booking_url,
    row.phone,
    row.source_url,
    row.note,
  ];
}
