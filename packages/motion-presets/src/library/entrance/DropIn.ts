import type { AnimationData, DropIn, TimeAnimationOptions } from '../../types';
import {
  MOTION_SCALE_NAME,
  getMotionScale,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
} from '../../transformUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { UNDIRECTED_MOTION_RANGE } from '../../directions';

const FADE_IN_DURATION_FACTOR = 0.8;
const FADE_IN_EASING = 'quadOut';

const DEFAULT_EASING = 'quintInOut';
const DEFAULTS: Required<DropIn> = {
  type: 'DropIn',
  scale: 1.6,
};

export const schema = {
  scale: { type: 'number', min: 1, default: DEFAULTS.scale },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<DropIn>;
  const { scale = DEFAULTS.scale } = namedEffect!;
  const { fill = 'backwards' } = options;

  const transformOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, scale },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      duration: options.duration! * FADE_IN_DURATION_FACTOR,
      easing: FADE_IN_EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...transformOptions,
      composite: 'replace',
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionScale(UNDIRECTED_MOTION_RANGE, { scale }, asWeb, suffix),
    },
  ];
}
