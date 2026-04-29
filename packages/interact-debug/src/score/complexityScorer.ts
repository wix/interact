import type { InteractConfig, ScoreResult, Scope } from '../types';
import { isRecord, isInScope } from '../validate/helpers';
import { weightedAverage } from './utils';

/**
 * Scores config complexity. Lower complexity is better (closer to 1.0).
 * Penalizes excessive interactions, effects per interaction, cross-key depth,
 * conditions, and nested sequences.
 */
export function scoreComplexity(config: InteractConfig, scope?: Scope): ScoreResult {
  const subscores: ScoreResult[] = [];

  const interactions = scope
    ? config.interactions.filter((ix, i) => isInScope(ix, i, scope))
    : config.interactions;

  // Interaction count: sweet spot 1–10, diminishing above
  const ixCount = interactions.length;
  const ixScore = ixCount <= 10 ? 1 : Math.max(0, 1 - (ixCount - 10) / 20);
  subscores.push({
    dimension: 'interactionCount',
    score: ixScore,
    weight: 0.25,
    details: `${ixCount} interactions`,
  });

  // Effects per interaction: >5 penalized
  let totalEffectsPerIx = 0;
  let maxEffectsPerIx = 0;
  for (const ix of interactions) {
    const count =
      (Array.isArray(ix.effects) ? ix.effects.length : 0) +
      (Array.isArray(ix.sequences) ? ix.sequences.length : 0);
    totalEffectsPerIx += count;
    maxEffectsPerIx = Math.max(maxEffectsPerIx, count);
  }
  const avgEffects = interactions.length > 0 ? totalEffectsPerIx / interactions.length : 0;
  const effScore = maxEffectsPerIx <= 5 ? 1 : Math.max(0, 1 - (maxEffectsPerIx - 5) / 15);
  subscores.push({
    dimension: 'effectsPerInteraction',
    score: effScore,
    weight: 0.2,
    details: `max ${maxEffectsPerIx}, avg ${avgEffects.toFixed(1)}`,
  });

  // Cross-key wiring depth
  let crossKeyCount = 0;
  for (const ix of interactions) {
    if (Array.isArray(ix.effects)) {
      for (const eff of ix.effects) {
        if (
          isRecord(eff) &&
          typeof (eff as Record<string, unknown>).key === 'string' &&
          (eff as Record<string, unknown>).key !== ix.key
        ) {
          crossKeyCount++;
        }
      }
    }
  }
  const crossScore = crossKeyCount <= 3 ? 1 : Math.max(0, 1 - (crossKeyCount - 3) / 10);
  subscores.push({
    dimension: 'crossKeyWiring',
    score: crossScore,
    weight: 0.2,
    details: `${crossKeyCount} cross-key effects`,
  });

  // Condition count
  const condCount = Object.keys(config.conditions ?? {}).length;
  const condScore = condCount <= 5 ? 1 : Math.max(0, 1 - (condCount - 5) / 15);
  subscores.push({
    dimension: 'conditions',
    score: condScore,
    weight: 0.15,
    details: `${condCount} conditions`,
  });

  // Sequence complexity
  let totalSeqEffects = 0;
  let nestedSeqCount = 0;
  if (config.sequences) {
    for (const seq of Object.values(config.sequences)) {
      if (!isRecord(seq)) continue;
      const seqObj = seq as Record<string, unknown>;
      const effects = Array.isArray(seqObj.effects) ? seqObj.effects : [];
      totalSeqEffects += effects.length;
      for (const eff of effects) {
        if (isRecord(eff) && typeof (eff as Record<string, unknown>).sequenceId === 'string') {
          nestedSeqCount++;
        }
      }
    }
  }
  const seqScore =
    totalSeqEffects <= 10 && nestedSeqCount === 0
      ? 1
      : Math.max(0, 1 - totalSeqEffects / 30 - nestedSeqCount * 0.15);
  subscores.push({
    dimension: 'sequences',
    score: seqScore,
    weight: 0.2,
    details: `${totalSeqEffects} total effects in sequences, ${nestedSeqCount} nested`,
  });

  const score = weightedAverage(subscores);
  return {
    dimension: 'complexity',
    score,
    weight: 0.1,
    details: `Complexity score based on interaction count, effects, cross-key wiring, conditions, sequences`,
    subscores,
  };
}
