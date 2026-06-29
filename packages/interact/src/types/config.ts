import type { TriggerType, TriggerParams } from './triggers';
import type { Effect, EffectRef, EffectProperty, TimeAnimationTriggerType } from './effects';

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

export type SplitType = 'chars' | 'words' | 'lines' | 'sentences';

/**
 * Declarative configuration for splitting an element's text into animatable
 * `<span>` wrappers before Interact resolves animation targets. The actual
 * splitting is performed by a resolver registered via `Interact.use('splitText', ...)`
 * (e.g. `@wix/splittext/interact`); these types live in `@wix/interact` so the
 * config is fully typed with zero bundle cost when the feature is unused.
 */
export type SplitTextConfig = {
  /** Selector for the element to split, relative to the connecting root element. */
  container: string;
  /** Split granularity. An array builds a nested tree (coarse → fine). */
  type: SplitType | SplitType[];
  /** Optional id to reference this definition from `InteractConfig.splitText`. */
  splitId?: string;
  /** CSS class(es) added to every wrapper span. */
  wrapperClass?: string;
  /** Inline styles applied to every wrapper span. */
  wrapperStyle?: Record<string, string>;
  /** Custom HTML attributes applied to every wrapper span. */
  wrapperAttrs?: Record<string, string>;
  /** Attach a ResizeObserver + fonts.ready listener that re-splits automatically. */
  autoSplit?: boolean;
  /** ARIA handling mode, aligned to `@wix/splittext`. */
  aria?: 'auto' | 'none';
  /** Hide the container (via the `data-text-split` state attribute + CSS) until splitting completes, to prevent FOUC. */
  hide?: boolean;
};

/**
 * Reference to a `SplitTextConfig` defined under `InteractConfig.splitText`.
 * Any inline field overrides the referenced definition.
 */
export type SplitTextConfigRef = {
  splitId: string;
  container?: string;
  type?: SplitType | SplitType[];
  wrapperClass?: string;
  wrapperStyle?: Record<string, string>;
  wrapperAttrs?: Record<string, string>;
  autoSplit?: boolean;
  aria?: 'auto' | 'none';
  hide?: boolean;
};

export type InteractionTrigger = {
  key: string;
  listContainer?: string;
  listItemSelector?: string;
  trigger: TriggerType;
  params?: TriggerParams;
  conditions?: string[];
  selector?: string;
  splitText?: SplitTextConfig | SplitTextConfigRef;
};

export type Interaction = InteractionTrigger & {
  effects?: ((Effect | EffectRef) & { interactionId?: string })[];
  sequences?: (SequenceConfig | SequenceConfigRef)[];
};

export type InteractConfig = {
  effects?: Record<string, Effect>;
  sequences?: Record<string, SequenceConfig>;
  conditions?: Record<string, Condition>;
  splitText?: Record<string, SplitTextConfig>;
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
