import { parsePriceText } from "../naverPriceCandidates";

/** CSV/DB와 동일 — 원(won) 단위 정수 */
export function parseReservationPriceText(rawText: string): {
  priceText: string;
  priceMin: number | null;
  priceMax: number | null;
  unit: "won";
} {
  const priceText = rawText.trim();
  if (!priceText) {
    return { priceText: "", priceMin: null, priceMax: null, unit: "won" };
  }

  const parsed = parsePriceText(priceText);
  if (parsed.min != null) {
    return {
      priceText,
      priceMin: parsed.min,
      priceMax: parsed.max ?? parsed.min,
      unit: "won",
    };
  }

  const amounts = new Set<number>();

  for (const match of priceText.matchAll(/(\d+(?:\.\d+)?)\s*만\s*원?/gi)) {
    const man = Number.parseFloat(match[1]);
    if (Number.isFinite(man) && man > 0) {
      amounts.add(Math.round(man * 10_000));
    }
  }

  for (const match of priceText.matchAll(/(\d{1,3}(?:,\d{3})+|\d{4,})\s*원/g)) {
    const value = Number.parseInt(match[1].replace(/,/g, ""), 10);
    if (Number.isFinite(value) && value >= 10_000 && value <= 5_000_000) {
      amounts.add(value);
    }
  }

  const sorted = [...amounts].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { priceText, priceMin: null, priceMax: null, unit: "won" };
  }

  return {
    priceText,
    priceMin: sorted[0],
    priceMax: sorted[sorted.length - 1],
    unit: "won",
  };
}

export function formatWonForCsv(value: number | null): string {
  if (value == null) return "";
  return String(value);
}
