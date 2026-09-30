import type { DomApi, Jello, TimeAnimationOptions } from '../../types';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import type { LoopPoint } from '../../utils';
import { useDirectionalPresetAsBasic } from '../../utils';

const DEFAULTS: Required<Jello> = {
  type: 'Jello',
  iterationDelay: 0,
  skew: 12.25,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  skew: { type: 'number', default: DEFAULTS.skew },
};

// a damped wobble, first to the positive skew
const SHAPE: LoopPoint[] = [
  [0, 0],
  [1, 0.24],
  [-2 / 7, 0.38],
  [4 / 7, 0.58],
  [-2 / 7, 0.8],
  [0, 1],
];

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_TRANS_ROT_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Jello>;
  const { skew = DEFAULTS.skew } = namedEffect!;

  const jelloOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      // the keyframes start at the negative side
      skew: { y: -skew },
    },
  } as TimeAnimationOptions;

  return [
    // the layout rotation comes first, so the skew is along the element's rotated axes
    useLayoutRotation(jelloOptions, 'ongoing', { composite: 'replace' }, asWeb, suffix),
    useDirectionalPresetAsBasic(getMotionTransRot, jelloOptions, 'ongoing', { loop: { shape: SHAPE } }, asWeb, suffix),
  ];
}
