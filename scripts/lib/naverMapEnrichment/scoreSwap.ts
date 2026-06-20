export interface ScoreSwapAssessment {
  suspected: boolean;
  correctedAvgScore: string;
  correctedDifficulty: string;
  note: string;
}

function parseNum(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number.parseFloat(trimmed);
  return Number.isFinite(num) ? num : null;
}

/** avg_score(60~120) vs difficulty(0~10) 뒤바뀜 의심 */
export function assessScoreDifficultySwap(
  avgScore: string,
  difficulty: string,
): ScoreSwapAssessment {
  const avg = parseNum(avgScore);
  const diff = parseNum(difficulty);

  const suspected =
    avg !== null &&
    diff !== null &&
    avg <= 10 &&
    diff > 20;

  if (!suspected) {
    return {
      suspected: false,
      correctedAvgScore: avgScore,
      correctedDifficulty: difficulty,
      note: "",
    };
  }

  return {
    suspected: true,
    correctedAvgScore: difficulty,
    correctedDifficulty: avgScore,
    note: `avg_score_difficulty_swapped_suspected; corrected_avg_score=${difficulty}; corrected_difficulty=${avgScore}`,
  };
}

export function applySwapToScrapedFields(input: {
  scraped_avg_score: string;
  scraped_difficulty: string;
  note: string;
}): { scraped_avg_score: string; scraped_difficulty: string; note: string } {
  const assessment = assessScoreDifficultySwap(
    input.scraped_avg_score,
    input.scraped_difficulty,
  );
  if (!assessment.suspected) return input;

  const notePrefix = input.note.trim() ? `${input.note.trim()}; ` : "";
  return {
    scraped_avg_score: assessment.correctedAvgScore,
    scraped_difficulty: assessment.correctedDifficulty,
    note: `${notePrefix}${assessment.note}`,
  };
}
