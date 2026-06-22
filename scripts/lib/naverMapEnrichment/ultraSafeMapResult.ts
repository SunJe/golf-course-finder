import type { ScrapeRunResult } from "./enrichmentScraper";
import { isAccessBlockedNote } from "./accessControl";
import type { EnrichmentInputRow } from "./types";
import type { UltraSafePriceResult, UltraSafeResultStatus } from "./ultraSafeIo";
import {
  formatWonForCsv,
  parseReservationPriceText,
} from "./ultraSafePriceParse";

function resolveStatus(
  scrape: ScrapeRunResult,
): { status: UltraSafeResultStatus; errorReason: string } {
  const { row, diagnostics } = scrape;
  const note = `${row.note} ${row.mismatch_reason}`.trim();

  if (
    isAccessBlockedNote(row.note, row.mismatch_reason) ||
    diagnostics.blockDetectedAt ||
    /circuit_breaker|access blocked|captcha|과도한\s*접근/i.test(note)
  ) {
    return { status: "blocked", errorReason: note || "access blocked" };
  }

  if (!row.matched_title?.trim()) {
    if (/mismatch|ambiguous|category_not_golf|no golf/i.test(note)) {
      return { status: "ambiguous_match", errorReason: note || "ambiguous match" };
    }
    return { status: "failed", errorReason: note || "match failed" };
  }

  const priceText =
    row.scraped_price_text?.trim() ||
    row.scraped_price_min ||
    row.scraped_price_max
      ? [
          row.scraped_price_text,
          row.scraped_price_min && `${row.scraped_price_min}원`,
          row.scraped_price_max &&
            row.scraped_price_max !== row.scraped_price_min &&
            `${row.scraped_price_max}원`,
        ]
          .filter(Boolean)
          .join("; ")
      : "";

  let priceMin = row.scraped_price_min?.trim()
    ? Number.parseInt(row.scraped_price_min, 10)
    : null;
  let priceMax = row.scraped_price_max?.trim()
    ? Number.parseInt(row.scraped_price_max, 10)
    : null;

  if (priceText && (priceMin == null || !Number.isFinite(priceMin))) {
    const parsed = parseReservationPriceText(priceText);
    priceMin = parsed.priceMin;
    priceMax = parsed.priceMax;
  }

  const hasPrice =
    (priceMin != null && Number.isFinite(priceMin)) ||
    (priceMax != null && Number.isFinite(priceMax));

  const reservationFound =
    row.reservation_available === "y" ||
    /예약|reservation/i.test(priceText) ||
    hasPrice;

  if (hasPrice) {
    return { status: "success", errorReason: "" };
  }

  if (row.reservation_available === "n") {
    return { status: "no_reservation", errorReason: note || "no reservation tab" };
  }

  if (reservationFound) {
    return { status: "no_price", errorReason: note || "reservation without price" };
  }

  if (/category_not_golf|clubhouse|mismatch/i.test(note)) {
    return { status: "ambiguous_match", errorReason: note };
  }

  return { status: "no_reservation", errorReason: note || "no reservation info" };
}

export function mapScrapeToUltraSafeResult(
  input: EnrichmentInputRow,
  scrape: ScrapeRunResult,
  screenshotPath: string,
): UltraSafePriceResult {
  const { row } = scrape;
  const { status, errorReason } = resolveStatus(scrape);

  const priceText =
    row.scraped_price_text?.trim() ||
    [row.scraped_price_min, row.scraped_price_max]
      .filter(Boolean)
      .join(" ~ ");

  const parsed = parseReservationPriceText(priceText);
  const priceMin =
    row.scraped_price_min?.trim() && Number.isFinite(Number(row.scraped_price_min))
      ? Number.parseInt(row.scraped_price_min, 10)
      : parsed.priceMin;
  const priceMax =
    row.scraped_price_max?.trim() && Number.isFinite(Number(row.scraped_price_max))
      ? Number.parseInt(row.scraped_price_max, 10)
      : parsed.priceMax ?? priceMin;

  const reservationFound =
    status === "success" ||
    row.reservation_available === "y" ||
    Boolean(priceText.trim());

  return {
    id: input.id,
    name: input.name,
    address: input.address,
    matched_title: row.matched_title ?? "",
    matched_address: row.matched_address ?? "",
    naver_reservation_found: reservationFound ? "y" : "n",
    price_text: priceText || parsed.priceText,
    price_min: formatWonForCsv(priceMin),
    price_max: formatWonForCsv(priceMax),
    price_unit: "won",
    source_url: row.matched_place_url || input.source_url,
    status,
    error_reason: errorReason,
    collected_at: new Date().toISOString(),
    screenshot_path: screenshotPath,
  };
}
