import type {
  InteractConfig,
  InteractArtifact,
  ValidationResult,
  ScoreResult,
  ScoreReport,
  Scope,
} from '../types';
import { scoreComplexity } from './complexityScorer';
import { scoreWeight } from './weightScorer';
import { scoreA11y } from './a11yScorer';
import { scoreCoherence } from './coherenceScorer';
import { scoreBestPractices } from './bestPracticesScorer';
import { scoreValidation } from './validationScorer';

/**
 * Score a config-only input (no HTML/JS metadata).
 * Runs complexity, weight, and coherence scorers.
 */
export function scoreConfig(config: InteractConfig, scope?: Scope): ScoreReport {
  const dimensions: ScoreResult[] = [
    scoreComplexity(config, scope),
    scoreWeight(config, scope),
    scoreCoherence(config, scope),
  ];
  return buildReport(dimensions);
}

/**
 * Score a full artifact (config + metadata) with its validation results.
 * Runs all static scorers including a11y, bestPractices, and validation.
 *
 * When validationResult is provided, the validation dimension uses ALL
 * validator errors/warnings (schema, reference, compatibility, integration,
 * anti-patterns, registry) to produce a single penalized score.
 */
export function scoreArtifact(
  artifact: InteractArtifact,
  scope?: Scope,
  validationResult?: ValidationResult,
): ScoreReport {
  const dimensions: ScoreResult[] = [
    scoreComplexity(artifact.config, scope),
    scoreWeight(artifact.config, scope),
    scoreA11y(artifact, scope),
    scoreCoherence(artifact.config, scope),
    scoreBestPractices(artifact, scope),
  ];

  if (validationResult) {
    dimensions.push(scoreValidation(validationResult));
  }

  return buildReport(dimensions);
}

function buildReport(dimensions: ScoreResult[]): ScoreReport {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const dim of dimensions) {
    weightedSum += dim.score * dim.weight;
    totalWeight += dim.weight;
  }
  return {
    aggregate: totalWeight > 0 ? weightedSum / totalWeight : 0,
    dimensions,
  };
}
