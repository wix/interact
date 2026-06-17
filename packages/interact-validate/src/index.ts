import type { InteractConfig } from '@wix/interact';
import { InteractValidationError, type ValidationResult } from './errors';
import { validateStructural } from './structural';

export { InteractValidationError };
export type { Severity, ValidationError, ValidationResult } from './errors';

// Zod schemas and sub-schemas for host-project schema composition
export {
  InteractConfigSchema,
  Interaction,
  TriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
  Effect,
  EffectRef,
  EffectSource,
  TimeEffect,
  EffectBase,
  NamedEffect,
  SCRUB_FIELDS,
  STATE_FIELDS,
  TIME_FIELDS,
  SequenceConfig,
  SequenceConfigRef,
  Keyframe,
  LengthPercentage,
  RangeOffset,
  Condition,
} from './schema';
export type {
  InteractConfig,
  ConditionDef,
  SequenceOptionsConfig,
  SequenceConfig,
  SequenceConfigRef,
  InteractionDef,
  InteractionTrigger,
  Effect,
  EffectRef,
} from './schema';

export function validateInteractConfig(input: unknown): ValidationResult {
  return validateStructural(input);
}

export function assertValidInteractConfig(input: unknown): asserts input is InteractConfig {
  const result = validateInteractConfig(input);
  if (!result.ok) {
    throw new InteractValidationError(result.errors);
  }
}
