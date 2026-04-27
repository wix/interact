import type { AnimationFillMode, DomApi, ScrubAnimationOptions, SpinScroll } from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: (typeof SPIN_DIRECTIONS)[number] = 'clockwise';

const DIRECTION_MAP = {
  clockwise: 1,
  'counter-clockwise': -1,
};

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-spinScroll'];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as SpinScroll;
  const direction = parseDirection(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULT_DIRECTION);
  const { spins = 0.15, scale = 1, range = 'in' } = namedEffect;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const spinDirection = DIRECTION_MAP[direction];
  const rotationZ = spins * 360;
  const isIn = range === 'in';

  const fromValue = isIn ? -rotationZ : range === 'out' ? 0 : -rotationZ / 2;
  const toValue = isIn ? 0 : range === 'out' ? rotationZ : rotationZ / 2;

  const [spinScroll] = getNames(options);

  const custom = {
    '--motion-spin-from': `${spinDirection * fromValue}deg`,
    '--motion-spin-to': `${spinDirection * toValue}deg`,
    '--motion-spin-scale-from': isIn ? scale : 1,
    '--motion-spin-scale-to': isIn ? 1 : scale,
  };

  return [
    {
      ...options,
      name: spinScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          transform: `scale(${toKeyframeValue(
            custom,
            '--motion-spin-scale-from',
            asWeb,
          )}) rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-spin-from', asWeb)}))`,
        },
        {
          transform: `scale(${toKeyframeValue(
            custom,
            '--motion-spin-scale-to',
            asWeb,
          )}) rotate(calc(${toKeyframeValue(
            {},
            '--motion-rotate',
            false,
            '0deg',
          )} + ${toKeyframeValue(custom, '--motion-spin-to', asWeb)}))`,
        },
      ],
    },
  ];
}
