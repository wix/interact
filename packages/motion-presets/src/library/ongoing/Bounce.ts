import type { TimeAnimationOptions, Bounce, AnimationExtraOptions, DomApi } from '../../types';
import {
  getEasing,
  getTimingFactor,
  parseLengthLazy,
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';

const DEFAULTS: Required<Bounce> = {
  type: 'Bounce',
  iterationDelay: 0,
  travel: { value: 49, unit: 'px' },
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  travel: { type: 'length', default: DEFAULTS.travel },
};

const TRANSLATE_Y_KEYFRAMES = [
  { keyframe: 0, translateY: 0 },
  { keyframe: 8.8, translateY: -55 },
  { keyframe: 17.6, translateY: -87 },
  { keyframe: 26.5, translateY: -98 },
  { keyframe: 35.3, translateY: -87 },
  { keyframe: 44.1, translateY: -55 },
  { keyframe: 53.1, translateY: 0 },
  { keyframe: 66.2, translateY: -23 },
  { keyframe: 81, translateY: 0 },
  { keyframe: 86.8, translateY: -5 },
  { keyframe: 94.1, translateY: 0 },
  { keyframe: 97.1, translateY: -2 },
  { keyframe: 100, translateY: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Bounce;
  const { travel = DEFAULTS.travel, iterationDelay = DEFAULTS.iterationDelay } = namedEffect;

  const duration = options.duration || 1;
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const easing = getEasing('sineOut');

  const custom = {
    '--motion-bounce-travel': parseLengthLazy(travel, { value: 0, unit: 'px' }),
  };

  const keyframes = TRANSLATE_Y_KEYFRAMES.map(({ keyframe, translateY }) => ({
    offset: (keyframe / 100) * timingFactor,
    transform: `translateY(calc(${translateY / 98} * ${toKeyframeValue(
      custom,
      '--motion-bounce-travel',
      asWeb,
    )})) rotate(var(--motion-rotate, 0deg))`,
    easing,
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
  const iterationDelay = (options.namedEffect as Bounce)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-bounce-${timingFactor}`], options.suffix);
}
