import type { EffectFourDirections, SlideIn, TimeAnimationOptions } from '../../types';
import { getClipPolygonParams, parseDirection } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'left';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-slideIn', 'motion-fadeIn'];
}

const PARAM_MAP: Record<
  EffectFourDirections,
  { dx: number; dy: number; clip: EffectFourDirections }
> = {
  top: { dx: 0, dy: -1, clip: 'bottom' },
  right: { dx: 1, dy: 0, clip: 'left' },
  bottom: { dx: 0, dy: 1, clip: 'top' },
  left: { dx: -1, dy: 0, clip: 'right' },
};

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const namedEffect = options.namedEffect as SlideIn;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { initialTranslate = 1 } = namedEffect;
  const [slideIn, fadeIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const minimum = 100 - initialTranslate * 100;

  const start = getClipPolygonParams({
    direction: PARAM_MAP[direction].clip,
    minimum,
  });
  const clipEnd = getClipPolygonParams({ direction: 'initial' });

  const custom = {
    '--motion-clip-start': start,
    '--motion-translate-x': `${PARAM_MAP[direction].dx * 100}%`,
    '--motion-translate-y': `${PARAM_MAP[direction].dy * 100}%`,
  };

  return [
    {
      ...options,
      name: slideIn,
      easing,
      custom,
      keyframes: [
        {
          transform: `rotate(var(--motion-rotate, 0deg)) translate(var(--motion-translate-x, ${custom['--motion-translate-x']}), var(--motion-translate-y, ${custom['--motion-translate-y']}))`,
          clipPath: `var(--motion-clip-start, ${custom['--motion-clip-start']})`,
        },
        {
          transform: 'rotate(var(--motion-rotate, 0deg)) translate(0px, 0px)',
          clipPath: clipEnd,
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
