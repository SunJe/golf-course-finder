import {
  TOUR_COLORS,
  TOUR_LABELS,
  type TourCode,
} from "@/data/tournamentSchedule2026";

const TOURS: TourCode[] = ["KLPGA", "KPGA", "LPGA", "PGA_TOUR"];

export function TournamentLegend() {
  return (
    <ul
      className="mt-3 flex flex-wrap gap-2"
      aria-label="투어 범례"
    >
      {TOURS.map((tour) => {
        const colors = TOUR_COLORS[tour];
        return (
          <li key={tour}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${colors.bar}`}
                aria-hidden
              />
              {TOUR_LABELS[tour]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
