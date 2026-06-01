import { z } from 'zod';
import { SerializableEffect, SerializableEffectRef } from './effects';
import { SerializableSequenceConfig, SerializableSequenceConfigRef } from './sequences';

export const TriggerType = z.enum([
  'hover',
  'click',
  'interest',
  'activate',
  'viewEnter',
  'viewProgress',
  'pointerMove',
  'animationEnd',
  'pageVisible',
]);

export const ViewEnterParams = z
  .object({
    threshold: z.number().optional(),
    inset: z.string().optional(),
    useSafeViewEnter: z.boolean().optional(),
  })
  .strict();

export const PointerMoveParams = z
  .object({
    hitArea: z.enum(['root', 'self']).optional(),
    axis: z.enum(['x', 'y']).optional(),
  })
  .strict();

export const AnimationEndParams = z
  .object({
    effectId: z.string().min(1),
  })
  .strict();

export const TriggerParams = z.union([ViewEnterParams, PointerMoveParams, AnimationEndParams]);

const InteractionBase = {
  id: z.string().optional(),
  key: z.string().min(1),
  selector: z.string().optional(),
  listContainer: z.string().optional(),
  listItemSelector: z.string().optional(),
  conditions: z.array(z.string()).optional(),
  effects: z.array(z.union([SerializableEffect, SerializableEffectRef])).optional(),
  sequences: z
    .array(z.union([SerializableSequenceConfig, SerializableSequenceConfigRef]))
    .optional(),
};

const ViewEnterInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.enum(['viewEnter', 'pageVisible']),
    params: ViewEnterParams.optional(),
  })
  .strict();

const PointerMoveInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('pointerMove'),
    params: PointerMoveParams.optional(),
  })
  .strict();

const AnimationEndInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('animationEnd'),
    params: AnimationEndParams,
  })
  .strict();

const SimpleInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.enum(['hover', 'click', 'interest', 'activate', 'viewProgress']),
  })
  .strict();

export const ExperienceInteraction = z.union([
  ViewEnterInteraction,
  PointerMoveInteraction,
  AnimationEndInteraction,
  SimpleInteraction,
]);

export const ExperienceInteractConfig = z.object({
  effects: z.record(z.string().min(1), SerializableEffect),
  sequences: z.record(z.string().min(1), SerializableSequenceConfig).optional(),
  conditions: z
    .record(
      z.string().min(1),
      z.object({
        type: z.enum(['media', 'selector']),
        predicate: z.string().optional(),
      }),
    )
    .optional(),
  interactions: z.array(ExperienceInteraction),
});
