import type { TimeAnimationOptions, WinkIn } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import { MOTION_WINK_NAME, getMotionWink } from '../../clipUtils';
import {
  MOTION_SCALE_NAME,
  getMotionScale,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import {
  useBasicPreset,
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
} from '../../presetUtils';

const FADE_IN_EASING = 'quadOut';
const TRANSFORM_2D_IN_DURATION_FACTOR = 0.85;

const DEFAULT_EASING = 'quintInOut';
const DEFAULTS: Required<WinkIn> = {
  type: 'WinkIn',
  direction: 'horizontal',
};

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME, MOTION_WINK_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<WinkIn>;
  const { direction } = namedEffect!;

  // vertical - x: 1->1, y: 0->1; horizontal - x: 0->1, y: 1->1
  const scaleX = compareKeywordToNonDefaults(direction, ['vertical']) ? 1 : 0;
  const scaleY = 1 - scaleX;

  const transformOptions = {
    ...options,
    duration: options.duration! * TRANSFORM_2D_IN_DURATION_FACTOR,
    easing,
    namedEffect: {
      ...namedEffect,
      scale: { x: scaleX, y: scaleY },
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(
      getMotionFade,
      { ...options, easing: FADE_IN_EASING },
      'entrance',
      asWeb,
      suffix,
    ),
    useLayoutRotation(transformOptions, 'entrance', { composite: 'replace' }, asWeb, suffix),
    useDirectionalPresetAsBasic(getMotionScale, transformOptions, 'entrance', {}, asWeb, suffix),
    useDirectionalPreset(
      getMotionWink,
      { ...options, easing },
      'entrance',
      {
        defaultDirection: DEFAULTS.direction,
        directionType: 'axis',
      },
      asWeb,
      suffix,
    ),
  ];
}
