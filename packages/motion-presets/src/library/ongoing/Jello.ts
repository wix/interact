import type { Jello, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import { getTimingFactor, toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';

const DEFAULTS: Required<Jello> = {
  type: 'Jello',
  iterationDelay: 0,
  skew: 12.25,
};

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  skew: { type: 'number', default: DEFAULTS.skew },
};

const SKEW_Y_KEYFRAMES = [
  { keyframe: 0, skewY: 0 },
  { keyframe: 24, skewY: 7 },
  { keyframe: 38, skewY: -2 },
  { keyframe: 58, skewY: 4 },
  { keyframe: 80, skewY: -2 },
  { keyframe: 100, skewY: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Jello;
  const { skew = DEFAULTS.skew, iterationDelay = DEFAULTS.iterationDelay } = namedEffect;

  const duration = options.duration || 1;
  const [name] = getNames(options);
  const timingFactor = duration / (duration + iterationDelay);

  const custom: Record<string, string | number> = {
    '--motion-skew-y': `${skew}deg`,
  };

  const keyframes = SKEW_Y_KEYFRAMES.map(({ keyframe, skewY }) => {
    const offset = (keyframe / 100) * timingFactor;

    return {
      offset,
      transform: `rotateZ(var(--motion-rotate, 0deg)) skewY(calc(${toKeyframeValue(
        custom,
        '--motion-skew-y',
        asWeb,
      )} * ${skewY / 7}))`,
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
  const iterationDelay = (options.namedEffect as Jello)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-jello-${timingFactor}`], options.suffix);
}
