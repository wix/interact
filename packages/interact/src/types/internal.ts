import type {
  Effect,
  EffectRef,
  ReducedMotionPolicy,
  StateEffect,
  TransitionProperty,
} from './effects';
import type { Condition, SequenceConfig, Interaction, InteractionTrigger } from './config';

export type InteractCache = {
  effects: {
    [effectId: string]: Effect;
  };
  sequences: {
    [sequenceId: string]: SequenceConfig;
  };
  conditions: {
    [conditionId: string]: Condition;
  };
  // the instance's
  reducedMotionPolicy?: ReducedMotionPolicy;
  forceReducedMotion?: boolean;
  interactions: {
    [path: string]: {
      triggers: Interaction[];
      // `owner` is the source interaction the effect or sequence belongs to, holding its siblings
      effects: Record<
        string,
        (InteractionTrigger & { effect: Effect | EffectRef; owner: Interaction })[]
      >;
      sequences: Record<
        string,
        (InteractionTrigger & { sequence: SequenceConfig; owner: Interaction })[]
      >;
      interactionIds: Set<string>;
      selectors: Set<string>;
    };
  };
};

export type CreateTransitionCSSParams = {
  key: string;
  effectId: string;
  transition?: StateEffect['transition'];
  transitionProperties?: TransitionProperty[];
  childSelector?: string;
  selectorCondition?: string;
  useFirstChild?: boolean;
};
