// Zod schema values — for validation and host-project schema composition
export {
  InteractConfigSchema,
  Interaction,
  TriggerType,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
} from './interactions';

export {
  SerializableEffect,
  SerializableEffectRef,
  SerializableEffectSource,
  SerializableTimeEffect,
  EffectBase,
  NamedEffect,
  SCRUB_FIELDS,
  STATE_FIELDS,
  TIME_FIELDS,
} from './effects';

export { SerializableSequenceConfig, SerializableSequenceConfigRef } from './sequences';

export { Keyframe, LengthPercentage, RangeOffset, Condition } from './primitives';

// Canonical types — single source of truth, no z.infer<> re-derivation.
export type {
  InteractConfig,
  Condition as ConditionDef,
  SequenceOptionsConfig,
  SequenceConfig,
  SequenceConfigRef,
  Interaction as InteractionDef,
  InteractionTrigger,
} from '@wix/interact';

export type { Effect, EffectRef } from '@wix/interact';
