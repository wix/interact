import type { DomApi, ScrubAnimationOptions, TurnScroll } from '../../types';
import { SCROLL_RANGES, SPIN_DIRECTIONS, TWO_SIDES_DIRECTIONS } from '../../consts';
import { getOffscreenTravels, measureLayout } from '../../layoutUtils';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_SCALE_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionScale,
  getMotionTransRot,
  useLayoutRotation,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';
import {
  useDirectionalPreset,
  useDirectionalPresetAsBasic,
  withSharedScrollRange,
} from '../../presetUtils';
import { scrollGroup } from '../../scrollGroup';
import { sideDirection } from '../../directions';

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
export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { namedEffect, suffix } = options as ScrubAnimationOptions<TurnScroll>;
  const { angle = DEFAULTS.angle, scale = DEFAULTS.scale } = namedEffect!;
  const side = parseKeywordLazy(namedEffect?.direction, TWO_SIDES_DIRECTIONS, DEFAULTS.direction);
  const spin = parseKeywordLazy(namedEffect?.spin, SPIN_DIRECTIONS, DEFAULTS.spin);

  const turnOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      // the rotation shares the motion's sign - a positive angle turns clockwise when moving right
      angle: angle * (spin === 'clockwise' ? 1 : -1) * (side === 'right' ? 1 : -1),
      direction: side,
      ...getOffscreenTravels(side),
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
      turnOptions,
      scrollGroup,
      {
        defaultDirection: DEFAULTS.direction,
        defaultRange: DEFAULTS.range,
        directionType: sideDirection,
      },
      asWeb,
      suffix,
    ),
    useLayoutRotation(turnOptions, scrollGroup, { defaultRange: DEFAULTS.range }, asWeb, suffix),
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
