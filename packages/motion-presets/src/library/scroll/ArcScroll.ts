import type { ArcScroll, DomApi, ScrubAnimationOptions } from '../../types';
import { SCROLL_RANGES, AXIS_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { useDirectionalPreset, withSharedScrollRange } from '../../presetUtils';
import { scrollGroup } from '../../scrollGroup';

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

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_3D_TRANSFORM_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ArcScroll>;
  const { direction, perspective = DEFAULTS.perspective } = namedEffect!;

  // mapped to a side so that 'out' flips it like any directional motion, continuing the rotation of 'in'
  const fourSideDirection = compareKeywordToNonDefaults(direction, ['vertical']) ? 'top' : 'right';

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
    useDirectionalPreset(
      getMotion3dTransform,
      transformOptions,
      scrollGroup,
      {
        defaultRange: DEFAULTS.range,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(
      transformOptions,
      scrollGroup,
      { defaultRange: DEFAULTS.range },
      asWeb,
      suffix,
    ),
  ]);
}
