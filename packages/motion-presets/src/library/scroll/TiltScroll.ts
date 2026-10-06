import type { AnimationData, ScrubAnimationOptions, TiltScroll, DomApi } from '../../types';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';
import { spinDirection, toMotionRange } from '../../directions';
import { getScrollEasing } from '../../easingUtils';
import { getScrollParallax } from '../../parallaxUtils';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_TRANS_ROT_NAME,
  MOTION_3D_TRANSFORM_NAME,
  getMotionTransRot,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotionLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';

const [ROTATION_X, ROTATION_Y, ROTATION_Z] = [10, 25, 25];
const ROTATION_Z_EASING = 'sineInOut';

const DEFAULTS: Required<TiltScroll> = {
  type: 'TiltScroll',
  direction: 'counter-clockwise',
  perspective: 400,
  range: 'in',
  speed: 1,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_3D_TRANSFORM_NAME, MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<TiltScroll>;
  const { perspective = DEFAULTS.perspective, speed = DEFAULTS.speed } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);
  const direction = spinDirection.parse(namedEffect!.direction, DEFAULTS.direction);

  // the 3d tilt is not directional - 'out' is 'in' reversed with the same tilt, so its direction is pre-flipped
  const isOut = compareKeywordToNonDefaults(namedEffect!.range, ['out']);
  const rot3dDirection = isOut ? 'counter-clockwise' : 'clockwise';
  const angle3d = { x: ROTATION_X, y: ROTATION_Y };

  const transform3dOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: angle3d,
      direction: rot3dDirection,
      perspective,
      parallax: { speed },
    },
  } as ScrubAnimationOptions;
  const transform2dOptions = {
    ...options,
    composite: 'add',
    namedEffect: { ...namedEffect, angle: ROTATION_Z },
  } as ScrubAnimationOptions;

  const overrides3d = getScrollOverrides(options, range, getLinearScrollEasing(range, true));
  const easing2d = getScrollEasing(range, true, {
    easing: ROTATION_Z_EASING,
    outEasing: ROTATION_Z_EASING,
  });

  return withSharedScrollRange([
    {
      ...transform3dOptions,
      ...overrides3d,
      ...getMotion3dTransform(
        toMotionRange(
          spinDirection,
          range === 'out' ? spinDirection.opposite(rot3dDirection) : rot3dDirection,
          range,
        ),
        { angle: angle3d, perspective, parallax: getScrollParallax(range, overrides3d, speed) },
        asWeb,
        suffix,
      ),
    },
    {
      ...transform2dOptions,
      ...getScrollOverrides(options, range, easing2d),
      ...getMotionTransRot(
        toMotionRange(
          spinDirection,
          range === 'out' ? spinDirection.opposite(direction) : direction,
          range,
        ),
        { angle: ROTATION_Z },
        asWeb,
        suffix,
      ),
    },
    {
      ...transform3dOptions,
      composite: 'add',
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, false)),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ]);
}
