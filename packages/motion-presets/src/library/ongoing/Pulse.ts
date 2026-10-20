import type { Pulse, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, holdAtRest, roundNumber, toKeyframeValue } from '../../utils';

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: 0 },
  scale: { type: 'number', min: 0, default: 0.93 },
} as const;

const SCALE_KEYFRAMES = [
  { keyframe: 27, depth: 4 / 7 },
  { keyframe: 45, depth: 0 },
  { keyframe: 72, depth: 1 },
  { keyframe: 100, depth: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Pulse;
  const { scale = schema.scale.default } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {};

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, depth }) => {
    const scaleKey = `--motion-scale${suffix}-${keyframe}`;
    if (depth) {
      custom[scaleKey] = roundNumber(scale + (1 - depth) * (1 - scale), 4);
    }

    return {
      offset: keyframe / 100,
      transform: `rotateZ(var(--motion-rotate, 0deg)) scale(${
        depth ? toKeyframeValue(custom, scaleKey, asWeb) : '1'
      })`,
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
    (options.namedEffect as Pulse)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;

  return [`motion-pulse-${timingFactor}`].map((name) => name + suffix);
}
