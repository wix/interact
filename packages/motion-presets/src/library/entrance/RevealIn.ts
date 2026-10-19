import type { RevealIn, TimeAnimationOptions, EffectFourDirections } from '../../types';
import { getClipPolygonParams, parseDirection, getEntranceFill } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: 'left' },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-revealIn', 'motion-fadeIn'].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const namedEffect = options.namedEffect as RevealIn;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
  );
  const [revealIn, fadeIn] = getNames(options);
  const easing = options.easing || 'cubicInOut';

  const start = getClipPolygonParams({ direction, minimum: 0 });
  const end = getClipPolygonParams({ direction: 'initial' });

  const custom = {
    '--motion-clip-start': start,
  };

  return [
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
}
