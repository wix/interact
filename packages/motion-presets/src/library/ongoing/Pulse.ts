import type { Pulse, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, roundNumber, toKeyframeValue } from '../../utils';

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: 0 },
  scale: { type: 'number', min: 0, default: 0.93 },
} as const;

const SCALE_KEYFRAMES = [
  { keyframe: 27, scale: 0.96 },
  { keyframe: 45, scale: 1 },
  { keyframe: 72, scale: 0.93 },
  { keyframe: 100, scale: 1 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Pulse;
  const { scale: minScale = schema.scale.default } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const pulseOffset = roundNumber(schema.scale.default - minScale, 4);

  // Create CSS custom properties for the pulse configuration
  const custom: Record<string, string | number> = {
    [`--motion-pulse-offset${suffix}`]: pulseOffset,
  };

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, scale }) => {
    const offset = (keyframe / 100) * timingFactor;

    return {
      offset,
      transform: `scale(${
        scale < 1
          ? `calc(${scale} - ${toKeyframeValue(custom, `--motion-pulse-offset${suffix}`, asWeb)})`
          : '1'
      })`,
    };
  });

  if (timingFactor < 1) {
    keyframes.push({
      offset: 1,
      transform: 'scale(1)',
    });
  }

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
  const iterationDelay =
    (options.namedEffect as Pulse)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;

  return [`motion-pulse-${timingFactor}`].map((name) => name + suffix);
}
