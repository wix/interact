import type { Path, SemanticIssue, AnyCondition } from '../types';

const MOTION_PREFERENCE_FEATURE = 'prefers-reduced-motion';
const NO_PREFERENCE = new RegExp(`${MOTION_PREFERENCE_FEATURE}\\s*:\\s*no-preference`);
const SCRUB_TRIGGERS = ['viewProgress', 'pointerMove'];

// `(prefers-reduced-motion: no-preference)` gates on motion being allowed, which is what the
// runtime already does for a scrub — redundant, not dead. Every other spelling of the feature
// (`: reduce`, or the boolean `(prefers-reduced-motion)`) selects the reduce side.
// `not (prefers-reduced-motion: no-preference)` reads as no-preference here — a deliberate
// false negative, cheaper than the false positives a looser test would produce.
function gatesOnReduce(predicate: string): boolean {
  return predicate.includes(MOTION_PREFERENCE_FEATURE) && !NO_PREFERENCE.test(predicate);
}

export function checkReduceGatedScrub(
  path: Path,
  conditions: string[] | undefined,
  configConditions: Record<string, AnyCondition>,
  trigger?: string,
): SemanticIssue[] {
  if (!trigger || !SCRUB_TRIGGERS.includes(trigger) || !conditions) return [];

  const index = conditions.findIndex((conditionId) => {
    const condition = configConditions[conditionId];
    return condition?.type === 'media' && gatesOnReduce(condition.predicate);
  });

  if (index === -1) return [];

  return [
    {
      code: 'custom',
      params: { domainCode: 'REDUCE_GATED_SCRUB' },
      path: [...path, 'conditions', index],
      message: `Condition "${conditions[index]}" gates a \`${trigger}\` scrub on reduced motion, so it can never run — scrubbed effects are cancelled under \`(prefers-reduced-motion: reduce)\` whatever their conditions say. Give the reduced-motion alternative a time-based trigger such as \`viewEnter\`, or express it as a plain CSS rule.`,
      severity: 'warning',
    },
  ];
}
