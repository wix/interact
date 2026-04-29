import type { Page } from '@playwright/test';
import type { InteractArtifact, ScoreResult, Scope } from '../types';
import { verifyAll } from './runtimeVerifier';

/**
 * Runtime animation fidelity scorer.
 * Uses the runtime verifier to check that every interaction actually works,
 * then converts the pass rate to a 0–1 score.
 */
export async function scoreAnimationFidelity(
  page: Page,
  artifact: InteractArtifact,
  scope?: Scope,
): Promise<ScoreResult> {
  const results = await verifyAll(page, artifact, scope);

  if (results.length === 0) {
    return {
      dimension: 'animationFidelity',
      score: 1,
      weight: 0.2,
      details: 'No interactions to verify',
    };
  }

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const score = passed / total;

  const subscores: ScoreResult[] = results.map((r) => ({
    dimension: `${r.interaction.key}:${r.interaction.trigger}[${r.interaction.index}]`,
    score: r.passed ? 1 : 0,
    weight: 1 / total,
    details: r.passed
      ? 'All checks passed'
      : `Failed: ${r.checks
          .filter((c) => !c.passed)
          .map((c) => c.name)
          .join(', ')}`,
  }));

  return {
    dimension: 'animationFidelity',
    score,
    weight: 0.2,
    details: `${passed}/${total} interactions passed runtime verification`,
    subscores,
  };
}
