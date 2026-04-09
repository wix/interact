import type { Rubber, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, roundNumber, toKeyframeValue, mapRange } from '../../utils';

const RUBBER_OFFSET_SOFT = 0;
const RUBBER_OFFSET_HARD = 0.1;

const SCALE_KEYFRAMES = [
  { keyframe: 45, scaleX: 1.03, scaleY: 0.93 },
  { keyframe: 56, scaleX: 0.9, scaleY: 1.03 },
  { keyframe: 66, scaleX: 1.02, scaleY: 0.96 },
  { keyframe: 78, scaleX: 0.98, scaleY: 1.02 },
  { keyframe: 89, scaleX: 1.005, scaleY: 0.9995 },
  { keyframe: 100, scaleX: 1, scaleY: 1 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Rubber;
  const { intensity = 0.5 } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const rubberOffset = mapRange(0, 1, RUBBER_OFFSET_SOFT, RUBBER_OFFSET_HARD, intensity);

  // Create CSS custom properties for the rubber configuration
  const custom: Record<string, string | number> = {};

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, scaleX, scaleY }, index) => {
    const isLastKeyframe = index === SCALE_KEYFRAMES.length - 1;
    const isEvenKeyframe = index % 2 === 0;
    const offset = rubberOffset * (isLastKeyframe ? 0 : isEvenKeyframe ? 1 : -0.5);

    const adjustedScaleX = roundNumber(scaleX + offset, 4);
    const adjustedScaleY = roundNumber(scaleY - offset, 4);

    // Create custom property keys for this keyframe
    const scaleXKey = `--motion-scale-x-${keyframe}`;
    const scaleYKey = `--motion-scale-y-${keyframe}`;

    // Add the scale values to custom properties
    custom[scaleXKey] = adjustedScaleX;
    custom[scaleYKey] = adjustedScaleY;

    return {
      offset: (keyframe / 100) * timingFactor,
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
      keyframes,
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Rubber)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-rubber-${timingFactor}`];
}
