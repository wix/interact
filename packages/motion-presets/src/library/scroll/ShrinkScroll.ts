import type { AnimationData, ScrubAnimationOptions, ShrinkScroll, DomApi } from '../../types';
import { EPSILON, NINE_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { axisDirection, toMotionRange } from '../../directions';
import { getScrollParallax } from '../../parallaxUtils';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  getMotionScale,
  getMotionTransRot,
  getMotionLayoutRotation,
  pivotToTransformOrigin,
  mergeTransformLayers,
} from '../../transformUtils';
import { compareKeywordToNonDefaults, parseKeywordLazy, roundNumber } from '../../utils';

const DIRECTION = 'vertical';

const DEFAULTS: Required<ShrinkScroll> = {
  type: 'ShrinkScroll',
  pivot: 'center',
  range: 'in',
  scale: 1.2,
  speed: 1,
};

export const schema = {
  pivot: { type: 'enum', values: NINE_DIRECTIONS, default: DEFAULTS.pivot },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames(options: ScrubAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ShrinkScroll>;
  const { scale: inputScale = DEFAULTS.scale, speed = DEFAULTS.speed } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);
  const transformOrigin = pivotToTransformOrigin(
    parseKeywordLazy(namedEffect!.pivot, NINE_DIRECTIONS, DEFAULTS.pivot),
  );

  const isIn = !compareKeywordToNonDefaults(namedEffect!.range, ['out', 'continuous']);

  // ShrinkScroll always goes down in scale, so scale should be bigger than 1 for 'in' and smaller than 1 otherwise
  // in case the scale is not in the correct range, we take its inverse
  const invScale = roundNumber(1 / Math.max(inputScale, EPSILON), 4);
  const scale = isIn ? Math.max(inputScale, invScale) : Math.min(inputScale, invScale);

  // parallax is a directional motion, so it continues through 'continuous' while the scale goes back and forth
  const parallaxOptions = {
    ...options,
    namedEffect: { ...namedEffect, parallax: { speed } },
  } as ScrubAnimationOptions;
  const scaleOptions = {
    ...options,
    namedEffect: { ...namedEffect, scale },
  } as ScrubAnimationOptions;

  const parallaxOverrides = getScrollOverrides(options, range, getLinearScrollEasing(range, true));
  const scaleOverrides = getScrollOverrides(options, range, getLinearScrollEasing(range, false));
  const motionRange = toMotionRange(axisDirection, DIRECTION, range);

  return withSharedScrollRange([
    {
      ...parallaxOptions,
      ...parallaxOverrides,
      ...getMotionTransRot(
        motionRange,
        { parallax: getScrollParallax(range, parallaxOverrides, speed), transformOrigin },
        asWeb,
        suffix,
      ),
    },
    {
      ...parallaxOptions,
      composite: 'add',
      ...scaleOverrides,
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...scaleOptions,
      ...scaleOverrides,
      ...getMotionScale(motionRange, { scale, transformOrigin }, asWeb, suffix),
    },
  ]);
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
