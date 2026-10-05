import type { DomApi, TimeAnimationOptions, Wiggle } from '../../types';
import {
  MOTION_3D_TRANSFORM_NAME,
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotion3dTransform,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { useDirectionalPreset, useDirectionalPresetAsBasic } from '../../presetUtils';
import { ongoingGroup } from '../../ongoingGroup';

const DEFAULTS: Required<Wiggle> = {
  type: 'Wiggle',
  angle: 25,
  iterationDelay: 0,
  travel: { value: 25, unit: 'px' },
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  travel: { type: 'length', default: DEFAULTS.travel },
};

// the rotation and the lift have different shapes, so each has its own layer
// a damped wobble, first to the positive angle
const ROTATION_SHAPE: LoopPoint[] = [
  [0, 0],
  [1, 0.18],
  [-0.8, 0.35],
  [0.6, 0.53],
  [-0.4, 0.73],
  [0, 1],
];
// a single lift during the first swing
const LIFT_SHAPE: LoopPoint[] = [
  [0, 0],
  [1, 0.18],
  [0, 0.35],
  [0, 1],
];

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_3D_TRANSFORM_NAME, MOTION_TRANS_ROT_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Wiggle>;
  const { angle = DEFAULTS.angle, travel = DEFAULTS.travel } = namedEffect!;

  const rotationOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      // the keyframes start at the negative sign, so the first peak is +angle
      angle: { z: -angle },
      // no z-motion, so the perspective has no effect
      perspective: 800,
      travel: 0,
    },
  } as TimeAnimationOptions;
  const liftOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      angle: 0,
      direction: 'top',
      travel,
    },
  } as TimeAnimationOptions;

  // the lift comes after the rotations, so it is along the element's tilted axes
  return [
    useLayoutRotation(options, ongoingGroup, { composite: 'replace' }, asWeb, suffix),
    useDirectionalPresetAsBasic(
      getMotion3dTransform,
      rotationOptions,
      ongoingGroup,
      { loop: { shape: ROTATION_SHAPE } },
      asWeb,
      suffix,
    ),
    useDirectionalPreset(
      getMotionTransRot,
      liftOptions,
      ongoingGroup,
      { directionType: 'four-sides', loop: { shape: LIFT_SHAPE } },
      asWeb,
      suffix,
    ),
  ];
}
