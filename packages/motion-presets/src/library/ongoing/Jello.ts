import type { Jello, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, holdAtRest, roundNumber, toKeyframeValue } from '../../utils';

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: 0 },
  skew: { type: 'number', default: 12.25 },
} as const;

const SKEW_Y_KEYFRAMES = [
  { keyframe: 24, skewY: 1 },
  { keyframe: 38, skewY: -2 / 7 },
  { keyframe: 58, skewY: 4 / 7 },
  { keyframe: 80, skewY: -2 / 7 },
  { keyframe: 100, skewY: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Jello;
  const { skew = schema.skew.default } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const [name] = getNames(options);
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;

  // Create CSS custom properties for the jello configuration
  const custom: Record<string, string | number> = {};

  const keyframes = SKEW_Y_KEYFRAMES.map(({ keyframe, skewY }) => {
    const skewKey = `--motion-skew-y${suffix}-${keyframe}`;
    custom[skewKey] = `${roundNumber(skewY * skew, 4)}deg`;

    return {
      offset: keyframe / 100,
      transform: `rotateZ(var(--motion-rotate, 0deg)) skewY(${toKeyframeValue(
        custom,
        skewKey,
        asWeb,
      )})`,
    };
  });

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes: holdAtRest(keyframes, timingFactor),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Jello)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;

  return [`motion-jello-${timingFactor}`].map((name) => name + suffix);
}
