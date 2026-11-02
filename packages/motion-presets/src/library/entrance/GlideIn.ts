import type { AnimationData, GlideIn, LengthValue, TimeAnimationOptions } from '../../types';
import {
  getMotionTransRot,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { parseCssLength } from '../../utils';
import { getMotionFade } from '../../fadeBlurUtils';
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

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
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
        { travel: parseCssLength(namedEffect?.travel, DEFAULTS.travel as LengthValue) },
        asWeb,
        suffix,
      ),
    },
    {
      ...options,
      composite: 'add',
      easing,
      fill,
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
