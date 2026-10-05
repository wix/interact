import type { AnimationData, TimeAnimationOptions, TurnIn } from '../../types';
import { FOUR_CORNERS_DIRECTIONS } from '../../consts';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
  pivotToTransformOrigin,
} from '../../transformUtils';
import { compareKeywordToNonDefaults, parseKeywordLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { spinDirection, toMotionRange } from '../../directions';

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

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<TurnIn>;
  const { pivot } = namedEffect!;
  const { fill = 'backwards' } = options;

  // TurnIn always comes from the top - so it is clockwise when rotating around the left side
  const direction = compareKeywordToNonDefaults(pivot, ['top-right', 'bottom-right'])
    ? 'counter-clockwise'
    : 'clockwise';
  const transformOrigin = pivotToTransformOrigin(
    parseKeywordLazy(pivot, FOUR_CORNERS_DIRECTIONS, DEFAULTS.pivot),
  );

  const transformOptions = {
    ...options,
    easing,
    fill,
    namedEffect: { ...namedEffect, angle: ROTATION_ANGLE, direction },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      duration: options.duration! * FADE_IN_DURATION_FACTOR,
      easing: FADE_IN_EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...transformOptions,
      ...getMotionTransRot(
        toMotionRange(spinDirection, direction, 'in'),
        { angle: ROTATION_ANGLE, transformOrigin },
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
