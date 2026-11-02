import type { AnimationData, FloatIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  getMotionTransRot,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { getMotionFade } from '../../fadeBlurUtils';
import { sideDirection, toMotionRange } from '../../directions';

const TRAVEL = '120px';
const EASING = 'sineInOut';

const DEFAULTS: Required<FloatIn> = {
  type: 'FloatIn',
  from: 'left',
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
};

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<FloatIn>;
  const { fill = 'backwards' } = options;
  const from = sideDirection.parse(namedEffect?.from, DEFAULTS.from);

  const transformOptions = {
    ...options,
    easing: EASING,
    fill,
    namedEffect: { ...namedEffect, travel: TRAVEL },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      easing: EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionTransRot(
        toMotionRange(sideDirection, sideDirection.opposite(from), 'in'),
        { travel: TRAVEL },
        asWeb,
        suffix,
      ),
    },
    {
      ...transformOptions,
      composite: 'add',
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
