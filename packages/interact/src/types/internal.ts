import type { Effect, EffectRef, StateEffect, TransitionProperty } from './effects';
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
  /** Set for a list effect, whose state is on the item rather than on the element of `key` */
  listItemStateSelector?: string;
  selectorCondition?: string;
  useFirstChild?: boolean;
};
