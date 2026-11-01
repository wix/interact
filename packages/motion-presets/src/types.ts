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
  UnitLengthPercentage,
  WebAnimationEffectFactory,
} from '@wix/motion';
import type { LengthInput } from './utils';

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

export type FadeIn = { type: 'FadeIn' };
export type ArcIn = {
  type: 'ArcIn';
  from?: EffectFourDirections;
  depth?: LengthInput;
  perspective?: number;
};
export type CurveIn = {
  type: 'CurveIn';
  from?: EffectFourDirections;
  depth?: LengthInput;
  perspective?: number;
};
export type DropIn = {
  type: 'DropIn';
  scale?: number;
};
export type FlipIn = {
  type: 'FlipIn';
  direction?: 'vertical' | 'horizontal';
  angle?: number;
  perspective?: number;
};
export type FloatIn = {
  type: 'FloatIn';
  from?: EffectFourDirections;
};
export type FoldIn = {
  type: 'FoldIn';
  pivot?: EffectFourDirections;
  angle?: number;
  perspective?: number;
};
export type SlideIn = {
  type: 'SlideIn';
  from?: EffectFourDirections;
  start?: number;
};
export type SpinIn = {
  type: 'SpinIn';
  spins?: number;
  direction?: 'clockwise' | 'counter-clockwise';
  scale?: number;
};
export type BounceIn = {
  type: 'BounceIn';
  from?: EffectFourDirections | 'back';
  travel?: LengthInput;
  perspective?: number;
};
export type GlideIn = {
  type: 'GlideIn';
  from?: number | string;
  travel?: LengthInput;
};
export type TurnIn = {
  type: 'TurnIn';
  pivot?: EffectFourCorners;
};
export type WinkIn = {
  type: 'WinkIn';
  direction?: 'vertical' | 'horizontal';
};
export type TiltIn = {
  type: 'TiltIn';
  from?: EffectTwoSides;
  depth?: LengthInput;
  perspective?: number;
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
export type RevealIn = {
  type: 'RevealIn';
  from?: EffectFourDirections;
};
export type BlurIn = {
  type: 'BlurIn';
  blur?: number;
};

export type ExpandIn = {
  type: 'ExpandIn';
  from?: number | string;
  travel?: LengthInput;
  scale?: number;
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
  direction?: 'vertical' | 'horizontal' | 'center';
  travel?: LengthInput;
  perspective?: number;
  iterationDelay?: number;
};
export type Pulse = {
  type: 'Pulse';
  scale?: number;
  iterationDelay?: number;
};
export type Spin = {
  type: 'Spin';
  direction?: 'clockwise' | 'counter-clockwise';
  iterationDelay?: number;
};
export type Poke = {
  type: 'Poke';
  direction?: EffectFourDirections;
  travel?: LengthInput;
  iterationDelay?: number;
};
export type Flash = { type: 'Flash'; iterationDelay?: number };
export type Swing = {
  type: 'Swing';
  angle?: number;
  pivot?: EffectFourDirections;
  iterationDelay?: number;
};
export type Flip = {
  type: 'Flip';
  direction?: 'vertical' | 'horizontal';
  perspective?: number;
  iterationDelay?: number;
};
export type Rubber = {
  type: 'Rubber';
  stretch?: number;
  iterationDelay?: number;
};
export type Fold = {
  type: 'Fold';
  pivot?: EffectFourDirections;
  angle?: number;
  perspective?: number;
  iterationDelay?: number;
};
export type Jello = {
  type: 'Jello';
  skew?: number;
  iterationDelay?: number;
};
export type Wiggle = {
  type: 'Wiggle';
  angle?: number;
  travel?: LengthInput;
  iterationDelay?: number;
};
export type Bounce = {
  type: 'Bounce';
  travel?: LengthInput;
  iterationDelay?: number;
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
  range?: EffectScrollRange;
  perspective?: number;
};
export type BlurScroll = {
  type: 'BlurScroll';
  range?: EffectScrollRange;
  blur?: number;
};
export type FadeScroll = {
  type: 'FadeScroll';
  range?: EffectScrollRange;
  opacity?: number;
};
export type FlipScroll = {
  type: 'FlipScroll';
  direction?: 'vertical' | 'horizontal';
  range?: EffectScrollRange;
  rotate?: number;
  perspective?: number;
};
export type GrowScroll = {
  type: 'GrowScroll';
  direction?: EffectNineDirections;
  range?: EffectScrollRange;
  scale?: number;
  speed?: number;
};
export type MoveScroll = {
  type: 'MoveScroll';
  angle?: number;
  range?: EffectScrollRange;
  distance?: UnitLengthPercentage;
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
  parallaxFactor?: number;
  range?: EffectScrollRange;
};
export type RevealScroll = {
  type: 'RevealScroll';
  direction?: EffectFourDirections;
  range?: EffectScrollRange;
};
export type ShapeScroll = {
  type: 'ShapeScroll';
  shape?: 'circle' | 'ellipse' | 'rectangle' | 'diamond' | 'window';
  range?: EffectScrollRange;
  intensity?: number;
};
export type ShrinkScroll = {
  type: 'ShrinkScroll';
  direction?: EffectNineDirections;
  range?: EffectScrollRange;
  scale?: number;
  speed?: number;
};
export type ShuttersScroll = {
  type: 'ShuttersScroll';
  direction?: EffectFourDirections;
  shutters?: number;
  staggered?: boolean;
  range?: EffectScrollRange;
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
  range?: EffectScrollRange;
  rotate?: number;
  speed?: number;
  perspective?: number;
};
export type SpinScroll = {
  type: 'SpinScroll';
  direction?: 'clockwise' | 'counter-clockwise';
  spins?: number;
  range?: EffectScrollRange;
  scale?: number;
};
export type StretchScroll = {
  type: 'StretchScroll';
  range?: EffectScrollRange;
  stretch?: number;
};
export type TiltScroll = {
  type: 'TiltScroll';
  direction?: EffectTwoSides;
  range?: EffectScrollRange;
  parallaxFactor?: number;
  perspective?: number;
};
export type TurnScroll = {
  type: 'TurnScroll';
  direction?: EffectTwoSides;
  spin?: 'clockwise' | 'counter-clockwise';
  range?: EffectScrollRange;
  scale?: number;
  rotation?: number;
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
  depth?: number;
};
export type BgFade = {
  type: 'BgFade';
  range?: 'in' | 'out';
};
export type BgFadeBack = {
  type: 'BgFadeBack';
  scale?: number;
};
export type BgFake3D = {
  type: 'BgFake3D';
  scaleY?: number;
  depth?: number;
};
export type BgPan = {
  type: 'BgPan';
  direction?: 'left' | 'right';
  speed?: number;
};
export type BgParallax = {
  type: 'BgParallax';
  speed?: number;
};
export type BgPullBack = {
  type: 'BgPullBack';
  depth?: number;
};
export type BgReveal = { type: 'BgReveal' };
export type BgRotate = {
  type: 'BgRotate';
  direction?: 'counter-clockwise' | 'clockwise';
  angle?: number;
};
export type BgSkew = {
  type: 'BgSkew';
  direction?: 'counter-clockwise' | 'clockwise';
  angle?: number;
};
export type BgZoom = {
  type: 'BgZoom';
  direction?: 'in' | 'out';
  depth?: number;
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
  travel?: LengthInput;
  direction?: MouseEffectAxis;
  angle?: number;
};
export type BlobMouse = MouseEffectBase & {
  type: 'BlobMouse';
  travel?: LengthInput;
  scale?: number;
};
export type BlurMouse = MouseEffectBase & {
  type: 'BlurMouse';
  travel?: LengthInput;
  angle?: number;
  scale?: number;
  blur?: number;
  perspective?: number;
};
export type BounceMouse = MouseEffectBase & {
  type: 'BounceMouse';
  travel?: LengthInput;
  direction?: MouseEffectAxis;
};
export type ScaleMouse = MouseEffectBase & {
  type: 'ScaleMouse';
  travel?: LengthInput;
  direction?: MouseEffectAxis;
  scale?: number;
};
export type SkewMouse = MouseEffectBase & {
  type: 'SkewMouse';
  travel?: LengthInput;
  angle?: number;
  direction?: MouseEffectAxis;
};
export type SpinMouse = MouseEffectBase & {
  type: 'SpinMouse';
  direction?: MouseEffectAxis;
};
export type SwivelMouse = MouseEffectBase & {
  type: 'SwivelMouse';
  angle?: number;
  perspective?: number;
  pivot?: MousePivotAxis;
};
export type Tilt3DMouse = MouseEffectBase & {
  type: 'Tilt3DMouse';
  angle?: number;
  perspective?: number;
};
export type Track3DMouse = MouseEffectBase & {
  type: 'Track3DMouse';
  travel?: LengthInput;
  angle?: number;
  direction?: MouseEffectAxis;
  perspective?: number;
};
export type TrackMouse = MouseEffectBase & {
  type: 'TrackMouse';
  travel?: LengthInput;
  direction?: MouseEffectAxis;
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
