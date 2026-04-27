import type { Wiggle, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, roundNumber, toKeyframeValue, mapRange } from '../../utils';

const WIGGLE_FACTOR_SOFT = 1;
const WIGGLE_FACTOR_HARD = 4;

const TRANSFORM_KEYFRAMES = [
  { keyframe: 18, transY: -10, accRotate: 10 },
  { keyframe: 35, transY: 0, accRotate: -18 },
  { keyframe: 53, transY: 0, accRotate: 14 },
  { keyframe: 73, transY: 0, accRotate: -10 },
  { keyframe: 100, transY: 0, accRotate: 4 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Wiggle;
  const { intensity = 0.5 } = namedEffect;
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const wiggleFactor = mapRange(0, 1, WIGGLE_FACTOR_SOFT, WIGGLE_FACTOR_HARD, intensity);

  let currentRotation = 0;

  // Create CSS custom properties for the wiggle configuration
  const custom: Record<string, string | number> = {
    '--motion-wiggle-factor': wiggleFactor,
  };

  const keyframes = TRANSFORM_KEYFRAMES.map(({ keyframe, transY, accRotate }) => {
    const offset = (keyframe / 100) * timingFactor;
    const rotateValue = `calc(var(--motion-rotate, 0deg) + ${roundNumber(
      currentRotation + accRotate * wiggleFactor,
    )}deg)`;
    const translateYValue = `${transY * wiggleFactor}px`;

    const rotateKey = `--motion-rotate-${keyframe}`;
    const translateYKey = `--motion-translate-y-${keyframe}`;

    // For non-web usage, add the values to custom properties
    custom[rotateKey] = rotateValue;
    custom[translateYKey] = translateYValue;

    currentRotation += accRotate * wiggleFactor;

    return {
      offset,
      transform: `rotate(${toKeyframeValue(
        custom,
        rotateKey,
        asWeb,
      )}) translateY(${toKeyframeValue(custom, translateYKey, asWeb)})`,
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
  const iterationDelay = (options.namedEffect as Wiggle)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-wiggle-${timingFactor}`];
}
