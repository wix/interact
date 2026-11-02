import type { AnimationData, DomApi, Pulse, TimeAnimationOptions } from '../../types';
import {
  getMotionScale,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { getLoopOverrides } from '../../easingUtils';
import { UNDIRECTED_MOTION_RANGE } from '../../directions';

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

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
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
      ...getMotionScale(UNDIRECTED_MOTION_RANGE, { scale }, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
