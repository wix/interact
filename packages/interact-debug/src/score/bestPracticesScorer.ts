import type { InteractArtifact, ScoreResult, Scope } from '../types';
import { isRecord, isInScope, resolveEffect, buildGlobalMaps } from '../validate/helpers';
import { detectAntiPatterns } from '../validate/antiPatterns';
import { weightedAverage } from './utils';

/**
 * Scores adherence to Interact best practices:
 * - Anti-pattern count
 * - FOUC prevention for viewEnter+once
 * - Fill usage (forwards for once, both for alternate)
 * - effectId usage for shared effects
 * - Cleanup code (destroy)
 */
export function scoreBestPractices(artifact: InteractArtifact, scope?: Scope): ScoreResult {
  const { config, setupMeta, htmlMeta } = artifact;
  const { globalEffects } = buildGlobalMaps(config);
  const subscores: ScoreResult[] = [];

  const interactions = scope
    ? config.interactions.filter((ix, i) => isInScope(ix, i, scope))
    : config.interactions;

  // Anti-pattern count
  const antiResult = detectAntiPatterns(artifact, scope);
  const antiCount = antiResult.warnings.length;
  const antiScore = antiCount === 0 ? 1 : Math.max(0, 1 - antiCount * 0.15);
  subscores.push({
    dimension: 'antiPatterns',
    score: antiScore,
    weight: 0.25,
    details: `${antiCount} anti-patterns detected`,
  });

  // FOUC prevention completeness
  let foucNeeded = 0;
  let foucComplete = 0;
  for (const ix of interactions) {
    if (ix.trigger !== 'viewEnter') continue;
    const effects = Array.isArray(ix.effects)
      ? ix.effects.map((e) =>
          isRecord(e) ? resolveEffect(e as Record<string, unknown>, globalEffects) : {},
        )
      : [];
    const isOnce = effects.every((e) => !('triggerType' in e) || e.triggerType === 'once');
    const sameElement = effects.every((e) => !('key' in e) || e.key === ix.key);

    if (isOnce && sameElement) {
      foucNeeded++;
      if (htmlMeta && setupMeta) {
        const hasInitial = ix.key in (htmlMeta.initials ?? {});
        const hasGenerate = setupMeta.hasGenerate === true;
        if (hasInitial && hasGenerate) foucComplete++;
      }
    }
  }
  const foucScore = foucNeeded === 0 ? 1 : foucComplete / foucNeeded;
  subscores.push({
    dimension: 'foucPrevention',
    score: foucScore,
    weight: 0.2,
    details: `${foucComplete}/${foucNeeded} viewEnter+once interactions have complete FOUC prevention`,
  });

  // Fill usage correctness
  let fillChecks = 0;
  let fillCorrect = 0;
  for (const ix of interactions) {
    if (!Array.isArray(ix.effects)) continue;
    for (const raw of ix.effects) {
      if (!isRecord(raw)) continue;
      const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
      const isAnimation = 'keyframeEffect' in eff || 'namedEffect' in eff || 'customEffect' in eff;
      if (!isAnimation) continue;

      const triggerType = eff.triggerType as string | undefined;
      const fill = eff.fill as string | undefined;

      if (triggerType === 'once' || (!triggerType && ix.trigger === 'viewEnter')) {
        fillChecks++;
        if (fill === 'forwards' || fill === 'both') fillCorrect++;
      } else if (triggerType === 'alternate') {
        fillChecks++;
        if (fill === 'both' || fill === 'forwards') fillCorrect++;
      }
    }
  }
  const fillScore = fillChecks === 0 ? 1 : fillCorrect / fillChecks;
  subscores.push({
    dimension: 'fillUsage',
    score: fillScore,
    weight: 0.15,
    details: `${fillCorrect}/${fillChecks} effects have correct fill value`,
  });

  // effectId usage for shared effects (prefer effectId over inline duplication)
  let effectIdUsage = 0;
  let inlineEffects = 0;
  const definedEffects = Object.keys(config.effects ?? {}).length;
  for (const ix of interactions) {
    if (!Array.isArray(ix.effects)) continue;
    for (const eff of ix.effects) {
      if (!isRecord(eff)) continue;
      const e = eff as Record<string, unknown>;
      if (typeof e.effectId === 'string') {
        effectIdUsage++;
      } else if (
        'keyframeEffect' in e ||
        'namedEffect' in e ||
        'customEffect' in e ||
        'transition' in e
      ) {
        inlineEffects++;
      }
    }
  }
  const totalEffectRefs = effectIdUsage + inlineEffects;
  const reuseScore =
    totalEffectRefs === 0
      ? 1
      : definedEffects > 0
        ? Math.min(1, effectIdUsage / totalEffectRefs + 0.3)
        : inlineEffects <= 2
          ? 1
          : 0.6;
  subscores.push({
    dimension: 'effectReuse',
    score: Math.min(1, reuseScore),
    weight: 0.2,
    details: `${effectIdUsage} effectId refs, ${inlineEffects} inline, ${definedEffects} defined`,
  });

  // Cleanup code (destroy)
  let destroyScore = 1;
  if (setupMeta) {
    destroyScore = setupMeta.hasDestroy ? 1 : 0.3;
  }
  subscores.push({
    dimension: 'cleanup',
    score: destroyScore,
    weight: 0.2,
    details: setupMeta?.hasDestroy ? 'destroy() present' : setupMeta ? 'No destroy()' : 'Unknown',
  });

  const score = weightedAverage(subscores);
  return {
    dimension: 'bestPractices',
    score,
    weight: 0.15,
    details: `Best practices score: anti-patterns, FOUC, fill, reuse, cleanup`,
    subscores,
  };
}
