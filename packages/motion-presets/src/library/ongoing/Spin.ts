import type { AnimationExtraOptions, DomApi, Spin, TimeAnimationOptions } from '../../types';
import {
  getEasing,
  getTimingFactor,
  toKeyframeValue,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<Spin> = {
  type: 'Spin',
  direction: 'clockwise',
  iterationDelay: 0,
};

export const schema = {
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
};

const DIRECTION_MAP = {
  clockwise: -1,
  'counter-clockwise': 1,
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Spin;
  const direction = parseDirection(namedEffect?.direction, SPIN_DIRECTIONS, DEFAULTS.direction);
  const { iterationDelay = DEFAULTS.iterationDelay } = namedEffect;

  const duration = options.duration || 1;
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const easing = options.easing || 'linear';

  const transformRotate = (DIRECTION_MAP[direction] > 0 ? 1 : -1) * 360;

  const custom = {
    '--motion-rotate-start': `calc(var(--motion-rotate, 0deg) + ${transformRotate}deg)`,
  };

  const animations = [
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

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Spin)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-spin-${timingFactor}`], options.suffix);
}
