import type { AnimationExtraOptions, DomApi, Spin, TimeAnimationOptions } from '../../types';
import { getEasing, getTimingFactor, toKeyframeValue, parseDirection } from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: (typeof SPIN_DIRECTIONS)[number] = 'clockwise';

const DIRECTION_MAP = {
  clockwise: -1,
  'counter-clockwise': 1,
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Spin;
  const direction = parseDirection(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULT_DIRECTION);

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
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
  const iterationDelay = (options.namedEffect as Spin)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-spin-${timingFactor}`];
}
