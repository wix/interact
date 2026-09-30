import type { FlipIn, TimeAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import {
  MOTION_FADE_NAME,
  getMotionFade,
  useBasicPreset,
  useDirectionalPreset,
} from '../../utils';

const FADE_IN_EASING = 'quadOut';

const DEFAULT_EASING = 'backOut';
const DEFAULTS: Required<FlipIn> = {
  type: 'FlipIn',
  angle: 90,
  direction: 'vertical',
  perspective: 800,
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_3D_TRANSFORM_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<FlipIn>;
  const { angle = DEFAULTS.angle, perspective = DEFAULTS.perspective } = namedEffect!;

  const fadeOptions = { ...options, easing: FADE_IN_EASING };
  const transformOptions = {
    ...options,
    composite: 'add',
    easing,
    namedEffect: {
      ...namedEffect,
      angle,
      perspective,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    // the layout rotation comes first, so the motion moves along the element's rotated axes
    useLayoutRotation(transformOptions, 'entrance', { composite: 'replace' }, asWeb, suffix),
    useDirectionalPreset(getMotion3dTransform, transformOptions, 'entrance', {
      defaultDirection: DEFAULTS.direction,
      directionType: 'axis',
    }, asWeb, suffix),
  ];
}
