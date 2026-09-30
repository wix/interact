import type { DomApi, PanScroll, ScrubAnimationOptions } from '../../types';
import { SCROLL_RANGES, TWO_SIDES_DIRECTIONS } from '../../consts';
import { getOffscreenTravels, measureLayout } from '../../layoutUtils';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';
import { useDirectionalPreset, withSharedScrollRange } from '../../presetUtils';

const DEFAULTS: Required<PanScroll> = {
  type: 'PanScroll',
  direction: 'right',
  distance: { value: 400, unit: 'px' },
  range: 'in',
  startFromOffScreen: true,
};

export const schema = {
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.direction },
  distance: { type: 'length', default: DEFAULTS.distance },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  startFromOffScreen: { type: 'bool', default: DEFAULTS.startFromOffScreen },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function prepare(options: ScrubAnimationOptions, dom?: DomApi) {
  const { startFromOffScreen = DEFAULTS.startFromOffScreen } = options.namedEffect as PanScroll;
  if (startFromOffScreen) {
    measureLayout(dom);
  }
}

export function web(options: ScrubAnimationOptions, dom?: DomApi) {
  prepare(options, dom);

  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<PanScroll>;
  const { direction, distance, startFromOffScreen = DEFAULTS.startFromOffScreen } = namedEffect!;

  // offscreen - from fully outside the viewport on one side to fully outside on the other side
  const side = parseKeywordLazy(direction, TWO_SIDES_DIRECTIONS, DEFAULTS.direction);
  const travels = startFromOffScreen ? getOffscreenTravels(side) : { travel: distance };

  const panOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: side,
      ...travels,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(
      getMotionTransRot,
      panOptions,
      'scroll',
      {
        defaultDirection: DEFAULTS.direction,
        defaultRange: DEFAULTS.range,
        defaultTravel: DEFAULTS.distance,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(panOptions, 'scroll', { defaultRange: DEFAULTS.range }, asWeb, suffix),
  ]);
}
