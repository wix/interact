import { ShuttersIn, TimeAnimationOptions, EffectFourDirections } from '../../types';
import {
  getShuttersClipPaths,
  getEasing,
  toKeyframeValue,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'right';

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-shuttersIn', 'motion-fadeIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ShuttersIn;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { shutters = 12, staggered = true } = namedEffect;
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
      custom: {},
      keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
