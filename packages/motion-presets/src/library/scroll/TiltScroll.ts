import type {
  ScrubAnimationOptions,
  TiltScroll,
  DomApi,
} from '../../types';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';
import {
  MOTION_TRANS_ROT_NAME,
  MOTION_3D_TRANSFORM_NAME,
  getMotionTransRot,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import {
  compareKeywordToNonDefaults,
  useDirectionalPreset,
  withSharedScrollRange,
} from '../../utils';

const [ROTATION_X, ROTATION_Y, ROTATION_Z] = [10, 25, 25];
const ROTATION_Z_EASING = 'sineInOut';

const DEFAULTS: Required<TiltScroll> = {
  type: 'TiltScroll',
  direction: 'counter-clockwise',
  perspective: 400,
  range: 'in',
  speed: 1,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  speed: { type: 'length', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_3D_TRANSFORM_NAME, MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<TiltScroll>;
  const { perspective = DEFAULTS.perspective, range, speed = DEFAULTS.speed } = namedEffect!;

  // TODO - not sure what the idea behind this logic is - seems that 'out' is just 'in' reversed without reversing direction
  const isOut = compareKeywordToNonDefaults(range, ['out']);
  const rot3dDirection = isOut ? 'counter-clockwise' : 'clockwise';

  const transform3dOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: { x: ROTATION_X, y: ROTATION_Y },
      direction: rot3dDirection,
      perspective,
      parallax: { speed },
    },
  } as ScrubAnimationOptions;
  const transform2dOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      angle: ROTATION_Z,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(getMotion3dTransform, transform3dOptions, 'scroll', {
      defaultRange: DEFAULTS.range,
      directionType: 'spin',
    }, asWeb, suffix),
    useDirectionalPreset(getMotionTransRot, transform2dOptions, 'scroll', {
      defaultDirection: DEFAULTS.direction,
      defaultRange: DEFAULTS.range,
      directionType: 'spin',
      easing: ROTATION_Z_EASING,
      outEasing: ROTATION_Z_EASING,
    }, asWeb, suffix),
    useLayoutRotation(transform3dOptions, 'scroll', { defaultRange: DEFAULTS.range }, asWeb, suffix),
  ]);
}
