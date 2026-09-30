import type {
  DomApi,
  ScrubAnimationOptions,
  ShapeScroll,
} from '../../types';
import { SCROLL_RANGES, SHAPES } from '../../consts';
import {
  MOTION_SHAPE_NAME,
  getMotionShape,
} from '../../clipUtils';
import { parseKeywordLazy, useBasicPreset } from '../../utils';

const EASING = 'circInOut';

const DEFAULTS: Required<ShapeScroll> = {
  type: 'ShapeScroll',
  range: 'in',
  shape: 'circle',
  start: 0.5,
};

export const schema = {
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  shape: { type: 'enum', values: SHAPES, default: DEFAULTS.shape },
  start: { type: 'number', min: 0, max: 1, default: DEFAULTS.start },
}

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_SHAPE_NAME + suffix];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<ShapeScroll>;
  const { shape = DEFAULTS.shape, start: minimum = DEFAULTS.start } = namedEffect!;

  const shapeOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      minimum,
      shape: parseKeywordLazy(shape, SHAPES, DEFAULTS.shape),
    },
  } as ScrubAnimationOptions;

  return [
    useBasicPreset(getMotionShape, shapeOptions, 'scroll', asWeb, suffix, { easing: EASING, outEasing: EASING }),
  ];
}
