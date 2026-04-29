import type { InteractConfig, ScoreResult, Scope } from '../types';
import { isRecord, isInScope, resolveEffect, buildGlobalMaps } from '../validate/helpers';
import { weightedAverage } from './utils';

const ENTRANCE_PATTERN = /In$/;
const SCROLL_PATTERN = /Scroll$/;
const MOUSE_PATTERN = /Mouse$/;
const ONGOING_NAMES = new Set([
  'Bounce',
  'Breathe',
  'Cross',
  'Flash',
  'Flip',
  'Fold',
  'Jello',
  'Poke',
  'Pulse',
  'Rubber',
  'Spin',
  'Swing',
  'Wiggle',
]);
const BG_SCROLL_PATTERN = /^Bg|^ImageParallax$/;

const TRIGGER_TO_PRESET_AFFINITY: Record<string, (type: string) => boolean> = {
  viewEnter: (t) => ENTRANCE_PATTERN.test(t),
  pageVisible: (t) => ENTRANCE_PATTERN.test(t),
  viewProgress: (t) => SCROLL_PATTERN.test(t) || BG_SCROLL_PATTERN.test(t),
  pointerMove: (t) => MOUSE_PATTERN.test(t),
  hover: (t) => ONGOING_NAMES.has(t) || ENTRANCE_PATTERN.test(t),
  click: (t) => ONGOING_NAMES.has(t) || ENTRANCE_PATTERN.test(t),
  activate: (t) => ONGOING_NAMES.has(t) || ENTRANCE_PATTERN.test(t),
  interest: (t) => ONGOING_NAMES.has(t) || ENTRANCE_PATTERN.test(t),
  animationEnd: (t) => ENTRANCE_PATTERN.test(t) || ONGOING_NAMES.has(t),
};

/**
 * Scores semantic alignment between triggers and effects.
 * Entrance presets with viewEnter, scroll presets with viewProgress,
 * mouse presets with pointerMove, etc. Also checks consistency of
 * easing and duration across the config.
 */
export function scoreCoherence(config: InteractConfig, scope?: Scope): ScoreResult {
  const { globalEffects } = buildGlobalMaps(config);
  const subscores: ScoreResult[] = [];

  const interactions = scope
    ? config.interactions.filter((ix, i) => isInScope(ix, i, scope))
    : config.interactions;

  // Named effect + trigger affinity
  let namedEffectCount = 0;
  let alignedCount = 0;
  for (const ix of interactions) {
    if (!Array.isArray(ix.effects)) continue;
    for (const raw of ix.effects) {
      if (!isRecord(raw)) continue;
      const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
      if (!isRecord(eff.namedEffect)) continue;
      const ne = eff.namedEffect as Record<string, unknown>;
      if (typeof ne.type !== 'string') continue;

      namedEffectCount++;
      const checker = TRIGGER_TO_PRESET_AFFINITY[ix.trigger];
      if (checker && checker(ne.type)) {
        alignedCount++;
      }
    }
  }
  const affinityScore = namedEffectCount === 0 ? 1 : alignedCount / namedEffectCount;
  subscores.push({
    dimension: 'presetTriggerAffinity',
    score: affinityScore,
    weight: 0.5,
    details: `${alignedCount}/${namedEffectCount} named effects match their trigger type`,
  });

  // Easing/duration consistency: penalize wildly different values
  const durations: number[] = [];
  const easings: string[] = [];
  for (const ix of interactions) {
    if (!Array.isArray(ix.effects)) continue;
    for (const raw of ix.effects) {
      if (!isRecord(raw)) continue;
      const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
      if (typeof eff.duration === 'number') durations.push(eff.duration as number);
      if (typeof eff.easing === 'string') easings.push(eff.easing as string);
    }
  }

  let consistencyScore = 1;
  if (durations.length >= 2) {
    const maxD = Math.max(...durations);
    const minD = Math.min(...durations);
    const ratio = maxD > 0 ? minD / maxD : 1;
    // A ratio close to 1 means consistent durations
    consistencyScore = Math.max(0, ratio);
  }

  const uniqueEasings = new Set(easings).size;
  if (uniqueEasings > 3) {
    consistencyScore *= Math.max(0.5, 1 - (uniqueEasings - 3) * 0.1);
  }

  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;
  subscores.push({
    dimension: 'durationEasingConsistency',
    score: consistencyScore,
    weight: 0.5,
    details: `${durations.length} durations (range ${minDuration}–${maxDuration}ms), ${uniqueEasings} unique easings`,
  });

  const score = weightedAverage(subscores);
  return {
    dimension: 'coherence',
    score,
    weight: 0.1,
    details: `Semantic alignment of triggers to effects and consistency of timing values`,
    subscores,
  };
}
