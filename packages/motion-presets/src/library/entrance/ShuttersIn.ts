import type { AnimationData, ShuttersIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import { MOTION_SHUTTERS_NAME, getMotionShutters } from '../../clipUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { sideDirection, toMotionRange } from '../../directions';

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

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const {
    easing = DEFAULT_EASING,
    namedEffect,
    suffix,
  } = options as TimeAnimationOptions<ShuttersIn>;
  const { shutters = DEFAULTS.shutters, staggered = DEFAULTS.staggered } = namedEffect!;
  const { fill = 'backwards' } = options;
  const from = sideDirection.parse(namedEffect?.from, DEFAULTS.from);

  const shuttersOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, shutters, staggered },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      easing: FADE_IN_EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...shuttersOptions,
      ...getMotionShutters(
        toMotionRange(sideDirection, sideDirection.opposite(from), 'in'),
        { shutters, staggered },
        asWeb,
        suffix,
      ),
    },
  ];
}
