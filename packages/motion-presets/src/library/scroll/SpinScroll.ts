import type { AnimationFillMode, DomApi, ScrubAnimationOptions, SpinScroll } from '../../types';
import { toKeyframeValue, parseDirection } from '../../utils';
import { SCROLL_RANGES, SPIN_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: 'clockwise' },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
  scale: { type: 'number', min: 0, default: 1 },
  spins: { type: 'number', min: 0, default: 0.15 },
} as const;

const DIRECTION_MAP = {
  clockwise: 1,
  'counter-clockwise': -1,
};

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-spinScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as SpinScroll;
  const direction = parseDirection<(typeof SPIN_DIRECTIONS)[number]>(
    namedEffect?.direction,
    SPIN_DIRECTIONS,
    schema.direction.default,
  );
  const {
    spins = schema.spins.default,
    scale = schema.scale.default,
    range = schema.range.default,
  } = namedEffect;
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
