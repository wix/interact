import type { Breathe, DomApi, TimeAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotion3dTransform,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import type { LoopPoint } from '../../utils';
import { getEasingFamily, parseKeywordLazy, useDirectionalPreset } from '../../utils';

const DEFAULT_EASING = 'sineInOut';
const DIRECTIONS = [...AXIS_DIRECTIONS, 'center'] as const;

const DEFAULTS: Required<Breathe> = {
  type: 'Breathe',
  direction: 'vertical',
  iterationDelay: 0,
  perspective: 800,
  travel: { value: 25, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  travel: { type: 'length', default: DEFAULTS.travel },
};

// a damped back-and-forth, first towards the positive side of the axis (down, right or towards the viewer)
const SHAPE: LoopPoint[] = [
  [0, 0],
  [-1, 0.1],
  [1, 0.302],
  [-1, 0.504],
  [0.7, 0.705],
  [-0.6, 0.839],
  [0, 1],
];

export function getNames({ namedEffect, suffix = '' }: TimeAnimationOptions) {
  const isCenter = (namedEffect as Breathe)?.direction === 'center';
  return [isCenter ? MOTION_3D_TRANSFORM_NAME : MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Breathe>;
  const { perspective = DEFAULTS.perspective, travel = DEFAULTS.travel } = namedEffect!;
  const direction = parseKeywordLazy(namedEffect?.direction, DIRECTIONS, DEFAULTS.direction);
  const ease = getEasingFamily(easing);
  const isCenter = direction === 'center';

  const breatheOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      // center moves along the z-axis
      direction: isCenter ? 'vertical' : direction,
      perspective,
      travel,
    },
  } as TimeAnimationOptions;

  return [
    useDirectionalPreset(isCenter ? getMotion3dTransform : getMotionTransRot, breatheOptions, 'ongoing', {
      directionType: 'axis',
      loop: { shape: SHAPE, easings: [ease.out, ease.inOut] },
    }, asWeb, suffix),
    useLayoutRotation(breatheOptions, 'ongoing', {}, asWeb, suffix),
  ];
}
