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
  stretch: 0.1,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  stretch: { type: 'number', min: -1, max: 1, default: DEFAULTS.stretch },
};

// scaleX = 1 + squash * stretch, scaleY = 1 - squash * stretch
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
  const namedEffect = options.namedEffect as Rubber;
  const { stretch = DEFAULTS.stretch } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {};

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, squash }) => {
    const adjustedScaleX = roundNumber(1 + squash * stretch, 4);
    const adjustedScaleY = roundNumber(1 - squash * stretch, 4);

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
