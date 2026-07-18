import fs from "fs";
import path from "path";
import {
  TOURNAMENT_EVENTS_2026,
  TOURNAMENT_SCHEDULE_LAST_CHECKED,
  getEventsForMonth,
  type TournamentMonthKey,
} from "../data/tournamentSchedule2026";
import { getProjectRoot } from "./lib/sourceRegistry";

const ROOT = getProjectRoot();
let failures = 0;

function fail(message: string): void {
  console.error(`[audit:tournament-schedule] FAIL: ${message}`);
  failures += 1;
}

function ok(message: string): void {
  console.log(`[audit:tournament-schedule] OK: ${message}`);
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TOURS = new Set(["KLPGA", "KPGA", "LPGA", "PGA_TOUR"]);
const STATUSES = new Set(["confirmed", "name_tbd", "venue_tbd", "completed"]);

function main(): void {
  const ids = new Set<string>();
  for (const event of TOURNAMENT_EVENTS_2026) {
    if (ids.has(event.id)) fail(`duplicate id: ${event.id}`);
    ids.add(event.id);

    if (!TOURS.has(event.tour)) fail(`${event.id}: bad tour ${event.tour}`);
    if (!STATUSES.has(event.status)) {
      fail(`${event.id}: bad status ${event.status}`);
    }
    if (!DATE_RE.test(event.startDate) || !DATE_RE.test(event.endDate)) {
      fail(`${event.id}: invalid date format`);
    }
    if (event.startDate > event.endDate) {
      fail(`${event.id}: startDate after endDate`);
    }
    if (!event.officialUrl || !/^https?:\/\//.test(event.officialUrl)) {
      fail(`${event.id}: missing officialUrl`);
    }
    if (!event.lastCheckedAt) fail(`${event.id}: missing lastCheckedAt`);
    if (event.status === "name_tbd" && event.venue) {
      fail(`${event.id}: name_tbd should not invent venue`);
    }
  }

  const kg = TOURNAMENT_EVENTS_2026.find((e) => e.id === "klpga-2026-kg-ladies");
  if (!kg || kg.startDate !== "2026-08-27" || kg.endDate !== "2026-08-30") {
    fail("KG 레이디스 오픈 must be 2026-08-27~08-30");
  } else {
    ok("KG 레이디스 오픈 2026-08-27~08-30");
  }

  const okEvent = TOURNAMENT_EVENTS_2026.find(
    (e) => e.id === "klpga-2026-ok-eutman",
  );
  if (
    !okEvent ||
    okEvent.startDate !== "2026-09-04" ||
    okEvent.endDate !== "2026-09-06"
  ) {
    fail("OK저축은행 읏맨 오픈 must be 2026-09-04~09-06");
  } else {
    ok("OK저축은행 읏맨 오픈 2026-09-04~09-06");
  }

  for (const month of [
    "2026-08",
    "2026-09",
    "2026-10",
  ] as TournamentMonthKey[]) {
    const events = getEventsForMonth(month);
    if (events.length < 5) fail(`${month}: too few events (${events.length})`);
    else ok(`${month}: ${events.length} events`);
  }

  const jsonPath = path.join(ROOT, "data/2026-aug-oct-tournament-schedule.json");
  if (fs.existsSync(jsonPath)) {
    const raw = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
      checkedAt?: string;
      months?: Record<string, Record<string, string[]>>;
    };
    const aug = (raw.months?.["2026-08"]?.KLPGA || []).join(" ");
    const sep = (raw.months?.["2026-09"]?.KLPGA || []).join(" ");
    if (!aug.includes("8/27-30 KG")) {
      fail("JSON schedule missing corrected KG dates");
    }
    if (!sep.includes("9/4-6 OK")) {
      fail("JSON schedule missing corrected OK dates");
    }
    if (raw.checkedAt !== TOURNAMENT_SCHEDULE_LAST_CHECKED) {
      fail("JSON checkedAt mismatch with TS schedule");
    }
  }

  if (failures > 0) {
    console.error(`[audit:tournament-schedule] ${failures} failure(s)`);
    process.exit(1);
  }
  console.log(
    `[audit:tournament-schedule] PASS — ${TOURNAMENT_EVENTS_2026.length} events`,
  );
}

main();
