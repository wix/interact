import type { TriggerType, TriggerParams } from './triggers';
import type { Effect, EffectRef, TimeAnimationTriggerType } from './effects';

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
  triggerType?: TimeAnimationTriggerType;
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
