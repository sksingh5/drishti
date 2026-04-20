import { IndicatorType } from "./types";

export function computeCompositeScore(
  indicatorScores: Partial<Record<IndicatorType, number>>,
  weights: Record<IndicatorType, number>
): number | null {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [indicator, score] of Object.entries(indicatorScores)) {
    const weight = weights[indicator as IndicatorType];
    if (weight !== undefined && score !== undefined && score !== null) {
      weightedSum += weight * score;
      totalWeight += weight;
    }
  }
  if (totalWeight === 0) return null;
  return Math.round(weightedSum / totalWeight);
}
