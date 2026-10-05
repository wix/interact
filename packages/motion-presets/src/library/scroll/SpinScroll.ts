import type { AnimationData, DomApi, ScrubAnimationOptions, SpinScroll } from '../../types';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';
import { spinDirection, toMotionRange } from '../../directions';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  MOTION_LAYOUT_ROTATION_NAME,
  getMotionLayoutRotation,
} from '../../transformUtils';

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

export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<SpinScroll>;
  const { scale = DEFAULTS.scale, spins = DEFAULTS.spins } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);
  const spin = spinDirection.parse(namedEffect!.direction, DEFAULTS.direction);
  const direction = range === 'out' ? spinDirection.opposite(spin) : spin;
  const angle = 360 * spins;

  const spinOptions = {
    ...options,
    namedEffect: { ...namedEffect, angle },
  } as ScrubAnimationOptions;
  const scaleOptions = {
    ...options,
    namedEffect: { ...namedEffect, scale },
  } as ScrubAnimationOptions;

  const motionRange = toMotionRange(spinDirection, direction, range);
  const scaleOverrides = getScrollOverrides(options, range, getLinearScrollEasing(range, false));

  return withSharedScrollRange([
    {
      ...spinOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      ...getMotionTransRot(motionRange, { angle }, asWeb, suffix),
    },
    {
      ...spinOptions,
      composite: 'add',
      ...scaleOverrides,
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
    {
      ...scaleOptions,
      ...scaleOverrides,
      ...getMotionScale(motionRange, { scale }, asWeb, suffix),
    },
  ]);
}
