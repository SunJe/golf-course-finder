/** CSV/DB difficulty placeholder — SQL 업데이트·필터에서 제외 */
export const INVALID_DIFFICULTY_VALUES = new Set([
  "",
  "-",
  "정보 없음",
  "미확인",
  "n/a",
  "na",
  "null",
  "undefined",
  "none",
  "없음",
]);

export function isBlankDifficultyValue(value?: string | null): boolean {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return true;
  return INVALID_DIFFICULTY_VALUES.has(trimmed.toLowerCase());
}

export function hasValidDifficulty(value?: string | null): boolean {
  return !isBlankDifficultyValue(value);
}

export function normalizeDifficulty(value?: string | null): string | null {
  if (!hasValidDifficulty(value)) return null;
  return value!.trim();
}

const EASY_TEXT = ["쉬움", "낮음", "easy", "입문", "초보"];
const NORMAL_TEXT = ["보통", "중간", "normal", "medium"];
const HARD_TEXT = ["어려움", "높음", "hard", "상급"];

function textDifficultyScore(value: string): number | null {
  const lower = value.toLowerCase();
  if (EASY_TEXT.some((token) => lower.includes(token))) return 1;
  if (NORMAL_TEXT.some((token) => lower.includes(token))) return 3;
  if (HARD_TEXT.some((token) => lower.includes(token))) return 5;
  return null;
}

function numericDifficultyScore(value: string): number | null {
  const num = Number.parseFloat(value);
  if (!Number.isFinite(num)) return null;

  if (num >= 1 && num <= 5) {
    return Math.max(1, Math.min(5, Math.round(num)));
  }

  // Naver-style 0~10 scale
  if (num >= 0 && num <= 10) {
    return Math.max(1, Math.min(5, Math.round(num / 2)));
  }

  return null;
}

/** 1=쉬움 … 5=어려움. 알 수 없으면 null */
export function getDifficultyScore(value?: string | null): number | null {
  const normalized = normalizeDifficulty(value);
  if (!normalized) return null;

  const textScore = textDifficultyScore(normalized);
  if (textScore != null) return textScore;

  return numericDifficultyScore(normalized);
}

export function isBeginnerFriendlyDifficulty(value?: string | null): boolean {
  const score = getDifficultyScore(value);
  return score != null && score <= 2;
}
