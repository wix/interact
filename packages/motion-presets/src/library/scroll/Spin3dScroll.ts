import type { ScrubAnimationOptions, Spin3dScroll, DomApi } from '../../types';
import { SCROLL_RANGES } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import {
  useDirectionalPreset,
  withSharedScrollRange,
} from '../../utils';

const DIRECTION = 'clockwise';

const DEFAULTS: Required<Spin3dScroll> = {
  type: 'Spin3dScroll',
  angle: 100,
  perspective: 1000,
  range: 'in',
  speed: 1,
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_3D_TRANSFORM_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<Spin3dScroll>;
  const {
    angle = DEFAULTS.angle,
    perspective = DEFAULTS.perspective,
    speed = DEFAULTS.speed,
  } = namedEffect!;

  const transformOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: { x: angle, y: angle, z: angle },
      direction: DIRECTION, 
      perspective,
      parallax: { speed },
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(getMotion3dTransform, transformOptions, 'scroll', {
      defaultRange: DEFAULTS.range,
      directionType: 'spin',
    }, asWeb, suffix),
    useLayoutRotation(transformOptions, 'scroll', { defaultRange: DEFAULTS.range }, asWeb, suffix),
  ]);
}
