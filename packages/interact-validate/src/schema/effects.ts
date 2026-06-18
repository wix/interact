import { z } from 'zod';
import { Keyframe, RangeOffset } from './primitives';

export const StateActionType = z.enum(['add', 'remove', 'toggle', 'clear']);
export const TimeTriggerType = z.enum(['once', 'repeat', 'alternate', 'state']);

const TransitionOptions = {
  duration: z.number().optional(),
  delay: z.number().optional(),
  easing: z.string().optional(),
};
const StyleProperty = { name: z.string().min(1), value: z.string() };

export const NamedEffect = z.object({ type: z.string().min(1) }).catchall(z.unknown());

export const KeyframeEffect = z
  .object({
    name: z.string().min(1),
    keyframes: z.array(Keyframe).min(1),
  })
  .strict();

export const CustomEffect = z.custom<(...args: unknown[]) => unknown>(
  (v) => typeof v === 'function',
);

export const exactlyOne = (obj: Record<string, unknown>) =>
  Object.values(obj).filter(Boolean).length === 1;
export const atMostOne = (obj: Record<string, unknown>) =>
  Object.values(obj).filter(Boolean).length <= 1;

const EFFECT_SOURCE_MESSAGE =
  'Effect source must define exactly one of namedEffect, keyframeEffect, or customEffect';
const TRANSITION_SOURCE_MESSAGE = 'Exactly one of transition or transitionProperties must be used';

const TransitionEffectSourceBase = z
  .object({
    transition: z
      .object({
        ...TransitionOptions,
        styleProperties: z.array(z.object(StyleProperty)),
      })
      .optional(),
    transitionProperties: z.array(z.object({ ...StyleProperty, ...TransitionOptions })).optional(),
  })
  .strict();

const EffectSourceBase = z
  .object({
    namedEffect: NamedEffect.optional(),
    keyframeEffect: KeyframeEffect.optional(),
    customEffect: CustomEffect.optional(),
  })
  .strict();

// Keep the standalone refined schema for external use (schema composition in host projects).
// Do NOT use these with .extend() — use the base + .check() pattern below instead.
export const EffectSource = EffectSourceBase.refine(exactlyOne, {
  message: EFFECT_SOURCE_MESSAGE,
});

// Reusable checks — applied via .check() after .extend() to avoid the Zod v4
// behavior where .extend() creates a new ZodObject that drops parent refinements.
const checkExactlyOneEffectSource = z.check<any>((input) => {
  const { namedEffect, keyframeEffect, customEffect } = input.value;
  if (!exactlyOne({ namedEffect, keyframeEffect, customEffect })) {
    input.issues.push({
      code: 'custom',
      message: EFFECT_SOURCE_MESSAGE,
      input: input.value,
      params: { domainCode: 'MULTIPLE_EFFECT_SOURCES' },
    });
  }
});

const checkAtMostOneEffectSource = z.check<any>((input) => {
  const { namedEffect, keyframeEffect, customEffect } = input.value;
  if (!atMostOne({ namedEffect, keyframeEffect, customEffect })) {
    input.issues.push({
      code: 'custom',
      message: EFFECT_SOURCE_MESSAGE,
      input: input.value,
      params: { domainCode: 'MULTIPLE_EFFECT_SOURCES' },
    });
  }
});

const checkExactlyOneTransition = z.check<any>((input) => {
  const { transition, transitionProperties } = input.value;
  if (!exactlyOne({ transition, transitionProperties })) {
    input.issues.push({
      code: 'custom',
      message: TRANSITION_SOURCE_MESSAGE,
      input: input.value,
      params: { domainCode: 'MULTIPLE_TRANSITION_SOURCES' },
    });
  }
});

const checkAtMostOneTransition = z.check<any>((input) => {
  const { transition, transitionProperties } = input.value;
  if (!atMostOne({ transition, transitionProperties })) {
    input.issues.push({
      code: 'custom',
      message: TRANSITION_SOURCE_MESSAGE,
      input: input.value,
      params: { domainCode: 'MULTIPLE_TRANSITION_SOURCES' },
    });
  }
});

const EffectBase = {
  key: z.string().optional(),
  effectId: z.string().optional(),
  selector: z.string().optional(),
  listContainer: z.string().optional(),
  listItemSelector: z.string().optional(),
  conditions: z.array(z.string().min(1)).optional(),
};

export const StateEffect = TransitionEffectSourceBase.extend({
  ...EffectBase,
  stateAction: StateActionType.optional(),
})
  .strict()
  .check(checkExactlyOneTransition);
export const StateEffectRef = TransitionEffectSourceBase.extend({
  ...EffectBase,
  effectId: z.string().min(1),
  stateAction: StateActionType.optional(),
})
  .strict()
  .check(checkAtMostOneTransition);

const AnimationEffectBase = {
  ...EffectBase,
  iterations: z.number().int().positive().optional(),
  easing: z.string().optional(),
  alternate: z.boolean().optional(),
  reversed: z.boolean().optional(),
  fill: z.enum(['none', 'forwards', 'backwards', 'both']).optional(),
  composite: z.enum(['replace', 'add', 'accumulate']).optional(),
};

const viewProgressEffectFields = {
  rangeStart: RangeOffset.optional(),
  rangeEnd: RangeOffset.optional(),
};

const pointerMoveEffectFields = {
  centeredToTarget: z.boolean().optional(),
  transitionDuration: z.number().int().nonnegative().optional(),
  transitionDelay: z.number().int().nonnegative().optional(),
  transitionEasing: z.enum(['linear', 'hardBackOut', 'easeOut', 'elastic', 'bounce']).optional(),
};

export const TimeEffect = EffectSourceBase.extend({
  ...AnimationEffectBase,
  duration: z.number().nonnegative(),
  delay: z.number().nonnegative().optional(),
  triggerType: TimeTriggerType.optional(),
})
  .strict()
  .check(checkExactlyOneEffectSource);
export const TimeEffectRef = EffectSourceBase.extend({
  ...AnimationEffectBase,
  effectId: z.string().min(1),
  duration: z.number().nonnegative().optional(),
  delay: z.number().nonnegative().optional(),
  triggerType: TimeTriggerType.optional(),
})
  .strict()
  .check(checkAtMostOneEffectSource);

export const ViewProgressEffect = EffectSourceBase.extend({
  ...AnimationEffectBase,
  ...viewProgressEffectFields,
})
  .strict()
  .check(checkExactlyOneEffectSource);
export const ViewProgressEffectRef = EffectSourceBase.extend({
  ...AnimationEffectBase,
  effectId: z.string().min(1),
  ...viewProgressEffectFields,
})
  .strict()
  .check(checkAtMostOneEffectSource);

export const PointerMoveEffect = EffectSourceBase.extend({
  ...AnimationEffectBase,
  ...pointerMoveEffectFields,
})
  .strict()
  .check(checkExactlyOneEffectSource);
export const PointerMoveEffectRef = EffectSourceBase.extend({
  ...AnimationEffectBase,
  effectId: z.string().min(1),
  ...pointerMoveEffectFields,
})
  .strict()
  .check(checkAtMostOneEffectSource);

export const ScrubEffect = z.union([ViewProgressEffect, PointerMoveEffect]);
export const ScrubEffectRef = z.union([ViewProgressEffectRef, PointerMoveEffectRef]);

export const Effect = z.union([TimeEffect, ScrubEffect, StateEffect]);
export const EffectRef = z.union([TimeEffectRef, ScrubEffectRef, StateEffectRef]);
