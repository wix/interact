import type {
  NamedEffect,
  RangeOffset,
  ScrubTransitionEasing,
  MotionAnimationOptions,
  CssEasing,
} from '@wix/motion';

type Fill = 'none' | 'forwards' | 'backwards' | 'both';

type MotionKeyframeEffect = {
  name: string;
  keyframes: Keyframe[];
};

export type TimeAnimationTriggerType = 'once' | 'repeat' | 'alternate' | 'state';

export type StateAction = 'add' | 'remove' | 'toggle' | 'clear';

type EffectEffectProperty =
  | {
      keyframeEffect: MotionKeyframeEffect;
    }
  | {
      namedEffect: NamedEffect;
    }
  | {
      customEffect: (element: Element, progress: any) => void;
    };

export type TimeEffect = {
  duration: number;
  easing?: CssEasing;
  iterations?: number;
  alternate?: boolean;
  fill?: Fill;
  reversed?: boolean;
  delay?: number;
  triggerType?: TimeAnimationTriggerType;
  composite?: CompositeOperation;
} & EffectEffectProperty;

export type ScrubEffect = {
  easing?: CssEasing;
  iterations?: number;
  alternate?: boolean;
  fill?: Fill;
  reversed?: boolean;
  composite?: CompositeOperation;
  rangeStart?: RangeOffset;
  rangeEnd?: RangeOffset;
  centeredToTarget?: boolean;
  transitionDuration?: number;
  transitionDelay?: number;
  transitionEasing?: ScrubTransitionEasing;
} & EffectEffectProperty;

export type TransitionOptions = {
  duration?: number;
  delay?: number;
  easing?: CssEasing;
};

export type StyleProperty = {
  name: string;
  value: string;
};

export type TransitionProperty = StyleProperty & TransitionOptions;

export type StateEffect = {
  key?: string;
  effectId?: string;
  stateAction?: StateAction;
} & {
  transition?: TransitionOptions & {
    styleProperties: StyleProperty[];
  };
  transitionProperties?: TransitionProperty[];
};

export type EffectBase = {
  key?: string;
  listContainer?: string;
  listItemSelector?: string;
  conditions?: string[];
  selector?: string;
  effectId?: string;
};

export type EffectRef = EffectBase & { effectId: string };

export type Effect = EffectBase & (TimeEffect | ScrubEffect | StateEffect);

export type AnimationOptions<T extends 'time' | 'scrub'> = MotionAnimationOptions<T> &
  EffectEffectProperty;

export type OneOf<T extends Record<string, unknown>> =
  | {
      [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>;
    }[keyof T]
  | Partial<Record<keyof T, never>>;

export type EffectProperty = OneOf<{
  namedEffect: NamedEffect;
  keyframeEffect: MotionKeyframeEffect;
  transition: TransitionOptions & { styleProperties: StyleProperty[] };
  transitionProperties: TransitionProperty[];
  customEffect: (element: Element, progress: any) => void;
}>;
