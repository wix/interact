import type { ScrubAnimationOptions, ShrinkScroll, DomApi } from '../../types';
import { NINE_DIRECTIONS, SCROLL_RANGES } from '../../consts';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import {
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
  withSharedScrollRange,
} from '../../presetUtils';
import { parallaxScrollGroup, scrollGroup } from '../../scrollGroup';

const EPSILON = 0.01;

const DEFAULTS: Required<ShrinkScroll> = {
  type: 'ShrinkScroll',
  pivot: 'center',
  range: 'in',
  scale: 1.2,
  speed: 1,
};

export const schema = {
  pivot: { type: 'enum', values: NINE_DIRECTIONS, default: DEFAULTS.pivot },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ShrinkScroll>;
  const { range, scale: inputScale = DEFAULTS.scale, speed = DEFAULTS.speed } = namedEffect!;

  const isIn = !compareKeywordToNonDefaults(range, ['out', 'continuous']);

  // ShrinkScroll always goes down in scale, so scale should be bigger than 1 for 'in' and smaller than 1 otherwise
  // in case the scale is not in the correct range, we take its inverse
  const invScale = 1 / Math.max(inputScale, EPSILON);
  const scale = isIn ? Math.max(inputScale, invScale) : Math.min(inputScale, invScale);

  // parallax is a directional motion, so it continues through 'continuous' while the scale goes back and forth
  const parallaxOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      parallax: { speed },
    },
  } as ScrubAnimationOptions;
  const scaleOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      scale,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(
      getMotionTransRot,
      parallaxOptions,
      parallaxScrollGroup,
      {
        defaultRange: DEFAULTS.range,
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(
      parallaxOptions,
      scrollGroup,
      { defaultRange: DEFAULTS.range },
      asWeb,
      suffix,
    ),
    useDirectionalPresetAsBasic(
      getMotionScale,
      scaleOptions,
      scrollGroup,
      {
        defaultPivot: DEFAULTS.pivot,
        defaultRange: DEFAULTS.range,
        pivotType: 'all',
      },
      asWeb,
      suffix,
    ),
  ]);
}
