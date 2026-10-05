import type { ShapeIn, TimeAnimationOptions } from '../../types';
import { SHAPES } from '../../consts';
import { MOTION_SHAPE_NAME, getMotionShape } from '../../clipUtils';
import { parseKeywordLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';

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

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<ShapeIn>;
  const { shape } = namedEffect!;

  const fadeOptions = {
    ...options,
    duration: options.duration! * FADE_IN_DURATION_FACTOR,
    easing: FADE_IN_EASING,
  };
  const shapeOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      shape: parseKeywordLazy(shape, SHAPES, DEFAULTS.shape),
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, entranceGroup, asWeb, suffix),
    useBasicPreset(getMotionShape, shapeOptions, entranceGroup, asWeb, suffix),
  ];
}
