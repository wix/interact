import type { AnimationData, Breathe, DomApi, TimeAnimationOptions } from '../../types';
import { AXIS_DIRECTIONS } from '../../consts';
import {
  getMotion3dTransform,
  getMotionLayoutRotation,
  getMotionTransRot,
  mergeTransformLayers,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { getLoopOverrides } from '../../easingUtils';
import { getEasingFamily, parseKeywordLazy, parseCssLength } from '../../utils';
import { axisDirection, toMotionRange } from '../../directions';

const DEFAULT_EASING = 'sineInOut';
const DIRECTIONS = [...AXIS_DIRECTIONS, 'center'] as const;

const DEFAULTS: Required<Breathe> = {
  type: 'Breathe',
  direction: 'vertical',
  iterationDelay: 0,
  perspective: 800,
  travel: { value: 25, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  travel: { type: 'length', default: DEFAULTS.travel },
};

// a damped back-and-forth, first towards the positive side of the axis (down, right or towards the viewer)
const SHAPE: LoopPoint[] = [
  [0, 0],
  [-1, 0.1],
  [1, 0.302],
  [-1, 0.504],
  [0.7, 0.705],
  [-0.6, 0.839],
  [0, 1],
];

export function getNames(options: TimeAnimationOptions) {
  return style(options).map(({ name }) => name!);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function layers(options: TimeAnimationOptions, asWeb = false): AnimationData[] {
  const { easing = DEFAULT_EASING, namedEffect, suffix } = options as TimeAnimationOptions<Breathe>;
  const { perspective = DEFAULTS.perspective, travel = DEFAULTS.travel } = namedEffect!;
  const direction = parseKeywordLazy(namedEffect?.direction, DIRECTIONS, DEFAULTS.direction);
  const ease = getEasingFamily(easing);
  const isCenter = direction === 'center';
  // center moves along the z-axis
  const axis = isCenter ? 'vertical' : direction;

  const breatheOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: axis,
      perspective,
      travel,
    },
  } as TimeAnimationOptions;

  const motionRange = toMotionRange(axisDirection, axis, 'in');
  const params = { perspective, travel: parseCssLength(travel, { value: 0, unit: 'px' }) };

  return [
    {
      ...breatheOptions,
      ...getLoopOverrides(breatheOptions, { shape: SHAPE, easings: [ease.out, ease.inOut] }),
      ...(isCenter
        ? getMotion3dTransform(motionRange, params, asWeb, suffix)
        : getMotionTransRot(motionRange, params, asWeb, suffix)),
    },
    {
      ...breatheOptions,
      composite: 'add',
      ...getLoopOverrides(breatheOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}

export function style(...args: Parameters<typeof layers>): AnimationData[] {
  return mergeTransformLayers(layers(...args), args[0].suffix);
}
