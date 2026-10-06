import type { AnimationData, ScrubAnimationOptions, Spin3dScroll, DomApi } from '../../types';
import { SCROLL_RANGES } from '../../consts';
import { spinDirection, toMotionRange } from '../../directions';
import { getScrollParallax } from '../../parallaxUtils';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotionLayoutRotation,
} from '../../transformUtils';

const DIRECTION = 'clockwise';

const DEFAULTS: Required<Spin3dScroll> = {
  type: 'Spin3dScroll',
  angle: 100,
  perspective: 1000,
  range: 'in',
  speed: 1,
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_3D_TRANSFORM_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<Spin3dScroll>;
  const {
    angle = DEFAULTS.angle,
    perspective = DEFAULTS.perspective,
    speed = DEFAULTS.speed,
  } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);
  const direction = range === 'out' ? spinDirection.opposite(DIRECTION) : DIRECTION;
  const angleXYZ = { x: angle, y: angle, z: angle };

  const transformOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: angleXYZ,
      direction: DIRECTION,
      perspective,
      parallax: { speed },
    },
  } as ScrubAnimationOptions;

  const overrides = getScrollOverrides(options, range, getLinearScrollEasing(range, true));

  return withSharedScrollRange([
    {
      ...transformOptions,
      ...overrides,
      ...getMotion3dTransform(
        toMotionRange(spinDirection, direction, range),
        { angle: angleXYZ, perspective, parallax: getScrollParallax(range, overrides, speed) },
        asWeb,
        suffix,
      ),
    },
    {
      ...transformOptions,
      composite: 'add',
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, false)),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ]);
}
