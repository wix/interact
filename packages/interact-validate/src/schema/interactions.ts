import { z } from 'zod';
import { Condition } from './primitives';
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
  key: z.string().min(1),
  selector: z.string().optional(),
  listContainer: z.string().optional(),
  listItemSelector: z.string().optional(),
  conditions: z.array(z.string().min(1)).optional(),
  effects: z.array(z.union([SerializableEffect, SerializableEffectRef])).optional(),
  sequences: z
    .array(z.union([SerializableSequenceConfig, SerializableSequenceConfigRef]))
    .optional(),
};

const ViewEnterInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('viewEnter'),
    params: ViewEnterParams.optional(),
  })
  .strict();

const PageVisibleInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('pageVisible'),
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

const HoverInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('hover'),
  })
  .strict();

const ClickInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('click'),
  })
  .strict();

const InterestInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('interest'),
  })
  .strict();

const ActivateInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('activate'),
  })
  .strict();

const ViewProgressInteraction = z
  .object({
    ...InteractionBase,
    trigger: z.literal('viewProgress'),
  })
  .strict();

export const Interaction = z.discriminatedUnion('trigger', [
  ViewEnterInteraction,
  PageVisibleInteraction,
  PointerMoveInteraction,
  AnimationEndInteraction,
  HoverInteraction,
  ClickInteraction,
  InterestInteraction,
  ActivateInteraction,
  ViewProgressInteraction,
]);

export const InteractConfigSchema = z
  .object({
    effects: z.record(z.string().min(1), SerializableEffect).optional(),
    sequences: z.record(z.string().min(1), SerializableSequenceConfig).optional(),
    conditions: z.record(z.string().min(1), Condition).optional(),
    interactions: z.array(Interaction),
  })
  .strict();
