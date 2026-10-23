import type { SpinIn, TimeAnimationOptions } from '../../types';
import { toKeyframeValue, parseDirection, getEntranceFill } from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: 'clockwise' },
  scale: { type: 'number', min: 0, default: 0 },
  spins: { type: 'number', min: 0, default: 0.5 },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-spinIn'].map((name) => name + suffix);
}

const DIRECTION_MAP = {
  clockwise: -1,
  'counter-clockwise': 1,
};

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as SpinIn;
  const direction = parseDirection<(typeof SPIN_DIRECTIONS)[number]>(
    namedEffect?.direction,
    SPIN_DIRECTIONS,
    schema.direction.default,
  );
  const { spins = schema.spins.default, scale: initialScale = schema.scale.default } = namedEffect;
  const [fadeIn, spinIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const transformRotate = (DIRECTION_MAP[direction] > 0 ? 1 : -1) * 360 * spins;

  const custom = {
    [`--motion-scale${suffix}`]: `${initialScale}`,
    [`--motion-rotate${suffix}`]: `${transformRotate}deg`,
  };

  return [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'cubicIn',
      duration: options.duration! * Math.min(initialScale, 1),
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: spinIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          scale: toKeyframeValue(custom, `--motion-scale${suffix}`, asWeb),
          rotate: toKeyframeValue(custom, `--motion-rotate${suffix}`, asWeb),
        },
        {
          scale: '1',
          rotate: `0deg`,
        },
      ],
    },
  ];
}
