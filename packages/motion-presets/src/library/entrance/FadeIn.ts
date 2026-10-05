import type { TimeAnimationOptions } from '../../types';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';

const EASING = 'sineInOut';

export const schema = {};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME + suffix];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  return [
    useBasicPreset(
      getMotionFade,
      { ...options, easing: EASING },
      entranceGroup,
      asWeb,
      options.suffix,
    ),
  ];
}
