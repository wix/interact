import type { TimeAnimationOptions, DomApi, AnimationExtraOptions, Flash } from '../../types';
import { getEasing, getTimingFactor } from '../../utils';

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, _asWeb = false) {
  const namedEffect = options.namedEffect as Flash;
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
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
      offset: 0.5 * timingFactor,
      opacity: 0,
      easing,
    },
    {
      offset: timingFactor,
      opacity: 1,
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
      keyframes,
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Flash)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-flash-${timingFactor}`];
}
