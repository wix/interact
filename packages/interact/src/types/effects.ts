import type {
  NamedEffect,
  RangeOffset,
  ScrubTransitionEasing,
  MotionAnimationOptions,
} from '@wix/motion';

type Fill = 'none' | 'forwards' | 'backwards' | 'both';

type MotionKeyframeEffect = {
  name: string;
  keyframes: Keyframe[];
};

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
  easing?: string;
  iterations?: number;
  alternate?: boolean;
  fill?: Fill;
  reversed?: boolean;
  delay?: number;
  composite?: CompositeOperation;
} & EffectEffectProperty;

export type ScrubEffect = {
  easing?: string;
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
  easing?: string;
};

export type StyleProperty = {
  name: string;
  value: string;
};

export type TransitionProperty = StyleProperty & TransitionOptions;

export type TransitionEffect = {
  key?: string;
  effectId?: string;
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

export type Effect = EffectBase & (TimeEffect | ScrubEffect | TransitionEffect);

export type AnimationOptions<T extends 'time' | 'scrub'> = MotionAnimationOptions<T> &
  EffectEffectProperty;
