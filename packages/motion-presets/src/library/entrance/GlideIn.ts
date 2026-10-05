import type { AnimationData, GlideIn, LengthValue, TimeAnimationOptions } from '../../types';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  getMotionLayoutRotation,
  MOTION_LAYOUT_ROTATION_NAME,
} from '../../transformUtils';
import { parseLengthLazy } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { angleDirection, toMotionRange } from '../../directions';

const FADE_IN_EASING = 'step-start';

const DEFAULT_EASING = 'quintInOut';
const DEFAULTS: Required<GlideIn> = {
  type: 'GlideIn',
  from: 180,
  travel: { value: 100, unit: 'percentage' },
};

export const schema = {
  from: { type: 'angle', default: DEFAULTS.from },
  travel: { type: 'length', default: DEFAULTS.travel },
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
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<GlideIn>;
  const { fill = 'backwards' } = options;
  const from = angleDirection.parse(namedEffect?.from, DEFAULTS.from as number);

  return [
    {
      ...options,
      easing: FADE_IN_EASING,
      fill,
      ...getMotionFade(namedEffect as { opacity?: number }, asWeb, suffix),
    },
    {
      ...options,
      easing,
      fill,
      ...getMotionTransRot(
        toMotionRange(angleDirection, angleDirection.opposite(from), 'in'),
        { travel: parseLengthLazy(namedEffect?.travel, DEFAULTS.travel as LengthValue) },
        asWeb,
        suffix,
      ),
    },
    {
      ...options,
      composite: 'add' as const,
      easing,
      fill,
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}
