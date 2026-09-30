import type { DropIn, TimeAnimationOptions } from '../../types';
import {
  MOTION_SCALE_NAME,
  getMotionScale,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import {
  MOTION_FADE_NAME,
  getMotionFade,
  useBasicPreset,
  useDirectionalPresetAsBasic,
} from '../../utils';

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
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<DropIn>;
  const { scale = DEFAULTS.scale } = namedEffect!;

  const fadeOptions = {
    ...options,
    duration: options.duration! * FADE_IN_DURATION_FACTOR,
    easing: FADE_IN_EASING,
  };
  const transformOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      scale,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    useLayoutRotation(transformOptions, 'entrance', { composite: 'replace' }, asWeb, suffix),
    useDirectionalPresetAsBasic(getMotionScale, transformOptions, 'entrance', {}, asWeb, suffix),
  ];
}
