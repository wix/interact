import { MotionKeyframeEffect, NamedEffect } from '@wix/motion';
import type {
  InteractConfig,
  Effect,
  EffectRef,
  EffectBase,
  StateEffect,
  Interaction,
  ResolvedEffect,
  ResolvedSequence,
  ReducedMotionHandling,
  EffectProperty,
  SequenceConfig,
  SequenceConfigRef,
  TimeAnimationTriggerType,
  TriggerType,
} from '../types';
import { isTemplatedKey, generateId } from '../utils';
import { shouldUseInitial } from './utilities';
import { getEffectKind, getReducedMotionHandling, getReducedMotionVariants } from './reducedMotion';

const TIME_TRIGGER_TO_DEFAULT_TYPE: Map<TriggerType, TimeAnimationTriggerType> = new Map([
  ['viewEnter', 'once'],
  ['animationEnd', 'once'],
  ['hover', 'alternate'],
  ['click', 'alternate'],
  ['activate', 'alternate'],
  ['interest', 'alternate'],
]);

type ResolveOptions = {
  sequence?: { reducedMotionHandling?: ReducedMotionHandling };
  force?: boolean;
};

type FullEffect = EffectBase &
  StateEffect & {
    triggerType?: TimeAnimationTriggerType;
    namedEffect?: NamedEffect;
    customEffect?: (element: Element, progress: any) => void;
    keyframeEffect?: MotionKeyframeEffect;
  };

// whether CSS keeps a position for the effect - a customEffect has one, but plays at runtime only
function hasCSSPosition(
  { namedEffect, keyframeEffect, customEffect }: FullEffect,
  isPointerMove: boolean,
): boolean {
  if (namedEffect) {
    // With the 2D nature of pointerMove namedEffects, there is no easy way to mimic the
    // behavior with CSSAnimations.
    return !isPointerMove && !!namedEffect.type;
  }
  return !!keyframeEffect || !(customEffect && isPointerMove);
}

// the effect with only the animation source CSS can express, if any
function resolveBody(
  effect: FullEffect & Omit<ResolvedEffect, keyof EffectProperty>,
  isPointerMove: boolean,
): ResolvedEffect {
  const { namedEffect, customEffect, keyframeEffect, transition, transitionProperties, ...rest } =
    effect;

  if (namedEffect) {
    return isPointerMove || !namedEffect.type ? rest : { namedEffect, ...rest };
  } else if (keyframeEffect) {
    return { keyframeEffect, ...rest };
  } else if (customEffect) {
    return rest;
  } else if (transition) {
    return { transition, ...rest };
  } else {
    return transitionProperties ? { transitionProperties, ...rest } : rest;
  }
}

export function resolveEffectForCSS(
  effect: Effect | EffectRef,
  interaction: Interaction,
  config: InteractConfig,
  fallbackId?: string,
  options: ResolveOptions = {},
): ResolvedEffect | null {
  const { effects = {}, conditions: configConditions = {} } = config;
  const { key: interactionKey, trigger, conditions: interactionConditions = [] } = interaction;
  const isPointerMove = trigger === 'pointerMove';

  // ensuring the original reference of the effect has an id (required for states)
  if (!effect.effectId) {
    effect.effectId = fallbackId || generateId();
  }
  const { effectId } = effect;

  const fullEffect: FullEffect = { ...(effects[effectId] || {}), ...effect };

  let { key, conditions, triggerType } = fullEffect;

  if (!key) {
    if (!interactionKey) {
      return null;
    }
    key = interactionKey;
  }
  if (isTemplatedKey(key)) {
    // should probably find a way to support those
    return null;
  }

  const interactionMediaConditions = interactionConditions.filter(
    (condition: string) => configConditions[condition].type === 'media',
  );

  conditions = [
    ...new Set(
      [...(conditions || []), ...interactionMediaConditions].filter(
        (condition: string) => configConditions[condition],
      ),
    ),
  ];

  if (!triggerType) {
    triggerType = TIME_TRIGGER_TO_DEFAULT_TYPE.get(trigger)!;
  }

  const { namedEffect, keyframeEffect } = fullEffect;
  // Need to verify validity of name for CSS?
  if (!namedEffect && keyframeEffect && !keyframeEffect.name) {
    const canUseEffectId = effectId && !(effects[effectId] && 'keyframeEffect' in effect);
    keyframeEffect.name = canUseEffectId ? effectId : generateId();
  }

  if (!hasCSSPosition(fullEffect, isPointerMove)) {
    return null;
  }

  const full = { ...fullEffect, key, conditions, effectId, triggerType };
  const position = { ...full, initial: shouldUseInitial(interaction, full) };

  const variants = getReducedMotionVariants(
    position,
    getReducedMotionHandling(fullEffect, options.sequence, interaction, config),
    { kind: getEffectKind(fullEffect, trigger), effects, force: options.force },
  ).map((variant) => resolveBody(variant, isPointerMove));

  return variants.length ? { ...resolveBody(position, isPointerMove), variants } : null;
}

export function resolveSequenceForCSS(
  sequence: SequenceConfig | SequenceConfigRef,
  interaction: Interaction,
  config: InteractConfig,
  fallbackId?: string,
  getSlotKey?: (effectIndex: number) => string,
  force?: boolean,
): ResolvedSequence | null {
  const { sequences = {}, conditions: configConditions = {} } = config;
  const { trigger, conditions: interactionConditions = [] } = interaction;

  if (!sequence.sequenceId) {
    sequence.sequenceId = fallbackId || generateId();
  }

  const { sequenceId } = sequence;
  const fullSequence = { ...(sequences[sequenceId] || {}), ...sequence };

  let {
    effects,
    conditions,
    triggerType,
    delay = 0,
    offset = 0,
    offsetEasing = 'linear',
  } = fullSequence;

  if (typeof offsetEasing === 'function') {
    return null; // CSS does not support JS functions for easing
  }
  if (!effects) {
    return null; // an unresolved sequence reference
  }

  if (!triggerType) {
    triggerType = TIME_TRIGGER_TO_DEFAULT_TYPE.get(trigger)!;
  }

  const interactionMediaConditions = interactionConditions.filter(
    (condition: string) => configConditions[condition].type === 'media',
  );

  conditions = [
    ...new Set(
      [...(conditions || []), ...interactionMediaConditions].filter(
        (condition: string) => configConditions[condition],
      ),
    ),
  ];
  // resolving effects and cascading the conditions from sequence
  const resolvedEffects = effects.map((effect, index) => {
    const resolved = resolveEffectForCSS(
      { ...effect, triggerType, conditions: [...(effect.conditions || []), ...conditions] },
      interaction,
      config,
      `${sequenceId}-eff-${index}`,
      { sequence: fullSequence, force },
    );
    return resolved && Object.assign(resolved, { slotKey: getSlotKey?.(index) });
  });

  // removing unsupported effects and the whole sequence if all are unsupported
  const filteredEffects = resolvedEffects.filter((effect) => effect !== null);
  if (!filteredEffects.length) {
    return null;
  }

  return {
    sequenceId,
    triggerType,
    conditions,
    delay,
    offset,
    offsetEasing,
    effects: filteredEffects,
  };
}
