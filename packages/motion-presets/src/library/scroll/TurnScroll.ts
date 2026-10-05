import type { AnimationData, DomApi, ScrubAnimationOptions, TurnScroll } from '../../types';
import { SCROLL_RANGES, SPIN_DIRECTIONS, TWO_SIDES_DIRECTIONS } from '../../consts';
import { sideDirection, toMotionRange } from '../../directions';
import { getOffscreenTravels, measureLayout } from '../../layoutUtils';
import {
  getLinearScrollEasing,
  getScrollOverrides,
  parseRange,
  withSharedScrollRange,
} from '../../rangeUtils';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  getMotionLayoutRotation,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';

const DEFAULTS: Required<TurnScroll> = {
  type: 'TurnScroll',
  angle: 45,
  direction: 'left',
  range: 'in',
  scale: 1,
  spin: 'clockwise',
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  direction: { type: 'enum', values: TWO_SIDES_DIRECTIONS, default: DEFAULTS.direction },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  spin: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.spin },
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME, MOTION_SCALE_NAME].map(
    (name) => name + suffix,
  );
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  measureLayout(dom);
}

export function web(options: ScrubAnimationOptions, dom?: DomApi) {
  prepare(options, dom);

  return style(options, true);
}

// moves from fully outside the viewport on one side to fully outside on the other side while turning
export function style(options: ScrubAnimationOptions, asWeb = false): AnimationData[] {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<TurnScroll>;
  const { angle = DEFAULTS.angle, scale = DEFAULTS.scale } = namedEffect!;
  const range = parseRange(namedEffect, DEFAULTS.range);
  const side = parseKeywordLazy(namedEffect?.direction, TWO_SIDES_DIRECTIONS, DEFAULTS.direction);
  const spin = parseKeywordLazy(namedEffect?.spin, SPIN_DIRECTIONS, DEFAULTS.spin);
  const direction = range === 'out' ? sideDirection.opposite(side) : side;

  // the rotation shares the motion's sign - a positive angle turns clockwise when moving right
  const turnAngle = angle * (spin === 'clockwise' ? 1 : -1) * (side === 'right' ? 1 : -1);

  const turnOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      angle: turnAngle,
      direction: side,
      ...getOffscreenTravels(side),
    },
  } as ScrubAnimationOptions;
  const scaleOptions = {
    ...options,
    namedEffect: { ...namedEffect, scale },
  } as ScrubAnimationOptions;

  const motionRange = toMotionRange(sideDirection, direction, range);
  const scaleOverrides = getScrollOverrides(options, range, getLinearScrollEasing(range, false));

  return withSharedScrollRange([
    {
      ...turnOptions,
      ...getScrollOverrides(options, range, getLinearScrollEasing(range, true)),
      // 'out' is the reversed 'in' of the opposite direction, so its travels are those towards that direction
      ...getMotionTransRot(
        motionRange,
        { angle: turnAngle, ...getOffscreenTravels(direction as typeof side) },
        asWeb,
        suffix,
      ),
    },
    {
      ...turnOptions,
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
