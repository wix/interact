import type { AnimationData, DomApi, TimeAnimationOptions, Wiggle } from '../../types';
import type { MotionRange } from '../../directions';
import {
  MOTION_3D_TRANSFORM_NAME,
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotion3dTransform,
  getMotionLayoutRotation,
  getMotionTransRot,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { getLoopOverrides } from '../../easingUtils';
import { parseLengthLazy } from '../../utils';

// the rotation's sign is set by its angle, the lift starts at its peak above its place
const MOTION_RANGE: MotionRange = {
  fromSign: -1,
  toSign: 0,
  vertical: true,
  movementAngle: '90deg',
};
// no z-motion, so the perspective has no effect
const PERSPECTIVE = 800;

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

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Wiggle>;
  const { angle = DEFAULTS.angle, travel = DEFAULTS.travel } = namedEffect!;
  // the keyframes start at the negative sign, so the first peak is +angle
  const rotation = { z: -angle };

  const rotationOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      angle: rotation,
      perspective: PERSPECTIVE,
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
    {
      ...options,
      composite: 'replace',
      ...getLoopOverrides(options),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...rotationOptions,
      ...getLoopOverrides(rotationOptions, { shape: ROTATION_SHAPE }),
      ...getMotion3dTransform(
        MOTION_RANGE,
        { angle: rotation, perspective: PERSPECTIVE },
        asWeb,
        suffix,
      ),
    },
    {
      ...liftOptions,
      ...getLoopOverrides(liftOptions, { shape: LIFT_SHAPE }),
      ...getMotionTransRot(
        MOTION_RANGE,
        { travel: parseLengthLazy(travel, { value: 0, unit: 'px' }) },
        asWeb,
        suffix,
      ),
    },
  ];
}
