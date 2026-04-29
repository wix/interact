import type { InteractConfig, ScoreResult, Scope } from '../types';
import { isRecord, isInScope, resolveEffect, buildGlobalMaps } from '../validate/helpers';
import { weightedAverage } from './utils';

const COMPOSITE_PROPERTIES = new Set([
  'transform',
  'opacity',
  'filter',
  'backdrop-filter',
  'clip-path',
  'offset-distance',
  'translate',
  'rotate',
  'scale',
]);

const LAYOUT_PROPERTIES = new Set([
  'width',
  'height',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-width',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'font-size',
  'line-height',
]);

/**
 * Estimates the rendering cost of animations. Lighter animations (compositor-friendly
 * properties, fewer keyframes, shorter total duration) score higher.
 */
export function scoreWeight(config: InteractConfig, scope?: Scope): ScoreResult {
  const { globalEffects } = buildGlobalMaps(config);
  const subscores: ScoreResult[] = [];

  const interactions = scope
    ? config.interactions.filter((ix, i) => isInScope(ix, i, scope))
    : config.interactions;

  let totalKeyframes = 0;
  let totalDuration = 0;
  let compositorCount = 0;
  let layoutCount = 0;
  let animationEffectCount = 0;

  for (const ix of interactions) {
    if (!Array.isArray(ix.effects)) continue;
    for (const raw of ix.effects) {
      if (!isRecord(raw)) continue;
      const eff = resolveEffect(raw as Record<string, unknown>, globalEffects);
      const isAnimation = 'keyframeEffect' in eff || 'namedEffect' in eff || 'customEffect' in eff;
      if (!isAnimation) continue;

      animationEffectCount++;

      if (typeof eff.duration === 'number') {
        totalDuration += eff.duration as number;
      }

      if (isRecord(eff.keyframeEffect)) {
        const kf = eff.keyframeEffect as Record<string, unknown>;
        if (Array.isArray(kf.keyframes)) {
          totalKeyframes += kf.keyframes.length;
          const props = extractProperties(kf.keyframes as Record<string, unknown>[]);
          const { compositor, layout } = classifyProperties(props);
          compositorCount += compositor;
          layoutCount += layout;
        }
      } else if (isRecord(eff.namedEffect)) {
        totalKeyframes += 2; // assume 2 keyframes for named effects
        compositorCount++; // named presets are typically compositor-friendly
      }
    }
  }

  // Keyframe count: ≤50 is ideal
  const kfScore = totalKeyframes <= 50 ? 1 : Math.max(0, 1 - (totalKeyframes - 50) / 200);
  subscores.push({
    dimension: 'keyframeCount',
    score: kfScore,
    weight: 0.2,
    details: `${totalKeyframes} total keyframes`,
  });

  // Total duration: ≤10s is ideal
  const durScore = totalDuration <= 10000 ? 1 : Math.max(0, 1 - (totalDuration - 10000) / 30000);
  subscores.push({
    dimension: 'totalDuration',
    score: durScore,
    weight: 0.2,
    details: `${totalDuration}ms total`,
  });

  // Simultaneous animations: based on unique triggers per key
  const simultaneousScore =
    animationEffectCount <= 10 ? 1 : Math.max(0, 1 - (animationEffectCount - 10) / 20);
  subscores.push({
    dimension: 'simultaneousAnimations',
    score: simultaneousScore,
    weight: 0.2,
    details: `${animationEffectCount} animation effects`,
  });

  // Compositor vs layout: prefer compositor-only
  const totalProps = compositorCount + layoutCount;
  const compositorRatio = totalProps > 0 ? compositorCount / totalProps : 1;
  subscores.push({
    dimension: 'compositorFriendly',
    score: compositorRatio,
    weight: 0.4,
    details: `${compositorCount} compositor, ${layoutCount} layout-triggering`,
  });

  const score = weightedAverage(subscores);
  return {
    dimension: 'weight',
    score,
    weight: 0.1,
    details: `Animation cost estimate based on keyframes, duration, and property types`,
    subscores,
  };
}

function extractProperties(keyframes: Record<string, unknown>[]): string[] {
  const props = new Set<string>();
  for (const frame of keyframes) {
    for (const key of Object.keys(frame)) {
      if (key === 'offset' || key === 'easing' || key === 'composite') continue;
      props.add(camelToKebab(key));
    }
  }
  return [...props];
}

function classifyProperties(props: string[]): { compositor: number; layout: number } {
  let compositor = 0;
  let layout = 0;
  for (const prop of props) {
    if (COMPOSITE_PROPERTIES.has(prop)) {
      compositor++;
    } else if (LAYOUT_PROPERTIES.has(prop)) {
      layout++;
    } else {
      // Paint-only properties (color, background, etc.) count as compositor-adjacent
      compositor++;
    }
  }
  return { compositor, layout };
}

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
