import type { FoldIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
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
const DEFAULTS: Required<FoldIn> = {
  type: 'FoldIn',
  angle: -90,
  perspective: 800,
  pivot: 'top',
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.pivot },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_3D_TRANSFORM_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<FoldIn>;
  const { angle = DEFAULTS.angle, perspective = DEFAULTS.perspective, pivot } = namedEffect!;

  const fadeOptions = { ...options, easing: FADE_IN_EASING };
  const transformOptions = {
    ...options,
    composite: 'add',
    easing,
    namedEffect: {
      ...namedEffect,
      angle,
      from: pivot,
      perspective,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    // the layout rotation comes first, so the motion moves along the element's rotated axes
    useLayoutRotation(transformOptions, 'entrance', { composite: 'replace' }, asWeb, suffix),
    useDirectionalPreset(getMotion3dTransform, transformOptions, 'entrance', {
      defaultDirection: DEFAULTS.pivot,
      defaultPivot: DEFAULTS.pivot,
      directionType: 'four-sides',
      pivotType: 'four-sides',
    }, asWeb, suffix),
  ];
}
