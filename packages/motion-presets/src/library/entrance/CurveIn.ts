import type {
  AnimationData,
  CurveIn,
  DomApi,
  LengthValue,
  TimeAnimationOptions,
} from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
} from '../../transformUtils';
import { parseLengthLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { sideDirection, toMotionRange } from '../../directions';

const EASING = 'quadOut';
const ROTATION_ANGLE = 180;

const DEFAULTS: Required<CurveIn> = {
  type: 'CurveIn',
  depth: { value: 900, unit: 'px' },
  from: 'right',
  perspective: 200,
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

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<CurveIn>;
  const { depth, perspective = DEFAULTS.perspective } = namedEffect!;
  const { fill = 'backwards' } = options;
  const from = sideDirection.parse(namedEffect?.from, DEFAULTS.from);

  const transformOptions = {
    ...options,
    easing: EASING,
    fill,
    namedEffect: { ...namedEffect, angle: ROTATION_ANGLE, perspective },
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
      ...getMotion3dTransform(
        toMotionRange(sideDirection, sideDirection.opposite(from), 'in'),
        {
          angle: ROTATION_ANGLE,
          depth: parseLengthLazy(depth, DEFAULTS.depth as LengthValue),
          perspective,
        },
        asWeb,
        suffix,
      ),
    },
    {
      ...transformOptions,
      composite: 'add' as const,
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}
