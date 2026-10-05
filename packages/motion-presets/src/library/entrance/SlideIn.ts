import type { EffectFourDirections, SlideIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import { MOTION_REVEAL_NAME, getMotionReveal } from '../../clipUtils';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';
import { sideDirection } from '../../directions';

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
  return [
    MOTION_FADE_NAME,
    MOTION_LAYOUT_ROTATION_NAME,
    MOTION_TRANS_ROT_NAME,
    MOTION_REVEAL_NAME,
  ].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<SlideIn>;
  const { start: minimum = DEFAULTS.start } = namedEffect!;

  // SlideIn reveals in the opposite direction to the movement to create its entrance feel
  const clipFrom = sideDirection.opposite(
    parseKeywordLazy(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from),
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
    useBasicPreset(getMotionFade, { ...options, easing }, entranceGroup, asWeb, suffix),
    // the layout rotation comes first, so the motion moves along the element's rotated axes
    useLayoutRotation(transformOptions, entranceGroup, { composite: 'replace' }, asWeb, suffix),
    useDirectionalPreset(
      getMotionTransRot,
      transformOptions,
      entranceGroup,
      {
        defaultDirection: DEFAULTS.from,
        directionType: sideDirection,
      },
      asWeb,
      suffix,
    ),
    useDirectionalPreset(
      getMotionReveal,
      revealOptions,
      entranceGroup,
      {
        defaultDirection: sideDirection.opposite(DEFAULTS.from) as EffectFourDirections,
        directionType: sideDirection,
      },
      asWeb,
      suffix,
    ),
  ];
}
