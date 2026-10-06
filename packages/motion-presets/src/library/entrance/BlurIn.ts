import type { AnimationData, BlurIn, TimeAnimationOptions } from '../../types';
import {
  getMotionBlur,
  getMotionFade,
  MOTION_BLUR_NAME,
  MOTION_FADE_NAME,
} from '../../fadeBlurUtils';

const FADE_IN_DURATION_FACTOR = 0.7;
const FADE_IN_EASING = 'sineIn';

const DEFAULT_EASING = 'linear';
const DEFAULTS: Required<BlurIn> = {
  type: 'BlurIn',
  blur: 6,
};

export const schema = {
  blur: { type: 'number', min: 0, default: DEFAULTS.blur },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_BLUR_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<BlurIn>;
  const { blur = DEFAULTS.blur } = namedEffect!;
  const { fill = 'backwards' } = options;

  const blurOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, blur },
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
      ...blurOptions,
      ...getMotionBlur({ blur }, asWeb, suffix),
    },
  ];
}
