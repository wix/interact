import type { CurveIn, DomApi, LengthValue, TimeAnimationOptions } from '../../types';
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

const EASING = 'quadOut';
const ROTATION_ANGLE = 180;

const DEFAULTS: Required<CurveIn> = {
  type: 'CurveIn',
  depth: { value: 900, unit: 'px' },
  from: 'right',
  perspective: 200,
};

export const schema = {
  depth: { type: 'length', default: DEFAULTS.depth },
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_3D_TRANSFORM_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<CurveIn>;
  const { perspective = DEFAULTS.perspective } = namedEffect!;

  const fadeOptions = { ...options, easing: EASING };
  const transformOptions = {
    ...options,
    easing: EASING,
    namedEffect: {
      ...namedEffect,
      angle: ROTATION_ANGLE,
      perspective,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    useDirectionalPreset(getMotion3dTransform, transformOptions, 'entrance', {
      defaultDepth: DEFAULTS.depth as LengthValue,
      defaultDirection: DEFAULTS.from,
      directionType: 'four-sides',
    }, asWeb, suffix),
    useLayoutRotation(transformOptions, 'entrance', {}, asWeb, suffix),
  ];
}
