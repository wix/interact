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
  getEasingName,
  getTimingFactor,
  toKeyframeValue,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
  roundNumber,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_EASING = 'cubicInOut';

const DEFAULTS: Required<Fold> = {
  type: 'Fold',
  angle: 15,
  iterationDelay: 0,
  perspective: 800,
  pivot: 'top',
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.pivot },
};

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
  const pivot = parseDirection(
    namedEffect.pivot,
    FOUR_DIRECTIONS,
    DEFAULTS.pivot,
  ) as EffectFourDirections;
  const { angle = DEFAULTS.angle, perspective = DEFAULTS.perspective } = namedEffect;

  const easing = options.easing || DEFAULT_EASING;
  const duration = options.duration || 1;
  const iterationDelay = +(namedEffect?.iterationDelay || 0);
  const [name] = getNames(options);

  const { rotation, origin } = DIRECTION_MAP[pivot];
  const { x, y } = origin;
  const ease = getEasingFamily(easing);

  const totalDuration = duration + iterationDelay;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;

  // Create CSS custom properties for the fold configuration
  const custom: Record<string, string | number> = {
    '--motion-origin-x': `${x}%`,
    '--motion-origin-y': `${y}%`,
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-angle': `${angle}deg`,
    '--motion-rotate-x': `${rotation.x}`,
    '--motion-rotate-y': `${rotation.y}`,
  };

  const transformLeft = `rotateZ(var(--motion-rotate, 0deg)) translateX(${toKeyframeValue(
    custom,
    '--motion-origin-x',
    asWeb,
  )}) translateY(${toKeyframeValue(custom, '--motion-origin-y', asWeb)}) perspective(${toKeyframeValue(
    custom,
    '--motion-perspective',
    asWeb,
  )})`;
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

  // the damped shape runs past the motion into the delay - a delay too short to hold it fits it into the cycle
  const dampedFactor = Math.min(timingFactor, 1 / KEYFRAME_FACTORS.at(-1)!.frameFactor);

  const keyframes = iterationDelay
    ? KEYFRAME_FACTORS.map(({ fold, frameFactor }) => {
        const keyframeOffset = roundNumber(frameFactor * dampedFactor, 6);
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

  const animations = [
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

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const duration = options.duration || 1;
  const iterationDelay = +((options.namedEffect as Fold)?.iterationDelay || 0);

  if (!iterationDelay) {
    return suffixNames(
      [`motion-fold${getEasingName(options.easing, DEFAULT_EASING)}`],
      options.suffix,
    );
  }

  const timingFactor = getTimingFactor(duration, iterationDelay, true) as string;

  return suffixNames(
    [`motion-fold-${timingFactor}${getEasingName(options.easing, DEFAULT_EASING)}`],
    options.suffix,
  );
}
