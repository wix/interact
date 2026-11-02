import type { AnimationData, DomApi, Flip, TimeAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import {
  getMotion3dTransform,
  getMotionLayoutRotation,
  mergeTransformLayers,
} from '../../transformUtils';
import { getLoopOverrides } from '../../easingUtils';
import { axisDirection, toMotionRange } from '../../directions';

const DEFAULT_EASING = 'linear';
const ANGLE = 360;

const DEFAULTS: Required<Flip> = {
  type: 'Flip',
  direction: 'horizontal',
  iterationDelay: 0,
  perspective: 800,
};

export const schema = {
  direction: { type: 'enum', values: AXIS_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
};

// a full flip - starting a turn away from rest, which looks the same
const SHAPE: [number, number][] = [
  [1, 0],
  [0, 1],
];

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Flip>;
  const { perspective = DEFAULTS.perspective } = namedEffect!;

  const flipOptions = {
    ...options,
    composite: 'add',
    namedEffect: {
      ...namedEffect,
      angle: ANGLE,
      perspective,
    },
  } as TimeAnimationOptions;

  const axis = axisDirection.parse(namedEffect?.direction, DEFAULTS.direction);

  return [
    // the layout rotation comes first, so the flip is along the element's rotated axes
    {
      ...flipOptions,
      composite: 'replace',
      ...getLoopOverrides(flipOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...flipOptions,
      ...getLoopOverrides(flipOptions, { shape: SHAPE, easings: [easing] }),
      ...getMotion3dTransform(
        toMotionRange(axisDirection, axis, 'in'),
        { angle: ANGLE, perspective },
        asWeb,
        suffix,
      ),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
