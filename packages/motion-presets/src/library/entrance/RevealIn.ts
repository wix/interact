import type { AnimationData, RevealIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import { MOTION_REVEAL_NAME, getMotionReveal } from '../../clipUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { sideDirection, toMotionRange } from '../../directions';

const DEFAULT_EASING = 'cubicInOut';
const DEFAULTS: Required<RevealIn> = {
  type: 'RevealIn',
  from: 'left',
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_REVEAL_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const {
    easing = DEFAULT_EASING,
    namedEffect,
    suffix,
  } = options as TimeAnimationOptions<RevealIn>;
  const { fill = 'backwards' } = options;
  const from = sideDirection.parse(namedEffect?.from, DEFAULTS.from);

  return [
    {
      ...options,
      easing,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...options,
      easing,
      fill,
      ...getMotionReveal(
        toMotionRange(sideDirection, sideDirection.opposite(from), 'in'),
        {},
        asWeb,
        suffix,
      ),
    },
  ];
}
