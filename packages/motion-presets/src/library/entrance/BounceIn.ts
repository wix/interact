import {
  getEasingFamily,
  getEasing,
  toKeyframeValue,
  parseDirection,
  parseLengthLazy,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import type { BounceIn, TimeAnimationOptions } from '../../types';
import type { LengthValue } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

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

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-bounceIn'], options.suffix);
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
  const from = parseDirection(namedEffect?.from, DIRECTIONS, DEFAULTS.from);
  const travel = parseLengthLazy(namedEffect?.travel, DEFAULTS.travel as LengthValue);
  const { perspective = DEFAULTS.perspective } = namedEffect || {};
  const [fadeIn, bounceIn] = getNames(options);
  const perspectiveValue = from === 'back' ? `perspective(${perspective}px)` : ' ';
  const { x, y, z } = TRANSLATE_DIRECTION_MAP[from];

  const custom = {
    '--motion-direction-x': x,
    '--motion-direction-y': y,
    '--motion-direction-z': z,
    '--motion-travel': travel,
    '--motion-perspective': perspectiveValue,
  };

  const travel_ = toKeyframeValue(custom, '--motion-travel', asWeb);
  const perspective_ = toKeyframeValue(custom, '--motion-perspective', asWeb, '');
  const directionX = toKeyframeValue(custom, '--motion-direction-x', asWeb);
  const directionY = toKeyframeValue(custom, '--motion-direction-y', asWeb);
  const directionZ = toKeyframeValue(custom, '--motion-direction-z', asWeb);

  const keyframes = BOUNCE_KEYFRAMES.map(({ offset, translate }, index) => ({
    offset: offset / 100,
    easing: getEasing(index % 2 ? easeOut : easeIn),
    transform: `${(perspective_ as string).trim()} translate3d(calc(${directionX} * ${travel_} * ${
      translate / 100
    }), calc(${directionY} * ${travel_} * ${translate / 100}), calc(${directionZ} * ${travel_} * ${
      translate / 100
    })) rotateZ(var(--motion-rotate, 0deg))`,
  }));

  const animations = [
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

  return suffixCustomProperties(animations, options.suffix);
}
