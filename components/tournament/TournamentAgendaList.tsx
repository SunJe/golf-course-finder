import Link from "next/link";
import {
  TOUR_COLORS,
  TOUR_LABELS,
  formatEventDateRange,
  getEventsForMonth,
  statusLabel,
  type TournamentMonthKey,
} from "@/data/tournamentSchedule2026";

type TournamentAgendaListProps = {
  monthKey: TournamentMonthKey;
  className?: string;
};

export function TournamentAgendaList({
  monthKey,
  className = "",
}: TournamentAgendaListProps) {
  const events = getEventsForMonth(monthKey);

  return (
    <ol
      className={`space-y-3 ${className}`}
      aria-label={`${monthKey} 골프대회 일정 목록`}
    >
      {events.map((event) => {
        const colors = TOUR_COLORS[event.tour];
        const venue =
          event.venue ??
          (event.status === "venue_tbd" || event.status === "name_tbd"
            ? "공식 최종 공지 확인"
            : undefined);

        return (
          <li
            key={event.id}
            className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <time
                dateTime={`${event.startDate}/${event.endDate}`}
                className="inline-flex rounded-md bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-800"
              >
                {formatEventDateRange(event)}
              </time>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${colors.bg} ${colors.text}`}
              >
                {TOUR_LABELS[event.tour]}
              </span>
              {event.crossMonth ? (
                <span className="text-[11px] font-medium text-amber-700">
                  월간 경계
                </span>
              ) : null}
              {event.status !== "confirmed" ? (
                <span className="text-[11px] font-medium text-stone-500">
                  {statusLabel(event.status)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug text-stone-900">
              {event.name}
            </p>
            {venue ? (
              <p className="mt-1 text-xs text-stone-600">{venue}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
              {event.relatedBlogSlug ? (
                <Link
                  href={`/blog/${event.relatedBlogSlug}`}
                  className="text-brand-800 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  관련 글
                </Link>
              ) : null}
              <a
                href={event.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-600 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                공식 일정
              </a>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
