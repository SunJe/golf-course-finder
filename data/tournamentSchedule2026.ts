export type TourCode = "KLPGA" | "KPGA" | "LPGA" | "PGA_TOUR";

export type TournamentStatus =
  | "confirmed"
  | "name_tbd"
  | "venue_tbd"
  | "completed";

export interface TournamentEvent {
  id: string;
  tour: TourCode;
  name: string;
  startDate: string;
  endDate: string;
  venue?: string;
  country?: string;
  status: TournamentStatus;
  officialUrl: string;
  lastCheckedAt: string;
  relatedBlogSlug?: string;
  relatedCourseId?: string;
  crossMonth?: boolean;
  note?: string;
}

export const TOURNAMENT_SCHEDULE_LAST_CHECKED = "2026-07-18";

const KLPGA_SCHEDULE = "https://klpga.co.kr/web/schedule/schedule";
const KPGA_SCHEDULE =
  "https://www.kpga.co.kr/tours/schedule/schedule/?tourId=11";
const LPGA_SCHEDULE = "https://www.lpga.com/tournaments";
const PGA_SCHEDULE = "https://www.pgatour.com/schedule/2026";

export const TOURNAMENT_EVENTS_2026: TournamentEvent[] = [
  // --- August KLPGA ---
  {
    id: "klpga-2026-jeju-samdasoo",
    tour: "KLPGA",
    name: "제13회 제주삼다수 마스터스",
    startDate: "2026-08-06",
    endDate: "2026-08-09",
    venue: "테디밸리 골프앤리조트",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "klpga-2026-mediheal",
    tour: "KLPGA",
    name: "메디힐·한국일보 챔피언십",
    startDate: "2026-08-13",
    endDate: "2026-08-16",
    venue: "몽베르 · 명성산 OUT/IN",
    country: "KR",
    status: "confirmed",
    officialUrl:
      "https://klpga.co.kr/web/tourInfo/tourInfo?gameCode=2026080003",
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    relatedBlogSlug: "2026-mediheal-hankook-ilbo-montvert-guide",
    relatedCourseId: "gc-9d709ff43c33",
    note: "총상금 12억원",
  },
  {
    id: "klpga-2026-championship",
    tour: "KLPGA",
    name: "BC카드·한경 제48회 KLPGA 챔피언십",
    startDate: "2026-08-20",
    endDate: "2026-08-23",
    venue: "포천힐스CC",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    relatedCourseId: "gc-564e2ae6067a",
  },
  {
    id: "klpga-2026-kg-ladies",
    tour: "KLPGA",
    name: "제15회 KG 레이디스 오픈",
    startDate: "2026-08-27",
    endDate: "2026-08-30",
    venue: "써닝포인트CC",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    relatedCourseId: "gc-c45d3f5d316d",
  },
  // --- August KPGA ---
  {
    id: "kpga-2026-donga",
    tour: "KPGA",
    name: "동아회원권그룹 오픈",
    startDate: "2026-08-20",
    endDate: "2026-08-23",
    venue: "솔라고CC",
    country: "KR",
    status: "confirmed",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "총상금 7억원",
  },
  // --- August LPGA ---
  {
    id: "lpga-2026-aig-open",
    tour: "LPGA",
    name: "AIG Women's Open",
    startDate: "2026-07-30",
    endDate: "2026-08-02",
    venue: "Royal Lytham & St. Annes Golf Club",
    country: "GB",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    crossMonth: true,
    note: "$10M",
  },
  {
    id: "lpga-2026-portland",
    tour: "LPGA",
    name: "The Standard Portland Classic",
    startDate: "2026-08-13",
    endDate: "2026-08-16",
    venue: "Columbia Edgewater Country Club",
    country: "US",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "$2M",
  },
  {
    id: "lpga-2026-cpkc",
    tour: "LPGA",
    name: "CPKC Women's Open",
    startDate: "2026-08-20",
    endDate: "2026-08-23",
    venue: "Royal Mayfair Golf Club",
    country: "CA",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "$2.75M",
  },
  {
    id: "lpga-2026-fm",
    tour: "LPGA",
    name: "FM Championship",
    startDate: "2026-08-27",
    endDate: "2026-08-30",
    venue: "TPC Boston",
    country: "US",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "$4.4M",
  },
  // --- August PGA ---
  {
    id: "pga-2026-wyndham",
    tour: "PGA_TOUR",
    name: "Wyndham Championship",
    startDate: "2026-08-06",
    endDate: "2026-08-09",
    venue: "Sedgefield Country Club",
    country: "US",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "pga-2026-st-jude",
    tour: "PGA_TOUR",
    name: "FedEx St. Jude Championship",
    startDate: "2026-08-13",
    endDate: "2026-08-16",
    venue: "TPC Southwind",
    country: "US",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "FedExCup Playoffs",
  },
  {
    id: "pga-2026-bmw",
    tour: "PGA_TOUR",
    name: "BMW Championship",
    startDate: "2026-08-20",
    endDate: "2026-08-23",
    venue: "Bellerive Country Club",
    country: "US",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "FedExCup Playoffs",
  },
  {
    id: "pga-2026-tour-championship",
    tour: "PGA_TOUR",
    name: "TOUR Championship",
    startDate: "2026-08-27",
    endDate: "2026-08-30",
    venue: "East Lake Golf Club",
    country: "US",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "FedExCup Playoffs",
  },
  // --- September KLPGA ---
  {
    id: "klpga-2026-kb-golden",
    tour: "KLPGA",
    name: "KB금융 골든라이프 챔피언십",
    startDate: "2026-09-03",
    endDate: "2026-09-06",
    venue: "블랙스톤 이천",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "klpga-2026-ok-eutman",
    tour: "KLPGA",
    name: "OK저축은행 읏맨 오픈",
    startDate: "2026-09-04",
    endDate: "2026-09-06",
    venue: "포천 아도니스",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    relatedCourseId: "gc-e2614722e86e",
    relatedBlogSlug: "pocheon-golf-best-7",
  },
  {
    id: "klpga-2026-hana",
    tour: "KLPGA",
    name: "하나금융그룹 챔피언십",
    startDate: "2026-09-17",
    endDate: "2026-09-20",
    venue: undefined,
    country: "KR",
    status: "venue_tbd",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "klpga-2026-kfood",
    tour: "KLPGA",
    name: "K-FOOD 놀부·화미 마스터즈",
    startDate: "2026-09-25",
    endDate: "2026-09-27",
    venue: "클럽72 하늘코스",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  // --- September KPGA ---
  {
    id: "kpga-2026-insenco",
    tour: "KPGA",
    name: "인스앤코 인비테이셔널",
    startDate: "2026-09-03",
    endDate: "2026-09-06",
    status: "venue_tbd",
    country: "KR",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "kpga-2026-shinhan",
    tour: "KPGA",
    name: "제42회 신한동해오픈",
    startDate: "2026-09-10",
    endDate: "2026-09-13",
    status: "venue_tbd",
    country: "KR",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "kpga-2026-golfzon",
    tour: "KPGA",
    name: "골프존 오픈",
    startDate: "2026-09-17",
    endDate: "2026-09-20",
    status: "venue_tbd",
    country: "KR",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  // --- September LPGA ---
  {
    id: "lpga-2026-solheim",
    tour: "LPGA",
    name: "Solheim Cup",
    startDate: "2026-09-11",
    endDate: "2026-09-13",
    venue: "Bernardus Golf",
    country: "NL",
    status: "confirmed",
    officialUrl: "https://www.lpga.com/tournaments/the-solheim-cup/overview",
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "USA vs Europe team match",
  },
  {
    id: "lpga-2026-walmart",
    tour: "LPGA",
    name: "Walmart NW Arkansas Championship presented by P&G",
    startDate: "2026-09-25",
    endDate: "2026-09-27",
    venue: "Pinnacle Country Club",
    country: "US",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "$3M",
  },
  // --- September PGA ---
  {
    id: "pga-2026-biltmore",
    tour: "PGA_TOUR",
    name: "Biltmore Championship Asheville",
    startDate: "2026-09-17",
    endDate: "2026-09-20",
    venue: "The Cliffs at Walnut Cove",
    country: "US",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "FedExCup Fall",
  },
  {
    id: "pga-2026-presidents",
    tour: "PGA_TOUR",
    name: "Presidents Cup",
    startDate: "2026-09-24",
    endDate: "2026-09-27",
    venue: "Medinah Country Club",
    country: "US",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "USA vs International team match",
  },
  {
    id: "pga-2026-bank-of-utah",
    tour: "PGA_TOUR",
    name: "Bank of Utah Championship",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    venue: "Black Desert Resort",
    country: "US",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    crossMonth: true,
    note: "FedExCup Fall · 대회 주간 9/28 시작",
  },
  // --- October KLPGA ---
  {
    id: "klpga-2026-hitejinro",
    tour: "KLPGA",
    name: "제26회 하이트진로 챔피언십",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    venue: "블루헤런",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "klpga-2026-dongbu",
    tour: "KLPGA",
    name: "2026 동부건설·한국토지신탁 챔피언십",
    startDate: "2026-10-08",
    endDate: "2026-10-11",
    venue: "익산",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "klpga-2026-oct-tbd",
    tour: "KLPGA",
    name: "대회명 미정",
    startDate: "2026-10-15",
    endDate: "2026-10-18",
    status: "name_tbd",
    country: "KR",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "klpga-2026-happiness",
    tour: "KLPGA",
    name: "광남일보·해피니스 오픈",
    startDate: "2026-10-22",
    endDate: "2026-10-25",
    venue: "해피니스CC",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "총상금 10억원",
  },
  {
    id: "klpga-2026-soil",
    tour: "KLPGA",
    name: "S-OIL 챔피언십 2026",
    startDate: "2026-10-29",
    endDate: "2026-11-01",
    venue: "엘리시안 제주",
    country: "KR",
    status: "confirmed",
    officialUrl: KLPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    crossMonth: true,
    note: "총상금 10억원",
  },
  // --- October KPGA ---
  {
    id: "kpga-2026-choi",
    tour: "KPGA",
    name: "현대해상 최경주 인비테이셔널",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    venue: "페럼클럽",
    country: "KR",
    status: "confirmed",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "kpga-2026-oct-tbd",
    tour: "KPGA",
    name: "대회명 미정(공식 일정표 임시 표기)",
    startDate: "2026-10-08",
    endDate: "2026-10-11",
    status: "name_tbd",
    country: "KR",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "kpga-2026-charity",
    tour: "KPGA",
    name: "더채리티클래식 2026",
    startDate: "2026-10-15",
    endDate: "2026-10-18",
    venue: "서원밸리CC",
    country: "KR",
    status: "confirmed",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "kpga-2026-genesis",
    tour: "KPGA",
    name: "제네시스 챔피언십",
    startDate: "2026-10-22",
    endDate: "2026-10-25",
    venue: "우정힐스CC",
    country: "KR",
    status: "confirmed",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
  },
  {
    id: "kpga-2026-lexus",
    tour: "KPGA",
    name: "2026 렉서스 마스터즈",
    startDate: "2026-10-29",
    endDate: "2026-11-01",
    venue: "클럽72CC",
    country: "KR",
    status: "confirmed",
    officialUrl: KPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    crossMonth: true,
  },
  // --- October LPGA ---
  {
    id: "lpga-2026-lotte",
    tour: "LPGA",
    name: "LOTTE Championship presented by Hoakalei",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    venue: "Hoakalei Country Club",
    country: "US",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "$3M",
  },
  {
    id: "lpga-2026-shanghai",
    tour: "LPGA",
    name: "Buick LPGA Shanghai",
    startDate: "2026-10-15",
    endDate: "2026-10-18",
    venue: "Sheshan Golf Club",
    country: "CN",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "$3.2M",
  },
  {
    id: "lpga-2026-bmw-ladies",
    tour: "LPGA",
    name: "BMW Ladies Championship",
    startDate: "2026-10-22",
    endDate: "2026-10-25",
    venue: "Pine Beach Golf Links",
    country: "KR",
    status: "confirmed",
    officialUrl:
      "https://www.lpga.com/tournaments/bmw-lpga-championship/overview",
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    relatedBlogSlug: "2026-bmw-ladies-championship-guide",
    relatedCourseId: "gc-437ea8156737",
    note: "$2.35M",
  },
  {
    id: "lpga-2026-maybank",
    tour: "LPGA",
    name: "Maybank Championship",
    startDate: "2026-10-29",
    endDate: "2026-11-01",
    venue: "Kuala Lumpur Golf & Country Club, West Course",
    country: "MY",
    status: "confirmed",
    officialUrl: LPGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    crossMonth: true,
    note: "$3M",
  },
  // --- October PGA ---
  {
    id: "pga-2026-baycurrent",
    tour: "PGA_TOUR",
    name: "Baycurrent Classic",
    startDate: "2026-10-08",
    endDate: "2026-10-11",
    venue: "Yokohama Country Club",
    country: "JP",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "FedExCup Fall",
  },
  {
    id: "pga-2026-bermuda",
    tour: "PGA_TOUR",
    name: "Butterfield Bermuda Championship",
    startDate: "2026-10-22",
    endDate: "2026-10-25",
    venue: "Port Royal Golf Course",
    country: "BM",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    note: "FedExCup Fall",
  },
  {
    id: "pga-2026-mexico",
    tour: "PGA_TOUR",
    name: "VidantaWorld Mexico Open",
    startDate: "2026-10-29",
    endDate: "2026-11-01",
    venue: "Vidanta Vallarta Golf Course",
    country: "MX",
    status: "confirmed",
    officialUrl: PGA_SCHEDULE,
    lastCheckedAt: TOURNAMENT_SCHEDULE_LAST_CHECKED,
    crossMonth: true,
    note: "FedExCup Fall",
  },
];

export type TournamentMonthKey = "2026-08" | "2026-09" | "2026-10";

export const TOUR_LABELS: Record<TourCode, string> = {
  KLPGA: "KLPGA",
  KPGA: "KPGA",
  LPGA: "LPGA",
  PGA_TOUR: "PGA TOUR",
};

export const TOUR_COLORS: Record<
  TourCode,
  { bg: string; text: string; bar: string }
> = {
  KLPGA: {
    bg: "bg-pink-100",
    text: "text-pink-800",
    bar: "bg-pink-500",
  },
  KPGA: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    bar: "bg-emerald-600",
  },
  LPGA: {
    bg: "bg-sky-100",
    text: "text-sky-800",
    bar: "bg-sky-500",
  },
  PGA_TOUR: {
    bg: "bg-violet-100",
    text: "text-violet-800",
    bar: "bg-violet-500",
  },
};

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Events overlapping a calendar month (YYYY-MM). Includes cross-month events. */
export function getEventsForMonth(monthKey: TournamentMonthKey): TournamentEvent[] {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  return TOURNAMENT_EVENTS_2026.filter((event) => {
    const start = parseYmd(event.startDate);
    const end = parseYmd(event.endDate);
    return start <= monthEnd && end >= monthStart;
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function formatEventDateRange(event: TournamentEvent): string {
  const start = parseYmd(event.startDate);
  const end = parseYmd(event.endDate);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = `${start.getMonth() + 1}/${start.getDate()}`;
  const endLabel = sameMonth
    ? `${end.getDate()}`
    : `${end.getMonth() + 1}/${end.getDate()}`;
  return `${startLabel}~${endLabel}`;
}

export function shortEventName(name: string, max = 18): string {
  if (name.length <= max) return name;
  return `${name.slice(0, max - 1)}…`;
}

export function buildMonthGrid(monthKey: TournamentMonthKey): {
  year: number;
  month: number;
  weeks: Array<Array<{ date: Date; inMonth: boolean; ymd: string } | null>>;
} {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startPad = first.getDay(); // 0=Sun
  const daysInMonth = last.getDate();

  const cells: Array<{ date: Date; inMonth: boolean; ymd: string } | null> =
    [];
  for (let i = 0; i < startPad; i++) {
    const d = new Date(year, month - 1, -startPad + i + 1);
    cells.push({ date: d, inMonth: false, ymd: formatYmd(d) });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    cells.push({ date: d, inMonth: true, ymd: formatYmd(d) });
  }
  while (cells.length % 7 !== 0) {
    const lastCell = cells[cells.length - 1]!;
    const d = new Date(lastCell.date);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false, ymd: formatYmd(d) });
  }

  const weeks: Array<
    Array<{ date: Date; inMonth: boolean; ymd: string } | null>
  > = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return { year, month, weeks };
}

export function eventOverlapsYmd(event: TournamentEvent, ymd: string): boolean {
  return event.startDate <= ymd && event.endDate >= ymd;
}

export function statusLabel(status: TournamentStatus): string {
  switch (status) {
    case "name_tbd":
      return "대회명 미정";
    case "venue_tbd":
      return "장소 미정";
    case "completed":
      return "종료";
    default:
      return "확정";
  }
}

export function monthTitle(monthKey: TournamentMonthKey): string {
  const month = Number(monthKey.split("-")[1]);
  return `2026년 ${month}월 골프대회 일정`;
}
