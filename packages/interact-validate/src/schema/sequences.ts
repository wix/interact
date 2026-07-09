import { z } from 'zod';
import { TimeEffect, TimeEffectRef, TimeTriggerType } from './effects';

const SequenceOptionsConfig = {
  delay: z.number().int().nonnegative().optional(),
  offset: z.number().int().nonnegative().optional(),
  offsetEasing: z
    .union([z.string(), z.custom<(...args: unknown[]) => unknown>((v) => typeof v === 'function')])
    .optional(),
  triggerType: TimeTriggerType.optional(),
  sequenceId: z.string().optional(),
  conditions: z.array(z.string().min(1)).optional(),
};

export const SequenceConfig = z
  .object({
    ...SequenceOptionsConfig,
    effects: z.array(z.union([TimeEffect, TimeEffectRef])).min(1),
  })
  .strict();

export const SequenceConfigRef = z
  .object({
    ...SequenceOptionsConfig,
    sequenceId: z.string().min(1),
  })
  .strict();
