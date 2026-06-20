export interface ParsedDifficulty {
  difficulty: string;
  difficultyText: string;
}

const SLASH_PATTERN = /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/;
const LABELED_PATTERN = /(?:코스\s*)?난이도\s*(\d+(?:\.\d+)?)/i;
const PLAIN_NUMBER_PATTERN = /^(\d+(?:\.\d+)?)$/;

function formatDifficultyNumber(rawNumber: string, value: number): string {
  if (!Number.isFinite(value) || value < 0 || value > 10) return "";
  if (rawNumber.includes(".")) {
    return String(value);
  }
  return String(Math.round(value));
}

export function formatDifficultyForDisplay(difficulty: string): string {
  const trimmed = difficulty.trim();
  if (!trimmed) return "";
  return `${trimmed}/10`;
}

export function isDifficultySlashFormat(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const match = trimmed.match(SLASH_PATTERN);
  if (!match) return false;
  return parseFloat(match[2]) === 10;
}

export function parseDifficultyRaw(raw: string): ParsedDifficulty {
  const text = raw.trim();
  if (!text) {
    return { difficulty: "", difficultyText: "" };
  }

  const slashMatch = text.match(SLASH_PATTERN);
  if (slashMatch) {
    const numeratorRaw = slashMatch[1];
    const denominator = parseFloat(slashMatch[2]);
    const numerator = parseFloat(numeratorRaw);
    const difficultyText = `${numeratorRaw}/${slashMatch[2]}`;
    if (denominator === 10 && Number.isFinite(numerator)) {
      const difficulty = formatDifficultyNumber(numeratorRaw, numerator);
      if (difficulty) {
        return { difficulty, difficultyText };
      }
    }
    return { difficulty: "", difficultyText: text };
  }

  const labeledMatch = text.match(LABELED_PATTERN);
  if (labeledMatch) {
    const numRaw = labeledMatch[1];
    const value = parseFloat(numRaw);
    const difficulty = formatDifficultyNumber(numRaw, value);
    if (difficulty) {
      return { difficulty, difficultyText: text };
    }
    return { difficulty: "", difficultyText: text };
  }

  const plainMatch = text.match(PLAIN_NUMBER_PATTERN);
  if (plainMatch) {
    const numRaw = plainMatch[1];
    const value = parseFloat(numRaw);
    const difficulty = formatDifficultyNumber(numRaw, value);
    if (difficulty) {
      return { difficulty, difficultyText: "" };
    }
  }

  return { difficulty: "", difficultyText: text };
}

export function normalizeReviewDifficultyInput(raw: string): {
  difficulty: string;
  error?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { difficulty: "" };
  }
  const parsed = parseDifficultyRaw(trimmed);
  if (!parsed.difficulty) {
    return {
      difficulty: "",
      error: "난이도는 0~10 숫자만 저장할 수 있습니다 (예: 9, 2.3).",
    };
  }
  return { difficulty: parsed.difficulty };
}

/**
 * Normalize an existing CSV cell. Preserves original in difficultyText when converting slash format.
 */
export function normalizeDifficultyField(
  value: string,
  existingText = "",
): ParsedDifficulty & { changed: boolean } {
  const trimmed = value.trim();
  const textTrimmed = existingText.trim();

  if (!trimmed) {
    return {
      difficulty: "",
      difficultyText: textTrimmed,
      changed: false,
    };
  }

  if (isDifficultySlashFormat(trimmed)) {
    const parsed = parseDifficultyRaw(trimmed);
    return {
      difficulty: parsed.difficulty,
      difficultyText: textTrimmed || parsed.difficultyText || trimmed,
      changed: parsed.difficulty !== trimmed || Boolean(parsed.difficultyText),
    };
  }

  const parsed = parseDifficultyRaw(trimmed);
  if (parsed.difficulty) {
    return {
      difficulty: parsed.difficulty,
      difficultyText: textTrimmed || parsed.difficultyText,
      changed: parsed.difficulty !== trimmed,
    };
  }

  return {
    difficulty: "",
    difficultyText: textTrimmed || trimmed,
    changed: trimmed !== "" && !textTrimmed,
  };
}
