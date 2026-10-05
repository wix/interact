import type {
  BounceIn,
  EffectFourDirections,
  LengthValue,
  TimeAnimationOptions,
} from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_TRANS_ROT_NAME,
  MOTION_3D_TRANSFORM_NAME,
  getMotionTransRot,
  getMotion3dTransform,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { compareKeywordToNonDefaults } from '../../utils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';
import { sideDirection } from '../../directions';

// BounceIn uses easing to create the bouncing movement and uses only 2 keyframes
const BOUNCE_IN_EASING = `linear(${[
  [0],
  [0.0129, 3.25],
  [0.1159, 9.55],
  [0.2076, 12.7],
  [0.3011, 15.25],
  [0.4149, 17.9],
  [0.5426, 20.55],
  [0.8588, 26.75],
  [1, 30],
  [0.7999, 34.5],
  [0.7187, 36.75],
  [0.6874, 38],
  [0.6664, 39.25],
  [0.65, 42],
  [0.6685, 44.6],
  [0.7233, 47.1],
  [0.7948, 49.15],
  [0.9506, 52.7],
  [1, 54],
  [0.8799, 57],
  [0.8312, 58.5],
  [0.8, 60.15],
  [0.79, 62],
  [0.8011, 64.6],
  [0.834, 67.1],
  [0.8769, 69.15],
  [1, 74],
  [0.9277, 78.5],
  [0.9143, 80.15],
  [0.91, 82],
  [0.9288, 85.4],
  [1, 90],
  [0.98, 95],
  [1],
]
  .map(
    (params: number[]) =>
      `${params[0].toFixed(4)}${params[1] === undefined ? '' : ` ${params[1].toFixed(2)}%`}`,
  )
  .join(', ')})`;

const FADE_IN_DURATION_FACTOR = 0.54;
const FADE_IN_EASING = 'quadOut';

const DIRECTIONS = [...FOUR_DIRECTIONS, 'back'] as const;

const DEFAULTS: Required<BounceIn> = {
  type: 'BounceIn',
  from: 'bottom',
  perspective: 800,
  travel: { value: 50, unit: 'px' },
};

export const schema = {
  from: { type: 'enum', values: DIRECTIONS, default: DEFAULTS.from },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  travel: { type: 'length', default: DEFAULTS.travel },
};

export function getNames({ namedEffect, suffix = '' }: TimeAnimationOptions) {
  const { from } = namedEffect as BounceIn;
  return [
    MOTION_FADE_NAME,
    compareKeywordToNonDefaults(from, ['back']) ? MOTION_3D_TRANSFORM_NAME : MOTION_TRANS_ROT_NAME,
    MOTION_LAYOUT_ROTATION_NAME,
  ].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<BounceIn>;
  const { from, perspective = DEFAULTS.perspective } = namedEffect!;

  // 'back' bounces along the z-axis, the sides along their own axis
  const isBack = compareKeywordToNonDefaults(from, ['back']);
  const preset = isBack ? getMotion3dTransform : getMotionTransRot;

  const transformOptions = {
    ...options,
    easing: BOUNCE_IN_EASING,
    namedEffect: {
      ...namedEffect,
      // from 'top' starts at the negative sign - the z travel then starts behind the element
      from: isBack ? 'top' : from,
      perspective,
    },
  } as TimeAnimationOptions;

  const fadeOptions = {
    ...options,
    duration: options.duration! * FADE_IN_DURATION_FACTOR,
    easing: FADE_IN_EASING,
  };

  return [
    useBasicPreset(getMotionFade, fadeOptions, entranceGroup, asWeb, suffix),
    useDirectionalPreset(
      preset,
      transformOptions,
      entranceGroup,
      {
        defaultDirection: DEFAULTS.from as EffectFourDirections,
        defaultTravel: DEFAULTS.travel as LengthValue,
        directionType: sideDirection,
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(transformOptions, entranceGroup, {}, asWeb, suffix),
  ];
}
