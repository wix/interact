import {
  toKeyframeValue,
  parseDirection,
  parseLengthLazy,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import type { BounceIn, LengthValue, TimeAnimationOptions } from '../../types';
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

const BOUNCE_EASING = `linear(${[
  [0],
  [0.0129, 3.25],
  [0.1159, 9.55],
  [0.2076, 12.7],
  [0.3011, 15.25],
  [0.4149, 17.9],
  [0.5426, 20.55],
  [0.8588, 26.75],
  [1, 30],
  [0.7999, 34.5],
  [0.7187, 36.75],
  [0.6874, 38],
  [0.6664, 39.25],
  [0.65, 42],
  [0.6685, 44.6],
  [0.7233, 47.1],
  [0.7948, 49.15],
  [0.9506, 52.7],
  [1, 54],
  [0.8799, 57],
  [0.8312, 58.5],
  [0.8, 60.15],
  [0.79, 62],
  [0.8011, 64.6],
  [0.834, 67.1],
  [0.8769, 69.15],
  [1, 74],
  [0.9277, 78.5],
  [0.9143, 80.15],
  [0.91, 82],
  [0.9288, 85.4],
  [1, 90],
  [0.98, 95],
  [1],
]
  .map(([value, offset]) => (offset === undefined ? `${value}` : `${value} ${offset}%`))
  .join(', ')})`;

const TRANSLATE_DIRECTION_MAP = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
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

  const custom: Record<string, string | number> =
    from === 'back'
      ? { '--motion-perspective': `${perspective}px`, '--motion-travel': travel }
      : {
          '--motion-direction-x': TRANSLATE_DIRECTION_MAP[from].x,
          '--motion-direction-y': TRANSLATE_DIRECTION_MAP[from].y,
          '--motion-travel': travel,
        };

  const travel_ = toKeyframeValue(custom, '--motion-travel', asWeb);
  const transformFrom =
    from === 'back'
      ? `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(calc(-1 * ${travel_}))`
      : `translate(calc(${toKeyframeValue(custom, '--motion-direction-x', asWeb)} * ${travel_}), calc(${toKeyframeValue(custom, '--motion-direction-y', asWeb)} * ${travel_}))`;
  const transformTo =
    from === 'back'
      ? `perspective(${toKeyframeValue(custom, '--motion-perspective', asWeb)}) translateZ(0px)`
      : 'translate(0px, 0px)';

  const animations = [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'quadOut',
      duration: options.duration! * 0.54,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: bounceIn,
      fill: getEntranceFill(options),
      easing: BOUNCE_EASING,
      custom,
      keyframes: [
        { transform: `${transformFrom} rotateZ(var(--motion-rotate, 0deg))` },
        { transform: `${transformTo} rotateZ(var(--motion-rotate, 0deg))` },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
