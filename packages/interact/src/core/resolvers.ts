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
  SequenceConfig,
  SequenceConfigRef,
  TimeAnimationTriggerType,
  TriggerType,
} from '../types';
import { isTemplatedKey, generateId } from '../utils';
import { shouldUseInitial } from './utilities';

const TIME_TRIGGER_TO_DEFAULT_TYPE: Map<TriggerType, TimeAnimationTriggerType> = new Map([
  ['viewEnter', 'once'],
  ['animationEnd', 'once'],
  ['hover', 'alternate'],
  ['click', 'alternate'],
  ['activate', 'alternate'],
  ['interest', 'alternate'],
]);

export function resolveEffectForCSS(
  effect: Effect | EffectRef,
  interaction: Interaction,
  config: InteractConfig,
  fallbackId?: string,
): ResolvedEffect | null {
  const { effects = {}, conditions: configConditions = {} } = config;
  const { key: interactionKey, trigger } = interaction;
  const isPointerMove = trigger === 'pointerMove';

  // ensuring the original reference of the effect has an id (required for states)
  if (!effect.effectId) {
    effect.effectId = fallbackId || generateId();
  }
  const { effectId } = effect;

  const fullEffect: EffectBase &
    StateEffect & {
      triggerType?: TimeAnimationTriggerType;
      namedEffect?: NamedEffect;
      customEffect?: (element: Element, progress: any) => void;
      keyframeEffect?: MotionKeyframeEffect;
    } = { ...(effects[effectId] || {}), ...effect };

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
  // TODO: handle here any key escaping if needed

  conditions = [
    ...new Set((conditions || []).filter((condition: string) => configConditions[condition])),
  ];

  if (!triggerType) {
    triggerType = TIME_TRIGGER_TO_DEFAULT_TYPE.get(trigger)!;
  }

  const { namedEffect, customEffect, keyframeEffect, transition, transitionProperties, ...rest } = {
    ...fullEffect,
    key,
    conditions,
    effectId,
    triggerType,
  };

  const initial = shouldUseInitial(interaction, rest);

  if (namedEffect) {
    // With the 2D nature of pointerMove namedEffects, there is no easy way to mimic the
    // behavior with CSSAnimations.
    return isPointerMove || !namedEffect.type ? null : { namedEffect, initial, ...rest };
  } else if (keyframeEffect) {
    // Need to verify validity of name for CSS?
    if (!keyframeEffect.name) {
      const canUseEffectId = effectId && !(effects[effectId] && 'keyframeEffect' in effect);
      keyframeEffect.name = canUseEffectId ? effectId : generateId();
    }
    return { keyframeEffect, initial, ...rest };
  } else if (customEffect) {
    return isPointerMove ? null : { initial, ...rest };
  } else if (transition) {
    return { transition, initial, ...rest };
  } else {
    return transitionProperties ? { transitionProperties, initial, ...rest } : { initial, ...rest };
  }
}

export function resolveSequenceForCSS(
  sequence: SequenceConfig | SequenceConfigRef,
  interaction: Interaction,
  config: InteractConfig,
  fallbackId?: string,
): ResolvedSequence | null {
  const { sequences = {}, conditions: configConditions = {} } = config;

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

  if (!triggerType) {
    triggerType = TIME_TRIGGER_TO_DEFAULT_TYPE.get(interaction.trigger)!;
  }

  conditions = [
    ...new Set((conditions || []).filter((condition: string) => configConditions[condition])),
  ];
  // resolving effects and cascading the conditions from sequence
  const resolvedEffects = effects.map((effect, index) => {
    if (!effect.conditions) {
      effect.conditions = [...conditions];
    } else {
      effect.conditions.push(...conditions);
    }
    return resolveEffectForCSS(
      { ...effect, triggerType },
      interaction,
      config,
      `${sequenceId}-eff-${index}`,
    );
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
