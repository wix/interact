import type { TimeAnimationOptions, FloatIn, EffectFourDirections } from '../../types';
import { toKeyframeValue, parseDirection, getEntranceFill } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  from: { type: 'enum', values: FOUR_DIRECTIONS, default: 'left' },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-floatIn', 'motion-fadeIn'].map((name) => name + suffix);
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
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as FloatIn;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
  );
  const [floatIn, fadeIn] = getNames(options);
  const fromParams = DIRECTION_MAP[direction];

  const translateX = fromParams.dx * fromParams.distance;
  const translateY = fromParams.dy * fromParams.distance;

  const custom = {
    [`--motion-translate-x${suffix}`]: `${translateX}px`,
    [`--motion-translate-y${suffix}`]: `${translateY}px`,
  };

  const easing = 'sineInOut';

  return [
    {
      ...options,
      name: floatIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          transform: `translate(${toKeyframeValue(
            custom,
            `--motion-translate-x${suffix}`,
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            `--motion-translate-y${suffix}`,
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
      fill: getEntranceFill(options),
      easing,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];
}
