import type { AnimationData, SpinIn, TimeAnimationOptions } from '../../types';
import { SPIN_DIRECTIONS } from '../../consts';
import {
  getMotionScale,
  getMotionTransRot,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { getMotionFade } from '../../fadeBlurUtils';
import { spinDirection, toMotionRange } from '../../directions';

const FADE_IN_EASING = 'cubicIn';

const DEFAULT_EASING = 'cubicInOut';
const DEFAULTS: Required<SpinIn> = {
  type: 'SpinIn',
  direction: 'clockwise',
  scale: 0,
  spins: 0.5,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  spins: { type: 'number', min: 0, default: DEFAULTS.spins },
};

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<SpinIn>;
  const { scale = DEFAULTS.scale, spins = DEFAULTS.spins } = namedEffect!;
  const { fill = 'backwards' } = options;
  const angle = 360 * spins;
  const motionRange = toMotionRange(
    spinDirection,
    spinDirection.parse(namedEffect?.direction, DEFAULTS.direction),
    'in',
  );

  const transformOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, angle, scale },
  } as TimeAnimationOptions;

  return [
    // the fade shortens with the starting scale - growing from 0 needs no fade
    {
      ...options,
      duration: options.duration! * Math.min(scale, 1),
      easing: FADE_IN_EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionTransRot(motionRange, { angle }, asWeb, suffix),
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

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
