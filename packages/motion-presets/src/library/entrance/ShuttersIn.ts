import { ShuttersIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import { MOTION_SHUTTERS_NAME, getMotionShutters } from '../../clipUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';

const FADE_IN_EASING = 'step-start';

const DEFAULT_EASING = 'sineIn';
const DEFAULTS: Required<ShuttersIn> = {
  type: 'ShuttersIn',
  from: 'left',
  shutters: 12,
  staggered: true,
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  shutters: { type: 'number', min: 1, int: true, default: DEFAULTS.shutters },
  staggered: { type: 'bool', default: DEFAULTS.staggered },
};

export function getNames({ namedEffect, suffix = '' }: TimeAnimationOptions) {
  const { shutters = DEFAULTS.shutters } = namedEffect as ShuttersIn;
  return [MOTION_FADE_NAME + suffix, `${MOTION_SHUTTERS_NAME}${suffix}-${shutters}`];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const {
    easing = DEFAULT_EASING,
    namedEffect,
    suffix,
  } = options as TimeAnimationOptions<ShuttersIn>;
  const { shutters = DEFAULTS.shutters, staggered = DEFAULTS.staggered } = namedEffect!;

  const fadeOptions = { ...options, easing: FADE_IN_EASING };
  const shuttersOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      shutters,
      staggered,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    useDirectionalPreset(
      getMotionShutters,
      shuttersOptions,
      'entrance',
      {
        defaultDirection: DEFAULTS.from,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
  ];
}
