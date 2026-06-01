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
};

export const SerializableEffectSource = z
  .object(SourceFields)
  .strict()
  .refine((v) => (v.namedEffect ? 1 : 0) + (v.keyframeEffect ? 1 : 0) === 1, {
    message: 'Effect source must define exactly one of namedEffect or keyframeEffect',
  });

const EffectShape = EffectBase.extend({
  ...SourceFields,
  ...TimeEffectFields,
  ...ScrubEffectFields,
  ...StateEffectFields,
}).strict();

export const SerializableEffect = EffectShape.superRefine((v, ctx) => {
  const hasNamed = v.namedEffect !== undefined;
  const hasKeyframe = v.keyframeEffect !== undefined;
  const hasSource = hasNamed || hasKeyframe;
  const hasState =
    v.stateAction !== undefined ||
    v.transition !== undefined ||
    v.transitionProperties !== undefined;

  if (hasNamed && hasKeyframe) {
    ctx.addIssue({
      code: 'custom',
      message: 'Effect cannot define both namedEffect and keyframeEffect.',
      path: ['keyframeEffect'],
    });
  }
  if (hasSource && hasState) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Effect source fields (namedEffect or keyframeEffect) cannot be combined with state effect fields.',
      path: [],
    });
  }
  if (!hasSource && !hasState) {
    ctx.addIssue({
      code: 'custom',
      message:
        'Effect must define an effect source (namedEffect or keyframeEffect) or be a state effect (stateAction / transition / transitionProperties).',
      path: [],
    });
  }
});

// Time effects are the only variant allowed inside a sequence:
// must have an effect source, and must not carry scrub or state fields.
const SCRUB_FIELDS = [
  'rangeStart',
  'rangeEnd',
  'centeredToTarget',
  'transitionDuration',
  'transitionDelay',
  'transitionEasing',
] as const;

const STATE_FIELDS = ['stateAction', 'transition', 'transitionProperties'] as const;

export const SerializableTimeEffect = SerializableEffect.superRefine((v, ctx) => {
  if (v.namedEffect === undefined && v.keyframeEffect === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'Time effect must define an effect source (namedEffect or keyframeEffect).',
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

// Aliases preserved for the schema barrel; the unified SerializableEffect is the
// runtime for interaction-level effects (which may be time, scrub, or state).
export const SerializableScrubEffect = SerializableEffect;
export const SerializableStateEffect = SerializableEffect;
