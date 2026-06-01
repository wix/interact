import { z } from 'zod';
import { SerializableEffectRef, SerializableTimeEffect } from './effects';

const TriggerType = z.enum(['once', 'repeat', 'alternate', 'state']);

export const SerializableSequenceConfig = z.object({
  effects: z.array(z.union([SerializableTimeEffect, SerializableEffectRef])),
  delay: z.number().optional(),
  offset: z.number().optional(),
  offsetEasing: z.string().optional(),
  triggerType: TriggerType.optional(),
  sequenceId: z.string().optional(),
  conditions: z.array(z.string()).optional(),
});

export const SerializableSequenceConfigRef = z
  .object({
    sequenceId: z.string().min(1),
    delay: z.number().optional(),
    offset: z.number().optional(),
    offsetEasing: z.string().optional(),
    triggerType: TriggerType.optional(),
    conditions: z.array(z.string()).optional(),
  })
  .strict();
