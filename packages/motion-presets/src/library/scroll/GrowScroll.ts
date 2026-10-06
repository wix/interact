import type { AnimationData, GrowScroll, ScrubAnimationOptions, DomApi } from '../../types';
import { NINE_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { axisDirection, toMotionRange } from '../../directions';
import { getScrollParallax } from '../../parallaxUtils';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotionLayoutRotation,
  pivotToTransformOrigin,
} from '../../transformUtils';
import { compareKeywordToNonDefaults, parseKeywordLazy } from '../../utils';

const EPSILON = 0.01;
const DIRECTION = 'vertical';

const DEFAULTS: Required<GrowScroll> = {
  type: 'GrowScroll',
  pivot: 'center',
  range: 'in',
  scale: 0.25,
  speed: 1,
};

export const schema = {
  pivot: { type: 'enum', values: NINE_DIRECTIONS, default: DEFAULTS.pivot },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<GrowScroll>;
  const { scale: inputScale = DEFAULTS.scale, speed = DEFAULTS.speed } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);
  const transformOrigin = pivotToTransformOrigin(
    parseKeywordLazy(namedEffect!.pivot, NINE_DIRECTIONS, DEFAULTS.pivot),
  );

  const isIn = !compareKeywordToNonDefaults(namedEffect!.range, ['out', 'continuous']);

  // GrowScroll always goes up in scale, so scale should be smaller than 1 for 'in' and bigger than 1 otherwise
  // in case the scale is not in the correct range, we take its inverse
  const invScale = 1 / Math.max(inputScale, EPSILON);
  const scale = isIn ? Math.min(inputScale, invScale) : Math.max(inputScale, invScale);

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
