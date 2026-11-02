import type { DomApi, FlipScroll, ScrubAnimationOptions, AnimationData } from '../../types';
import { AXIS_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import { sideDirection, toMotionRange } from '../../directions';
import { getLinearScrollEasing, getScrollOverrides, parseRange } from '../../rangeUtils';
import {
  getMotion3dTransform,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';

const DEFAULTS: Required<FlipScroll> = {
  type: 'FlipScroll',
  angle: 240,
  direction: 'horizontal',
  perspective: 800,
  range: 'continuous',
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames(options: ScrubAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<FlipScroll>;
  const { angle = DEFAULTS.angle, direction, perspective = DEFAULTS.perspective } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);

  // mapped to a side so that 'out' flips it like any directional motion, continuing the rotation of 'in'
  const fourSideDirection = compareKeywordToNonDefaults(direction, ['vertical']) ? 'top' : 'right';
  const side = range === 'out' ? sideDirection.opposite(fourSideDirection) : fourSideDirection;

  const transformOptions = {
    ...options,
    namedEffect: { ...namedEffect, angle, direction: fourSideDirection, perspective },
  } as ScrubAnimationOptions;

  return [
    {
      ...transformOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotion3dTransform(
        toMotionRange(sideDirection, side, range),
        { angle, perspective },
        asWeb,
        suffix,
      ),
    },
    {
      ...transformOptions,
      composite: 'add',
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, false)),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
