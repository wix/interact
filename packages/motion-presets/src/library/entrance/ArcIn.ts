import type { ArcIn, DomApi, LengthValue, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';
import { sideDirection } from '../../directions';

const FADE_IN_DURATION_FACTOR = 0.7;
const FADE_IN_EASING = 'sineIn';

const ROTATION_ANGLE = 80;

const DEFAULT_EASING = 'quintInOut';
const DEFAULTS: Required<ArcIn> = {
  type: 'ArcIn',
  depth: { value: 100, unit: 'px' },
  from: 'right',
  perspective: 800,
};

export const schema = {
  depth: { type: 'length', default: DEFAULTS.depth },
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_3D_TRANSFORM_NAME, MOTION_LAYOUT_ROTATION_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<ArcIn>;
  const { perspective = DEFAULTS.perspective } = namedEffect!;

  const fadeOptions = {
    ...options,
    duration: options.duration! * FADE_IN_DURATION_FACTOR,
    easing: FADE_IN_EASING,
  };
  const transformOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      angle: ROTATION_ANGLE,
      perspective,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, entranceGroup, asWeb, suffix),
    useDirectionalPreset(
      getMotion3dTransform,
      transformOptions,
      entranceGroup,
      {
        defaultDepth: DEFAULTS.depth as LengthValue,
        defaultDirection: DEFAULTS.from,
        directionType: sideDirection,
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(transformOptions, entranceGroup, {}, asWeb, suffix),
  ];
}
