import type { Wiggle, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import type { LengthValue } from '../../utils';
import {
  getTimingFactor,
  roundNumber,
  toKeyframeValue,
  parseCssLength,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';

const DEFAULTS: Required<Wiggle> = {
  type: 'Wiggle',
  angle: 25,
  iterationDelay: 0,
  travel: { value: 25, unit: 'px' },
};

export const schema = {
  angle: { type: 'number', default: DEFAULTS.angle },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  travel: { type: 'length', default: DEFAULTS.travel },
};

const TRANSFORM_KEYFRAMES = [
  { keyframe: 18, lift: 1, rotate: 1 },
  { keyframe: 35, lift: 0, rotate: -0.8 },
  { keyframe: 53, lift: 0, rotate: 0.6 },
  { keyframe: 73, lift: 0, rotate: -0.4 },
  { keyframe: 100, lift: 0, rotate: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Wiggle;
  const { angle = DEFAULTS.angle } = namedEffect;
  const travel = parseCssLength(namedEffect.travel, DEFAULTS.travel as LengthValue);
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {};

  const keyframes = TRANSFORM_KEYFRAMES.map(({ keyframe, lift, rotate }) => {
    const offset = roundNumber((keyframe / 100) * timingFactor, 6);
    const rotateValue = `calc(var(--motion-rotate, 0deg) + ${roundNumber(rotate * angle)}deg)`;
    const translateYValue = lift ? `calc(-1 * ${travel})` : '0px';

    const rotateKey = `--motion-rotate-${keyframe}`;
    const translateYKey = `--motion-translate-y-${keyframe}`;

    // For non-web usage, add the values to custom properties
    custom[rotateKey] = rotateValue;
    custom[translateYKey] = translateYValue;

    return {
      offset,
      transform: `rotate(${toKeyframeValue(
        custom,
        rotateKey,
        asWeb,
      )}) translateY(${toKeyframeValue(custom, translateYKey, asWeb)})`,
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
  const iterationDelay = (options.namedEffect as Wiggle)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-wiggle-${timingFactor}`], options.suffix);
}
