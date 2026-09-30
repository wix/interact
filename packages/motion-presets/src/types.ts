export type {
  AnimationData,
  AnimationExtraOptions,
  AnimationFillMode,
  AnimationOptions,
  CustomEffect,
  DomApi,
  EffectEightDirections,
  EffectFourCorners,
  EffectFourDirections,
  EffectNineDirections,
  EffectScrollRange,
  EffectTwoSides,
  Length,
  Percentage,
  Progress,
  RangeOffset,
  ScrubAnimationOptions,
  ScrubTransitionEasing,
  Shape,
  TimeAnimationOptions,
  Point,
} from '@wix/motion';

import type {
  AnimationData,
  AnimationEffectAPI,
  AnimationOptions,
  DomApi,
  EffectEightDirections,
  EffectFourCorners,
  EffectFourDirections,
  EffectNineDirections,
  EffectScrollRange,
  EffectTwoSides,
  MouseAnimationFactoryCreate,
  ScrubAnimationOptions,
  Shape,
  UnitLengthPercentage,
  WebAnimationEffectFactory,
} from '@wix/motion';

export type Translate = { x: string; y: string };
export type ShapeType = 'circle' | 'ellipse' | 'rectangle' | 'diamond' | 'window';

export type HorizontalOffsetByDirectionParams = {
  left: number;
  width: number;
  parentWidth: number;
};
export type VerticalOffsetByDirectionParams = {
  top: number;
  height: number;
  parentHeight: number;
};
export type OffsetByDirectionParams = HorizontalOffsetByDirectionParams &
  VerticalOffsetByDirectionParams;

export type LengthValue = { value: number; unit: string };
export type LengthInput =
  | string
  | number
  | LengthValue
  | { value: number; unit?: string }
  | undefined;

export type EffectTwoAxes = 'horizontal' | 'vertical';
export type EffectSpinDirection = 'clockwise' | 'counter-clockwise';

export type ArcIn = {
  type: 'ArcIn';
  depth?: LengthInput;
  from?: EffectFourDirections;
  perspective?: number;
};
export type BlurIn = {
  type: 'BlurIn';
  blur?: number;
};
export type BounceIn = {
  type: 'BounceIn';
  from?: EffectFourDirections | 'back';
  perspective?: number;
  travel?: LengthInput;
};
export type CurveIn = {
  type: 'CurveIn';
  depth?: LengthInput;
  from?: EffectFourDirections;
  perspective?: number;
};
export type DropIn = {
  type: 'DropIn';
  scale?: number;
};
export type ExpandIn = {
  type: 'ExpandIn';
  from?: number | string;
  scale?: number;
  travel?: LengthInput;
};
export type FadeIn = { type: 'FadeIn' };
export type FlipIn = {
  type: 'FlipIn';
  angle?: number;
  direction?: EffectTwoAxes;
  perspective?: number;
};
export type FloatIn = {
  type: 'FloatIn';
  from?: EffectFourDirections;
};
export type FoldIn = {
  type: 'FoldIn';
  angle?: number;
  perspective?: number;
  pivot?: EffectFourDirections;
};
export type GlideIn = {
  type: 'GlideIn';
  from?: number | string;
  travel?: LengthInput;
};
export type RevealIn = {
  type: 'RevealIn';
  from?: EffectFourDirections;
};
export type ShapeIn = {
  type: 'ShapeIn';
  shape?: 'circle' | 'ellipse' | 'rectangle' | 'diamond' | 'window';
};
export type ShuttersIn = {
  type: 'ShuttersIn';
  from?: EffectFourDirections;
  shutters?: number;
  staggered?: boolean;
};
export type SlideIn = {
  type: 'SlideIn';
  from?: EffectFourDirections;
  start?: number;
};
export type SpinIn = {
  type: 'SpinIn';
  direction?: EffectSpinDirection;
  scale?: number;
  spins?: number;
};
export type TiltIn = {
  type: 'TiltIn';
  depth?: LengthInput;
  from?: EffectTwoSides;
  perspective?: number;
};
export type TurnIn = {
  type: 'TurnIn';
  pivot?: EffectFourCorners;
};
export type WinkIn = {
  type: 'WinkIn';
  direction?: EffectTwoAxes;
};

export type EntranceAnimation =
  | FadeIn
  | ArcIn
  | CurveIn
  | DropIn
  | FlipIn
  | FloatIn
  | FoldIn
  | SlideIn
  | SpinIn
  | BounceIn
  | GlideIn
  | TurnIn
  | WinkIn
  | TiltIn
  | ShapeIn
  | ShuttersIn
  | RevealIn
  | BlurIn
  | ExpandIn;

export type EntranceAnimations = Record<EntranceAnimation['type'], AnimationEffectAPI<'time'>>;

export type Breathe = {
  type: 'Breathe';
  direction?: EffectTwoAxes | 'center';
  iterationDelay?: number;
  perspective?: number;
  travel?: LengthInput;
};
export type Pulse = {
  type: 'Pulse';
  iterationDelay?: number;
  scale?: number;
};
export type Spin = {
  type: 'Spin';
  direction?: EffectSpinDirection;
  iterationDelay?: number;
};
export type Poke = {
  type: 'Poke';
  direction?: EffectFourDirections;
  iterationDelay?: number;
  travel?: LengthInput;
};
export type Flash = { type: 'Flash'; iterationDelay?: number };
export type Swing = {
  type: 'Swing';
  angle?: number;
  iterationDelay?: number;
  pivot?: EffectFourDirections;
};
export type Flip = {
  type: 'Flip';
  direction?: EffectTwoAxes;
  iterationDelay?: number;
  perspective?: number;
};
export type Rubber = {
  type: 'Rubber';
  iterationDelay?: number;
  stretch?: number;
};
export type Fold = {
  type: 'Fold';
  angle?: number;
  iterationDelay?: number;
  perspective?: number;
  pivot?: EffectFourDirections;
};
export type Jello = {
  type: 'Jello';
  iterationDelay?: number;
  skew?: number;
};
export type Wiggle = {
  type: 'Wiggle';
  angle?: number;
  iterationDelay?: number;
  travel?: LengthInput;
};
export type Bounce = {
  type: 'Bounce';
  iterationDelay?: number;
  travel?: LengthInput;
};
export type Cross = {
  type: 'Cross';
  direction?: EffectEightDirections;
  iterationDelay?: number;
};
export type DVD = {
  type: 'DVD';
};

export type OngoingAnimation =
  | Breathe
  | Pulse
  | Spin
  | Poke
  | Flash
  | Swing
  | Flip
  | Rubber
  | Fold
  | Jello
  | Wiggle
  | Bounce
  | Cross
  | DVD;
export type OngoingAnimations = Record<OngoingAnimation['type'], AnimationEffectAPI<'time'>>;

export type ArcScroll = {
  type: 'ArcScroll';
  direction?: 'vertical' | 'horizontal';
  perspective?: number;
  range?: EffectScrollRange;
};
export type BlurScroll = {
  type: 'BlurScroll';
  blur?: number;
  range?: EffectScrollRange;
};
export type FadeScroll = {
  type: 'FadeScroll';
  opacity?: number;
  range?: EffectScrollRange;
};
export type FlipScroll = {
  type: 'FlipScroll';
  angle?: number;
  direction?: 'vertical' | 'horizontal';
  perspective?: number;
  range?: EffectScrollRange;
};
export type GrowScroll = {
  type: 'GrowScroll';
  pivot?: EffectNineDirections;
  range?: EffectScrollRange;
  scale?: number;
  speed?: number;
};
export type MoveScroll = {
  type: 'MoveScroll';
  direction?: number;
  range?: EffectScrollRange;
  travel?: UnitLengthPercentage;
};
export type PanScroll = {
  type: 'PanScroll';
  direction?: EffectTwoSides;
  distance?: UnitLengthPercentage;
  startFromOffScreen?: boolean;
  range?: EffectScrollRange;
};
export type ParallaxScroll = {
  type: 'ParallaxScroll';
  center?: number;
  speed?: number;
};
export type RevealScroll = {
  type: 'RevealScroll';
  direction?: EffectFourDirections;
  range?: EffectScrollRange;
};
export type ShapeScroll = {
  type: 'ShapeScroll';
  range?: EffectScrollRange;
  shape?: Shape;
  start?: number;
};
export type ShrinkScroll = {
  type: 'ShrinkScroll';
  pivot?: EffectNineDirections;
  range?: EffectScrollRange;
  scale?: number;
  speed?: number;
};
export type ShuttersScroll = {
  type: 'ShuttersScroll';
  direction?: EffectFourDirections;
  range?: EffectScrollRange;
  shutters?: number;
  staggered?: boolean;
};
export type SkewPanScroll = {
  type: 'SkewPanScroll';
  direction?: EffectTwoSides;
  range?: EffectScrollRange;
  skew?: number;
};
export type SlideScroll = {
  type: 'SlideScroll';
  direction?: EffectFourDirections;
  range?: EffectScrollRange;
};
export type Spin3dScroll = {
  type: 'Spin3dScroll';
  angle?: number;
  perspective?: number;
  range?: EffectScrollRange;
  speed?: number;
};
export type SpinScroll = {
  type: 'SpinScroll';
  direction?: EffectSpinDirection;
  range?: EffectScrollRange;
  scale?: number;
  spins?: number;
};
export type StretchScroll = {
  type: 'StretchScroll';
  range?: EffectScrollRange;
  stretch?: number;
};
export type TiltScroll = {
  type: 'TiltScroll';
  direction?: EffectSpinDirection;
  perspective?: number;
  range?: EffectScrollRange;
  speed?: number;
};
export type TurnScroll = {
  type: 'TurnScroll';
  angle?: number;
  direction?: EffectTwoSides;
  range?: EffectScrollRange;
  scale?: number;
  spin?: EffectSpinDirection;
};

export type ScrollAnimation =
  | ArcScroll
  | BlurScroll
  | FadeScroll
  | FlipScroll
  | GrowScroll
  | MoveScroll
  | PanScroll
  | ParallaxScroll
  | RevealScroll
  | ShapeScroll
  | ShuttersScroll
  | ShrinkScroll
  | SkewPanScroll
  | SlideScroll
  | Spin3dScroll
  | SpinScroll
  | StretchScroll
  | TiltScroll
  | TurnScroll;

export type ScrollPreset = (
  options: ScrubAnimationOptions,
  dom?: DomApi,
  config?: Record<string, any>,
) => AnimationData[];

export type ScrollAnimations = Record<ScrollAnimation['type'], AnimationEffectAPI<'scrub'>>;

export type BgCloseUp = {
  type: 'BgCloseUp';
  scale?: number;
};
export type BgFade = {
  type: 'BgFade';
  range: 'in' | 'out';
};
export type BgFadeBack = {
  type: 'BgFadeBack';
  scale?: number;
};
export type BgFake3D = {
  type: 'BgFake3D';
  stretch?: number;
  zoom?: number;
};
export type BgPan = {
  type: 'BgPan';
  direction: 'left' | 'right';
  speed?: number;
};
export type BgParallax = {
  type: 'BgParallax';
  speed?: number;
};
export type BgPullBack = {
  type: 'BgPullBack';
  scale?: number;
};
export type BgReveal = { type: 'BgReveal' };
export type BgRotate = {
  type: 'BgRotate';
  direction?: EffectSpinDirection;
  angle?: number;
};
export type BgSkew = {
  type: 'BgSkew';
  direction?: EffectSpinDirection;
  angle?: number;
};
export type BgZoom = {
  type: 'BgZoom';
  direction: 'in' | 'out';
  zoom?: number;
};
export type ImageParallax = {
  type: 'ImageParallax';
  reverse?: boolean;
  speed?: number;
  isPage?: boolean;
};

export type BackgroundScrollAnimation =
  | BgCloseUp
  | BgFade
  | BgFadeBack
  | BgFake3D
  | BgPan
  | BgParallax
  | BgPullBack
  | BgReveal
  | BgRotate
  | BgSkew
  | BgZoom
  | ImageParallax;

export type BackgroundScrollAnimationModule = {
  create: WebAnimationEffectFactory<'scrub'>;
};
export type BackgroundScrollAnimations = Record<
  BackgroundScrollAnimation['type'],
  AnimationEffectAPI<'scrub'>
>;

type MouseEffectBase = {
  inverted?: boolean;
};

export type MouseEffectAxis = 'both' | 'horizontal' | 'vertical';

export type MousePivotAxis =
  | 'top'
  | 'bottom'
  | 'right'
  | 'left'
  | 'center-horizontal'
  | 'center-vertical';

export type AiryMouse = MouseEffectBase & {
  type: 'AiryMouse';
  distance?: UnitLengthPercentage;
  axis?: MouseEffectAxis;
  angle?: number;
};
export type BlobMouse = MouseEffectBase & {
  type: 'BlobMouse';
  distance?: UnitLengthPercentage;
  scale?: number;
};
export type BlurMouse = MouseEffectBase & {
  type: 'BlurMouse';
  distance?: UnitLengthPercentage;
  angle?: number;
  scale?: number;
  blur?: number;
  perspective?: number;
};
export type BounceMouse = MouseEffectBase & {
  type: 'BounceMouse';
  distance?: UnitLengthPercentage;
  axis?: MouseEffectAxis;
};
export type ScaleMouse = MouseEffectBase & {
  type: 'ScaleMouse';
  distance?: UnitLengthPercentage;
  axis?: MouseEffectAxis;
  scale?: number;
};
export type SkewMouse = MouseEffectBase & {
  type: 'SkewMouse';
  distance?: UnitLengthPercentage;
  angle?: number;
  axis?: MouseEffectAxis;
};
export type SpinMouse = MouseEffectBase & {
  type: 'SpinMouse';
  axis?: MouseEffectAxis;
};
export type SwivelMouse = MouseEffectBase & {
  type: 'SwivelMouse';
  angle?: number;
  perspective?: number;
  pivotAxis?: MousePivotAxis;
};
export type Tilt3DMouse = MouseEffectBase & {
  type: 'Tilt3DMouse';
  angle?: number;
  perspective?: number;
};
export type Track3DMouse = MouseEffectBase & {
  type: 'Track3DMouse';
  distance?: UnitLengthPercentage;
  angle?: number;
  axis?: MouseEffectAxis;
  perspective?: number;
};
export type TrackMouse = MouseEffectBase & {
  type: 'TrackMouse';
  distance?: UnitLengthPercentage;
  axis?: MouseEffectAxis;
};

export type CustomMouse = { type: 'CustomMouse' };

export type MouseAnimation =
  | AiryMouse
  | BlobMouse
  | BlurMouse
  | BounceMouse
  | CustomMouse
  | ScaleMouse
  | SkewMouse
  | SpinMouse
  | SwivelMouse
  | Tilt3DMouse
  | Track3DMouse
  | TrackMouse;

export type MouseAnimations = Record<MouseAnimation['type'], MouseAnimationFactoryCreate>;

export type NamedEffect =
  | EntranceAnimation
  | OngoingAnimation
  | ScrollAnimation
  | MouseAnimation
  | BackgroundScrollAnimation;

export type MotionPresetsAnimationOptions<TNamedEffect extends NamedEffect = NamedEffect> =
  AnimationOptions & { namedEffect?: TNamedEffect };
