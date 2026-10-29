import type { Rubber, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';

const DEFAULTS: Required<Rubber> = {
  type: 'Rubber',
  iterationDelay: 0,
  stretch: 0.1,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  stretch: { type: 'number', min: -1, max: 1, default: DEFAULTS.stretch },
};

const SCALE_KEYFRAMES = [
  { keyframe: 0, factor: 0 },
  { keyframe: 45, factor: -1 },
  { keyframe: 56, factor: 0.9 },
  { keyframe: 66, factor: -0.8 },
  { keyframe: 78, factor: 0.45 },
  { keyframe: 89, factor: -0.5275 },
  { keyframe: 100, factor: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Rubber;
  const { stretch = DEFAULTS.stretch, iterationDelay = DEFAULTS.iterationDelay } = namedEffect;

  const duration = options.duration || 1;
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-rubber-stretch': stretch,
  };
  const rubberStretch = toKeyframeValue(custom, '--motion-rubber-stretch', asWeb);

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, factor }) => ({
    offset: (keyframe / 100) * timingFactor,
    transform: `rotateZ(var(--motion-rotate, 0deg)) scale(calc(1 - ${rubberStretch} * ${factor}), calc(1 + ${rubberStretch} * ${factor}))`,
  }));

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
