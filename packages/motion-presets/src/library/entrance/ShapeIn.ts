import type { AnimationData, ShapeIn, TimeAnimationOptions } from '../../types';
import { SHAPES } from '../../consts';
import { MOTION_SHAPE_NAME, getMotionShape } from '../../clipUtils';
import { parseKeywordLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';

const FADE_IN_DURATION_FACTOR = 0.8;
const FADE_IN_EASING = 'quadOut';

const DEFAULT_EASING = 'cubicInOut';
const DEFAULTS: Required<ShapeIn> = {
  type: 'ShapeIn',
  shape: 'rectangle',
};

export const schema = {
  shape: { type: 'enum', values: SHAPES, default: DEFAULTS.shape },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_SHAPE_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<ShapeIn>;
  const { fill = 'backwards' } = options;
  const shape = parseKeywordLazy(namedEffect?.shape, SHAPES, DEFAULTS.shape);

  const shapeOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, shape },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      duration: options.duration! * FADE_IN_DURATION_FACTOR,
      easing: FADE_IN_EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...shapeOptions,
      ...getMotionShape({ shape }, asWeb, suffix),
    },
  ];
}
