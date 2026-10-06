import type { AnimationData, ScrubAnimationOptions, ParallaxScroll, DomApi } from '../../types';
import { axisDirection, toMotionRange } from '../../directions';
import { getScrollParallax } from '../../parallaxUtils';
import { getLinearScrollEasing, getScrollOverrides, withSharedScrollRange } from '../../rangeUtils';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotionLayoutRotation,
} from '../../transformUtils';

const RANGE = 'continuous';
const DIRECTION = 'vertical';

const DEFAULTS: Required<ParallaxScroll> = {
  type: 'ParallaxScroll',
  center: 0.5,
  speed: 0.7159,
};

export const schema = {
  center: { type: 'number', min: 0, max: 1, default: DEFAULTS.center },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ParallaxScroll>;
  const { center = DEFAULTS.center, speed = DEFAULTS.speed } = namedEffect!;
  const transformOptions = {
    ...options,
    namedEffect: { ...namedEffect, parallax: { center, speed }, range: RANGE },
  } as ScrubAnimationOptions;

  const overrides = getScrollOverrides(options, RANGE, getLinearScrollEasing(RANGE, true));

  return withSharedScrollRange([
    {
      ...transformOptions,
      ...overrides,
      ...getMotionTransRot(
        toMotionRange(axisDirection, DIRECTION, RANGE),
        { parallax: getScrollParallax(RANGE, overrides, speed, center) },
        asWeb,
        suffix,
      ),
    },
    {
      ...transformOptions,
      composite: 'add',
      ...getScrollOverrides(options, RANGE, getLinearScrollEasing(RANGE, false)),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ]);
}
