import type { TimeAnimationOptions, AnimationData } from '../../types';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';

const EASING = 'sineInOut';

export const schema = {};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME + suffix];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { fill = 'backwards', namedEffect, suffix } = options;
  return [
    {
      ...options,
      easing: EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
  ];
}
