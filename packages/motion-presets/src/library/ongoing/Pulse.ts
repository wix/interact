import type { Pulse, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';

const DEFAULTS: Required<Pulse> = {
  type: 'Pulse',
  iterationDelay: 0,
  scale: 0.93,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  scale: { type: 'number', min: 0, default: DEFAULTS.scale },
};

const SCALE_KEYFRAMES = [
  { keyframe: 0, factor: 0 },
  { keyframe: 27, factor: 4 / 7 },
  { keyframe: 45, factor: 0 },
  { keyframe: 72, factor: 1 },
  { keyframe: 100, factor: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Pulse;
  const { scale = DEFAULTS.scale, iterationDelay = DEFAULTS.iterationDelay } = namedEffect;

  const duration = options.duration || 1;
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-pulse-scale': scale,
  };

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, factor }) => ({
    offset: (keyframe / 100) * timingFactor,
    transform: `rotate(var(--motion-rotate, 0deg)) scale(${
      factor
        ? `calc(1 + (${toKeyframeValue(custom, '--motion-pulse-scale', asWeb)} - 1) * ${factor})`
        : '1'
    })`,
  }));

  if (timingFactor < 1) {
    keyframes.push({
      offset: 1,
      transform: 'rotate(var(--motion-rotate, 0deg)) scale(1)',
    });
  }

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
  const iterationDelay = (options.namedEffect as Pulse)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-pulse-${timingFactor}`], options.suffix);
}
