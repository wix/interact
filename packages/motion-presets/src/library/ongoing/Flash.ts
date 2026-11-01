import type { TimeAnimationOptions, DomApi, AnimationExtraOptions, Flash } from '../../types';
import {
  getEasing,
  getEasingName,
  getTimingFactor,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';

const DEFAULT_EASING = 'cubicInOut';

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
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const easing = getEasing(options.easing || DEFAULT_EASING);
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

  return suffixNames(
    [`motion-flash-${timingFactor}${getEasingName(options.easing, DEFAULT_EASING)}`],
    options.suffix,
  );
}
