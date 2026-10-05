import type { AnimationDataForScrub } from '@wix/motion';
import type {
  AnimationData,
  AnimationOptions,
  EffectFourCorners,
  EffectFourDirections,
  EffectNineDirections,
  EffectScrollRange,
  EffectSpinDirection,
  EffectTwoAxes,
  LengthInput,
  LengthValue,
  NamedEffect,
} from './types';
import type { LoopShape } from './easingUtils';
import {
  CENTER_AND_FOUR_DIRECTIONS,
  FOUR_CORNERS_DIRECTIONS,
  NINE_DIRECTIONS,
  SCROLL_RANGES,
} from './consts';
import type { DirectionKind } from './directions';
import { parseKeywordLazy, parseLengthLazy } from './utils';

// what differs between the scroll, entrance and ongoing presets - each group is its own module
export type PresetGroup = {
  name: 'scroll' | 'entrance' | 'ongoing';
  getOverrides(
    options: AnimationOptions,
    range: EffectScrollRange,
    easingOptions: EasingParsingOptions,
    directional: boolean,
  ): Partial<AnimationDataForScrub>;
  applyParallax?(
    params: { parallax?: unknown; [key: string]: unknown },
    range: EffectScrollRange,
    overrides: Partial<AnimationDataForScrub>,
  ): void;
};

// the resolved direction of a directional preset
// fromSign / toSign - the sign of the motion at the start / end keyframe (0 = rest)
// movementAngle - the 2d direction of the motion as a css angle
export type MotionRange = {
  fromSign: 1 | -1;
  toSign: 0 | 1 | -1;
  movementAngle: string;
  vertical: boolean;
};

type SpinParsingOptions = {
  directionType: DirectionKind<EffectSpinDirection>;
  defaultDirection?: EffectSpinDirection;
};

type AxisParsingOptions = {
  directionType: DirectionKind<EffectTwoAxes>;
  defaultDirection?: EffectTwoAxes;
};

type FourSidesParsingOptions = {
  directionType: DirectionKind<EffectFourDirections>;
  defaultDirection?: EffectFourDirections;
};

type AngleParsingOptions = {
  directionType: DirectionKind<number>;
  defaultDirection?: number;
};

type DirectionParsingOptions =
  | AxisParsingOptions
  | FourSidesParsingOptions
  | AngleParsingOptions
  | SpinParsingOptions;

// pivots - the pivot keywords the preset accepts
type PivotSideParsingOptions = {
  pivots: typeof CENTER_AND_FOUR_DIRECTIONS;
  defaultPivot?: EffectFourDirections | 'center';
};

type PivotCornerParsingOptions = {
  pivots: typeof FOUR_CORNERS_DIRECTIONS;
  defaultPivot?: EffectFourCorners;
};

type PivotAllParsingOptions = {
  pivots?: typeof NINE_DIRECTIONS;
  defaultPivot?: EffectNineDirections;
};

type PivotParsingOptions =
  | PivotSideParsingOptions
  | PivotCornerParsingOptions
  | PivotAllParsingOptions;

type DepthParsingOptions = { defaultDepth?: LengthValue };
type TravelParsingOptions = { defaultTravel?: LengthValue };
type ScrollRangeParsingOptions = { defaultRange?: EffectScrollRange };

// the preset's own easings - scroll ignores the user's easing and ongoing replaces it with its loop
export type EasingParsingOptions = {
  easing?: string;
  outEasing?: string;
  continuousEasing?: string;
  continuousHold?: number;
  // ongoing: the motion of a single iteration (see getLoopEasing)
  loop?: LoopShape;
};

type PresetParsingOptions = DirectionParsingOptions &
  DepthParsingOptions &
  TravelParsingOptions &
  ScrollRangeParsingOptions &
  PivotParsingOptions &
  EasingParsingOptions;

const SCROLL_RANGE_KEYS = ['startOffset', 'endOffset', 'startOffsetAdd', 'endOffsetAdd'] as const;

function resolveGroupOverrides(
  options: AnimationOptions,
  group: PresetGroup,
  defaultRange: EffectScrollRange = 'in',
  easingOptions: EasingParsingOptions = {},
  directional: boolean = false,
) {
  const namedEffect = options.namedEffect as NamedEffect & { range?: EffectScrollRange };
  const range = parseKeywordLazy<EffectScrollRange>(namedEffect.range, SCROLL_RANGES, defaultRange);
  return { range, overrides: group.getOverrides(options, range, easingOptions, directional) };
}

export function getFillOverrides(options: AnimationOptions, range: EffectScrollRange) {
  const defaultFill = range === 'out' ? 'forwards' : range === 'continuous' ? 'both' : 'backwards';
  const { fill = defaultFill } = options;
  return range === 'out' ? { fill, reversed: !options.reversed } : { fill };
}

function pivotToTransformOrigin(pivot: string) {
  return {
    x: pivot.includes('left') ? '-50%' : pivot.includes('right') ? '50%' : '0px',
    y: pivot.includes('top') ? '-50%' : pivot.includes('bottom') ? '50%' : '0px',
  };
}

function normalizePresetParams(
  namedEffect: NamedEffect & {
    depth?: LengthInput;
    pivot?: EffectNineDirections;
    travel?: LengthInput;
    toTravel?: LengthInput;
  },
  options: DepthParsingOptions & TravelParsingOptions & PivotParsingOptions,
) {
  const { depth, travel, toTravel, pivot } = namedEffect;
  const {
    defaultDepth = { value: 0, unit: 'px' },
    defaultPivot = 'center',
    defaultTravel = { value: 0, unit: 'px' },
    pivots = NINE_DIRECTIONS,
  } = options;

  return {
    ...namedEffect,
    depth: parseLengthLazy(depth, defaultDepth),
    transformOrigin: pivotToTransformOrigin(parseKeywordLazy(pivot, pivots, defaultPivot)),
    travel: parseLengthLazy(travel, defaultTravel),
    toTravel: toTravel === undefined ? undefined : parseLengthLazy(toTravel, defaultTravel),
  };
}

// makes all animations span the scroll range of the first one, e.g. a range widened by parallax
export function withSharedScrollRange(animations: AnimationData[]) {
  const [source, ...rest] = animations as Partial<AnimationDataForScrub>[];
  const range = Object.fromEntries(
    SCROLL_RANGE_KEYS.filter((key) => source[key] !== undefined).map((key) => [key, source[key]]),
  );

  return [source, ...rest.map((animation) => ({ ...animation, ...range }))] as AnimationData[];
}

export function useBasicPreset(
  preset: (params: any, asWeb: boolean, suffix: string) => AnimationData,
  options: AnimationOptions,
  group: PresetGroup,
  asWeb: boolean = true,
  suffix: string = '',
  parsingOptions: ScrollRangeParsingOptions & EasingParsingOptions = {},
): AnimationData {
  const namedEffect = options.namedEffect as NamedEffect & { range?: EffectScrollRange };
  const { overrides } = resolveGroupOverrides(
    options,
    group,
    parsingOptions.defaultRange,
    parsingOptions,
  );

  return { ...options, ...overrides, ...preset(namedEffect, asWeb, suffix) };
}

export function useDirectionalPresetAsBasic(
  preset: (motionRange: MotionRange, params: any, asWeb: boolean, suffix: string) => AnimationData,
  options: AnimationOptions,
  group: PresetGroup,
  parsingOptions: ScrollRangeParsingOptions & PivotParsingOptions & EasingParsingOptions,
  asWeb: boolean = true,
  suffix: string = '',
): AnimationData {
  const namedEffect = options.namedEffect as NamedEffect;
  const { range, overrides } = resolveGroupOverrides(
    options,
    group,
    parsingOptions.defaultRange,
    parsingOptions,
  );

  const motionRange: MotionRange = {
    fromSign: -1,
    toSign: 0,
    movementAngle: '90deg',
    vertical: true,
  };

  const params = normalizePresetParams(namedEffect, parsingOptions);
  group.applyParallax?.(params, range, overrides);

  return {
    ...options,
    ...overrides,
    ...preset(motionRange, params, asWeb, suffix),
  };
}

export function useDirectionalPreset(
  preset: (motionRange: MotionRange, params: any, asWeb: boolean, suffix: string) => AnimationData,
  options: AnimationOptions,
  group: PresetGroup,
  parsingOptions: PresetParsingOptions,
  asWeb: boolean = true,
  suffix: string = '',
): AnimationData {
  const namedEffect = options.namedEffect as NamedEffect & {
    direction?: number | string;
    from?: number | string;
  };

  const { directionType: kind, defaultRange = 'in' } = parsingOptions;
  const parse = (direction: number | string | undefined) =>
    kind.parse(direction, parsingOptions.defaultDirection as never);

  const { range, overrides } = resolveGroupOverrides(
    options,
    group,
    defaultRange,
    parsingOptions,
    true,
  );

  // range out is opposite direction reversed
  // entrance starts at the 'from' side, ongoing moves first towards its direction (the keyframes start at their peak)
  const direction =
    !kind.sided || group.name === 'scroll'
      ? range === 'out'
        ? kind.opposite(parse(namedEffect.direction))
        : parse(namedEffect.direction)
      : kind.opposite(parse(group.name === 'ongoing' ? namedEffect.direction : namedEffect.from));

  const fromSign: 1 | -1 =
    direction === 'left' || direction === 'top' || direction === 'counter-clockwise' ? 1 : -1;
  const toSign: 1 | -1 | 0 = range === 'continuous' ? (-fromSign as 1 | -1) : 0;

  const vertical = direction === 'vertical' || direction === 'top' || direction === 'bottom';
  const movementAngle = kind.movementAngle(direction);

  const motionRange: MotionRange = { fromSign, toSign, vertical, movementAngle };

  const params = normalizePresetParams(namedEffect, parsingOptions);
  group.applyParallax?.(params, range, overrides);
  // 'out' is the reversed 'in' of the opposite direction, so its travel is the one towards the original direction
  if (range === 'out' && params.toTravel !== undefined) {
    [params.travel, params.toTravel] = [params.toTravel, params.travel];
  }

  return {
    ...options,
    ...overrides,
    ...preset(motionRange, params, asWeb, suffix),
  };
}
