import type { AnimationData, FlipIn, TimeAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import {
  getMotion3dTransform,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { getMotionFade } from '../../fadeBlurUtils';
import { axisDirection, toMotionRange } from '../../directions';

const FADE_IN_EASING = 'quadOut';

const DEFAULT_EASING = 'backOut';
const DEFAULTS: Required<FlipIn> = {
  type: 'FlipIn',
  angle: 90,
  direction: 'vertical',
  perspective: 800,
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<FlipIn>;
  const { angle = DEFAULTS.angle, perspective = DEFAULTS.perspective } = namedEffect!;
  const { fill = 'backwards' } = options;
  const direction = axisDirection.parse(namedEffect?.direction, DEFAULTS.direction);

  const transformOptions = {
    ...options,
    composite: 'add',
    easing,
    fill,
    namedEffect: { ...namedEffect, angle, perspective },
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
        toMotionRange(axisDirection, direction, 'in'),
        { angle, perspective },
        asWeb,
        suffix,
      ),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
