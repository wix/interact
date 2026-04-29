import type { Page } from '@playwright/test';
import type { InteractArtifact, ValidationResult, ScoreResult, ScoreReport, Scope } from '../types';
import { scorePerformance } from './performanceScorer';
import { scoreAnimationFidelity } from './animationFidelityScorer';
import { scoreArtifact } from '../score/aggregate';

/**
 * Score an artifact at runtime (needs Playwright page with served artifact).
 * Runs performance and animation fidelity scorers.
 */
export async function scoreRuntime(
  page: Page,
  artifact: InteractArtifact,
  scope?: Scope,
): Promise<ScoreReport> {
  const dimensions: ScoreResult[] = [
    await scorePerformance(page, artifact, scope),
    await scoreAnimationFidelity(page, artifact, scope),
  ];
  return buildReport(dimensions);
}

/**
 * Combined static + runtime scoring.
 * When a Page is provided, includes runtime scorers alongside static ones.
 */
export async function scoreAll(
  artifact: InteractArtifact,
  options?: { page?: Page; scope?: Scope; validationResult?: ValidationResult },
): Promise<ScoreReport> {
  const staticReport = scoreArtifact(artifact, options?.scope, options?.validationResult);

  if (!options?.page) return staticReport;

  const runtimeReport = await scoreRuntime(options.page, artifact, options.scope);

  const allDimensions = [...staticReport.dimensions, ...runtimeReport.dimensions];
  return buildReport(allDimensions);
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
