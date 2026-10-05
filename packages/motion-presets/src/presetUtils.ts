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
  AXIS_DIRECTIONS,
  FOUR_CORNERS_DIRECTIONS,
  FOUR_DIRECTIONS,
  NINE_DIRECTIONS,
  SCROLL_RANGES,
  SPIN_DIRECTIONS,
} from './consts';
import { CSS_CALC_REGEX, parseKeywordLazy, parseLengthLazy, stripCalc } from './utils';

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
  directionType?: 'spin';
  defaultDirection?: EffectSpinDirection;
};

type AxisParsingOptions = {
  directionType?: 'axis';
  defaultDirection?: EffectTwoAxes;
};

type FourSidesParsingOptions = {
  directionType?: 'four-sides';
  defaultDirection?: EffectFourDirections;
};

type AngleParsingOptions = {
  directionType?: 'angle';
  defaultDirection?: number;
};

type DirectionParsingOptions =
  | AxisParsingOptions
  | FourSidesParsingOptions
  | AngleParsingOptions
  | SpinParsingOptions;

type PivotSideParsingOptions = {
  pivotType?: 'four-sides';
  defaultPivot?: EffectFourDirections | 'center';
};

type PivotCornerParsingOptions = {
  pivotType?: 'four-corners';
  defaultPivot?: EffectFourCorners;
};

type PivotAllParsingOptions = {
  pivotType?: 'all';
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

const CSS_ANGLE_REGEX = /^(-?\d*\.?\d+)(deg|rad|grad|turn)$/;

const SCROLL_RANGE_KEYS = ['startOffset', 'endOffset', 'startOffsetAdd', 'endOffsetAdd'] as const;

// the axis of each side - the side's sign is MotionRange.fromSign
const DIRECTION_2D_MAP = {
  top: '90deg',
  left: '0deg',
  bottom: '90deg',
  right: '0deg',
  vertical: '90deg',
  horizontal: '0deg',
};

function parseDirectionAngle(direction: number | string | undefined, defaultValue: number) {
  if (typeof direction === 'number') {
    return `${direction}deg`;
  }

  if (typeof direction === 'string') {
    const trimmed = direction.trim().toLowerCase();
    if (CSS_ANGLE_REGEX.test(trimmed) || CSS_CALC_REGEX.test(trimmed)) {
      return trimmed;
    }
    if (trimmed && !isNaN(Number(trimmed))) {
      return `${Number(trimmed)}deg`;
    }
  }

  return `${defaultValue}deg`;
}

function parseDirectionForPreset(
  direction: number | string | undefined,
  options: DirectionParsingOptions,
) {
  const { directionType = 'axis', defaultDirection } = options;
  if (directionType === 'axis') {
    return parseKeywordLazy(
      direction,
      AXIS_DIRECTIONS,
      (defaultDirection || 'vertical') as EffectTwoAxes,
    );
  }
  if (directionType === 'spin') {
    return parseKeywordLazy(
      direction,
      SPIN_DIRECTIONS,
      (defaultDirection || 'clockwise') as EffectSpinDirection,
    );
  }
  if (directionType === 'four-sides') {
    return parseKeywordLazy(
      direction,
      FOUR_DIRECTIONS,
      (defaultDirection || 'right') as EffectFourDirections,
    );
  }
  return (
    parseKeywordLazy(direction, FOUR_DIRECTIONS, '') ||
    parseDirectionAngle(direction, (defaultDirection || 0) as number)
  );
}

export function oppositeDirection(
  direction: string,
  type: DirectionParsingOptions['directionType'],
) {
  if (type === 'axis') {
    return direction;
  }
  if (type === 'spin') {
    const index = SPIN_DIRECTIONS.findIndex((d) => d === direction);
    return SPIN_DIRECTIONS[(index + 1) % 2];
  }
  if (type === 'four-sides') {
    const index = FOUR_DIRECTIONS.findIndex((d) => d === direction);
    return FOUR_DIRECTIONS[(index + 2) % 4];
  }
  const index = FOUR_DIRECTIONS.findIndex((d) => d === direction);
  if (index !== -1) {
    return FOUR_DIRECTIONS[(index + 2) % 4];
  }
  return `calc(180deg + ${stripCalc(direction)})`;
}

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
    pivotType = 'all',
  } = options;

  const pivotKeywords =
    pivotType === 'all'
      ? NINE_DIRECTIONS
      : pivotType === 'four-corners'
        ? FOUR_CORNERS_DIRECTIONS
        : ['center', ...FOUR_DIRECTIONS];

  return {
    ...namedEffect,
    depth: parseLengthLazy(depth, defaultDepth),
    transformOrigin: pivotToTransformOrigin(parseKeywordLazy(pivot, pivotKeywords, defaultPivot)),
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

  const { directionType = 'axis', defaultRange = 'in' } = parsingOptions;

  const { range, overrides } = resolveGroupOverrides(
    options,
    group,
    defaultRange,
    parsingOptions,
    true,
  );

  // range out is opposite direction reversed
  // entrance starts at the 'from' side, ongoing moves first towards its direction (the keyframes start at their peak)
  const isSided = directionType !== 'axis' && directionType !== 'spin';
  const direction =
    !isSided || group.name === 'scroll'
      ? range === 'out'
        ? oppositeDirection(
            parseDirectionForPreset(namedEffect.direction, parsingOptions),
            directionType,
          )
        : parseDirectionForPreset(namedEffect.direction, parsingOptions)
      : oppositeDirection(
          parseDirectionForPreset(
            group.name === 'ongoing' ? namedEffect.direction : namedEffect.from,
            parsingOptions,
          ),
          directionType,
        );

  const fromSign: 1 | -1 =
    direction === 'left' || direction === 'top' || direction === 'counter-clockwise' ? 1 : -1;
  const toSign: 1 | -1 | 0 = range === 'continuous' ? (-fromSign as 1 | -1) : 0;

  const vertical = direction === 'vertical' || direction === 'top' || direction === 'bottom';
  const movementAngle =
    parsingOptions.directionType === 'spin'
      ? '0deg'
      : DIRECTION_2D_MAP[direction as EffectFourDirections | EffectTwoAxes] || direction;

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
