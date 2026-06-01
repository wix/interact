import { z } from 'zod';
import {
  ElementEntry,
  ExperienceMeta,
  ExperienceSchemaVersion,
  MediaCondition,
  StyleRule,
} from './primitives';
import { ExperienceInteractConfig } from './interactions';
import { Control } from './controls';

export const ExperienceSchema = z
  .object({
    $schema: ExperienceSchemaVersion,
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    elements: z.record(z.string().min(1), ElementEntry),
    styles: z.array(StyleRule).optional(),
    interact: ExperienceInteractConfig,
    controls: z.array(Control),
    disableWhen: z.array(MediaCondition).optional(),
    meta: ExperienceMeta.optional(),
  })
  .strict();

export type Experience = z.infer<typeof ExperienceSchema>;
