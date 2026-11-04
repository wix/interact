import type { Condition, Effect, ReducedMotionPolicy, StateEffect, TimeEffect } from '../types';
import { isTransitionEffect } from '../utils';

export const REDUCED_MOTION_REDUCE = '__rm-reduce';
export const REDUCED_MOTION_NO_PREFERENCE = '__rm-no-preference';

export const REDUCED_MOTION_CONDITIONS: Record<string, Condition> = {
  [REDUCED_MOTION_REDUCE]: { type: 'media', predicate: 'prefers-reduced-motion: reduce' },
  [REDUCED_MOTION_NO_PREFERENCE]: {
    type: 'media',
    predicate: 'prefers-reduced-motion: no-preference',
  },
};

type EffectKind = 'time' | 'scrub' | 'state';

type VariantOptions = {
  effects: Record<string, Effect>;
  force?: boolean;
  // the effect plays in a sequence whose stagger collapses, so it has a reduced-motion variant even when ignored
  collapsesStagger?: boolean;
};

// the effect's animation itself, taken from a replacement - the rest is the original's identity and targeting
const BODY_FIELDS = new Set([
  'namedEffect',
  'keyframeEffect',
  'customEffect',
  'transition',
  'transitionProperties',
  'duration',
  'delay',
  'easing',
  'iterations',
  'alternate',
  'fill',
  'reversed',
  'composite',
  'rangeStart',
  'rangeEnd',
  'centeredToTarget',
  'transitionDuration',
  'transitionEasing',
]);

export function withReducedMotionConditions(
  conditions: Record<string, Condition> = {},
): Record<string, Condition> {
  return { ...conditions, ...REDUCED_MOTION_CONDITIONS };
}

// policies from the most specific level: effect, sequence, interaction, instance
export function getReducedMotionPolicy(
  ...policies: (ReducedMotionPolicy | undefined)[]
): ReducedMotionPolicy {
  return policies.find(Boolean) ?? 'collapse';
}

// the same time/scrub discriminator as effectToAnimationOptions()
function getEffectKind(effect: object): EffectKind {
  if (isTransitionEffect(effect)) {
    return 'state';
  }
  return 'duration' in effect ? 'time' : 'scrub';
}

function collapse<T extends object>(effect: T): T | null {
  const kind = getEffectKind(effect);

  if (kind === 'state') {
    const { transition, transitionProperties } = effect as StateEffect;
    return {
      ...effect,
      ...(transition && { transition: { ...transition, duration: 0 } }),
      ...(transitionProperties && {
        transitionProperties: transitionProperties.map((property) => ({
          ...property,
          duration: 0,
        })),
      }),
    };
  }

  const { iterations = 1 } = effect as TimeEffect;
  if (kind === 'scrub' || !iterations || iterations === Infinity) {
    return null;
  }

  return { ...effect, duration: 0 };
}

function replace<T extends object>(effect: T, replacementId: string, replacement: Effect): T {
  const isBody = ([field]: [string, unknown]) => BODY_FIELDS.has(field);
  const { keyframeEffect } = replacement as { keyframeEffect?: { name?: string } };

  return {
    ...Object.fromEntries(Object.entries(effect).filter((entry) => !isBody(entry))),
    ...Object.fromEntries(Object.entries(replacement).filter(isBody)),
    // named after the replacement, or its keyframes would take the original's name
    ...(keyframeEffect && {
      keyframeEffect: { ...keyframeEffect, name: keyframeEffect.name || replacementId },
    }),
  } as T;
}

function getReducedEffect<T extends object>(
  effect: T,
  policy: ReducedMotionPolicy,
  effects: Record<string, Effect>,
): T | null {
  switch (policy) {
    case 'ignore':
      return effect;
    case 'cancel':
      return null;
    case 'collapse':
      return collapse(effect);
    default: {
      const replacement = effects[policy];
      return replacement && getEffectKind(replacement) === getEffectKind(effect)
        ? replace(effect, policy, replacement)
        : collapse(effect);
    }
  }
}

function withCondition<T extends object>(effect: T, condition: string): T {
  return {
    ...effect,
    conditions: [...((effect as { conditions?: string[] }).conditions || []), condition],
  };
}

export function isReducedMotionVariant(effect: { conditions?: string[] }): boolean {
  return !!effect.conditions?.includes(REDUCED_MOTION_REDUCE);
}

/**
 * The effect's variants, each under its reserved media: CSS emits all of them, the runtime picks the one whose
 * media matches. When forced, only the reduced-motion outcome, unconditionally.
 */
export function getReducedMotionVariants<T extends object>(
  effect: T,
  policy: ReducedMotionPolicy,
  { effects, force, collapsesStagger }: VariantOptions,
): T[] {
  const reduced = getReducedEffect(effect, policy, effects);

  if (force) {
    return reduced ? [reduced] : [];
  }

  if (reduced === effect && !collapsesStagger) {
    return [effect];
  }

  const normal = withCondition(effect, REDUCED_MOTION_NO_PREFERENCE);

  return reduced ? [normal, withCondition(reduced, REDUCED_MOTION_REDUCE)] : [normal];
}
