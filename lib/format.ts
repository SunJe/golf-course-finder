/** 원화 금액을 "X만원" 형태로 변환 (만원 미만은 콤마 표기) */
export function formatPrice(value: number): string {
  if (!value || value <= 0) return "무료";
  if (value % 10000 === 0) return `${value / 10000}만원`;
  if (value >= 10000) {
    const man = Math.floor(value / 10000);
    const rest = value % 10000;
    return `${man}만 ${rest.toLocaleString()}원`;
  }
  return `${value.toLocaleString()}원`;
}

/** 그린피 범위를 짧게 표기 (카드용) */
export function formatGreenFeeShort(weekday: number): string {
  return `${Math.round(weekday / 10000)}만원~`;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}
