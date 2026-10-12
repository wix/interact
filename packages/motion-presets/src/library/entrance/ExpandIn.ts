import type { AnimationData, ExpandIn, LengthValue, TimeAnimationOptions } from '../../types';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
} from '../../transformUtils';
import { parseLengthLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { angleDirection, toMotionRange } from '../../directions';

const FADE_IN_DURATION_FACTOR = 0.7;

const DEFAULT_EASING = 'cubicInOut';
const DEFAULTS: Required<ExpandIn> = {
  type: 'ExpandIn',
  from: 270, // from top
  scale: 0,
  travel: { value: 120, unit: 'percentage' },
};

export const schema = {
  from: { type: 'angle', default: DEFAULTS.from },
  scale: { type: 'number', min: 0, max: 1, default: DEFAULTS.scale },
  travel: { type: 'length', default: DEFAULTS.travel },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [
    MOTION_FADE_NAME,
    MOTION_TRANS_ROT_NAME,
    MOTION_LAYOUT_ROTATION_NAME,
    MOTION_SCALE_NAME,
  ].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const {
    easing = DEFAULT_EASING,
    namedEffect,
    suffix,
  } = options as TimeAnimationOptions<ExpandIn>;
  const { scale = DEFAULTS.scale, travel } = namedEffect!;
  const { fill = 'backwards' } = options;
  const from = angleDirection.parse(namedEffect?.from, DEFAULTS.from as number);
  const motionRange = toMotionRange(angleDirection, angleDirection.opposite(from), 'in');

  const transformOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, scale },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      duration: options.duration! * FADE_IN_DURATION_FACTOR,
      easing,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionTransRot(
        motionRange,
        { travel: parseLengthLazy(travel, DEFAULTS.travel as LengthValue) },
        asWeb,
        suffix,
      ),
    },
    {
      ...transformOptions,
      composite: 'add',
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionScale(motionRange, { scale }, asWeb, suffix),
    },
  ];
}
