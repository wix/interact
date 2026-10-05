import type { DomApi, Spin, TimeAnimationOptions } from '../../types';
import { SPIN_DIRECTIONS } from '../../consts';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import { useDirectionalPreset } from '../../presetUtils';
import { ongoingGroup } from '../../ongoingGroup';
import { spinDirection } from '../../directions';

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

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Spin>;

  const spinOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: ANGLE,
    },
  } as TimeAnimationOptions;

  return [
    useDirectionalPreset(
      getMotionTransRot,
      spinOptions,
      ongoingGroup,
      {
        defaultDirection: DEFAULTS.direction,
        directionType: spinDirection,
        loop: { shape: SHAPE, easings: [easing] },
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(spinOptions, ongoingGroup, {}, asWeb, suffix),
  ];
}
