import type { LengthValue, TiltIn, TimeAnimationOptions } from '../../types';
import { TWO_SIDES_DIRECTIONS } from '../../consts';
import { MOTION_REVEAL_NAME, getMotionReveal } from '../../clipUtils';
import {
  MOTION_TRANS_ROT_NAME,
  MOTION_3D_TRANSFORM_NAME,
  getMotionTransRot,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';

const FADE_IN_EASING = 'cubicOut';
const FADE_IN_DURATION_FACTOR = 0.2;
const ROTATE_2D_IN_DURATION_FACTOR = 0.8;
const CLIP_PATH_DURATION_FACTOR = 0.8;

const CLIP_DIRECTION = 'top';
const TILT_DIRECTION = 'vertical';
const ROTATION_2D_ANGLE = 30;
const ROTATION_3D_ANGLE = -90;

const DEFAULT_EASING = 'cubicOut';
const DEFAULTS: Required<TiltIn> = {
  type: 'TiltIn',
  depth: { value: 100, unit: 'px' },
  from: 'left',
  perspective: 800,
};

export const schema = {
  depth: { type: 'length', default: DEFAULTS.depth },
  from: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.from },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [
    MOTION_FADE_NAME,
    MOTION_3D_TRANSFORM_NAME,
    MOTION_TRANS_ROT_NAME,
    MOTION_LAYOUT_ROTATION_NAME,
    MOTION_REVEAL_NAME,
  ].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<TiltIn>;
  const { from, perspective = DEFAULTS.perspective } = namedEffect!;

  const fadeOptions = {
    ...options,
    duration: options.duration! * FADE_IN_DURATION_FACTOR,
    easing: FADE_IN_EASING,
  };
  const transform3dOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      angle: ROTATION_3D_ANGLE,
      direction: TILT_DIRECTION,
      perspective,
    },
  } as TimeAnimationOptions;

  // TiltIn always comes from the bottom - so it is clockwise when coming from the right side
  const direction = compareKeywordToNonDefaults(from, ['right'])
    ? 'clockwise'
    : 'counter-clockwise';
  // the 2d rotation settles before the tilt ends
  const transform2dOptions = {
    ...options,
    composite: 'add',
    duration: options.duration! * ROTATE_2D_IN_DURATION_FACTOR,
    easing,
    namedEffect: {
      ...namedEffect,
      angle: ROTATION_2D_ANGLE,
      direction,
    },
  } as TimeAnimationOptions;

  const revealOptions = {
    ...options,
    duration: options.duration! * CLIP_PATH_DURATION_FACTOR,
    easing,
    namedEffect: {
      ...namedEffect,
      from: CLIP_DIRECTION as TiltIn['from'],
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    useDirectionalPreset(
      getMotion3dTransform,
      transform3dOptions,
      'entrance',
      {
        defaultDepth: DEFAULTS.depth as LengthValue,
        directionType: 'axis',
      },
      asWeb,
      suffix,
    ),
    useDirectionalPreset(
      getMotionTransRot,
      transform2dOptions,
      'entrance',
      {
        directionType: 'spin',
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(transform3dOptions, 'entrance', {}, asWeb, suffix),
    useDirectionalPreset(
      getMotionReveal,
      revealOptions,
      'entrance',
      {
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
  ];
}
