export function parseRoundDayFromUrl(url: string): string {
  const match = url.match(/[?&]roundDay=(\d{4}-\d{2}-\d{2})/i);
  return match?.[1] ?? "";
}

export function isRoundDayMismatch(
  selectedRoundDay: string,
  urlRoundDay: string,
): boolean {
  if (!selectedRoundDay || !urlRoundDay) return false;
  return selectedRoundDay !== urlRoundDay;
}
