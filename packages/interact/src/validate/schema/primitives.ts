import { z } from 'zod';

export const Keyframe = z.record(z.string(), z.union([z.string(), z.number()]));

export const LengthPercentage = z.union([
  z.object({
    value: z.number(),
    unit: z.enum(['px', 'em', 'rem', 'vh', 'vw', 'vmin', 'vmax']),
  }),
  z.object({
    value: z.number(),
    unit: z.literal('percentage'),
  }),
]);

export const RangeOffset = z
  .object({
    name: z
      .enum(['entry', 'exit', 'contain', 'cover', 'entry-crossing', 'exit-crossing'])
      .optional(),
    offset: LengthPercentage.optional(),
  })
  .strict();

export const Condition = z
  .object({
    type: z.enum(['media', 'container', 'selector']),
    predicate: z.string().optional(),
  })
  .strict();

export const MediaCondition = z
  .object({
    mediaQuery: z.string().min(1),
    label: z.string().optional(),
  })
  .strict();
