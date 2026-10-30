import type { SpinIn, TimeAnimationOptions } from '../../types';
import {
  toKeyframeValue,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<SpinIn> = {
  type: 'SpinIn',
  direction: 'clockwise',
  scale: 0,
  spins: 0.5,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
  spins: { type: 'number', min: 0, default: DEFAULTS.spins },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-spinIn'], options.suffix);
}

const DIRECTION_MAP = {
  clockwise: -1,
  'counter-clockwise': 1,
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as SpinIn;
  const direction = parseDirection(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULTS.direction);
  const { spins = DEFAULTS.spins, scale = DEFAULTS.scale } = namedEffect;
  const [fadeIn, spinIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const transformRotate = (DIRECTION_MAP[direction] > 0 ? 1 : -1) * 360 * spins;

  const custom = {
    '--motion-scale': `${scale}`,
    '--motion-spin-rotate': `${transformRotate}deg`,
  };

  const animations = [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'cubicIn',
      duration: options.duration! * Math.min(scale, 1),
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: spinIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          scale: toKeyframeValue(custom, '--motion-scale', asWeb),
          rotate: toKeyframeValue(custom, '--motion-spin-rotate', asWeb),
          transform: 'rotate(var(--motion-rotate, 0deg))',
        },
        {
          scale: '1',
          rotate: `0deg`,
          transform: 'rotate(var(--motion-rotate, 0deg))',
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
