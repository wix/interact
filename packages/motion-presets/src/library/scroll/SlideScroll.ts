import type { AnimationData, DomApi, ScrubAnimationOptions, SlideScroll } from '../../types';
import { FOUR_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { MOTION_REVEAL_NAME, getMotionReveal } from '../../clipUtils';
import { sideDirection, toMotionRange } from '../../directions';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotionLayoutRotation,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';

const TRAVEL = '100%';

const DEFAULTS: Required<SlideScroll> = {
  type: 'SlideScroll',
  direction: 'top',
  range: 'in',
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_TRANS_ROT_NAME, MOTION_REVEAL_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<SlideScroll>;
  const range = parseRange(namedEffect, DEFAULTS.range);
  const direction = parseKeywordLazy(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULTS.direction);

  // SlideScroll reveals in the opposite direction to the movement to create its entrance-exit feel
  const clipDirection = sideDirection.opposite(direction);

  // range out is opposite direction reversed
  const toSide = (side: string) => (range === 'out' ? sideDirection.opposite(side) : side);

  const transformOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      travel: TRAVEL,
    },
  } as ScrubAnimationOptions;
  const revealOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: clipDirection,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    // the layout rotation comes first, so the motion moves along the element's rotated axes
    {
      ...transformOptions,
      composite: 'replace',
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, false)),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotionTransRot(
        toMotionRange(sideDirection, toSide(direction), range),
        { travel: TRAVEL },
        asWeb,
        suffix,
      ),
    },
    {
      ...revealOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotionReveal(
        toMotionRange(sideDirection, toSide(clipDirection), range),
        {},
        asWeb,
        suffix,
      ),
    },
  ]);
}
