import type { AnimationData, DomApi, Pulse, TimeAnimationOptions } from '../../types';
import type { MotionRange } from '../../directions';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_SCALE_NAME,
  getMotionScale,
  getMotionLayoutRotation,
} from '../../transformUtils';
import { getLoopOverrides } from '../../easingUtils';

const MOTION_RANGE: MotionRange = {
  fromSign: -1,
  toSign: 0,
  vertical: true,
  movementAngle: '90deg',
};

const DEFAULTS: Required<Pulse> = {
  type: 'Pulse',
  iterationDelay: 0,
  scale: 0.93,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
};

// two beats - a light one and then the full one
const SHAPE: [number, number][] = [
  [0, 0],
  [4 / 7, 0.27],
  [0, 0.45],
  [1, 0.72],
  [0, 1],
];

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Pulse>;
  const { scale = DEFAULTS.scale } = namedEffect!;

  const scaleOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      scale,
    },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      composite: 'replace',
      ...getLoopOverrides(options),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...scaleOptions,
      ...getLoopOverrides(scaleOptions, { shape: SHAPE }),
      ...getMotionScale(MOTION_RANGE, { scale }, asWeb, suffix),
    },
  ];
}
