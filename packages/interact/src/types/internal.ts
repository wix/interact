import type { Effect, EffectRef, StateEffect, TransitionProperty } from './effects';
import type {
  Condition,
  SequenceConfig,
  Interaction,
  InteractionTrigger,
  SplitTextConfig,
} from './config';

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
  splitText: {
    [splitId: string]: SplitTextConfig;
  };
  interactions: {
    [path: string]: {
      triggers: Interaction[];
      effects: Record<string, (InteractionTrigger & { effect: Effect | EffectRef })[]>;
      sequences: Record<string, (InteractionTrigger & { sequence: SequenceConfig })[]>;
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
