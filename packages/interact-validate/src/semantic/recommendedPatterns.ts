import type { Path, SemanticIssue, AnyEffect, AnyInteraction } from '../types';
import { RETRIGGER_TYPES } from '../types';

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
