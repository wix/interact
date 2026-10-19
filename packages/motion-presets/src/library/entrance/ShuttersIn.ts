import { ShuttersIn, TimeAnimationOptions, EffectFourDirections } from '../../types';
import {
  getShuttersClipPaths,
  getEasing,
  toKeyframeValue,
  parseDirection,
  getEntranceFill,
  getOppositeDirection,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: 'left' },
  shutters: { type: 'number', min: 1, int: true, default: 12 },
  staggered: { type: 'bool', default: true },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-shuttersIn', 'motion-fadeInStep'].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as ShuttersIn;
  const from = parseDirection<EffectFourDirections>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
  );
  const direction = getOppositeDirection([...FOUR_DIRECTIONS], from);
  const { shutters = schema.shutters.default, staggered = schema.staggered.default } = namedEffect;
  const [shuttersIn, fadeIn] = getNames(options);

  const { clipStart, clipEnd } = getShuttersClipPaths(direction, shutters, staggered);

  const custom = {
    [`--motion-shutters-start${suffix}`]: clipStart,
    [`--motion-shutters-end${suffix}`]: clipEnd,
  };

  const easing = getEasing(options.easing || 'sineIn');

  return [
    {
      ...options,
      easing,
      name: shuttersIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          clipPath: toKeyframeValue(custom, `--motion-shutters-start${suffix}`, asWeb),
        },
        {
          clipPath: toKeyframeValue(custom, `--motion-shutters-end${suffix}`, asWeb),
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
}
