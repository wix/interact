import type { Bounce, DomApi, TimeAnimationOptions } from '../../types';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import type { LoopPoint } from '../../easingUtils';
import { useDirectionalPreset } from '../../presetUtils';

const EASING = 'sineOut';
const DIRECTION = 'top';

const DEFAULTS: Required<Bounce> = {
  type: 'Bounce',
  iterationDelay: 0,
  travel: { value: 49, unit: 'px' },
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  travel: { type: 'length', default: DEFAULTS.travel },
};

// a jump up and smaller bounces after it
const SHAPE: LoopPoint[] = [
  [0, 0],
  [55, 8.8],
  [87, 17.6],
  [98, 26.5],
  [87, 35.3],
  [55, 44.1],
  [0, 53.1],
  [23, 66.2],
  [0, 81],
  [5, 86.8],
  [0, 94.1],
  [2, 97.1],
  [0, 100],
].map(([value, time]) => [value / 98, time / 100]);

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Bounce>;
  const { travel = DEFAULTS.travel } = namedEffect!;

  const bounceOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: DIRECTION,
      travel,
    },
  } as TimeAnimationOptions;

  return [
    useDirectionalPreset(
      getMotionTransRot,
      bounceOptions,
      'ongoing',
      {
        directionType: 'four-sides',
        loop: { shape: SHAPE, easings: [EASING] },
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(bounceOptions, 'ongoing', {}, asWeb, suffix),
  ];
}
