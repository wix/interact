import type { ScrubAnimationOptions, RevealScroll, DomApi, AnimationData } from '../../types';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { MOTION_REVEAL_NAME, getMotionReveal } from '../../clipUtils';
import { sideDirection, toMotionRange } from '../../directions';
import { getLinearScrollEasing, getScrollOverrides, parseRange } from '../../rangeUtils';

const DEFAULTS: Required<RevealScroll> = {
  type: 'RevealScroll',
  direction: 'bottom',
  range: 'in',
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_REVEAL_NAME + suffix];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<RevealScroll>;
  const range = parseRange(namedEffect, DEFAULTS.range);

  // range out is opposite direction reversed
  const direction = sideDirection.parse(namedEffect?.direction, DEFAULTS.direction);
  const side = range === 'out' ? sideDirection.opposite(direction) : direction;

  return [
    {
      ...options,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotionReveal(toMotionRange(sideDirection, side, range), {}, asWeb, suffix),
    },
  ];
}
