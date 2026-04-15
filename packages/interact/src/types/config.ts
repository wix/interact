import type { TriggerType, TriggerParams } from './triggers';
import type { Effect, EffectRef, EffectProperty } from './effects';

export type Condition = {
  type: 'media' | 'container' | 'selector';
  predicate?: string;
};

export type SequenceOptionsConfig = {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  sequenceId?: string;
  conditions?: string[];
};

export type SequenceConfig = SequenceOptionsConfig & {
  effects: (Effect | EffectRef)[];
};

export type SequenceConfigRef = {
  sequenceId: string;
} & {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  conditions?: string[];
};

export type InteractionTrigger = {
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  trigger: TriggerType;
  params?: TriggerParams;
  conditions?: string[];
  selector?: string;
};

export type Interaction = InteractionTrigger & {
  effects?: ((Effect | EffectRef) & { interactionId?: string })[];
  sequences?: (SequenceConfig | SequenceConfigRef)[];
};

export type InteractConfig = {
  effects: Record<string, Effect>;
  sequences?: Record<string, SequenceConfig>;
  conditions?: Record<string, Condition>;
  interactions: Interaction[];
};

export type ElementIdentifier = {
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  selector?: string;
};

export type ResolvedEffect = ElementIdentifier &
  EffectProperty & {
    effectId: string;
    conditions: string[];
    initial: boolean;
  };

export type ResolvedSequence = {
  sequenceId: string;
  delay: number;
  offset: number;
  offsetEasing: (p: number) => number;
  conditions: string[];
  effects: ResolvedEffect[];
};
