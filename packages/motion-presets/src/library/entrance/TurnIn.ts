import type { TimeAnimationOptions, TurnIn } from '../../types';
import { FOUR_CORNERS_DIRECTIONS } from '../../consts';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';

const FADE_IN_EASING = 'sineIn';
const FADE_IN_DURATION_FACTOR = 0.6;

const ROTATION_ANGLE = 50;

const DEFAULT_EASING = 'backOut';
const DEFAULTS: Required<TurnIn> = {
  type: 'TurnIn',
  pivot: 'top-left',
};

export const schema = {
  pivot: { type: 'enum', values: FOUR_CORNERS_DIRECTIONS, default: DEFAULTS.pivot },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<TurnIn>;
  const { pivot } = namedEffect!;

  // TurnIn always comes from the top - so it is clockwise when rotating around the left side
  const direction = compareKeywordToNonDefaults(pivot, ['top-right', 'bottom-right'])
    ? 'counter-clockwise'
    : 'clockwise';

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
      direction,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, 'entrance', asWeb, suffix),
    useDirectionalPreset(
      getMotionTransRot,
      transformOptions,
      'entrance',
      {
        defaultPivot: DEFAULTS.pivot,
        directionType: 'spin',
        pivotType: 'four-corners',
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(transformOptions, 'entrance', {}, asWeb, suffix),
  ];
}
