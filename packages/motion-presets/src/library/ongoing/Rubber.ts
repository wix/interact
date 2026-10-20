import type { Rubber, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, holdAtRest, roundNumber, toKeyframeValue } from '../../utils';

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: 0 },
  stretch: { type: 'number', min: -1, max: 1, default: 0.1 },
} as const;

const SCALE_KEYFRAMES = [
  { keyframe: 45, squash: 1 },
  { keyframe: 56, squash: -0.9 },
  { keyframe: 66, squash: 0.8 },
  { keyframe: 78, squash: -0.45 },
  { keyframe: 89, squash: 0.5275 },
  { keyframe: 100, squash: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Rubber;
  const { stretch = schema.stretch.default } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  // Create CSS custom properties for the rubber configuration
  const custom: Record<string, string | number> = {};

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, squash }) => {
    const adjustedScaleX = roundNumber(1 + squash * stretch, 4);
    const adjustedScaleY = roundNumber(1 - squash * stretch, 4);

    // Create custom property keys for this keyframe
    const scaleXKey = `--motion-scale-x${suffix}-${keyframe}`;
    const scaleYKey = `--motion-scale-y${suffix}-${keyframe}`;

    // Add the scale values to custom properties
    custom[scaleXKey] = adjustedScaleX;
    custom[scaleYKey] = adjustedScaleY;

    return {
      offset: keyframe / 100,
      transform: `rotateZ(var(--motion-rotate, 0deg)) scale(${toKeyframeValue(
        custom,
        scaleXKey,
        asWeb,
      )}, ${toKeyframeValue(custom, scaleYKey, asWeb)})`,
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
    (options.namedEffect as Rubber)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;

  return [`motion-rubber-${timingFactor}`].map((name) => name + suffix);
}
