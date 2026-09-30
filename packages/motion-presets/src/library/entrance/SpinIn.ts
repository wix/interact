import type { SpinIn, TimeAnimationOptions } from '../../types';
import { SPIN_DIRECTIONS } from '../../consts';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import {
  MOTION_FADE_NAME,
  getMotionFade,
  useBasicPreset,
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
} from '../../utils';

const FADE_IN_EASING = 'cubicIn';

const DEFAULT_EASING = 'cubicInOut';
const DEFAULTS: Required<SpinIn> = {
  type: 'SpinIn',
  direction: 'clockwise',
  scale: 0,
  spins: 0.5,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  spins: { type: 'number', min: 0, default: DEFAULTS.spins },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<SpinIn>;
  const { scale = DEFAULTS.scale, spins = DEFAULTS.spins } = namedEffect!;

  const fadeOptions = {
    ...options,
    duration: options.duration! * Math.min(scale, 1),
    easing: FADE_IN_EASING,
  };
  const transformOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      angle: 360 * spins,
      scale,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    useDirectionalPreset(getMotionTransRot, transformOptions, 'entrance', {
      defaultDirection: DEFAULTS.direction,
      directionType: 'spin',
    }, asWeb, suffix),
    useLayoutRotation(transformOptions, 'entrance', {}, asWeb, suffix),
    useDirectionalPresetAsBasic(getMotionScale, transformOptions, 'entrance', {}, asWeb, suffix),
  ];
}
