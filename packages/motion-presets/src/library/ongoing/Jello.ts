import type { AnimationData, DomApi, Jello, TimeAnimationOptions } from '../../types';
import {
  getMotionTransRot,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { getLoopOverrides } from '../../easingUtils';
import { UNDIRECTED_MOTION_RANGE } from '../../directions';

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

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Jello>;
  const { skew = DEFAULTS.skew } = namedEffect!;
  // the keyframes start at the negative sign, so the first peak is +skew
  const skewY = { y: -skew };

  const jelloOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      skew: skewY,
    },
  } as TimeAnimationOptions;

  return [
    // the layout rotation comes first, so the skew is along the element's rotated axes
    {
      ...jelloOptions,
      composite: 'replace',
      ...getLoopOverrides(jelloOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...jelloOptions,
      ...getLoopOverrides(jelloOptions, { shape: SHAPE }),
      ...getMotionTransRot(UNDIRECTED_MOTION_RANGE, { skew: skewY }, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
