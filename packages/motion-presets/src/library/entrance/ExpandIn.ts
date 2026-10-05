import type { ExpandIn, LengthValue, TimeAnimationOptions } from '../../types';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import {
  useBasicPreset,
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
} from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';

const FADE_IN_DURATION_FACTOR = 0.7;

const DEFAULT_EASING = 'cubicInOut';
const DEFAULTS: Required<ExpandIn> = {
  type: 'ExpandIn',
  from: 270, // from top
  scale: 0,
  travel: { value: 120, unit: 'percentage' },
};

export const schema = {
  from: { type: 'angle', default: DEFAULTS.from },
  scale: { type: 'number', min: 0, max: 1, default: DEFAULTS.scale },
  travel: { type: 'length', default: DEFAULTS.travel },
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [
    MOTION_FADE_NAME,
    MOTION_TRANS_ROT_NAME,
    MOTION_LAYOUT_ROTATION_NAME,
    MOTION_SCALE_NAME,
  ].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const {
    easing = DEFAULT_EASING,
    namedEffect,
    suffix,
  } = options as TimeAnimationOptions<ExpandIn>;
  const { scale = DEFAULTS.scale } = namedEffect!;

  const fadeOptions = {
    ...options,
    duration: options.duration! * FADE_IN_DURATION_FACTOR,
    easing,
  };
  const transformOptions = {
    ...options,
    easing,
    namedEffect: {
      ...namedEffect,
      scale,
    },
  } as TimeAnimationOptions;

  return [
    useBasicPreset(getMotionFade, fadeOptions, entranceGroup, asWeb, suffix),
    useDirectionalPreset(
      getMotionTransRot,
      transformOptions,
      entranceGroup,
      {
        defaultDirection: DEFAULTS.from as number,
        defaultTravel: DEFAULTS.travel as LengthValue,
        directionType: 'angle',
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(transformOptions, entranceGroup, {}, asWeb, suffix),
    useDirectionalPresetAsBasic(getMotionScale, transformOptions, entranceGroup, {}, asWeb, suffix),
  ];
}
