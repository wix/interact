import type { TimeAnimationOptions, DomApi, AnimationExtraOptions, Flash } from '../../types';
import { getEasing, getTimingFactor, holdAtRest, getEasingKey } from '../../utils';

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: 0 },
} as const;

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, _asWeb = false) {
  const namedEffect = options.namedEffect as Flash;
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const easing = getEasing(options.easing || 'cubicInOut');
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const keyframes = [
    {
      offset: 0,
      opacity: 1,
      easing,
    },
    {
      offset: 0.5,
      opacity: 0,
      easing,
    },
    {
      offset: 1,
      opacity: 1,
    },
  ];

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      keyframes: holdAtRest(keyframes, timingFactor),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Flash)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;
  const easingKey = getEasingKey(options.easing);

  return [`motion-flash-${timingFactor}`].map((name) => name + easingKey + suffix);
}
