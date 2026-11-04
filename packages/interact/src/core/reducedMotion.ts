import type {
  Condition,
  Effect,
  ReducedMotionHandling,
  ScrubEffect,
  StateEffect,
  TimeEffect,
} from '../types';
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

type KeysOfUnion<T> = T extends unknown ? keyof T : never;

// typed against the effect types, so a new field must be classified here
const BODY_FIELDS = new Set(
  Object.keys({
    namedEffect: true,
    keyframeEffect: true,
    customEffect: true,
    transition: true,
    transitionProperties: true,
    duration: true,
    delay: true,
    easing: true,
    iterations: true,
    alternate: true,
    fill: true,
    reversed: true,
    composite: true,
    rangeStart: true,
    rangeEnd: true,
    centeredToTarget: true,
    transitionDuration: true,
    transitionEasing: true,
  } satisfies Record<
    Exclude<
      KeysOfUnion<TimeEffect | ScrubEffect | StateEffect>,
      'key' | 'effectId' | 'stateAction' | 'triggerType'
    >,
    true
  >),
);

export function withReducedMotionConditions(
  conditions: Record<string, Condition> = {},
): Record<string, Condition> {
  return { ...conditions, ...REDUCED_MOTION_CONDITIONS };
}

// handlings from the most specific level: effect, sequence, interaction, instance
export function getReducedMotionHandling(
  ...handlings: (ReducedMotionHandling | undefined)[]
): ReducedMotionHandling {
  return handlings.find(Boolean) ?? 'collapse';
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

  const { iterations = 1, alternate, reversed } = effect as TimeEffect;
  if (kind === 'scrub' || !iterations || iterations === Infinity) {
    return null;
  }

  // a single iteration ending where the last one does, which runs backwards when it's an odd alternate one
  return {
    ...effect,
    duration: 0,
    iterations: iterations % 1 || 1,
    ...(alternate && (Math.ceil(iterations) - 1) % 2 && { reversed: !reversed }),
  };
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
  handling: ReducedMotionHandling,
  effects: Record<string, Effect>,
): T | null {
  switch (handling) {
    case 'ignore':
      return effect;
    case 'cancel':
      return null;
    case 'collapse':
      return collapse(effect);
    default: {
      const replacement = effects[handling];
      return replacement && getEffectKind(replacement) === getEffectKind(effect)
        ? replace(effect, handling, replacement)
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
  handling: ReducedMotionHandling,
  { effects, force, collapsesStagger }: VariantOptions,
): T[] {
  const reduced = getReducedEffect(effect, handling, effects);

  if (force) {
    return reduced ? [reduced] : [];
  }

  if (reduced === effect && !collapsesStagger) {
    return [effect];
  }

  const normal = withCondition(effect, REDUCED_MOTION_NO_PREFERENCE);

  return reduced ? [normal, withCondition(reduced, REDUCED_MOTION_REDUCE)] : [normal];
}
