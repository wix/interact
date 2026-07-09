export { InteractValidationError } from './errors';
export type { Severity, ValidationResult, ValidationError, ValidateOptions } from './types';

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
  NamedEffect,
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
  InteractionDef,
  InteractionTrigger,
} from './schema';

export {
  validateStructural,
  validateInteractConfig,
  assertValidInteractConfig,
} from './structural';
