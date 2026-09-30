import type { EffectFourDirections, SlideIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_REVEAL_NAME,
  getMotionReveal,
} from '../../clipUtils';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import {
  MOTION_FADE_NAME,
  getMotionFade,
  oppositeDirection,
  parseKeywordLazy,
  useBasicPreset,
  useDirectionalPreset,
} from '../../utils';

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

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_TRANS_ROT_NAME, MOTION_REVEAL_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<SlideIn>;
  const { start: minimum = DEFAULTS.start } = namedEffect!;

  // SlideIn reveals in the opposite direction to the movement to create it's entrance feel
  const clipFrom = oppositeDirection(
    parseKeywordLazy(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from), 'four-sides'
  );

  const transformOptions = {
    ...options,
    composite: 'add',
    easing,
    namedEffect: {
      ...namedEffect,
      travel: TRAVEL,
    },
  } as TimeAnimationOptions;
  const revealOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      minimum,
      from: clipFrom,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, { ...options, easing }, 'entrance', asWeb, suffix),
    // the layout rotation comes first, so the motion moves along the element's rotated axes
    useLayoutRotation(transformOptions, 'entrance', { composite: 'replace' }, asWeb, suffix),
    useDirectionalPreset(getMotionTransRot, transformOptions, 'entrance', {
      defaultDirection: DEFAULTS.from,
      directionType: 'four-sides',
    }, asWeb, suffix),
    useDirectionalPreset(getMotionReveal, revealOptions, 'entrance', {
      defaultDirection: oppositeDirection(DEFAULTS.from, 'four-sides') as EffectFourDirections,
      directionType: 'four-sides',
    }, asWeb, suffix),
  ];
}
