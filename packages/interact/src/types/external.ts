// Triggers
export type {
  TriggerType,
  PointerMoveAxis,
  EventTriggerParams,
  ViewEnterParams,
  PointerMoveParams,
  AnimationEndParams,
  TriggerParams,
  RangeOffset,
} from './triggers';

// Effects
export type {
  TimeAnimationTriggerType,
  StateAction,
  TimeEffect,
  ScrubEffect,
  TransitionOptions,
  StyleProperty,
  TransitionProperty,
  StateEffect,
  EffectRef,
  Effect,
} from './effects';

// Config
export type {
  Condition,
  SequenceOptionsConfig,
  SequenceConfig,
  SequenceConfigRef,
  InteractionTrigger,
  Interaction,
  InteractConfig,
  SplitType,
  SplitTextConfig,
  SplitTextConfigRef,
} from './config';

// SplitText resolver contract
export type { SplitTextResolver, SplitTextResolverContext } from './splitText';

// Controller
export type { IInteractionController, IInteractElement } from './controller';

// Options
export type { InteractOptions } from './handlers';
