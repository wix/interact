import type { TurnIn, TimeAnimationOptions, EffectFourCorners } from '../../types';
import {
  toKeyframeValue,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_CORNERS_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<TurnIn> = {
  type: 'TurnIn',
  pivot: 'top-left',
};

export const schema = {
  pivot: { type: 'enum', values: FOUR_CORNERS_DIRECTIONS, default: DEFAULTS.pivot },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-turnIn'], options.suffix);
}

const PIVOT_TO_TRANSFORM_MAP: Record<EffectFourCorners, { x: number; y: number; angle: number }> = {
  'top-left': { angle: -50, x: -50, y: -50 },
  'top-right': { angle: 50, x: 50, y: -50 },
  'bottom-right': { angle: 50, x: 50, y: 50 },
  'bottom-left': { angle: -50, x: -50, y: 50 },
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as TurnIn;
  const pivot = parseDirection(namedEffect?.pivot, FOUR_CORNERS_DIRECTIONS, DEFAULTS.pivot);
  const [fadeIn, turnIn] = getNames(options);

  const easing = options.easing || 'backOut';
  const { x, y, angle } = PIVOT_TO_TRANSFORM_MAP[pivot];

  const custom = {
    '--motion-origin': `${x}%, ${y}%`,
    '--motion-origin-invert': `${-x}%, ${-y}%`,
    '--motion-rotate-z': `${angle}deg`,
  };

  const origin = toKeyframeValue(custom, '--motion-origin', asWeb);
  const invertedOrigin = toKeyframeValue(custom, '--motion-origin-invert', asWeb);

  const animations = [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      duration: options.duration! * 0.6,
      easing: 'sineIn',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: turnIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          transform: `translate(${origin}) rotate(${toKeyframeValue(
            custom,
            '--motion-rotate-z',
            asWeb,
          )}) translate(${invertedOrigin}) rotate(var(--motion-rotate, 0deg))`,
        },
        {
          transform: `translate(${origin}) rotate(0deg) translate(${invertedOrigin}) rotate(var(--motion-rotate, 0deg))`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
