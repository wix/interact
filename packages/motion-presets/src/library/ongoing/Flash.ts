import type { TimeAnimationOptions, DomApi, AnimationExtraOptions, Flash } from '../../types';
import { getEasing, getTimingFactor, suffixNames, suffixCustomProperties } from '../../utils';

const DEFAULTS: Required<Flash> = {
  type: 'Flash',
  iterationDelay: 0,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, _asWeb = false) {
  const namedEffect = options.namedEffect as Flash;
  const duration = options.duration || 1;
  const { iterationDelay = DEFAULTS.iterationDelay } = namedEffect;
  const easing = getEasing(options.easing || 'cubicInOut');
  const timingFactor = duration / (duration + iterationDelay);
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

  const animations = [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Flash)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-flash-${timingFactor}`], options.suffix);
}
