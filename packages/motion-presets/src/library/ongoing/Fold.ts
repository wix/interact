import type {
  Fold,
  TimeAnimationOptions,
  DomApi,
  AnimationExtraOptions,
  EffectFourDirections,
} from '../../types';
import {
  getEasing,
  getEasingFamily,
  getTimingFactor,
  holdAtRest,
  toKeyframeValue,
  parseDirection,
  getEasingKey,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  angle: { type: 'number', min: 0, default: 15 },
  iterationDelay: { type: 'number', min: 0, default: 0 },
  perspective: { type: 'number', min: 0, default: 800 },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: 'top' },
} as const;

const DIRECTION_MAP = {
  top: {
    rotation: { x: 1, y: 0 },
    origin: { x: 0, y: -50 },
  },
  right: {
    rotation: { x: 0, y: 1 },
    origin: { x: 50, y: 0 },
  },
  bottom: {
    rotation: { x: -1, y: 0 },
    origin: { x: 0, y: 50 },
  },
  left: {
    rotation: { x: 0, y: -1 },
    origin: { x: -50, y: 0 },
  },
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Fold;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect.pivot,
    FOUR_DIRECTIONS,
    schema.pivot.default,
  );
  const { angle = schema.angle.default, perspective = schema.perspective.default } = namedEffect;

  const easing = options.easing || 'cubicInOut';
  const duration = options.duration || 1;
  const iterationDelay = +(namedEffect?.iterationDelay || schema.iterationDelay.default);
  const [name] = getNames(options);

  const { rotation, origin } = DIRECTION_MAP[direction];
  const { x, y } = origin;
  const ease = getEasingFamily(easing);

  const totalDuration = duration + iterationDelay;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;

  // Create CSS custom properties for the fold configuration
  const custom: Record<string, string | number> = {
    [`--motion-origin-x${suffix}`]: `${x}%`,
    [`--motion-origin-y${suffix}`]: `${y}%`,
    [`--motion-rotate-angle${suffix}`]: `${angle}deg`,
    [`--motion-rotate-x${suffix}`]: `${rotation.x}`,
    [`--motion-rotate-y${suffix}`]: `${rotation.y}`,
    [`--motion-perspective${suffix}`]: `${perspective}px`,
  };

  const transformLeft = `rotateZ(var(--motion-rotate, 0deg)) translateX(${toKeyframeValue(
    custom,
    `--motion-origin-x${suffix}`,
    asWeb,
  )}) translateY(${toKeyframeValue(custom, `--motion-origin-y${suffix}`, asWeb)}) perspective(${toKeyframeValue(custom, `--motion-perspective${suffix}`, asWeb)})`;
  const transformRight = `translateX(calc(-1 * ${toKeyframeValue(
    custom,
    `--motion-origin-x${suffix}`,
    asWeb,
  )})) translateY(calc(-1 * ${toKeyframeValue(custom, `--motion-origin-y${suffix}`, asWeb)}))`;

  const angle_ = toKeyframeValue(custom, `--motion-rotate-angle${suffix}`, asWeb);
  const getTransform = (value: number) =>
    `${transformLeft} rotateX(calc(${toKeyframeValue(
      custom,
      `--motion-rotate-x${suffix}`,
      asWeb,
    )} * ${value} * ${angle_})) rotateY(calc(${toKeyframeValue(
      custom,
      `--motion-rotate-y${suffix}`,
      asWeb,
    )} * ${value} * ${angle_})) ${transformRight}`;

  const transform_0 = getTransform(0);

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: totalDuration,
      custom,
      keyframes: holdAtRest(
        [
          {
            offset: 0,
            easing: getEasing(ease.out),
            transform: transform_0,
          },
          {
            offset: 0.25,
            easing: getEasing(ease.inOut),
            transform: getTransform(1),
          },
          {
            offset: 0.75,
            easing: getEasing(ease.in),
            transform: getTransform(-1),
          },
          {
            offset: 1,
            transform: transform_0,
          },
        ],
        timingFactor,
      ),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const duration = options.duration || 1;
  const iterationDelay = +(
    (options.namedEffect as Fold)?.iterationDelay || schema.iterationDelay.default
  );
  const { suffix = '' } = options;
  const easingKey = getEasingKey(options.easing);

  if (!iterationDelay) {
    return ['motion-fold'].map((name) => name + easingKey + suffix);
  }

  const timingFactor = getTimingFactor(duration, iterationDelay, true) as string;

  return [`motion-fold-${timingFactor}`].map((name) => name + easingKey + suffix);
}
