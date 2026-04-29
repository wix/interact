import type { InteractArtifact, ScoreResult, Scope, TriggerType } from '../types';
import { isRecord, isInScope, resolveEffect, buildGlobalMaps } from '../validate/helpers';
import { weightedAverage } from './utils';

/**
 * Scores accessibility best practices:
 * - `activate` for every `click` (keyboard support)
 * - `interest` for every `hover` (focus support)
 * - `prefers-reduced-motion` condition defined and used
 * - State effects use toggle action (keyboard-friendly)
 * - allowA11yTriggers set when a11y triggers are used
 */
export function scoreA11y(artifact: InteractArtifact, scope?: Scope): ScoreResult {
  const { config, setupMeta } = artifact;
  const subscores: ScoreResult[] = [];

  const interactions = scope
    ? config.interactions.filter((ix, i) => isInScope(ix, i, scope))
    : config.interactions;

  // Build key→triggers map
  const triggersByKey = new Map<string, Set<TriggerType>>();
  for (const ix of interactions) {
    const set = triggersByKey.get(ix.key) ?? new Set();
    set.add(ix.trigger);
    triggersByKey.set(ix.key, set);
  }

  // Click vs activate: activate should be used INSTEAD OF click
  let clickCount = 0;
  let activateCount = 0;
  for (const [, triggers] of triggersByKey) {
    if (triggers.has('click')) clickCount++;
    if (triggers.has('activate')) activateCount++;
  }
  const totalClickLike = clickCount + activateCount;
  const activateScore = totalClickLike === 0 ? 1 : activateCount / totalClickLike;
  subscores.push({
    dimension: 'clickActivatePairing',
    score: activateScore,
    weight: 0.3,
    details: `${activateCount}/${totalClickLike} click-like keys use activate`,
  });

  // Hover vs interest: interest should be used INSTEAD OF hover
  let hoverCount = 0;
  let interestCount = 0;
  for (const [, triggers] of triggersByKey) {
    if (triggers.has('hover')) hoverCount++;
    if (triggers.has('interest')) interestCount++;
  }
  const totalHoverLike = hoverCount + interestCount;
  const interestScore = totalHoverLike === 0 ? 1 : interestCount / totalHoverLike;
  subscores.push({
    dimension: 'hoverInterestPairing',
    score: interestScore,
    weight: 0.3,
    details: `${interestCount}/${totalHoverLike} hover-like keys use interest`,
  });

  // prefers-reduced-motion condition
  const conditions = config.conditions ?? {};
  const hasReducedMotion = Object.values(conditions).some((c) => {
    if (!isRecord(c)) return false;
    const cond = c as Record<string, unknown>;
    return (
      cond.type === 'media' &&
      typeof cond.predicate === 'string' &&
      cond.predicate.includes('prefers-reduced-motion')
    );
  });
  const rmScore = hasReducedMotion ? 1 : 0;
  subscores.push({
    dimension: 'reducedMotion',
    score: rmScore,
    weight: 0.2,
    details: hasReducedMotion
      ? 'prefers-reduced-motion condition present'
      : 'No prefers-reduced-motion condition',
  });

  // State effects use toggle action
  const { globalEffects } = buildGlobalMaps(config);
  let stateEffects = 0;
  let toggleActions = 0;
  for (const ix of interactions) {
    if (!Array.isArray(ix.effects)) continue;
    for (const raw of ix.effects) {
      if (!isRecord(raw)) continue;
      const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
      if ('transition' in eff || 'transitionProperties' in eff) {
        stateEffects++;
        if (eff.stateAction === 'toggle') toggleActions++;
      }
    }
  }
  const toggleScore = stateEffects === 0 ? 1 : toggleActions / stateEffects;
  subscores.push({
    dimension: 'stateToggle',
    score: toggleScore,
    weight: 0.1,
    details: `${toggleActions}/${stateEffects} state effects use toggle`,
  });

  // allowA11yTriggers set when needed
  const needsA11y = interactions.some(
    (ix) => ix.trigger === 'activate' || ix.trigger === 'interest',
  );
  let a11yTriggersScore = 1;
  if (needsA11y && setupMeta) {
    a11yTriggersScore = setupMeta.hasA11yTriggers ? 1 : 0;
  } else if (needsA11y && !setupMeta) {
    a11yTriggersScore = 0.5; // unknown
  }
  subscores.push({
    dimension: 'allowA11yTriggers',
    score: a11yTriggersScore,
    weight: 0.1,
    details: needsA11y ? (setupMeta?.hasA11yTriggers ? 'Set' : 'Not set') : 'Not needed',
  });

  const score = weightedAverage(subscores);
  return {
    dimension: 'a11y',
    score,
    weight: 0.2,
    details: `Accessibility score based on trigger pairing, reduced motion, and state actions`,
    subscores,
  };
}
