import type { Rubber, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import {
  getTimingFactor,
  roundNumber,
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';

const DEFAULTS: Required<Rubber> = {
  type: 'Rubber',
  iterationDelay: 0,
  stretch: 0.08,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  stretch: { type: 'number', min: -0.64, max: 0.64, default: DEFAULTS.stretch },
};

// scale = 1 + factor * stretch, where stretch is the first squash's scaleX - 1
const SCALE_KEYFRAMES = [
  { keyframe: 45, x: 1, y: -1.5 },
  { keyframe: 56, x: -1.5625, y: 0.6875 },
  { keyframe: 66, x: 0.875, y: -1.125 },
  { keyframe: 78, x: -0.5625, y: 0.5625 },
  { keyframe: 89, x: 0.6875, y: -0.63125 },
  { keyframe: 100, x: 0, y: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Rubber;
  const { stretch = DEFAULTS.stretch } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {};

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, x, y }) => {
    const adjustedScaleX = roundNumber(1 + x * stretch, 4);
    const adjustedScaleY = roundNumber(1 + y * stretch, 4);

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

  const animations = [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Rubber)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-rubber-${timingFactor}`], options.suffix);
}
