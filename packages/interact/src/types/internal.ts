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
      // the key's states no interaction sets, for code to toggle
      codeStates: Effect[];
    };
  };
};

export type CreateTransitionCSSParams = {
  key: string;
  effectId: string;
  transition?: StateEffect['transition'];
  transitionProperties?: TransitionProperty[];
  elementStyles?: StateEffect['elementStyles'];
  childSelector?: string;
  selectorCondition?: string;
  useFirstChild?: boolean;
};
