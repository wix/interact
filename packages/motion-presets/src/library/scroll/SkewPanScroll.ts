import type { AnimationData, DomApi, ScrubAnimationOptions, SkewPanScroll } from '../../types';
import { SCROLL_RANGES, TWO_SIDES_DIRECTIONS } from '../../consts';
import { sideDirection, toMotionRange } from '../../directions';
import { getOffscreenTravels, measureLayout } from '../../layoutUtils';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionLayoutRotation,
  getMotionTransRot,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';

const DEFAULTS: Required<SkewPanScroll> = {
  type: 'SkewPanScroll',
  direction: 'left',
  range: 'in',
  skew: 10,
};

export const schema = {
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  skew: { type: 'number', default: DEFAULTS.skew },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  measureLayout(dom);
}

export function web(options: ScrubAnimationOptions, dom?: DomApi) {
  prepare(options, dom);

  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<SkewPanScroll>;
  const { direction, skew = DEFAULTS.skew } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);

  // from fully outside the viewport on one side to fully outside on the other side
  const side = parseKeywordLazy(direction, TWO_SIDES_DIRECTIONS, DEFAULTS.direction);
  const { travel, toTravel } = getOffscreenTravels(side);
  // leaning into the movement, flipping as it passes its layout position
  const skewXY = { x: -skew };

  const panOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: side,
      travel,
      toTravel,
      skew: skewXY,
    },
  } as ScrubAnimationOptions;

  // 'out' is the reversed 'in' of the opposite direction, so its travel is the one towards the original direction
  const motionTravels =
    range === 'out' ? { travel: toTravel, toTravel: travel } : { travel, toTravel };
  const motionSide = range === 'out' ? sideDirection.opposite(side) : side;

  return withSharedScrollRange([
    {
      ...panOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotionTransRot(
        toMotionRange(sideDirection, motionSide, range),
        { skew: skewXY, ...motionTravels },
        asWeb,
        suffix,
      ),
    },
    {
      ...panOptions,
      composite: 'add',
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, false)),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ]);
}
