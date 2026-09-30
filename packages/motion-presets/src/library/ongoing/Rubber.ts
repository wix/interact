import type { DomApi, Rubber, TimeAnimationOptions } from '../../types';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_SCALE_NAME,
  getMotionScale,
  useLayoutRotation,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { useDirectionalPresetAsBasic } from '../../presetUtils';

const DEFAULTS: Required<Rubber> = {
  type: 'Rubber',
  iterationDelay: 0,
  stretch: 0.1,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  stretch: { type: 'number', min: -1, max: 1, default: DEFAULTS.stretch },
};

// a damped wobble between squashing (wider and shorter) and stretching, first squashing
const SHAPE: LoopPoint[] = [
  [0, 0],
  [-1, 0.45],
  [0.9, 0.56],
  [-0.8, 0.66],
  [0.45, 0.78],
  [-0.5275, 0.89],
  [0, 1],
];

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Rubber>;
  const { stretch = DEFAULTS.stretch } = namedEffect!;

  const scaleOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      scale: { x: 1 - stretch, y: 1 + stretch },
    },
  } as TimeAnimationOptions;

  return [
    // the layout rotation comes first, so the stretch is along the element's rotated axes
    useLayoutRotation(options, 'ongoing', { composite: 'replace' }, asWeb, suffix),
    useDirectionalPresetAsBasic(
      getMotionScale,
      scaleOptions,
      'ongoing',
      { loop: { shape: SHAPE } },
      asWeb,
      suffix,
    ),
  ];
}
