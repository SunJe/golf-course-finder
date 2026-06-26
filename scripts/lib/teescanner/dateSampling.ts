export type DayType = "weekday" | "weekend";

export interface SampledDate {
  roundDay: string;
  dayType: DayType;
}

function parseYmd(value: string): Date {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, month - 1, day));
}

function formatYmd(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dayOfWeek(date: Date): number {
  return date.getUTCDay();
}

function isWeekday(date: Date): boolean {
  const dow = dayOfWeek(date);
  return dow >= 1 && dow <= 5;
}

function isWeekend(date: Date): boolean {
  const dow = dayOfWeek(date);
  return dow === 0 || dow === 6;
}

export function inferDayTypeFromRoundDay(roundDay: string): DayType {
  const date = parseYmd(roundDay);
  return isWeekend(date) ? "weekend" : "weekday";
}

export function sortSampledDatesAsc(samples: SampledDate[]): SampledDate[] {
  return [...samples].sort((a, b) => a.roundDay.localeCompare(b.roundDay));
}

/** KST 기준 오늘 날짜(UTC midnight). */
function todayYmdInKst(reference = new Date()): Date {
  const kst = new Date(reference.getTime() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

/**
 * 티스캐너 가격 크롤 기본 샘플일.
 * - 평일: 오늘 이후 첫 수요일(오늘이 수요일이면 그다음 주 수요일)
 * - 주말: 그 수요일이 속한 주의 일요일
 */
export function getDefaultTeescannerCrawlDates(reference = new Date()): {
  startDay: string;
  weekdayDay: string;
  weekendDay: string;
} {
  const today = todayYmdInKst(reference);
  const dow = dayOfWeek(today);

  let daysUntilWednesday = (3 - dow + 7) % 7;
  if (daysUntilWednesday === 0) daysUntilWednesday = 7;

  const wednesday = addDays(today, daysUntilWednesday);
  const wedDow = dayOfWeek(wednesday);
  const daysUntilSunday = wedDow === 0 ? 0 : 7 - wedDow;
  const sunday = addDays(wednesday, daysUntilSunday);

  const weekdayDay = formatYmd(wednesday);
  const weekendDay = formatYmd(sunday);
  return { startDay: weekdayDay, weekdayDay, weekendDay };
}

function nearestWeekdayOnOrAfter(startDay: string): string {
  const start = parseYmd(startDay);
  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = addDays(start, offset);
    if (isWeekday(candidate)) return formatYmd(candidate);
  }
  return startDay;
}

/** Most recent Saturday strictly before the weekday sample (within 7 days). */
function nearestSaturdayBefore(weekdayYmd: string): string {
  const weekday = parseYmd(weekdayYmd);
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = addDays(weekday, -offset);
    if (dayOfWeek(candidate) === 6) return formatYmd(candidate);
  }
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = addDays(weekday, -offset);
    if (isWeekend(candidate)) return formatYmd(candidate);
  }
  return weekdayYmd;
}

export function buildRepresentativeDates(
  startDay: string,
  weekdayCount: number,
  weekendCount: number,
): SampledDate[] {
  const samples: SampledDate[] = [];
  const weekdayDay = nearestWeekdayOnOrAfter(startDay);

  if (weekdayCount > 0) {
    samples.push({
      roundDay: weekdayDay,
      dayType: inferDayTypeFromRoundDay(weekdayDay),
    });
  }

  if (weekendCount > 0) {
    const weekendDay = nearestSaturdayBefore(weekdayDay);
    samples.push({
      roundDay: weekendDay,
      dayType: inferDayTypeFromRoundDay(weekendDay),
    });
  }

  return sortSampledDatesAsc(samples);
}

export function buildExplicitSampledDates(input: {
  weekdayDay?: string;
  weekendDay?: string;
}): SampledDate[] {
  const samples: SampledDate[] = [];
  if (input.weekdayDay?.trim()) {
    const roundDay = input.weekdayDay.trim();
    samples.push({ roundDay, dayType: inferDayTypeFromRoundDay(roundDay) });
  }
  if (input.weekendDay?.trim()) {
    const roundDay = input.weekendDay.trim();
    samples.push({ roundDay, dayType: inferDayTypeFromRoundDay(roundDay) });
  }
  return sortSampledDatesAsc(samples);
}

export function parseSampleDaysCsv(sampleDays: string): SampledDate[] {
  const samples = sampleDays
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value))
    .map((roundDay) => ({
      roundDay,
      dayType: inferDayTypeFromRoundDay(roundDay),
    }));
  return sortSampledDatesAsc(samples);
}

export function buildSampledDates(input: {
  startDay: string;
  weekdayCount: number;
  weekendCount: number;
  weekdayDay?: string;
  weekendDay?: string;
  sampleDays?: string;
}): SampledDate[] {
  if (input.sampleDays?.trim()) {
    return parseSampleDaysCsv(input.sampleDays);
  }

  const explicit = buildExplicitSampledDates({
    weekdayDay: input.weekdayDay,
    weekendDay: input.weekendDay,
  });
  if (explicit.length > 0) return explicit;

  return buildRepresentativeDates(
    input.startDay,
    input.weekdayCount,
    input.weekendCount,
  );
}
