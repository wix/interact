import type {
  Condition,
  Effect,
  ReducedMotionHandling,
  StateEffect,
  TimeEffect,
  TriggerType,
} from '../types';

export const REDUCED_MOTION_REDUCE = '__rm-reduce';
export const REDUCED_MOTION_NO_PREFERENCE = '__rm-no-preference';

export const REDUCED_MOTION_CONDITIONS: Record<string, Condition> = {
  [REDUCED_MOTION_REDUCE]: { type: 'media', predicate: 'prefers-reduced-motion: reduce' },
  [REDUCED_MOTION_NO_PREFERENCE]: {
    type: 'media',
    predicate: 'prefers-reduced-motion: no-preference',
  },
};

export type EffectKind = 'time' | 'scrub' | 'state';

type HandlingSource = { reducedMotionHandling?: ReducedMotionHandling } | undefined;

type VariantOptions = {
  kind: EffectKind;
  effects: Record<string, Effect>;
  force?: boolean;
  warn?: boolean;
};

// the effect's animation itself, taken from a replacement - the rest is the original's identity and targeting
const BODY_FIELDS = [
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
] as const;

const SCRUB_TRIGGERS = new Set<TriggerType>(['viewProgress', 'pointerMove']);

const warned = new Set<string>();

export function withReducedMotionConditions(
  conditions: Record<string, Condition> = {},
): Record<string, Condition> {
  return { ...conditions, ...REDUCED_MOTION_CONDITIONS };
}

export function getReducedMotionHandling(
  effect: HandlingSource,
  sequence: HandlingSource,
  interaction: HandlingSource,
  config: HandlingSource,
): ReducedMotionHandling {
  return (
    effect?.reducedMotionHandling ??
    sequence?.reducedMotionHandling ??
    interaction?.reducedMotionHandling ??
    config?.reducedMotionHandling ??
    'ignore'
  );
}

function isStateEffect(effect: object): boolean {
  return !!((effect as StateEffect).transition || (effect as StateEffect).transitionProperties);
}

export function getEffectKind(effect: object, trigger: TriggerType): EffectKind {
  if (isStateEffect(effect)) {
    return 'state';
  }
  return SCRUB_TRIGGERS.has(trigger) ? 'scrub' : 'time';
}

function getReplacementKind(effect: Effect): EffectKind {
  if (isStateEffect(effect)) {
    return 'state';
  }
  return 'duration' in effect ? 'time' : 'scrub';
}

function collapse<T extends object>(effect: T, kind: EffectKind): T | null {
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
  const body: Record<string, unknown> = {};
  const base = { ...effect } as Record<string, unknown>;

  BODY_FIELDS.forEach((field) => {
    delete base[field];
    if (field in replacement) {
      body[field] = replacement[field as keyof Effect];
    }
  });

  const keyframeEffect = body.keyframeEffect as { name?: string } | undefined;
  if (keyframeEffect && !keyframeEffect.name) {
    body.keyframeEffect = { ...keyframeEffect, name: replacementId };
  }

  return { ...base, ...body } as T;
}

function warnFallback(effect: object, handling: string, fallback: string) {
  const id = `${(effect as Effect).effectId}::${handling}`;
  if (warned.has(id)) {
    return;
  }
  warned.add(id);
  console.warn(
    `Interact: reducedMotionHandling "${handling}" can't apply to effect "${(effect as Effect).effectId}", falling back to "${fallback}"`,
  );
}

function getReducedEffect<T extends object>(
  effect: T,
  handling: ReducedMotionHandling,
  { kind, effects, warn }: VariantOptions,
): T | null {
  if (handling !== 'collapse') {
    const replacement = effects[handling];
    if (replacement && getReplacementKind(replacement) === kind) {
      return replace(effect, handling, replacement);
    }
    if (warn) {
      warnFallback(effect, handling, 'collapse');
    }
  }

  const collapsed = collapse(effect, kind);
  if (!collapsed && warn) {
    warnFallback(effect, handling, 'cancel');
  }

  return collapsed;
}

function withCondition<T extends object>(effect: T, condition: string): T {
  return {
    ...effect,
    conditions: [...((effect as { conditions?: string[] }).conditions || []), condition],
  };
}

/**
 * The variants of the effect in its position, each under its reserved media: CSS emits all of them, the runtime
 * picks the one whose media matches. When forced, only the reduced-motion outcome, unconditionally.
 */
export function getReducedMotionVariants<T extends object>(
  effect: T,
  handling: ReducedMotionHandling,
  options: VariantOptions,
): T[] {
  if (handling === 'ignore') {
    return [effect];
  }

  const reduced = handling === 'cancel' ? null : getReducedEffect(effect, handling, options);

  if (options.force) {
    return reduced ? [reduced] : [];
  }

  const normal = withCondition(effect, REDUCED_MOTION_NO_PREFERENCE);

  return reduced ? [normal, withCondition(reduced, REDUCED_MOTION_REDUCE)] : [normal];
}
