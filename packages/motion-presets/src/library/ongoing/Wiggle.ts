import type { Wiggle, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import {
  getTimingFactor,
  holdAtRest,
  roundNumber,
  toKeyframeValue,
  parseLengthOrCalc,
  scaleLength,
} from '../../utils';

export const schema = {
  angle: { type: 'number', default: 25 },
  iterationDelay: { type: 'number', min: 0, default: 0 },
  travel: { type: 'length', default: { value: 25, unit: 'px' } },
} as const;

const TRANSFORM_KEYFRAMES = [
  { keyframe: 18, lift: 1, rotate: 1 },
  { keyframe: 35, lift: 0, rotate: -0.8 },
  { keyframe: 53, lift: 0, rotate: 0.6 },
  { keyframe: 73, lift: 0, rotate: -0.4 },
  { keyframe: 100, lift: 0, rotate: 0 },
];

const roundUnit = (value: number) => roundNumber(value, 6);

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Wiggle;
  const { angle = schema.angle.default } = namedEffect;
  const travel = parseLengthOrCalc(namedEffect.travel, schema.travel.default);
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  // Create CSS custom properties for the wiggle configuration
  const custom: Record<string, string | number> = {};

  const keyframes = TRANSFORM_KEYFRAMES.map(({ keyframe, lift, rotate }) => {
    const rotateKey = `--motion-rotate${suffix}-${keyframe}`;
    const translateYKey = `--motion-translate-y${suffix}-${keyframe}`;

    custom[rotateKey] = `calc(var(--motion-rotate, 0deg) + ${roundNumber(rotate * angle, 4)}deg)`;
    custom[translateYKey] = lift ? scaleLength(travel, -lift, roundUnit) : '0px';

    return {
      offset: keyframe / 100,
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
      keyframes: holdAtRest(keyframes, timingFactor),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Wiggle)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;

  return [`motion-wiggle-${timingFactor}`].map((name) => name + suffix);
}
