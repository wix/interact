import type { TimeAnimationOptions, Bounce, AnimationExtraOptions, DomApi } from '../../types';
import { getEasing, getTimingFactor, toKeyframeValue, mapRange } from '../../utils';

const BOUNCE_FACTOR_SOFT = 1;
const BOUNCE_FACTOR_HARD = 3;

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
  const { intensity = 0 } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const bounceFactor = mapRange(0, 1, BOUNCE_FACTOR_SOFT, BOUNCE_FACTOR_HARD, intensity);

  const easing = getEasing('sineOut');

  const custom = {
    '--motion-bounce-factor': bounceFactor,
  };

  const keyframes = TRANSLATE_Y_KEYFRAMES.map(({ keyframe, translateY }) => ({
    offset: (keyframe / 100) * timingFactor,
    translate: `0px calc(${translateY / 2}px * ${toKeyframeValue(
      custom,
      '--motion-bounce-factor',
      asWeb,
    )})`,
    easing,
  }));

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes,
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Bounce)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-bounce-${timingFactor}`];
}
