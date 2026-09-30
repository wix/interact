import type { BlurScroll, ScrubAnimationOptions, DomApi } from '../../types';
import { SCROLL_RANGES } from '../../consts';
import { getMotionBlur, MOTION_BLUR_NAME } from '../../fadeBlurUtils';
import { useBasicPreset } from '../../presetUtils';

const DEFAULTS: Required<BlurScroll> = {
  type: 'BlurScroll',
  blur: 6,
  range: 'in',
};

export const schema = {
  blur: { type: 'number', min: 0, default: DEFAULTS.blur },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_BLUR_NAME + suffix];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<BlurScroll>;
  const { blur = DEFAULTS.blur } = namedEffect!;

  const blurOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      blur,
    },
  } as ScrubAnimationOptions;

  return [useBasicPreset(getMotionBlur, blurOptions, 'scroll', asWeb, suffix)];
}
