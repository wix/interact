import { ShuttersIn, TimeAnimationOptions, EffectFourDirections } from '../../types';
import {
  getShuttersClipPaths,
  getOppositeDirection,
  getEasing,
  toKeyframeValue,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<ShuttersIn> = {
  type: 'ShuttersIn',
  from: 'left',
  shutters: 12,
  staggered: true,
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
  shutters: { type: 'number', min: 1, int: true, default: DEFAULTS.shutters },
  staggered: { type: 'bool', default: DEFAULTS.staggered },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-shuttersIn', 'motion-fadeIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShuttersIn;
  const from = parseDirection(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from);
  const direction = getOppositeDirection<EffectFourDirections>([...FOUR_DIRECTIONS], from);
  const { shutters = DEFAULTS.shutters, staggered = DEFAULTS.staggered } = namedEffect;
  const [shuttersIn, fadeIn] = getNames(options);

  const { clipStart, clipEnd } = getShuttersClipPaths(direction, shutters, staggered);

  const custom = {
    '--motion-shutters-start': clipStart,
    '--motion-shutters-end': clipEnd,
  };

  const easing = getEasing(options.easing || 'sineIn');

  const animations = [
    {
      ...options,
      easing,
      name: shuttersIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          clipPath: toKeyframeValue(custom, '--motion-shutters-start', asWeb),
        },
        {
          clipPath: toKeyframeValue(custom, '--motion-shutters-end', asWeb),
        },
      ],
    },
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'step-start',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
