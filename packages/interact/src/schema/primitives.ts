import { z } from 'zod';

export const ExperienceSchemaVersion = z.literal('interact-experience/1.0');

export const ElementEntry = z
  .object({
    selector: z.string().min(1),
    styles: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const StyleRule = z
  .object({
    selector: z.string().min(1),
    properties: z.record(z.string(), z.string()),
    mediaQuery: z.string().optional(),
  })
  .strict();

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

export const ExperienceMeta = z
  .object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    previewUrl: z.string().optional(),
    author: z.string().optional(),
    createdAt: z.string().optional(),
  })
  .strict();
