import type { DomApi, FlipScroll, ScrubAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { useDirectionalPreset, withSharedScrollRange } from '../../presetUtils';

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

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_3D_TRANSFORM_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<FlipScroll>;
  const { angle = DEFAULTS.angle, direction, perspective = DEFAULTS.perspective } = namedEffect!;

  // mapped to a side so that 'out' flips it like any directional motion, continuing the rotation of 'in'
  const fourSideDirection = compareKeywordToNonDefaults(direction, ['vertical']) ? 'top' : 'right';

  const transformOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle,
      direction: fourSideDirection,
      perspective,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(
      getMotion3dTransform,
      transformOptions,
      'scroll',
      {
        defaultRange: DEFAULTS.range,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(transformOptions, 'scroll', { defaultRange: DEFAULTS.range }, asWeb, suffix),
  ]);
}
