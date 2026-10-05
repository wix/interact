import type { AnimationData, FloatIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
} from '../../transformUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { sideDirection, toMotionRange } from '../../directions';

const TRAVEL = '120px';
const EASING = 'sineInOut';

const DEFAULTS: Required<FloatIn> = {
  type: 'FloatIn',
  from: 'left',
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<FloatIn>;
  const { fill = 'backwards' } = options;
  const from = sideDirection.parse(namedEffect?.from, DEFAULTS.from);

  const transformOptions = {
    ...options,
    easing: EASING,
    fill,
    namedEffect: { ...namedEffect, travel: TRAVEL },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      easing: EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionTransRot(
        toMotionRange(sideDirection, sideDirection.opposite(from), 'in'),
        { travel: TRAVEL },
        asWeb,
        suffix,
      ),
    },
    {
      ...transformOptions,
      composite: 'add' as const,
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}
