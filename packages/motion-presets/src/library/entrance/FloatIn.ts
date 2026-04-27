import type { TimeAnimationOptions, FloatIn, EffectFourDirections } from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'left';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-floatIn', 'motion-fadeIn'];
}

const DIRECTION_MAP = {
  top: { dx: 0, dy: -1, distance: 120 },
  right: { dx: 1, dy: 0, distance: 120 },
  bottom: { dx: 0, dy: 1, distance: 120 },
  left: { dx: -1, dy: 0, distance: 120 },
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as FloatIn;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const [floatIn, fadeIn] = getNames(options);
  const fromParams = DIRECTION_MAP[direction];

  const translateX = fromParams.dx * fromParams.distance;
  const translateY = fromParams.dy * fromParams.distance;

  const custom = {
    '--motion-translate-x': `${translateX}px`,
    '--motion-translate-y': `${translateY}px`,
  };

  const easing = 'sineInOut';

  return [
    {
      ...options,
      name: floatIn,
      easing,
      custom,
      keyframes: [
        {
          transform: `translate(${toKeyframeValue(
            custom,
            '--motion-translate-x',
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            '--motion-translate-y',
            asWeb,
          )}) rotate(var(--motion-rotate, 0deg))`,
        },
        {
          transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
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
