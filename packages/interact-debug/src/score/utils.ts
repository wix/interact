import type { ScoreResult } from '../types';

export function weightedAverage(subscores: ScoreResult[]): number {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const s of subscores) {
    weightedSum += s.score * s.weight;
    totalWeight += s.weight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 1;
}
