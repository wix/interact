import type { AnimationData, FoldIn, TimeAnimationOptions } from '../../types';
import { CENTER_AND_FOUR_DIRECTIONS, FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_3D_TRANSFORM_NAME,
  getMotion3dTransform,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
  pivotToTransformOrigin,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { sideDirection, toMotionRange } from '../../directions';

const FADE_IN_EASING = 'quadOut';

const DEFAULT_EASING = 'backOut';
const DEFAULTS: Required<FoldIn> = {
  type: 'FoldIn',
  angle: -90,
  perspective: 800,
  pivot: 'top',
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.pivot },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_3D_TRANSFORM_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<FoldIn>;
  const { angle = DEFAULTS.angle, perspective = DEFAULTS.perspective, pivot } = namedEffect!;
  const { fill = 'backwards' } = options;
  // folds in from its pivot side
  const from = sideDirection.parse(pivot, DEFAULTS.pivot);
  const transformOrigin = pivotToTransformOrigin(
    parseKeywordLazy(pivot, CENTER_AND_FOUR_DIRECTIONS, DEFAULTS.pivot),
  );

  const transformOptions = {
    ...options,
    composite: 'add',
    easing,
    fill,
    namedEffect: { ...namedEffect, angle, from: pivot, perspective },
  } as TimeAnimationOptions;

  return [
    {
      ...options,
      easing: FADE_IN_EASING,
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
      ...getMotion3dTransform(
        toMotionRange(sideDirection, sideDirection.opposite(from), 'in'),
        { angle, perspective, transformOrigin },
        asWeb,
        suffix,
      ),
    },
  ];
}
