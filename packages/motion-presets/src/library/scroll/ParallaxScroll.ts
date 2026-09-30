import type { ScrubAnimationOptions, ParallaxScroll, DomApi } from '../../types';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { useDirectionalPreset, withSharedScrollRange } from '../../presetUtils';

const RANGE = 'continuous';

const DEFAULTS: Required<ParallaxScroll> = {
  type: 'ParallaxScroll',
  center: 0.5,
  speed: 0.7159,
};

export const schema = {
  center: { type: 'number', min: 0, max: 1, default: DEFAULTS.center },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ParallaxScroll>;
  const { center = DEFAULTS.center, speed = DEFAULTS.speed } = namedEffect!;
  const transformOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      parallax: { center, speed },
      range: RANGE,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(getMotionTransRot, transformOptions, 'scroll', {}, asWeb, suffix),
    useLayoutRotation(transformOptions, 'scroll', {}, asWeb, suffix),
  ]);
}
