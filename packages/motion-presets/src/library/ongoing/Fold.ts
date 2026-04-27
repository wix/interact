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
  toKeyframeValue,
  parseDirection,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'top';

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
    rotation: { x: 1, y: 0 },
    origin: { x: 0, y: 50 },
  },
  left: {
    rotation: { x: 0, y: 1 },
    origin: { x: -50, y: 0 },
  },
};

const MIN_ROTATE_ANGLE = 15;

const KEYFRAME_FACTORS = [
  { fold: 1, frameFactor: 0.1 },
  { fold: -0.7, frameFactor: 0.302 },
  { fold: 0.6, frameFactor: 0.504 },
  { fold: -0.3, frameFactor: 0.686 },
  { fold: 0.2, frameFactor: 0.847 },
  { fold: -0.05, frameFactor: 1.049 },
  { fold: 0, frameFactor: 1.189 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Fold;
  const direction = parseDirection(
    namedEffect.direction,
    FOUR_DIRECTIONS,
    DEFAULT_DIRECTION,
  ) as EffectFourDirections;
  const { angle = MIN_ROTATE_ANGLE } = namedEffect;

  const easing = options.easing || 'cubicInOut';
  const duration = options.duration || 1;
  const iterationDelay = +(namedEffect?.iterationDelay || 0);
  const [name] = getNames(options);

  const { rotation, origin } = DIRECTION_MAP[direction];
  const { x, y } = origin;
  const ease = getEasingFamily(easing);

  const totalDuration = duration + iterationDelay;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;

  // Create CSS custom properties for the fold configuration
  const custom: Record<string, string | number> = {
    '--motion-origin-x': `${x}%`,
    '--motion-origin-y': `${y}%`,
    '--motion-rotate-angle': `${angle}deg`,
    '--motion-rotate-x': `${rotation.x}`,
    '--motion-rotate-y': `${rotation.y}`,
  };

  const transformLeft = `rotateZ(var(--motion-rotate, 0deg)) translateX(${toKeyframeValue(
    custom,
    '--motion-origin-x',
    asWeb,
  )}) translateY(${toKeyframeValue(custom, '--motion-origin-y', asWeb)}) perspective(800px)`;
  const transformRight = `translateX(calc(-1 * ${toKeyframeValue(
    custom,
    '--motion-origin-x',
    asWeb,
  )})) translateY(calc(-1 * ${toKeyframeValue(custom, '--motion-origin-y', asWeb)}))`;

  const getTransform = (value: number) =>
    `${transformLeft} rotateX(calc(${toKeyframeValue(
      custom,
      '--motion-rotate-x',
      asWeb,
    )} * ${value} * ${angle}deg)) rotateY(calc(${toKeyframeValue(
      custom,
      '--motion-rotate-y',
      asWeb,
    )} * ${value} * ${angle}deg)) ${transformRight}`;

  const keyframes = iterationDelay
    ? KEYFRAME_FACTORS.map(({ fold, frameFactor }) => {
        const keyframeOffset = frameFactor * timingFactor;
        return {
          offset: keyframeOffset,
          easing: getEasing('sineInOut'),
          transform: getTransform(fold),
        };
      })
    : [
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
      ];

  const transform_0 = getTransform(0);

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: totalDuration,
      custom,
      keyframes: [
        {
          offset: 0,
          easing: getEasing(ease.out),
          transform: transform_0,
        },
        ...keyframes,
        {
          offset: 1,
          transform: transform_0,
        },
      ],
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const duration = options.duration || 1;
  const iterationDelay = +((options.namedEffect as Fold)?.iterationDelay || 0);

  if (!iterationDelay) {
    return ['motion-fold'];
  }

  const timingFactor = getTimingFactor(duration, iterationDelay, true) as string;

  return [`motion-fold-${timingFactor}`];
}
