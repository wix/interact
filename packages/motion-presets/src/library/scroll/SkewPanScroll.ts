import type { DomApi, ScrubAnimationOptions, SkewPanScroll } from '../../types';
import { SCROLL_RANGES, TWO_SIDES_DIRECTIONS } from '../../consts';
import { getOffscreenTravels, measureLayout } from '../../layoutUtils';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import { parseKeywordLazy, useDirectionalPreset, withSharedScrollRange } from '../../utils';

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

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<SkewPanScroll>;
  const { direction, skew = DEFAULTS.skew } = namedEffect!;

  // from fully outside the viewport on one side to fully outside on the other side
  const side = parseKeywordLazy(direction, TWO_SIDES_DIRECTIONS, DEFAULTS.direction);

  const panOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: side,
      ...getOffscreenTravels(side),
      // leaning into the movement, flipping as it passes its layout position
      skew: { x: -skew },
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(getMotionTransRot, panOptions, 'scroll', {
      defaultDirection: DEFAULTS.direction,
      defaultRange: DEFAULTS.range,
      directionType: 'four-sides',
    }, asWeb, suffix),
    useLayoutRotation(panOptions, 'scroll', { defaultRange: DEFAULTS.range }, asWeb, suffix),
  ]);
}
