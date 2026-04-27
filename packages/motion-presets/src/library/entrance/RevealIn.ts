import type { RevealIn, TimeAnimationOptions, EffectFourDirections } from '../../types';
import { getClipPolygonParams, parseDirection } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'left';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-revealIn', 'motion-fadeIn'];
}

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const namedEffect = options.namedEffect as RevealIn;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
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
      easing,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];
}
