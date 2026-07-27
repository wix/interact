import type { Path, SemanticIssue, AnyEffect, AnyInteraction } from '../types';
import { RETRIGGER_TYPES } from '../types';
import { targetsSameElementAsSource } from './fouc';

function isTimeAnimationEffect(effect: AnyEffect): boolean {
  return !!(effect.namedEffect || effect.keyframeEffect || effect.customEffect);
}

// recommended `fill: 'both'` for scrubbed and toggling effects
export function checkRecommendedFill(
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): SemanticIssue[] {
  if (effect.fill === 'both') return [];
  const isScrubbed = owner?.trigger === 'viewProgress' || owner?.trigger === 'pointerMove';
  const isToggling =
    effect.triggerType !== undefined && RETRIGGER_TYPES.includes(effect.triggerType);
  if (!isScrubbed && !isToggling) return [];
  const reason = isScrubbed
    ? `${owner?.trigger} (scrubbed) effects`
    : `triggerType '${effect.triggerType}' effects`;
  return [
    {
      code: 'custom',
      params: { domainCode: 'RECOMMENDED_FILL_BOTH' },
      path: [...path, 'fill'],
      message: `Include \`fill: 'both'\` for ${reason} so the effect stays applied and is not garbage-collected.`,
      severity: 'info',
    },
  ];
}

// recommended `fill: 'backwards'` (or `both`) for viewEnter once entrances
export function checkRecommendedFillBackwards(
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): SemanticIssue[] {
  if (!owner || owner.trigger !== 'viewEnter') return [];
  const triggerType = effect.triggerType ?? 'once';
  if (triggerType !== 'once') return [];
  if (!isTimeAnimationEffect(effect)) return [];
  if (effect.fill === 'backwards' || effect.fill === 'both') return [];

  const sameElement = targetsSameElementAsSource(owner, effect);
  const reason = sameElement
    ? 'viewEnter entrances with delay'
    : 'viewEnter targets without FOUC hiding rules';

  return [
    {
      code: 'custom',
      params: { domainCode: 'RECOMMENDED_FILL_BACKWARDS' },
      path: [...path, 'fill'],
      message: `Include \`fill: 'backwards'\` (or \`'both'\` when the final keyframe must persist) for ${reason} so the starting keyframe applies during any delay.`,
      severity: 'info',
    },
  ];
}
