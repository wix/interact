import {
  getEasingFamily,
  getEasing,
  toKeyframeValue,
  parseDirection,
  parseLength,
  getCssUnits,
  getEntranceFill,
} from '../../utils';
import type { BounceIn, TimeAnimationOptions } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';

const DIRECTIONS = [...FOUR_DIRECTIONS, 'back'] as const;

export const schema = {
  from: { type: 'enum', values: DIRECTIONS, default: 'bottom' },
  perspective: { type: 'number', min: 0, default: 800 },
  travel: { type: 'length', default: { value: 50, unit: 'px' } },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-bounceIn'].map((name) => name + suffix);
}

const { in: easeIn, out: easeOut } = getEasingFamily('sineIn');
const BOUNCE_KEYFRAMES = [
  { offset: 0, translate: 100 },
  { offset: 30, translate: 0 },
  { offset: 42, translate: 35 },
  { offset: 54, translate: 0 },
  { offset: 62, translate: 21 },
  { offset: 74, translate: 0 },
  { offset: 82, translate: 9 },
  { offset: 90, translate: 0 },
  { offset: 95, translate: 2 },
  { offset: 100, translate: 0, isIn: true },
];

const TRANSLATE_DIRECTION_MAP = {
  top: { y: -1, x: 0, z: 0 },
  right: { y: 0, x: 1, z: 0 },
  bottom: { y: 1, x: 0, z: 0 },
  left: { y: 0, x: -1, z: 0 },
  back: { x: 0, y: 0, z: -1 },
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as BounceIn;
  const direction = parseDirection<(typeof DIRECTIONS)[number]>(
    namedEffect?.from,
    DIRECTIONS,
    schema.from.default,
  );
  const travel = parseLength(namedEffect?.travel, schema.travel.default);
  const distanceFactor = travel.value / schema.travel.default.value;
  const unit = getCssUnits(travel.unit);
  const { perspective = schema.perspective.default } = namedEffect || {};
  const [fadeIn, bounceIn] = getNames(options);
  const perspectiveValue = direction === 'back' ? `perspective(${perspective}px)` : ' ';
  const { x, y, z } = TRANSLATE_DIRECTION_MAP[direction];

  const custom = {
    '--motion-direction-x': x,
    '--motion-direction-y': y,
    '--motion-direction-z': z,
    '--motion-distance-factor': distanceFactor,
    '--motion-perspective': perspectiveValue,
    '--motion-ease-in': getEasing(easeOut),
    '--motion-ease-out': getEasing(easeIn),
  };

  const easeIn_ = toKeyframeValue(custom, '--motion-ease-in', asWeb);
  const easeOut_ = toKeyframeValue(custom, '--motion-ease-out', asWeb);
  const distanceFactor_ = toKeyframeValue(custom, '--motion-distance-factor', asWeb);
  const perspective_ = toKeyframeValue(custom, '--motion-perspective', asWeb, '');
  const directionX = toKeyframeValue(custom, '--motion-direction-x', asWeb);
  const directionY = toKeyframeValue(custom, '--motion-direction-y', asWeb);
  const directionZ = toKeyframeValue(custom, '--motion-direction-z', asWeb);

  const keyframes = BOUNCE_KEYFRAMES.map(({ offset, translate }, index) => ({
    offset: offset / 100,
    animationTimingFunction: index % 2 ? easeIn_ : easeOut_,
    transform: `${(
      perspective_ as string
    ).trim()} translate3d(calc(${directionX} * ${distanceFactor_} * ${
      translate / 2
    }${unit}), calc(${directionY} * ${distanceFactor_} * ${
      translate / 2
    }${unit}), calc(${directionZ} * ${distanceFactor_} * ${
      translate / 2
    }${unit})) rotateZ(var(--motion-rotate, 0deg))`,
  }));

  return [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'quadOut',
      duration: (options.duration! * BOUNCE_KEYFRAMES[3].offset) / 100,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: bounceIn,
      fill: getEntranceFill(options),
      easing: 'linear',
      custom,
      keyframes,
    },
  ];
}
