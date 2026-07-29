import type { Path, SemanticIssue, AnyEffect, AnyInteraction } from '../types';
import { RETRIGGER_TYPES } from '../types';

function isKeyframeEffect(effect: AnyEffect): boolean {
  return !!(effect.namedEffect || effect.keyframeEffect);
}

// recommended fill for scrubbed, toggling, and viewEnter entrance effects
export function checkRecommendedFill(
  path: Path,
  effect: AnyEffect,
  owner?: AnyInteraction,
): SemanticIssue[] {
  if (effect.fill === 'both') return [];
  const isScrubbed = owner?.trigger === 'viewProgress' || owner?.trigger === 'pointerMove';
  const isToggling =
    effect.triggerType !== undefined && RETRIGGER_TYPES.includes(effect.triggerType);

  if (isScrubbed || isToggling) {
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

  if (!owner || owner.trigger !== 'viewEnter') return [];
  const triggerType = effect.triggerType ?? 'once';
  if (triggerType !== 'once') return [];
  if (!isKeyframeEffect(effect)) return [];
  if (effect.fill === 'backwards' || effect.fill === 'both') return [];

  return [
    {
      code: 'custom',
      params: { domainCode: 'RECOMMENDED_FILL_BACKWARDS' },
      path: [...path, 'fill'],
      message: `Include \`fill: 'backwards'\` (or \`'both'\` when the final keyframe must persist) so the starting keyframe applies before the animation starts on a target without FOUC hiding rules.`,
      severity: 'info',
    },
  ];
}
