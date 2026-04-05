import type { Jello, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, toKeyframeValue, mapRange } from '../../utils';

const JELLO_FACTOR_SOFT = 1;
const JELLO_FACTOR_HARD = 4;

const SKEW_Y_KEYFRAMES = [
  { keyframe: 24, skewY: 7 },
  { keyframe: 38, skewY: -2 },
  { keyframe: 58, skewY: 4 },
  { keyframe: 80, skewY: -2 },
  { keyframe: 100, skewY: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Jello;
  const { intensity = 0.25 } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const [name] = getNames(options);
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;

  const jelloFactor = mapRange(0, 1, JELLO_FACTOR_SOFT, JELLO_FACTOR_HARD, intensity);

  // Create CSS custom properties for the jello configuration
  const custom: Record<string, string | number> = {
    '--motion-skew-y': jelloFactor,
  };

  const keyframes = SKEW_Y_KEYFRAMES.map(({ keyframe, skewY }) => {
    const offset = (keyframe / 100) * timingFactor;

    return {
      offset,
      transform: `rotateZ(var(--motion-rotate, 0deg)) skewY(calc(${toKeyframeValue(
        custom,
        '--motion-skew-y',
        asWeb,
      )} * ${skewY}deg))`,
    };
  });

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
  const iterationDelay = (options.namedEffect as Jello)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-jello-${timingFactor}`];
}
