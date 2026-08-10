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
} from './config';

// Controller
export type { IInteractionController, IInteractElement } from './controller';

// CSS generation
export type { GenerateOptions } from './css';

// Options
export type { InteractOptions } from './handlers';

// Plugins
export type {
  InteractPlugin,
  InteractPluginContext,
  InteractPluginCleanup,
  InteractPluginConfigMap,
  InteractPluginStyleContext,
  InteractPluginStyleGenerator,
  InteractPluginStyles,
  PluginFields,
} from './plugins';
