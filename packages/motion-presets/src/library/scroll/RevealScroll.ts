import type {
  ScrubAnimationOptions,
  RevealScroll,
  DomApi,
} from '../../types';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import {
  MOTION_REVEAL_NAME,
  getMotionReveal,
} from '../../clipUtils';
import { useDirectionalPreset } from '../../utils';

const DEFAULTS: Required<RevealScroll> = {
  type: 'RevealScroll',
  direction: 'bottom',
  range: 'in',
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
}

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_REVEAL_NAME + suffix];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix } = options as ScrubAnimationOptions<RevealScroll>;

  return [
    useDirectionalPreset(getMotionReveal, options, 'scroll', {
      defaultDirection: DEFAULTS.direction,
      defaultRange: DEFAULTS.range,
      directionType: 'four-sides',
    }, asWeb, suffix),
  ];
}
