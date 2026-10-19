import type { AnimationExtraOptions, DomApi, Spin, TimeAnimationOptions } from '../../types';
import { getEasing, getTimingFactor, toKeyframeValue, parseDirection } from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: 'clockwise' },
  iterationDelay: { type: 'number', min: 0, default: 0 },
} as const;

const DIRECTION_MAP = {
  clockwise: -1,
  'counter-clockwise': 1,
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Spin;
  const direction = parseDirection<(typeof SPIN_DIRECTIONS)[number]>(
    namedEffect?.direction,
    SPIN_DIRECTIONS,
    schema.direction.default,
  );

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const easing = options.easing || 'linear';

  const transformRotate = (DIRECTION_MAP[direction] > 0 ? 1 : -1) * 360;

  const custom = {
    '--motion-rotate-start': `calc(var(--motion-rotate, 0deg) + ${transformRotate}deg)`,
  };

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes: [
        {
          offset: 0,
          easing: getEasing(easing),
          rotate: toKeyframeValue(custom, '--motion-rotate-start', asWeb),
        },
        {
          offset: timingFactor,
          rotate: `var(--motion-rotate, 0deg)`,
        },
      ],
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Spin)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;

  return [`motion-spin-${timingFactor}`].map((name) => name + suffix);
}
