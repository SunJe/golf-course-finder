import { normalizeDifficultyField } from "./difficultyUtils";

export function verifyNormalizeExports(): void {
  if (typeof normalizeDifficultyField !== "function") {
    throw new Error(
      "normalizeDifficultyField is not exported from lib/enrichment/difficultyUtils.ts",
    );
  }
  const sample = normalizeDifficultyField("9/10");
  if (sample.difficulty !== "9") {
    throw new Error(
      `normalizeDifficultyField sanity check failed: expected difficulty "9", got "${sample.difficulty}"`,
    );
  }
}
