type LengthUnit = 'px' | 'em' | 'rem' | 'vh' | 'vw' | 'vmin' | 'vmax';

export declare type Length = {
  value: number;
  unit: LengthUnit;
};

export declare type Percentage = {
  value: number;
  unit: 'percentage';
};

export declare type LengthPercentage = Length | Percentage;

export declare type UnitLengthPercentage = LengthPercentage;

export type Point = [number, number];

export type EffectNineDirections =
  | 'right'
  | 'top-right'
  | 'top'
  | 'top-left'
  | 'left'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right'
  | 'center';

export type EffectScaleDirection = 'up' | 'down';

declare class ViewTimeline {
  constructor(options: { subject: HTMLElement });
}

declare global {
  interface Window {
    ViewTimeline: ViewTimeline;
  }
}

export type AnimationFillMode = 'none' | 'backwards' | 'forwards' | 'both';

export type EffectTwoSides = 'left' | 'right';

export type EffectFourDirections = 'top' | 'right' | 'bottom' | 'left';
export type EffectFourCorners = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type EffectEightDirections = EffectFourDirections | EffectFourCorners;
export type EffectPower = 'soft' | 'medium' | 'hard';
export type EffectScrollRange = 'in' | 'out' | 'continuous';

export type AnimationOptionsTypes = {
  time: TimeAnimationOptions & AnimationExtraOptions;
  scrub: ScrubAnimationOptions & AnimationExtraOptions;
};

export type AnimationEffectAPI<Enum extends keyof AnimationOptionsTypes> = {
  web: (
    animationOptions: AnimationOptionsTypes[Enum],
    dom?: DomApi,
    options?: Record<string, any>,
  ) => AnimationData[];
  getNames: (animationOptions: AnimationOptionsTypes[Enum]) => string[];
  style?: (options: AnimationOptionsTypes[Enum]) => AnimationData[];
  prepare?: (options: AnimationOptionsTypes[Enum], dom?: DomApi) => void;
};

export type WebAnimationEffectFactory<Enum extends keyof AnimationOptionsTypes> = (
  animationOptions: AnimationOptionsTypes[Enum],
  dom?: DomApi,
  options?: Record<string, any>,
) => AnimationData[];

export type Progress = {
  x: number;
  y: number;
  v?: { x: number; y: number };
  active?: boolean;
};

export interface MouseAnimationInstance {
  target: HTMLElement;
  play: () => void;
  progress: (progress: Progress) => void;
  cancel: () => void;
}

export interface CustomMouseAnimationInstance extends MouseAnimationInstance {
  getProgress: () => Progress;
}

export type MouseAnimationFactory = (element: HTMLElement) => MouseAnimationInstance;

export type MouseAnimationFactoryCreate = (
  options: ScrubAnimationOptions,
  dom?: DomApi,
) => MouseAnimationFactory;

export type NamedEffect = { type: string } & Record<string, unknown>;

export type CustomEffect =
  | {
      ranges: { name: string; min: number; max: number; step?: number }[];
    }
  | ((element: Element | null, progress: number | null) => void);

export type AnimationExtraOptions = {
  effectId?: string;
  effect?: (progress: () => number | { x: number | undefined; y: number | undefined }) => void;
  measures?: Record<string, string | number>;
};

export type AnimationOptions<TNamedEffect extends NamedEffect = NamedEffect> = (
  | TimeAnimationOptions<TNamedEffect>
  | ScrubAnimationOptions<TNamedEffect>
) &
  AnimationExtraOptions;

export type MotionAnimationOptions<T extends keyof AnimationOptionsTypes> =
  AnimationOptionsTypes[T];

export type MeasureCallback = (fn: (target: HTMLElement | null) => void) => void;
export type DomApi = { measure: MeasureCallback; mutate: MeasureCallback };

export type NamedEffectFunction<TNamedEffect extends NamedEffect = NamedEffect> = (
  options: AnimationOptions<TNamedEffect>,
  domApi?: DomApi | undefined,
  config?: Record<string, any>,
) => AnimationData[];

export type ScrubTransitionEasing = 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';

export type RangeOffset = {
  name?: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing';
  offset?: LengthPercentage;
};

export type MotionKeyframeEffect = {
  name: string;
  keyframes: Keyframe[];
};

export type TimeAnimationOptions<TNamedEffect extends NamedEffect = NamedEffect> = {
  id?: string;
  keyframeEffect?: MotionKeyframeEffect;
  namedEffect?: TNamedEffect;
  customEffect?: CustomEffect;
  duration?: number;
  delay?: number;
  endDelay?: number;
  easing?: string;
  iterations?: number;
  alternate?: boolean;
  fill?: AnimationFillMode;
  reversed?: boolean;
};

export type PointerMoveAxis = 'x' | 'y';

type ScrubAnimationDataBase<TNamedEffect extends NamedEffect = NamedEffect> = {
  id?: string;
  keyframeEffect?: MotionKeyframeEffect;
  namedEffect?: TNamedEffect;
  customEffect?: CustomEffect;
  startOffset?: RangeOffset;
  endOffset?: RangeOffset;
  playbackRate?: number;
  easing?: string;
  iterations?: number;
  fill?: AnimationFillMode;
  alternate?: boolean;
  reversed?: boolean;
  transitionDuration?: number;
  transitionDelay?: number;
  transitionEasing?: ScrubTransitionEasing;
  centeredToTarget?: boolean;
};

export type ScrubAnimationOptions<TNamedEffect extends NamedEffect = NamedEffect> =
  ScrubAnimationDataBase<TNamedEffect> & {
    duration?: LengthPercentage;
  };

type AnimationDataExtra = {
  name?: string; // TODO:  need to be added to all animations and then be made required
  keyframes: Record<string, string | number | undefined>[];
  custom?: Record<string, string | number | undefined>;
  composite?: CompositeOperation;
  part?: string;
  timing?: Partial<EffectTiming>;
};

export type AnimationDataForScrub = ScrubAnimationDataBase & {
  duration?: LengthPercentage | number;
  startOffsetAdd?: string;
  endOffsetAdd?: string;
};

export type AnimationData = (TimeAnimationOptions | AnimationDataForScrub) & AnimationDataExtra;

// TODO: need it?
export type AnimationProperties = {
  groups?: string[];
  schema: { [key: string]: any };
};

export type TriggerVariant = {
  id: string;
  trigger: 'view-progress' | 'pointer-move';
  componentId: string;
};

export type AnimationGroupOptions = AnimationOptions & {
  trigger?: Partial<TriggerVariant> | undefined;
  startOffsetAdd?: string | undefined;
  endOffsetAdd?: string | undefined;
  measured?: Promise<void>;
};

export type Shape = 'ellipse' | 'circle' | 'rectangle' | 'diamond' | 'window';

export interface ScrubScrollScene {
  start: RangeOffset;
  end: RangeOffset;
  viewSource: HTMLElement;
  ready: Promise<void>;
  getProgress(): number;
  effect(__: any, p: number): void;
  disabled: boolean;
  destroy(): void;
  groupId?: string;
}

export interface ScrubPointerScene {
  target?: HTMLElement;
  centeredToTarget?: boolean;
  transitionDuration?: number;
  transitionEasing?: ScrubTransitionEasing;
  getProgress(): Progress | number;
  effect(__: any, p: Progress): void;
  disabled: boolean;
  destroy(): void;
  allowActiveEvent?: boolean;
  ready?: Promise<void>;
}

type ScrubOptions = ScrubAnimationOptions & AnimationExtraOptions;

export interface ScrollEffectModule {
  web(options: ScrubOptions, dom?: DomApi): AnimationData[];
}

export interface MouseEffectModule {
  web(options: ScrubOptions): (element: HTMLElement) => object;
}

export interface MouseCreateEffectModule {
  create(options: ScrubOptions): (element: HTMLElement) => object;
}

export type EffectModule =
  | AnimationEffectAPI<'time'>
  | AnimationEffectAPI<'scrub'>
  | ScrollEffectModule
  | MouseEffectModule
  | WebAnimationEffectFactory<'scrub'>;

export type SequenceOptions = {
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
};

export type AnimationGroupArgs = {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
};

export type IndexedGroup = {
  index: number;
  group: import('./AnimationGroup').AnimationGroup;
};
