import type { AnimationData, DomApi, Spin, TimeAnimationOptions } from '../../types';
import { SPIN_DIRECTIONS } from '../../consts';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionLayoutRotation,
  getMotionTransRot,
} from '../../transformUtils';
import { getLoopOverrides } from '../../easingUtils';
import { spinDirection, toMotionRange } from '../../directions';

const DEFAULT_EASING = 'linear';
const ANGLE = 360;

const DEFAULTS: Required<Spin> = {
  type: 'Spin',
  direction: 'clockwise',
  iterationDelay: 0,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
};

// a full turn - starting a turn away from rest, which looks the same
const SHAPE: [number, number][] = [
  [1, 0],
  [0, 1],
];

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Spin>;

  const spinOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: ANGLE,
    },
  } as TimeAnimationOptions;

  const direction = spinDirection.parse(namedEffect?.direction, DEFAULTS.direction);

  return [
    {
      ...spinOptions,
      ...getLoopOverrides(spinOptions, { shape: SHAPE, easings: [easing] }),
      ...getMotionTransRot(
        toMotionRange(spinDirection, direction, 'in'),
        { angle: ANGLE },
        asWeb,
        suffix,
      ),
    },
    {
      ...spinOptions,
      composite: 'add',
      ...getLoopOverrides(spinOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}
