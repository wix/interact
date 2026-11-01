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

// two beats - a light one at 4/7 of the depth and then the full one
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
  const namedEffect = options.namedEffect as Pulse;
  const { scale = DEFAULTS.scale } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-scale': scale,
  };

  const keyframes = SCALE_KEYFRAMES.map(({ keyframe, depth }) => {
    const offset = (keyframe / 100) * timingFactor;

    return {
      offset,
      transform: `rotateZ(var(--motion-rotate, 0deg)) scale(${
        depth
          ? `calc(1 - (1 - ${toKeyframeValue(custom, '--motion-scale', asWeb)}) * ${depth})`
          : '1'
      })`,
    };
  });

  if (timingFactor < 1) {
    keyframes.push({
      offset: 1,
      transform: 'rotateZ(var(--motion-rotate, 0deg)) scale(1)',
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
