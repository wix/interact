import type { BlurScroll, ScrubAnimationOptions, DomApi, AnimationData } from '../../types';
import { SCROLL_RANGES } from '../../consts';
import { getMotionBlur, MOTION_BLUR_NAME } from '../../fadeBlurUtils';
import { getLinearScrollEasing, getScrollOverrides, parseRange } from '../../rangeUtils';

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

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<BlurScroll>;
  const { blur = DEFAULTS.blur } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);

  const blurOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      blur,
    },
  } as ScrubAnimationOptions;

  return [
    {
      ...blurOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, false)),
      ...getMotionBlur({ blur }, asWeb, suffix),
    },
  ];
}
