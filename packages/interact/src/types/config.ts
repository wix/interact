import type { TriggerType, TriggerParams } from './triggers';
import type {
  Effect,
  EffectRef,
  EffectProperty,
  ReducedMotionPolicy,
  TimeAnimationTriggerType,
} from './effects';
import type { PluginFields } from './plugins';

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
  reducedMotionPolicy?: ReducedMotionPolicy;
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
  reducedMotionPolicy?: ReducedMotionPolicy;
};

export type InteractionTrigger = {
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  trigger: TriggerType;
  params?: TriggerParams;
  conditions?: string[];
  selector?: string;
  reducedMotionPolicy?: ReducedMotionPolicy;
} & PluginFields; // `$<name>` fields route to plugins registered via `Interact.use()`

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
    suffix?: string;
    // the effect's position in the config (see getSlotKey)
    slotKey?: string;
    // the effect's reduced-motion variants, each under its reserved media (see getReducedMotionVariants)
    variants?: ResolvedEffect[];
  };

export type ResolvedSequence = {
  sequenceId: string;
  triggerType: TimeAnimationTriggerType;
  delay: number;
  offset: number;
  offsetEasing: string;
  conditions: string[];
  reducedMotionPolicy: ReducedMotionPolicy;
  effects: ResolvedEffect[];
};
