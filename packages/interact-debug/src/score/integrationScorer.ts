import type { InteractArtifact, ScoreResult, Scope } from '../types';
import { validateIntegration } from '../validate/integrationValidator';

/**
 * Scores the full artifact integration by running integrationValidator
 * and converting error/warning counts to a 0–1 score.
 *
 * Every config key matched in HTML = full marks; missing keys heavily penalized.
 * Also accounts for registerEffects coverage and setup order correctness.
 */
export function scoreIntegration(artifact: InteractArtifact, scope?: Scope): ScoreResult {
  const result = validateIntegration(artifact, scope);

  const errorCount = result.errors.length;
  const warningCount = result.warnings.length;

  // Each error deducts 0.2 (capped), each warning deducts 0.05
  const errorPenalty = Math.min(1, errorCount * 0.2);
  const warningPenalty = Math.min(0.3, warningCount * 0.05);

  const score = Math.max(0, 1 - errorPenalty - warningPenalty);

  return {
    dimension: 'integration',
    score,
    weight: 0.15,
    details: `${errorCount} errors, ${warningCount} warnings from integration validation`,
  };
}
