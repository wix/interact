import type { AnimationData, TimeAnimationOptions, WinkIn } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import { MOTION_WINK_NAME, getMotionWink } from '../../clipUtils';
import {
  MOTION_SCALE_NAME,
  getMotionScale,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { axisDirection, toMotionRange } from '../../directions';

const FADE_IN_EASING = 'quadOut';
const TRANSFORM_2D_IN_DURATION_FACTOR = 0.85;

const DEFAULT_EASING = 'quintInOut';
const DEFAULTS: Required<WinkIn> = {
  type: 'WinkIn',
  direction: 'horizontal',
};

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME, MOTION_WINK_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<WinkIn>;
  const { direction } = namedEffect!;
  const { fill = 'backwards' } = options;
  const motionRange = toMotionRange(
    axisDirection,
    axisDirection.parse(direction, DEFAULTS.direction),
    'in',
  );

  // vertical - x: 1->1, y: 0->1; horizontal - x: 0->1, y: 1->1
  const scaleX = compareKeywordToNonDefaults(direction, ['vertical']) ? 1 : 0;
  const scale = { x: scaleX, y: 1 - scaleX };

  const transformOptions = {
    ...options,
    duration: options.duration! * TRANSFORM_2D_IN_DURATION_FACTOR,
    easing,
    fill,
    namedEffect: { ...namedEffect, scale },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      easing: FADE_IN_EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...transformOptions,
      composite: 'replace' as const,
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionScale(motionRange, { scale }, asWeb, suffix),
    },
    {
      ...options,
      easing,
      fill,
      ...getMotionWink(motionRange, {}, asWeb, suffix),
    },
  ];
}
