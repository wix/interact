import type { DomApi, ScrubAnimationOptions, SpinScroll } from '../../types';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  useLayoutRotation,
} from '../../transformUtils';
import {
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
  withSharedScrollRange,
} from '../../presetUtils';
import { scrollGroup } from '../../scrollGroup';
import { spinDirection } from '../../directions';

const DEFAULTS: Required<SpinScroll> = {
  type: 'SpinScroll',
  direction: 'clockwise',
  range: 'in',
  scale: 1,
  spins: 0.15,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  spins: { type: 'number', min: 0, default: DEFAULTS.spins },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map(
    (name) => name + suffix,
  );
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<SpinScroll>;
  const { scale = DEFAULTS.scale, spins = DEFAULTS.spins } = namedEffect!;

  const spinOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: 360 * spins,
    },
  } as ScrubAnimationOptions;
  const scaleOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      scale,
    },
  } as ScrubAnimationOptions;

  return withSharedScrollRange([
    useDirectionalPreset(
      getMotionTransRot,
      spinOptions,
      scrollGroup,
      {
        defaultDirection: DEFAULTS.direction,
        defaultRange: DEFAULTS.range,
        directionType: spinDirection,
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(spinOptions, scrollGroup, { defaultRange: DEFAULTS.range }, asWeb, suffix),
    useDirectionalPresetAsBasic(
      getMotionScale,
      scaleOptions,
      scrollGroup,
      {
        defaultRange: DEFAULTS.range,
      },
      asWeb,
      suffix,
    ),
  ]);
}
