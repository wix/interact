import type { RevealIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import { MOTION_REVEAL_NAME, getMotionReveal } from '../../clipUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';

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

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, suffix } = options as TimeAnimationOptions<RevealIn>;

  return [
    useBasicPreset(getMotionFade, { ...options, easing }, entranceGroup, asWeb, suffix),
    useDirectionalPreset(
      getMotionReveal,
      { ...options, easing },
      entranceGroup,
      {
        defaultDirection: DEFAULTS.from,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
  ];
}
