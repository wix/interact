import { getJsEasing as parseJsEasing } from '@wix/motion';
import type {
  AnimationOptions,
  EffectScrollRange,
  NamedEffect,
  TimeAnimationOptions,
} from './types';
import { getEasing, roundNumber } from './utils';

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
export function toCssEasing(easing?: string) {
  const css = getEasing(easing);
  return CSS_EASING_KEYWORDS[css] || css;
}

export function toEasingFunction(css: string): EasingFunction {
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

  return toLinearEasing(
    directional
      ? [
          [0, move, (t) => easeIn(t) / 2],
          [1 - move, 1, (t) => (1 + easeOut(t)) / 2],
        ]
      : [
          [0, move, easeIn],
          [1 - move, 1, (t) => 1 - easeOut(t)],
        ],
    isLinear ? 1 : EASING_SAMPLES,
  );
}

// a loop's motion as [value, time] points: 1 = the peak (the start of the preset's keyframes), 0 = rest,
// -1 = the opposite peak, values in between scale the motion. Times are a fraction of the duration, from 0 to 1.
// easings apply per segment between points, the last one repeating for the rest of the segments
export type LoopPoint = [number, number];
export type LoopShape = { shape: LoopPoint[]; easings?: string[] };

// the part of an ongoing iteration the motion takes - the rest of it is the iteration delay
export function getActiveFraction(options: AnimationOptions) {
  const duration = (options as TimeAnimationOptions).duration || 1;
  const { iterationDelay = 0 } = (options.namedEffect || {}) as NamedEffect & {
    iterationDelay?: number;
  };
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
export function getLoopEasing(
  { shape, easings = ['linear'] }: LoopShape,
  activeFraction: number = 1,
) {
  const segments = shape.slice(1).map(([value, time], i) => {
    const [fromValue, fromTime] = shape[i];
    const ease = toEasingFunction(toCssEasing(easings[Math.min(i, easings.length - 1)]));
    return [
      fromTime * activeFraction,
      time * activeFraction,
      (t: number) => 1 - fromValue - (value - fromValue) * ease(t),
    ] as [number, number, EasingFunction];
  });
  const isLinear = easings.every((easing) => toCssEasing(easing) === 'linear');
  const easing = toLinearEasing(segments, isLinear ? 1 : EASING_SAMPLES);
  // the iteration delay holds the rest state
  return activeFraction < 1 ? easing.replace(/\)$/, ', 1 100%)') : easing;
}

// the preset's own easings of a scroll animation - scroll ignores the user's easing
export type ScrollEasingOptions = {
  easing?: string;
  outEasing?: string;
  continuousEasing?: string;
  continuousHold?: number;
};

// scroll animations use only the preset's easing, applied per range to keep in + out = continuous
// easing - the visual easing of the in-motion
// outEasing - the visual easing of the out-motion (defaults to the in-motion reversed)
// continuousEasing - the in-half of continuous (defaults to easing), the out-half uses outEasing
export function getScrollEasing(
  range: EffectScrollRange,
  directional: boolean,
  easingOptions: ScrollEasingOptions = {},
) {
  const { easing, outEasing, continuousEasing = easing, continuousHold } = easingOptions;
  if (range === 'in') {
    return toCssEasing(easing);
  }
  if (range === 'out') {
    // 'out' is played reversed, so its visual easing is mirrored
    return outEasing ? mirrorEasing(outEasing) : toCssEasing(easing);
  }
  return getContinuousEasing(continuousEasing, outEasing, directional, continuousHold);
}

// an ongoing animation's duration and easing - the iteration delay is a hold at rest at the end of each iteration
export function getLoopOverrides(options: AnimationOptions, loop?: LoopShape) {
  const activeFraction = getActiveFraction(options);
  return {
    duration: ((options as TimeAnimationOptions).duration || 1) / activeFraction,
    easing: loop ? getLoopEasing(loop, activeFraction) : 'linear',
  };
}
