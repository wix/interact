import type { AnimationData, DomApi, PanScroll, ScrubAnimationOptions } from '../../types';
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
  getMotionLayoutRotation,
  getMotionTransRot,
  mergeTransformLayers,
} from '../../transformUtils';
import { parseKeywordLazy, parseCssLength } from '../../utils';

const DEFAULTS: Required<PanScroll> = {
  type: 'PanScroll',
  direction: 'right',
  distance: { value: 400, unit: 'px' },
  range: 'in',
  startFromOffScreen: true,
};

export const schema = {
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.direction },
  distance: { type: 'lengthObject', default: DEFAULTS.distance },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  startFromOffScreen: { type: 'bool', default: DEFAULTS.startFromOffScreen },
};

export function getNames(options: ScrubAnimationOptions) {
  return style(options).map(({ name }) => name!);
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

export function layers(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<PanScroll>;
  const { direction, distance, startFromOffScreen = DEFAULTS.startFromOffScreen } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);

  // offscreen - from fully outside the viewport on one side to fully outside on the other side
  const side = parseKeywordLazy(direction, TWO_SIDES_DIRECTIONS, DEFAULTS.direction);
  const offscreenTravels = startFromOffScreen ? getOffscreenTravels(side) : undefined;
  const travels = offscreenTravels || { travel: distance };

  const panOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: side,
      ...travels,
    },
  } as ScrubAnimationOptions;

  // 'out' is the reversed 'in' of the opposite direction, so its travel is the one towards the original direction
  const motionTravels = offscreenTravels
    ? range === 'out'
      ? { travel: offscreenTravels.toTravel, toTravel: offscreenTravels.travel }
      : offscreenTravels
    : { travel: parseCssLength(distance, DEFAULTS.distance) };
  const motionSide = range === 'out' ? sideDirection.opposite(side) : side;

  return withSharedScrollRange([
    {
      ...panOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotionTransRot(
        toMotionRange(sideDirection, motionSide, range),
        motionTravels,
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

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
