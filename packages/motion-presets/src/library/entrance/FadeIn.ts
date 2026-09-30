import type { TimeAnimationOptions } from '../../types';
import {
  MOTION_FADE_NAME,
  getMotionFade,
  useBasicPreset,
} from '../../utils';

const EASING = 'sineInOut';

export const schema = {};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME + suffix];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  return [useBasicPreset(getMotionFade, { ...options, easing: EASING }, 'entrance', asWeb, options.suffix)];
}
