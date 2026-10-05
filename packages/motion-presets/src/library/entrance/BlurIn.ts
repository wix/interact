import type { BlurIn, TimeAnimationOptions } from '../../types';
import {
  getMotionBlur,
  getMotionFade,
  MOTION_BLUR_NAME,
  MOTION_FADE_NAME,
} from '../../fadeBlurUtils';
import { useBasicPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';

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

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<BlurIn>;
  const { blur = DEFAULTS.blur } = namedEffect!;

  const fadeOptions = {
    ...options,
    duration: options.duration! * FADE_IN_DURATION_FACTOR,
    easing: FADE_IN_EASING,
  };
  const blurOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      blur,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, entranceGroup, asWeb, suffix),
    useBasicPreset(getMotionBlur, blurOptions, entranceGroup, asWeb, suffix),
  ];
}
