import type { ArcScroll, DomApi, ScrubAnimationOptions, AnimationData } from '../../types';
import { SCROLL_RANGES, AXIS_DIRECTIONS } from '../../consts';
import { sideDirection, toMotionRange } from '../../directions';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  getMotion3dTransform,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
const DEPTH = '300px';
const ROTATION_ANGLE = 68;

const DEFAULTS: Required<ArcScroll> = {
  type: 'ArcScroll',
  direction: 'horizontal',
  perspective: 500,
  range: 'in',
};

export const schema = {
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
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ArcScroll>;
  const { direction, perspective = DEFAULTS.perspective } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);

  // mapped to a side so that 'out' flips it like any directional motion, continuing the rotation of 'in'
  const fourSideDirection = compareKeywordToNonDefaults(direction, ['vertical']) ? 'top' : 'right';
  const side = range === 'out' ? sideDirection.opposite(fourSideDirection) : fourSideDirection;

  const transformOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: ROTATION_ANGLE,
      depth: DEPTH,
      direction: fourSideDirection,
      perspective,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    {
      ...transformOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotion3dTransform(
        toMotionRange(sideDirection, side, range),
        { angle: ROTATION_ANGLE, depth: DEPTH, perspective },
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
  ]);
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
