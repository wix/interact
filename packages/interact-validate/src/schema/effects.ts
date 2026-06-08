import { z } from 'zod';
import { Keyframe, RangeOffset } from './primitives';

const TriggerType = z.enum(['once', 'repeat', 'alternate', 'state']);

export const NamedEffect = z.object({ type: z.string().min(1) }).catchall(z.unknown());

const KeyframeEffectInline = z
  .object({
    name: z.string().min(1),
    keyframes: z.array(Keyframe).min(1),
  })
  .strict();

export const EffectBase = z.object({
  key: z.string().optional(),
  effectId: z.string().optional(),
  selector: z.string().optional(),
  listContainer: z.string().optional(),
  listItemSelector: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

export const SerializableEffectRef = EffectBase.extend({
  effectId: z.string().min(1),
}).strict();

const TimeEffectFields = {
  duration: z.number().optional(),
  easing: z.string().optional(),
  iterations: z.number().optional(),
  alternate: z.boolean().optional(),
  reversed: z.boolean().optional(),
  delay: z.number().optional(),
  fill: z.enum(['none', 'forwards', 'backwards', 'both']).optional(),
  composite: z.enum(['replace', 'add', 'accumulate']).optional(),
  triggerType: TriggerType.optional(),
};

export const SCRUB_FIELDS = [
  'rangeStart',
  'rangeEnd',
  'centeredToTarget',
  'transitionDuration',
  'transitionDelay',
  'transitionEasing',
] as const;

export const STATE_FIELDS = ['stateAction', 'transition', 'transitionProperties'] as const;

export const TIME_FIELDS = ['duration', 'delay'] as const;

const ScrubEffectFields = {
  rangeStart: RangeOffset.optional(),
  rangeEnd: RangeOffset.optional(),
  centeredToTarget: z.boolean().optional(),
  transitionDuration: z.number().optional(),
  transitionDelay: z.number().optional(),
  transitionEasing: z.enum(['linear', 'hardBackOut', 'easeOut', 'elastic', 'bounce']).optional(),
};

const StateEffectFields = {
  stateAction: z.enum(['add', 'remove', 'toggle', 'clear']).optional(),
  transition: z
    .object({
      duration: z.number().optional(),
      delay: z.number().optional(),
      easing: z.string().optional(),
      styleProperties: z.array(z.object({ name: z.string(), value: z.string() })),
    })
    .optional(),
  transitionProperties: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
        duration: z.number().optional(),
        delay: z.number().optional(),
        easing: z.string().optional(),
      }),
    )
    .optional(),
};

const SourceFields = {
  namedEffect: NamedEffect.optional(),
  keyframeEffect: KeyframeEffectInline.optional(),
  customEffect: z
    .custom<(...args: unknown[]) => unknown>((v) => typeof v === 'function')
    .optional(),
};

export const SerializableEffectSource = z
  .object(SourceFields)
  .strict()
  .refine(
    (v) => (v.namedEffect ? 1 : 0) + (v.keyframeEffect ? 1 : 0) + (v.customEffect ? 1 : 0) === 1,
    {
      message:
        'Effect source must define exactly one of namedEffect, keyframeEffect, or customEffect',
    },
  );

const EffectShape = EffectBase.extend({
  ...SourceFields,
  ...TimeEffectFields,
  ...ScrubEffectFields,
  ...StateEffectFields,
}).strict();

export const SerializableEffect = EffectShape.superRefine((v, ctx) => {
  const hasNamed = v.namedEffect !== undefined;
  const hasKeyframe = v.keyframeEffect !== undefined;
  const hasCustom = v.customEffect !== undefined;
  const sourceCount = (hasNamed ? 1 : 0) + (hasKeyframe ? 1 : 0) + (hasCustom ? 1 : 0);
  const hasSource = sourceCount > 0;
  const hasState =
    v.stateAction !== undefined ||
    v.transition !== undefined ||
    v.transitionProperties !== undefined;

  if (sourceCount > 1) {
    ctx.addIssue({
      code: 'custom',
      message: 'Effect must define exactly one of namedEffect, keyframeEffect, or customEffect.',
      path: [],
    });
  }
  if (hasSource && hasState) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Effect source fields (namedEffect, keyframeEffect, or customEffect) cannot be combined with state effect fields.',
      path: [],
    });
  }
  if (!hasSource && !hasState) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Effect must define an effect source (namedEffect, keyframeEffect, or customEffect) or be a state effect (stateAction / transition / transitionProperties).',
      path: [],
    });
  }
});

export const SerializableTimeEffect = SerializableEffect.superRefine((v, ctx) => {
  if (
    v.namedEffect === undefined &&
    v.keyframeEffect === undefined &&
    v.customEffect === undefined
  ) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Time effect must define an effect source (namedEffect, keyframeEffect, or customEffect).',
      path: [],
    });
  }
  for (const field of SCRUB_FIELDS) {
    if ((v as Record<string, unknown>)[field] !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: `"${field}" is a scrub-effect field and is not allowed on a time effect.`,
        path: [field],
      });
    }
  }
  for (const field of STATE_FIELDS) {
    if ((v as Record<string, unknown>)[field] !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: `"${field}" is a state-effect field and is not allowed on a time effect.`,
        path: [field],
      });
    }
  }
});
