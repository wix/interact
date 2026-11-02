import type {
  EffectFourDirections,
  SlideIn,
  TimeAnimationOptions,
  AnimationData,
} from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import { getMotionReveal } from '../../clipUtils';
import {
  getMotionLayoutRotation,
  getMotionTransRot,
  mergeTransformLayers,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';
import { getMotionFade } from '../../fadeBlurUtils';
import { sideDirection, toMotionRange } from '../../directions';

const TRAVEL = '100%';

const DEFAULT_EASING = 'cubicInOut';
const DEFAULTS: Required<SlideIn> = {
  type: 'SlideIn',
  from: 'left',
  start: 0,
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  start: { type: 'number', min: 0, max: 1, default: DEFAULTS.start },
};

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<SlideIn>;
  const { start: minimum = DEFAULTS.start } = namedEffect!;
  const { fill = 'backwards' } = options;
  const from = parseKeywordLazy(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from);
  // SlideIn reveals in the opposite direction to the movement to create its entrance feel
  const clipFrom = sideDirection.opposite(from) as EffectFourDirections;

  const transformOptions = {
    ...options,
    composite: 'add',
    easing,
    fill,
    namedEffect: { ...namedEffect, travel: TRAVEL },
  } as TimeAnimationOptions;
  const revealOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, minimum, from: clipFrom },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      easing,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    // the layout rotation comes first, so the motion moves along the element's rotated axes
    {
      ...transformOptions,
      composite: 'replace',
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionTransRot(
        toMotionRange(sideDirection, clipFrom, 'in'),
        { travel: TRAVEL },
        asWeb,
        suffix,
      ),
    },
    {
      ...revealOptions,
      ...getMotionReveal(toMotionRange(sideDirection, from, 'in'), { minimum }, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
