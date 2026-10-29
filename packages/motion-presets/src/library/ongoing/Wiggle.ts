import type { Wiggle, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import {
  getTimingFactor,
  parseLengthLazy,
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';

const DEFAULTS: Required<Wiggle> = {
  type: 'Wiggle',
  angle: 25,
  iterationDelay: 0,
  travel: { value: 25, unit: 'px' },
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  travel: { type: 'length', default: DEFAULTS.travel },
};

const TRANSFORM_KEYFRAMES = [
  { keyframe: 0, lift: 0, rotate: 0 },
  { keyframe: 18, lift: 1, rotate: 1 },
  { keyframe: 35, lift: 0, rotate: -0.8 },
  { keyframe: 53, lift: 0, rotate: 0.6 },
  { keyframe: 73, lift: 0, rotate: -0.4 },
  { keyframe: 100, lift: 0, rotate: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Wiggle;
  const {
    angle = DEFAULTS.angle,
    travel = DEFAULTS.travel,
    iterationDelay = DEFAULTS.iterationDelay,
  } = namedEffect;
  const duration = options.duration || 1;
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-wiggle-angle': `${angle}deg`,
    '--motion-wiggle-travel': parseLengthLazy(travel, { value: 0, unit: 'px' }),
  };
  const wiggleAngle = toKeyframeValue(custom, '--motion-wiggle-angle', asWeb);
  const wiggleTravel = toKeyframeValue(custom, '--motion-wiggle-travel', asWeb);

  const keyframes = TRANSFORM_KEYFRAMES.map(({ keyframe, lift, rotate }) => ({
    offset: (keyframe / 100) * timingFactor,
    transform: `rotate(calc(var(--motion-rotate, 0deg) + ${wiggleAngle} * ${rotate})) translateY(calc(${wiggleTravel} * ${-lift}))`,
  }));

  const animations = [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Wiggle)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-wiggle-${timingFactor}`], options.suffix);
}
