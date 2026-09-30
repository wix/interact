import type { AnimationDataForScrub } from '@wix/motion';
import { cssEasings, getJsEasing as parseJsEasing, jsEasings } from '@wix/motion';
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
  Point,
  RangeOffset,
  ScrubAnimationOptions,
  ScrubTransitionEasing,
  TimeAnimationOptions,
} from './types';
import {
  AXIS_DIRECTIONS,
  FOUR_CORNERS_DIRECTIONS,
  FOUR_DIRECTIONS,
  NINE_DIRECTIONS,
  SCROLL_RANGES,
  SPIN_DIRECTIONS,
} from './consts';

/**
 * Map a value from one range 'a' to different range 'b'
 */
export function mapRange(
  sourceMin: number,
  sourceMax: number,
  targetMin: number,
  targetMax: number,
  num: number,
): number {
  return ((num - sourceMin) * (targetMax - targetMin)) / (sourceMax - sourceMin) + targetMin;
}

export function distance2d([x1, y1]: Point, [x2, y2]: Point): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function getAngleInDeg(p1: Point = [0, 0], p2: Point = [0, 0], offset: number = 0): number {
  const angle = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI;
  return (360 + offset + angle) % 360;
}

export function getCssUnits(unit: 'percentage' | string) {
  return unit === 'percentage' ? '%' : unit || 'px';
}

export function getEasing(easing?: keyof typeof cssEasings | string): string {
  return easing ? cssEasings[easing as keyof typeof cssEasings] || easing : cssEasings.linear;
}

export function getJsEasing(
  easing?: keyof typeof jsEasings | string,
): ((t: number) => number) | undefined {
  return easing ? jsEasings[easing as keyof typeof jsEasings] : undefined;
}

const CSS_EASING_KEYWORDS: Record<string, string> = {
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
  'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
};
const CUBIC_BEZIER_REGEX = /^cubic-bezier\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)$/;
const EASING_SAMPLES = 16;

type EasingFunction = (t: number) => number;

// named easing or css keyword -> css easing function
function toCssEasing(easing?: string) {
  const css = getEasing(easing);
  return CSS_EASING_KEYWORDS[css] || css;
}

function toEasingFunction(css: string): EasingFunction {
  return css === 'linear' ? (t) => t : parseJsEasing(css)!;
}

// linear() approximation of consecutive [start, end, easing] segments (gaps between segments hold their value)
function toLinearEasing(segments: [number, number, EasingFunction][], samples: number) {
  const points = segments.flatMap(([start, end, easing]) =>
    Array.from({ length: samples + 1 }, (_, i) => {
      const t = i / samples;
      return `${roundNumber(easing(t), 4)} ${roundNumber((start + t * (end - start)) * 100, 2)}%`;
    }),
  );
  return `linear(${points.join(', ')})`;
}

// css linear() easing from [output, input percentage] points
export function linearEasing(points: [number, number][]) {
  return `linear(${points.map(([value, percentage]) => `${value} ${percentage}%`).join(', ')})`;
}

// the easing that looks the same when its animation is played backwards
export function mirrorEasing(easing?: string) {
  const css = toCssEasing(easing);
  if (css === 'linear') {
    return css;
  }

  const bezier = css.match(CUBIC_BEZIER_REGEX);
  if (bezier) {
    const [x1, y1, x2, y2] = bezier.slice(1).map(Number);
    return `cubic-bezier(${[1 - x2, 1 - y2, 1 - x1, 1 - y1].map((n) => roundNumber(n, 4)).join(', ')})`;
  }

  const ease = toEasingFunction(css);
  return toLinearEasing([[0, 1, (t) => 1 - ease(1 - t)]], EASING_SAMPLES);
}

// continuous = in + out: the in-motion over the first half, the out-motion over the second
// directional motion continues through its rest state, non-directional motion goes back to where it started
// hold keeps the rest state for that fraction of the range in the middle
export function getContinuousEasing(
  easing: string | undefined,
  outEasing: string | undefined,
  directional: boolean,
  hold: number = 0,
) {
  const inCss = toCssEasing(easing);
  const outCss = outEasing === undefined ? undefined : toCssEasing(outEasing);
  const isLinear = inCss === 'linear' && (outCss === undefined || outCss === 'linear');
  if (directional && isLinear && !hold) {
    return 'linear';
  }

  const easeIn = toEasingFunction(inCss);
  // by default the out-motion is the in-motion reversed
  const easeOut = outCss ? toEasingFunction(outCss) : (t: number) => 1 - easeIn(1 - t);
  const move = (1 - hold) / 2;

  return toLinearEasing(directional
    ? [[0, move, (t) => easeIn(t) / 2], [1 - move, 1, (t) => (1 + easeOut(t)) / 2]]
    : [[0, move, easeIn], [1 - move, 1, (t) => 1 - easeOut(t)]],
  isLinear ? 1 : EASING_SAMPLES);
}

// a loop's motion as [value, time] points: 1 = the peak (the start of the preset's keyframes), 0 = rest,
// -1 = the opposite peak, values in between scale the motion. Times are a fraction of the duration, from 0 to 1.
// easings apply per segment between points, the last one repeating for the rest of the segments
export type LoopPoint = [number, number];
export type LoopShape = { shape: LoopPoint[]; easings?: string[] };

// the part of an ongoing iteration the motion takes - the rest of it is the iteration delay
export function getActiveFraction(options: AnimationOptions) {
  const duration = (options as TimeAnimationOptions).duration || 1;
  const { iterationDelay = 0 } = (options.namedEffect || {}) as NamedEffect & { iterationDelay?: number };
  return duration / (duration + iterationDelay);
}

// linear() easing for a loop on keyframes that pass through rest (continuous keyframes) at progress `rest`:
// from rest to the start of the keyframes, wrapping around to their end and back to rest, at a constant speed
export function getWrapEasing(rest: number, activeFraction: number = 1) {
  const r = roundNumber(rest, 4);
  const wrap = roundNumber(rest * activeFraction * 100, 2);
  const end = roundNumber(activeFraction * 100, 2);
  return `linear(${r} 0%, 0 ${wrap}%, 1 ${wrap}%, ${r} ${end}%${activeFraction < 1 ? `, ${r} 100%` : ''})`;
}

// linear() easing for a loop on keyframes that go from the peak to rest, with a trailing hold at rest
// activeFraction - the part of the iteration the motion takes (the rest is the iteration delay)
export function getLoopEasing({ shape, easings = ['linear'] }: LoopShape, activeFraction: number = 1) {
  const segments = shape.slice(1).map(([value, time], i) => {
    const [fromValue, fromTime] = shape[i];
    const ease = toEasingFunction(toCssEasing(easings[Math.min(i, easings.length - 1)]));
    return [fromTime * activeFraction, time * activeFraction, (t: number) => 1 - fromValue - (value - fromValue) * ease(t)] as [
      number, number, EasingFunction,
    ];
  });
  const isLinear = easings.every((easing) => toCssEasing(easing) === 'linear');
  const easing = toLinearEasing(segments, isLinear ? 1 : EASING_SAMPLES);
  // the iteration delay holds the rest state
  return activeFraction < 1 ? easing.replace(/\)$/, ', 1 100%)') : easing;
}

// scroll animations use only the preset's easing, applied per range to keep in + out = continuous
// easing - the visual easing of the in-motion
// outEasing - the visual easing of the out-motion (defaults to the in-motion reversed)
// continuousEasing - the in-half of continuous (defaults to easing), the out-half uses outEasing
function resolveScrollEasing(range: EffectScrollRange, directional: boolean, parsingOptions: EasingParsingOptions) {
  const { easing, outEasing, continuousEasing = easing, continuousHold } = parsingOptions;
  if (range === 'in') {
    return toCssEasing(easing);
  }
  if (range === 'out') {
    // 'out' is played reversed, so its visual easing is mirrored
    return outEasing ? mirrorEasing(outEasing) : toCssEasing(easing);
  }
  return getContinuousEasing(continuousEasing, outEasing, directional, continuousHold);
}

export function getEasingFamily(easing: string) {
  if (!cssEasings[easing as keyof typeof cssEasings]) {
    return {
      in: easing,
      inOut: easing,
      out: easing,
    };
  }

  const ease = easing.replace(/In|Out/g, '');
  if (ease === 'linear') {
    return {
      in: `linear`,
      inOut: `linear`,
      out: `linear`,
    };
  }

  return {
    in: `${ease}In`,
    inOut: `${ease}InOut`,
    out: `${ease}Out`,
  };
}

const MOUSE_TRANSITION_EASING_MAP: Record<ScrubTransitionEasing, string> = {
  linear: 'linear',
  easeOut: 'ease-out',
  hardBackOut: 'cubic-bezier(0.58, 2.5, 0, 0.95)',
  elastic:
    'linear( 0, 0.2178 2.1%, 1.1144 8.49%, 1.2959 10.7%, 1.3463 11.81%, 1.3705 12.94%, 1.3726, 1.3643 14.48%, 1.3151 16.2%, 1.0317 21.81%, 0.941 24.01%, 0.8912 25.91%, 0.8694 27.84%, 0.8698 29.21%, 0.8824 30.71%, 1.0122 38.33%, 1.0357, 1.046 42.71%, 1.0416 45.7%, 0.9961 53.26%, 0.9839 57.54%, 0.9853 60.71%, 1.0012 68.14%, 1.0056 72.24%, 0.9981 86.66%, 1 )',
  bounce:
    'linear( 0, 0.0039, 0.0157, 0.0352, 0.0625 9.09%, 0.1407, 0.25, 0.3908, 0.5625, 0.7654, 1, 0.8907, 0.8125 45.45%, 0.7852, 0.7657, 0.7539, 0.75, 0.7539, 0.7657, 0.7852, 0.8125 63.64%, 0.8905, 1 72.73%, 0.9727, 0.9532, 0.9414, 0.9375, 0.9414, 0.9531, 0.9726, 1, 0.9883, 0.9844, 0.9883, 1 )',
};

export function getMouseTransitionEasing(value?: ScrubTransitionEasing) {
  return (value && MOUSE_TRANSITION_EASING_MAP[value]) || 'linear';
}

export function getElementOffset(element: HTMLElement, parent?: HTMLElement) {
  let left = element.offsetLeft;
  let top = element.offsetTop;
  let offsetParent = element.offsetParent as HTMLElement;

  while (offsetParent) {
    if (parent && offsetParent === parent) {
      break;
    }

    left += offsetParent.offsetLeft;
    top += offsetParent.offsetTop;
    offsetParent = offsetParent.offsetParent as HTMLElement;
  }

  return { left, top };
}

export function roundNumber(num: number, precision = 2) {
  return parseFloat(num.toFixed(precision));
}

export function toKeyframeValue(
  custom: Record<string, string | number>,
  key: string,
  useValue: boolean | undefined = false,
  fallback: string | undefined = undefined,
) {
  return useValue ? custom[key] : `var(${key}${fallback !== undefined ? `, ${fallback}` : ''})`;
}

export function declareCustom<K extends string>(
  prefix: string,
  entries: Record<K, [string | number, string]>,
  asWeb: boolean = false,
) {
  const custom: Record<string, string | number> = {};
  const vars = {} as Record<K, string | number>;

  for (const [key, [value, fallback]] of Object.entries(entries) as [K, [string | number, string]][]) {
    const name = `${prefix}-${key}`;
    custom[name] = value;
    vars[key] = toKeyframeValue(custom, name, asWeb, fallback);
  }

  return { custom, vars };
}

export function getTimingFactor(
  duration: number,
  delay: number,
  asString = false,
): number | string {
  const duration_ = duration || 1;
  const delay_ = delay || 0;
  const timingFactor = roundNumber(duration_ / (duration_ + delay_));
  return asString ? timingFactor.toString().replace(/\./g, '') : timingFactor;
}

const CSS_UNIT_REGEX = /^(-?\d*\.?\d+)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/i;

/**
 * Normalize unit string to internal format
 */
function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase();
  return lower === '%' ? 'percentage' : lower;
}

/**
 * Parse length value from number, string, or object format
 * @param input - Number, String (e.g., "100px", "50%", "100"), or object { value, type }
 * @param defaultValue - Fallback value if input is invalid
 * @returns Normalized length object { value, type }
 */
export function parseLength(input: LengthInput, defaultValue: LengthValue): LengthValue {
  if (input === undefined || input === null) {
    return defaultValue;
  }

  // Handle number input - use default unit type
  if (typeof input === 'number') {
    return { value: input, unit: defaultValue.unit };
  }

  // Handle object input { value, unit }
  if (typeof input === 'object' && 'value' in input && 'unit' in input) {
    const value = typeof input.value === 'string' ? parseFloat(input.value) : input.value;
    if (typeof value === 'number' && !isNaN(value) && typeof input.unit === 'string') {
      return { value, unit: normalizeUnit(input.unit) };
    }
    return defaultValue;
  }

  // Handle string input
  if (typeof input === 'string') {
    const trimmed = input.trim();

    // Try parsing as number + unit (e.g., "100px", "50%")
    const match = trimmed.match(CSS_UNIT_REGEX);
    if (match) {
      return { value: parseFloat(match[1]), unit: normalizeUnit(match[2]) };
    }

    // Try parsing as plain number string (e.g., "100", "100.5")
    if (trimmed !== '') {
      const numValue = Number(trimmed);
      if (!isNaN(numValue)) {
        return { value: numValue, unit: defaultValue.unit };
      }
    }
  }

  return defaultValue;
}

export type DirectionKeywords = readonly string[];

/**
 * Parse direction value from keyword, number (degrees), or string with "deg" suffix
 * @param input - String keyword, number, or "45deg" string
 * @param allowedKeywords - Array of valid keyword strings for this preset
 * @param defaultValue - Fallback value if input is invalid
 * @param acceptAngles - Whether to accept numeric angle values (default: false)
 * @returns Normalized direction value (number for angles, string for keywords)
 */
export function parseDirection<T extends string | number>(
  input: string | number | undefined,
  allowedKeywords: DirectionKeywords,
  defaultValue: T,
  acceptAngles = false,
): T {
  if (input === undefined || input === null) {
    return defaultValue;
  }

  if (typeof input === 'number') {
    return acceptAngles ? (input as T) : defaultValue;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();

    // Check if it's a valid keyword
    if (allowedKeywords.includes(trimmed)) {
      return trimmed as T;
    }

    if (acceptAngles) {
      // Check if it's a degree string (e.g., "45deg", "90DEG")
      const degMatch = trimmed.match(/^(-?\d*\.?\d+)deg$/i);
      if (degMatch) {
        return parseFloat(degMatch[1]) as T;
      }

      // Check if it's just a number as string
      if (trimmed !== '') {
        const numValue = Number(trimmed);
        if (!isNaN(numValue)) {
          return numValue as T;
        }
      }
    }
  }

  return defaultValue;
}

/////////////////////////

const CSS_ANGLE_REGEX = /^(-?\d*\.?\d+)(deg|rad|grad|turn)$/;
const CSS_UNIT_REGEX_NO_I = /^(-?\d*\.?\d+)(px|%|em|rem|vw|vh|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/;
export const CSS_CALC_REGEX = /^calc\(.*\)$/;
export const stripCalc = (str: string) => str.replace(/calc/g, '');

const SCROLL_RANGE_COVER_0: RangeOffset = { name: 'cover', offset: { value: 0, unit: 'percentage' } };
const SCROLL_RANGE_COVER_50: RangeOffset = { name: 'cover', offset: { value: 50, unit: 'percentage' } };
const SCROLL_RANGE_COVER_100: RangeOffset = { name: 'cover', offset: { value: 100, unit: 'percentage' } };

export const MOTION_BLUR_NAME = 'motion-blur';
export const MOTION_FADE_NAME = 'motion-fade';

// should not be used to compare direction against preset's default because undefined !== <default>
export function compareKeywordToNonDefaults(direction: string | undefined, compare: string[]) {
  const normalized = direction?.trim().toLowerCase();
  return compare.some((keyword) => normalized === keyword);
};

export function parseLengthLazy(input: LengthInput, defaultValue: LengthValue) {
  const parsedLength = { ...defaultValue };

  if (typeof input === 'number') {
    parsedLength.value = input;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();
    if (CSS_CALC_REGEX.test(trimmed) || CSS_UNIT_REGEX_NO_I.test(trimmed)) {
      return trimmed;
    }
    if (trimmed && !isNaN(Number(trimmed))) {
      parsedLength.value = Number(trimmed);
    }
  }

  if (typeof input === 'object' && input !== null && 'value' in input && 'unit' in input) {
    const value = typeof input.value === 'string' ? parseFloat(input.value) : input.value;
    if (typeof value === 'number' && !isNaN(value) && typeof input.unit === 'string') {
      parsedLength.value = value;
      parsedLength.unit = input.unit.toLowerCase();
    }
  }

  return `${parsedLength.value}${getCssUnits(parsedLength.unit)}`;
};

export function parseKeywordLazy<T extends string>(
  input: string | number | undefined,
  allowedKeywords: readonly string[],
  defaultValue: T,
) {
  if (typeof input === 'string') {
    const trimmed = input.trim().toLowerCase();
    // Check if it's a valid keyword
    if (allowedKeywords.includes(trimmed)) {
      return trimmed as T;
    }
  }
  return defaultValue;
};

function parseScrollRange(
  options: ScrubAnimationOptions<NamedEffect & { range?: EffectScrollRange}>,
  defaultRange: EffectScrollRange = 'in',
) {
  const { namedEffect } = options;
  const range = parseKeywordLazy<EffectScrollRange>(namedEffect!.range, SCROLL_RANGES, defaultRange);

  const {
    startOffset = range === 'out' ? SCROLL_RANGE_COVER_50 : SCROLL_RANGE_COVER_0,
    endOffset = range === 'in' ? SCROLL_RANGE_COVER_50 : SCROLL_RANGE_COVER_100,
  } = options;

  startOffset.name = startOffset.name || 'cover';
  endOffset.name = endOffset.name || startOffset.name;

  startOffset.offset = startOffset.offset || {
    value: range === 'out' && startOffset.name === 'cover' ? 50 : 0,
    unit: 'percentage',
  }
  endOffset.offset = endOffset.offset || {
    value: endOffset.name === 'cover' ? (range === 'in' ? 50 : 100) : 0,
    unit: 'percentage',
  }

  startOffset.offset.unit = startOffset.offset.unit || 'percentage';
  endOffset.offset.unit = endOffset.offset.unit || 'percentage';

  startOffset.offset.value = startOffset.offset.value ??
    (range === 'out' && startOffset.name === 'cover' && startOffset.offset.unit === 'percentage' ? 50 : 0);
  endOffset.offset.value = endOffset.offset.value ??
    (endOffset.name === 'cover' && endOffset.offset.unit === 'percentage' ? (range === 'in' ? 50 : 100) : 0);

  return { range, startOffset, endOffset };
}

function resolveScrollOverrides(
  options: AnimationOptions,
  group: PresetGroup,
  defaultRange?: EffectScrollRange,
  easingOptions: EasingParsingOptions = {},
  directional: boolean = false,
) {
  const { range, startOffset, endOffset } = parseScrollRange(
    options as ScrubAnimationOptions<NamedEffect & { range?: EffectScrollRange }>,
    defaultRange,
  );

  const defaultFill = range === 'out' ? 'forwards' : (range === 'continuous' ? 'both' : 'backwards');
  const { fill = defaultFill } = options;

  const overrides: Partial<AnimationDataForScrub> = group === 'ongoing'
    ? {}
    : (range === 'out' ? { fill, reversed: !options.reversed } : { fill });

  if (group === 'scroll') {
    overrides.easing = resolveScrollEasing(range, directional, easingOptions);
    overrides.startOffset = startOffset;
    overrides.endOffset = endOffset;
  }

  if (group === 'ongoing') {
    // the iteration delay is a hold at rest at the end of each iteration
    const activeFraction = getActiveFraction(options);
    Object.assign(overrides, {
      duration: ((options as TimeAnimationOptions).duration || 1) / activeFraction,
      easing: easingOptions.loop ? getLoopEasing(easingOptions.loop, activeFraction) : 'linear',
    });
  }

  return { range, startOffset, endOffset, overrides };
}

function applyParallaxRange(
  namedEffect: { parallax?: { speed: number; center?: number; range: { startOffset: RangeOffset; endOffset: RangeOffset } } },
  motionRange: MotionRange,
  range: EffectScrollRange,
  startOffset: RangeOffset,
  endOffset: RangeOffset,
) {
  if (!namedEffect.parallax) {
    return;
  }

  motionRange.parallaxReversed = range === 'out';
  namedEffect.parallax.center = namedEffect.parallax.center ?? (range === 'continuous' ? 0.5 : (range === 'out' ? 0 : 1));
  namedEffect.parallax.range = { startOffset, endOffset };
}

export function getMotionFade(
  params: {
    opacity?: number;
  },
  asWeb: boolean = false,
  suffix: string = '',
) {
  const { opacity = 0 } = params;
  const custom = {
    [`--motion-opacity${suffix}`]: opacity,
  };
  const opacity_ = toKeyframeValue(custom, `--motion-opacity${suffix}`, asWeb, '0');

  return {
    name: `${MOTION_FADE_NAME}${suffix}`,
    custom,
    keyframes: [{ offset: 0, opacity: opacity_ }],
  };
}

export function getMotionBlur(
  params: {
    blur?: number;
  },
  asWeb: boolean = false,
  suffix: string = '',
) {
  const { blur = 0 } = params;
  const custom = {
    [`--motion-blur${suffix}`]: `${blur}px`,
  };
  const blur_ = toKeyframeValue(custom, `--motion-blur${suffix}`, asWeb, '0px');

  return {
    name: `${MOTION_BLUR_NAME}${suffix}`,
    composite: 'add' as const,
    custom,
    keyframes: [{ filter: `blur(${blur_})` }, { filter: `blur(0px)` }],
  };
}

const SCROLL_RANGE_KEYS = ['startOffset', 'endOffset', 'startOffsetAdd', 'endOffsetAdd'] as const;

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
) : AnimationData {
  const namedEffect = options.namedEffect as NamedEffect & { range?: EffectScrollRange};
  const { overrides } = resolveScrollOverrides(options, group, parsingOptions.defaultRange, parsingOptions);


  return { ...options, ...overrides, ...preset(namedEffect, asWeb, suffix) };
}

function pivotToTransformOrigin(pivot: string) {
  return {
    x: pivot.includes('left') ? '-50%' : (pivot.includes('right') ? '50%' : '0px'),
    y: pivot.includes('top') ? '-50%' : (pivot.includes('bottom') ? '50%' : '0px'),
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

  const pivotKeywords = pivotType === 'all' ? NINE_DIRECTIONS : (
    pivotType === 'four-corners' ? FOUR_CORNERS_DIRECTIONS : ['center', ...FOUR_DIRECTIONS]
  );

  return {
    ...namedEffect,
    depth: parseLengthLazy(depth, defaultDepth),
    transformOrigin: pivotToTransformOrigin(parseKeywordLazy(pivot, pivotKeywords, defaultPivot)), 
    travel: parseLengthLazy(travel, defaultTravel),
    toTravel: toTravel === undefined ? undefined : parseLengthLazy(toTravel, defaultTravel),
  };
}

export function useDirectionalPresetAsBasic(
  preset: (motionRange: MotionRange, params: any, asWeb: boolean, suffix: string) => AnimationData,
  options: AnimationOptions,
  group: PresetGroup,
  parsingOptions: ScrollRangeParsingOptions & PivotParsingOptions & EasingParsingOptions,
  asWeb: boolean = true,
  suffix: string = '',
) : AnimationData {
  const namedEffect = options.namedEffect as NamedEffect & {
    range?: EffectScrollRange;
    parallax?: { speed: number, center?: number; range: { startOffset: RangeOffset; endOffset: RangeOffset } };
  };
  const { range, startOffset, endOffset, overrides } = resolveScrollOverrides(
    options, group, parsingOptions.defaultRange, parsingOptions,
  );


  const motionRange: MotionRange = {
    fromSign: -1,
    toSign: 0,
    movementAngle: '90deg',
    vertical: true,
  };

  if (group === 'scroll') {
    applyParallaxRange(namedEffect, motionRange, range, startOffset, endOffset);
  }

  return {
    ...options,
    ...overrides,
    ...preset(motionRange, normalizePresetParams(namedEffect, parsingOptions), asWeb, suffix),
  };
}

export type MotionRange = {
	fromSign: 1 | -1;
	toSign: 0 | 1 | -1;
	movementAngle: string; // 2d direction as css angle
  vertical: boolean;
  parallaxReversed?: boolean;
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

type DirectionParsingOptions = AxisParsingOptions | FourSidesParsingOptions | AngleParsingOptions | SpinParsingOptions;

type PivotSideParsingOptions = {
  pivotType?: 'four-sides';
  defaultPivot?: EffectFourDirections | 'center';
}
type PivotCornerParsingOptions = {
  pivotType?: 'four-corners';
  defaultPivot?: EffectFourCorners;
}
type PivotAllParsingOptions = {
  pivotType?: 'all';
  defaultPivot?: EffectNineDirections;
}

type PivotParsingOptions = PivotSideParsingOptions | PivotCornerParsingOptions | PivotAllParsingOptions;

type DepthParsingOptions = { defaultDepth?: LengthValue };
type TravelParsingOptions = { defaultTravel?: LengthValue };
type ScrollRangeParsingOptions = { defaultRange?: EffectScrollRange };
// the preset's own easings for scroll animations (scroll does not use the user's easing)
export type PresetGroup = 'scroll' | 'entrance' | 'ongoing';

type EasingParsingOptions = {
  easing?: string;
  outEasing?: string;
  continuousEasing?: string;
  continuousHold?: number;
  // ongoing: the motion of a single iteration (see getLoopEasing)
  loop?: LoopShape;
};

type PresetParsingOptions = DirectionParsingOptions & DepthParsingOptions & TravelParsingOptions & ScrollRangeParsingOptions & PivotParsingOptions & EasingParsingOptions;

const DIRECTION_2D_MAP = {
  'top': '90deg',
  'left': '0deg',
  'bottom': '90deg',
  'right': '0deg',
  'vertical': '90deg',
  'horizontal': '0deg',
}

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

function parseDirectionForPreset(direction: number | string | undefined, options: DirectionParsingOptions) {
  const { directionType = 'axis', defaultDirection } = options;
  if (directionType === 'axis') {
    return parseKeywordLazy(direction, AXIS_DIRECTIONS, (defaultDirection || 'vertical') as EffectTwoAxes);
  }
  if (directionType === 'spin') {
    return parseKeywordLazy(direction, SPIN_DIRECTIONS, (defaultDirection || 'clockwise') as EffectSpinDirection);
  }
  if (directionType === 'four-sides') {
    return parseKeywordLazy(direction, FOUR_DIRECTIONS, (defaultDirection || 'right') as EffectFourDirections);
  }
  return parseKeywordLazy(direction, FOUR_DIRECTIONS, '') ||
    parseDirectionAngle(direction, (defaultDirection || 0) as number);
}

export function oppositeDirection(direction: string, type: DirectionParsingOptions['directionType']) {
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

export function useDirectionalPreset(
  preset: (
    motionRange: MotionRange,
    params: any,
    asWeb: boolean,
    suffix: string,
  ) => AnimationData,
  options: AnimationOptions,
  group: PresetGroup,
  parsingOptions: PresetParsingOptions,
  asWeb: boolean = true,
  suffix: string = '',
) : AnimationData {
  const namedEffect = options.namedEffect as NamedEffect & {
    direction?: number | string;
    from?: number | string;
    parallax?: { speed: number, center?: number; range: { startOffset: RangeOffset; endOffset: RangeOffset } };
    range?: EffectScrollRange;
  };

  const { directionType = 'axis', defaultRange = 'in' } = parsingOptions;

  const { range, startOffset, endOffset, overrides } = resolveScrollOverrides(
    options, group, defaultRange, parsingOptions, true,
  );

  // range out is opposite direction reversed
  // entrance starts at the 'from' side, ongoing moves first towards its direction (the keyframes start at their peak)
  const isSided = directionType !== 'axis' && directionType !== 'spin';
  const direction = !isSided || group === 'scroll'
    ? (range === 'out'
      ? oppositeDirection(parseDirectionForPreset(namedEffect.direction, parsingOptions), directionType)
      : parseDirectionForPreset(namedEffect.direction, parsingOptions))
    : oppositeDirection(
      parseDirectionForPreset(group === 'ongoing' ? namedEffect.direction : namedEffect.from, parsingOptions),
      directionType,
    );

  const fromSign: 1 | -1 = direction === 'left' || direction === 'top' || direction === 'counter-clockwise' ? 1 : -1;
  const toSign: 1 | -1 | 0 = range === 'continuous' ? (-fromSign as 1 | -1) : 0;

  const vertical = direction === 'vertical' || direction === 'top' || direction === 'bottom';
  const movementAngle = parsingOptions.directionType === 'spin' ? '0deg' :
    DIRECTION_2D_MAP[direction as EffectFourDirections | EffectTwoAxes] || direction;

  const motionRange: MotionRange = { fromSign, toSign, vertical, movementAngle };

  if (group === 'scroll') {
    applyParallaxRange(namedEffect, motionRange, range, startOffset, endOffset);
  }

  const params = normalizePresetParams(namedEffect, parsingOptions);
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

