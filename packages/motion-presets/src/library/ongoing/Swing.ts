import type { AnimationData, DomApi, Swing, TimeAnimationOptions } from '../../types';
import { CENTER_AND_FOUR_DIRECTIONS, FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionLayoutRotation,
  getMotionTransRot,
  pivotToTransformOrigin,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { getLoopOverrides } from '../../easingUtils';
import { getEasingFamily, parseKeywordLazy } from '../../utils';
import { spinDirection, toMotionRange } from '../../directions';

const DEFAULT_EASING = 'sineInOut';
// the positive angle is a counter-clockwise spin's peak
const DIRECTION = 'counter-clockwise';

const DEFAULTS: Required<Swing> = {
  type: 'Swing',
  angle: 20,
  iterationDelay: 0,
  pivot: 'top',
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.pivot },
};

// a damped swing, first to the positive angle
const SHAPE: LoopPoint[] = [
  [0, 0],
  [1, 0.0934],
  [-1, 0.28],
  [0.6, 0.466],
  [-0.3, 0.653],
  [0.2, 0.839],
  [-0.05, 1.026],
  [0, 1.175],
].map(([value, time]) => [value, time / 1.175]);

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_LAYOUT_ROTATION_NAME, MOTION_TRANS_ROT_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Swing>;
  const { angle = DEFAULTS.angle, pivot = DEFAULTS.pivot } = namedEffect!;
  const ease = getEasingFamily(easing);

  const swingOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      angle,
      direction: DIRECTION,
      pivot,
    },
  } as TimeAnimationOptions;

  const transformOrigin = pivotToTransformOrigin(
    parseKeywordLazy(pivot, CENTER_AND_FOUR_DIRECTIONS, DEFAULTS.pivot),
  );

  return [
    // the layout rotation comes first, so the pivot is on the element's rotated side
    {
      ...swingOptions,
      composite: 'replace',
      ...getLoopOverrides(swingOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...swingOptions,
      ...getLoopOverrides(swingOptions, { shape: SHAPE, easings: [ease.out, ease.inOut] }),
      ...getMotionTransRot(
        toMotionRange(spinDirection, DIRECTION, 'in'),
        { angle, transformOrigin },
        asWeb,
        suffix,
      ),
    },
  ];
}
