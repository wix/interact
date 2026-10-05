import type { GlideIn, LengthValue, TimeAnimationOptions } from '../../types';
import {
  MOTION_TRANS_ROT_NAME,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import { getMotionFade, MOTION_FADE_NAME } from '../../fadeBlurUtils';
import { useBasicPreset, useDirectionalPreset } from '../../presetUtils';
import { entranceGroup } from '../../entranceGroup';
import { angleDirection } from '../../directions';

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

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { easing = DEFAULT_EASING, suffix } = options as TimeAnimationOptions<GlideIn>;

  return [
    useBasicPreset(
      getMotionFade,
      { ...options, easing: FADE_IN_EASING },
      entranceGroup,
      asWeb,
      suffix,
    ),
    useDirectionalPreset(
      getMotionTransRot,
      { ...options, easing },
      entranceGroup,
      {
        defaultDirection: DEFAULTS.from as number,
        defaultTravel: DEFAULTS.travel as LengthValue,
        directionType: angleDirection,
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation({ ...options, easing }, entranceGroup, {}, asWeb, suffix),
  ];
}
