import type { TriggerType, TriggerParams } from './triggers';
import type { Effect, EffectRef, EffectProperty, TimeAnimationTriggerType } from './effects';

export type Condition = {
  type: 'media' | 'container' | 'selector';
  predicate: string;
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
  effects?: Record<string, Effect>;
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
    triggerType: TimeAnimationTriggerType;
    initial: boolean;
    /** Delay in ms. For sequence effects this is the stagger base (sequenceDelay + effectOwnDelay). */
    delay?: number;
    /** Original 0-based index within the sequence's `effects` array; used to derive the stagger custom-property name. */
    sequenceIndex?: number;
  };

export type ResolvedSequence = {
  sequenceId: string;
  triggerType: TimeAnimationTriggerType;
  delay: number;
  offset: number;
  offsetEasing: (p: number) => number;
  conditions: string[];
  effects: ResolvedEffect[];
};
