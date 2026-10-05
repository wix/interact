import type { FadeScroll, ScrubAnimationOptions, DomApi } from '../../types';
import { SCROLL_RANGES } from '../../consts';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset } from '../../presetUtils';
import { scrollGroup } from '../../scrollGroup';

const DEFAULTS: Required<FadeScroll> = {
  type: 'FadeScroll',
  opacity: 0,
  range: 'in',
};

export const schema = {
  opacity: { type: 'number', min: 0, max: 1, default: DEFAULTS.opacity },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_FADE_NAME + suffix];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  return [useBasicPreset(getMotionFade, options, scrollGroup, asWeb, options.suffix)];
}
