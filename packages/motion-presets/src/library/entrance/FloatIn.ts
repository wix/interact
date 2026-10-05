import type { FloatIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';

const TRAVEL = '120px';
const EASING = 'sineInOut';

const DEFAULTS: Required<FloatIn> = {
  type: 'FloatIn',
  from: 'left',
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_FADE_NAME, MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as TimeAnimationOptions<FloatIn>;

  const fadeOptions = { ...options, easing: EASING };
  const transformOptions = {
    ...options,
    easing: EASING,
    namedEffect: {
      ...namedEffect,
      travel: TRAVEL,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, entranceGroup, asWeb, suffix),
    useDirectionalPreset(
      getMotionTransRot,
      transformOptions,
      entranceGroup,
      {
        defaultDirection: DEFAULTS.from,
        directionType: 'four-sides',
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(transformOptions, entranceGroup, {}, asWeb, suffix),
  ];
}
