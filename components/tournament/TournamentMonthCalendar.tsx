import Link from "next/link";
import {
  TOUR_COLORS,
  TOUR_LABELS,
  buildMonthGrid,
  eventOverlapsYmd,
  formatEventDateRange,
  getEventsForMonth,
  monthTitle,
  shortEventName,
  type TournamentEvent,
  type TournamentMonthKey,
} from "@/data/tournamentSchedule2026";
import { TournamentLegend } from "@/components/tournament/TournamentLegend";
import { TournamentAgendaList } from "@/components/tournament/TournamentAgendaList";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type TournamentMonthCalendarProps = {
  monthKey: TournamentMonthKey;
};

function eventsStartingOnDay(
  events: TournamentEvent[],
  ymd: string,
  weekYmdds: string[],
): TournamentEvent[] {
  return events.filter((event) => {
    if (!eventOverlapsYmd(event, ymd)) return false;
    // Start bar on first day of week that overlaps, or event start
    const weekStart = weekYmdds[0]!;
    const effectiveStart =
      event.startDate < weekStart ? weekStart : event.startDate;
    return effectiveStart === ymd;
  });
}

function spanDaysInWeek(
  event: TournamentEvent,
  weekYmdds: string[],
): number {
  let count = 0;
  for (const ymd of weekYmdds) {
    if (eventOverlapsYmd(event, ymd)) count += 1;
  }
  return Math.max(1, count);
}

export function TournamentMonthCalendar({
  monthKey,
}: TournamentMonthCalendarProps) {
  const events = getEventsForMonth(monthKey);
  const { weeks } = buildMonthGrid(monthKey);
  const title = monthTitle(monthKey);

  return (
    <div className="mt-6" aria-label={title}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-base font-bold text-stone-900 sm:text-lg">
          {title}
        </h3>
        <p className="text-xs text-stone-500">데이터 기반 일정 · 이미지 아님</p>
      </div>
      <TournamentLegend />

      {/* Mobile: agenda only */}
      <div className="mt-4 md:hidden">
        <TournamentAgendaList monthKey={monthKey} />
      </div>

      {/* Desktop: calendar grid */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <div className="min-w-[720px] rounded-2xl border border-stone-200 bg-white">
          <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
            {WEEKDAYS.map((label, index) => (
              <div
                key={label}
                className={`px-2 py-2 text-center text-xs font-bold ${
                  index === 0
                    ? "text-rose-600"
                    : index === 6
                      ? "text-sky-700"
                      : "text-stone-600"
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => {
            const weekYmdds = week.map((cell) => cell!.ymd);
            return (
              <div
                key={weekIndex}
                className="grid grid-cols-7 border-b border-stone-100 last:border-b-0"
              >
                {week.map((cell, dayIndex) => {
                  if (!cell) return null;
                  const dow = cell.date.getDay();
                  const dayEvents = eventsStartingOnDay(
                    events,
                    cell.ymd,
                    weekYmdds,
                  );
                  return (
                    <div
                      key={cell.ymd}
                      className={`relative min-h-[96px] border-r border-stone-100 p-1.5 last:border-r-0 ${
                        cell.inMonth ? "bg-white" : "bg-stone-50/80"
                      }`}
                    >
                      <time
                        dateTime={cell.ymd}
                        className={`text-xs font-semibold ${
                          !cell.inMonth
                            ? "text-stone-300"
                            : dow === 0
                              ? "text-rose-600"
                              : dow === 6
                                ? "text-sky-700"
                                : "text-stone-700"
                        }`}
                      >
                        {cell.date.getDate()}
                      </time>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.map((event) => {
                          const span = spanDaysInWeek(event, weekYmdds);
                          const colors = TOUR_COLORS[event.tour];
                          const label = `${TOUR_LABELS[event.tour]} ${shortEventName(event.name, 14)} ${formatEventDateRange(event)}`;
                          const inner = (
                            <span
                              className={`block truncate rounded px-1 py-0.5 text-[10px] font-semibold leading-tight text-white ${colors.bar}`}
                              title={label}
                            >
                              <span className="sr-only">
                                {TOUR_LABELS[event.tour]}{" "}
                              </span>
                              {shortEventName(event.name, 16)}
                            </span>
                          );
                          return (
                            <div
                              key={event.id}
                              className="relative z-10"
                              style={{ width: `calc(${span * 100}% + ${(span - 1) * 1}px)` }}
                            >
                              {event.relatedBlogSlug ? (
                                <Link
                                  href={`/blog/${event.relatedBlogSlug}`}
                                  className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600"
                                  aria-label={label}
                                >
                                  {inner}
                                </Link>
                              ) : (
                                <a
                                  href={event.officialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-600"
                                  aria-label={label}
                                >
                                  {inner}
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
