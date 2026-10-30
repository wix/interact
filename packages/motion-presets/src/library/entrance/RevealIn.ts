import type { RevealIn, TimeAnimationOptions } from '../../types';
import {
  getClipPolygonParams,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<RevealIn> = {
  type: 'RevealIn',
  from: 'left',
};

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.from },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-revealIn', 'motion-fadeIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const namedEffect = options.namedEffect as RevealIn;
  const direction = parseDirection(namedEffect?.from, FOUR_DIRECTIONS, DEFAULTS.from);
  const [revealIn, fadeIn] = getNames(options);
  const easing = options.easing || 'cubicInOut';

  const start = getClipPolygonParams({ direction, minimum: 0 });
  const end = getClipPolygonParams({ direction: 'initial' });

  const custom = {
    '--motion-clip-start': start,
  };

  const animations = [
    {
      ...options,
      easing,
      name: revealIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          clipPath: `var(--motion-clip-start, ${start})`,
        },
        {
          clipPath: end,
        },
      ],
    },
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
