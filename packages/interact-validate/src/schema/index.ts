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
  Effect,
  EffectRef,
  EffectSource,
  TimeEffect,
  EffectBase,
  NamedEffect,
  SCRUB_FIELDS,
  STATE_FIELDS,
  TIME_FIELDS,
} from './effects';

export { SequenceConfig, SequenceConfigRef } from './sequences';

export { Keyframe, LengthPercentage, RangeOffset, Condition } from './primitives';

// Canonical types — single source of truth, no z.infer<> re-derivation.
export type {
  InteractConfig,
  Condition as ConditionDef,
  SequenceOptionsConfig,
  SequenceConfig as SequenceConfigDef,
  SequenceConfigRef as SequenceConfigRefDef,
  Interaction as InteractionDef,
  InteractionTrigger,
} from '@wix/interact';

export type { Effect as EffectDef, EffectRef as EffectRefDef } from '@wix/interact';
