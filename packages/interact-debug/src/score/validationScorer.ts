import type { ValidationResult, ScoreResult } from '../types';

/**
 * Converts the full validateAll result (all validators merged) into a 0-1 score.
 * Every validation error and warning penalizes the score, giving real
 * differentiation between configs that pass cleanly vs those with issues.
 */
export function scoreValidation(validationResult: ValidationResult): ScoreResult {
  const errorCount = validationResult.errors.length;
  const warningCount = validationResult.warnings.length;

  const errorPenalty = Math.min(1, errorCount * 0.15);
  const warningPenalty = Math.min(0.5, warningCount * 0.05);

  const score = Math.max(0, 1 - errorPenalty - warningPenalty);

  return {
    dimension: 'validation',
    score,
    weight: 0.2,
    details: `${errorCount} errors, ${warningCount} warnings from all validators`,
  };
}
