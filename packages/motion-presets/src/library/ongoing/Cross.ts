import type {
  AnimationData,
  Cross,
  DomApi,
  EffectEightDirections,
  TimeAnimationOptions,
} from '../../types';
import { EIGHT_DIRECTIONS } from '../../consts';
import type { Layout } from '../../layoutUtils';
import {
  getOffscreenDistance,
  getOffscreenTravel,
  getOppositeDirection,
  measureLayout,
} from '../../layoutUtils';
import {
  MOTION_LAYOUT_ROTATION_NAME,
  MOTION_TRANS_ROT_NAME,
  getMotionLayoutRotation,
  getMotionTransRot,
} from '../../transformUtils';
import { parseKeywordLazy } from '../../utils';
import { getActiveFraction, getLoopOverrides, getWrapEasing } from '../../easingUtils';
import { angleDirection, toMotionRange } from '../../directions';

const DEFAULTS: Required<Cross> = {
  type: 'Cross',
  direction: 'right',
  iterationDelay: 0,
};

export const schema = {
  direction: { type: 'enum', values: EIGHT_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
};

const DIRECTION_ANGLES: Record<EffectEightDirections, number> = {
  right: 0,
  'bottom-right': 45,
  bottom: 90,
  'bottom-left': 135,
  left: 180,
  'top-left': 225,
  top: 270,
  'top-right': 315,
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return [MOTION_TRANS_ROT_NAME, MOTION_LAYOUT_ROTATION_NAME].map((name) => name + suffix);
}

export function prepare(_options: TimeAnimationOptions, dom?: DomApi) {
  measureLayout(dom, 'parent');
}

export function web(options: TimeAnimationOptions, dom?: DomApi) {
  return style(options, true, measureLayout(dom, 'parent'));
}

// crosses its container towards the direction - from its place to fully outside the container,
// then from fully outside the opposite side back to its place, at a constant speed
export function style(
  options: TimeAnimationOptions,
  asWeb = false,
  layout?: Layout,
): AnimationData[] {
  const { namedEffect, suffix } = options as TimeAnimationOptions<Cross>;
  const direction = parseKeywordLazy(namedEffect?.direction, EIGHT_DIRECTIONS, DEFAULTS.direction);
  const opposite = getOppositeDirection(direction);
  const activeFraction = getActiveFraction(options);
  const travel = getOffscreenTravel(direction);
  const toTravel = getOffscreenTravel(opposite);

  const crossOptions = {
    ...options,
    namedEffect: {
      ...namedEffect,
      direction: DIRECTION_ANGLES[direction],
      range: 'continuous',
      travel,
      toTravel,
    },
  } as TimeAnimationOptions;

  // progress where the keyframes pass through the element's place - unmeasured sides are assumed equal
  const getRest = () => {
    if (!layout?.measured) {
      return 0.5;
    }
    const travel = getOffscreenDistance(layout, direction);
    const toTravel = getOffscreenDistance(layout, opposite);
    return travel / (travel + toTravel || 1);
  };

  const cross = {
    ...crossOptions,
    ...getLoopOverrides(crossOptions),
    ...getMotionTransRot(
      toMotionRange(
        angleDirection,
        angleDirection.opposite(angleDirection.parse(DIRECTION_ANGLES[direction])),
        'continuous',
      ),
      { travel, toTravel },
      asWeb,
      suffix,
    ),
  };

  return [
    layout
      ? {
          ...cross,
          easing: getWrapEasing(0.5, activeFraction),
          // read by @wix/motion after measurements
          get timing() {
            return { easing: getWrapEasing(getRest(), activeFraction) };
          },
        }
      : { ...cross, easing: getWrapEasing(0.5, activeFraction) },
    {
      ...crossOptions,
      composite: 'add',
      ...getLoopOverrides(crossOptions),
      ...getMotionLayoutRotation({}, asWeb, suffix),
    },
  ];
}
