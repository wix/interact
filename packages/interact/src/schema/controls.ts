import { z } from 'zod';

export const ControlType = z.enum(['range', 'select', 'color', 'toggle', 'text']);

export const ControlValue = z.union([z.number(), z.string(), z.boolean()]);

export const ControlOption = z
  .object({
    value: z.union([z.string(), z.number()]),
    label: z.string(),
  })
  .strict();

export const ControlConstraints = z
  .object({
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    unit: z.string().optional(),
    options: z.array(ControlOption).optional(),
  })
  .strict();

export const BindingTarget = z.enum([
  'effect',
  'sequence',
  'style',
  'element',
  'interaction',
  'variable',
]);

export const ValueTransform = z.union([
  z.object({ type: z.literal('direct') }).strict(),
  z
    .object({
      type: z.literal('linear'),
      factor: z.number(),
      offset: z.number().optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('inverse'),
      numerator: z.number(),
    })
    .strict(),
  z
    .object({
      type: z.literal('map'),
      entries: z.record(z.string(), ControlValue),
    })
    .strict(),
  z
    .object({
      type: z.literal('template'),
      template: z.string(),
    })
    .strict(),
]);

export const ControlBinding = z
  .object({
    target: BindingTarget,
    targetId: z.string().min(1),
    property: z.string().optional(),
    transform: ValueTransform.optional(),
  })
  .strict();

export const Control = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
    group: z.string().optional(),
    type: ControlType,
    defaultValue: ControlValue,
    constraints: ControlConstraints.optional(),
    bindings: z.array(ControlBinding),
  })
  .strict();
