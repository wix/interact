import { getJsEasing } from '@wix/motion';
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
  roundNumber,
  toKeyframeValue,
  parseDirection,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

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

const EASING_SAMPLES = 16;

type Point = [value: number, offset: number];

// the segment's easing sampled into linear(), rounded as a single linear() over the whole animation is
function toSegmentEasing(easing: string, [fromValue, fromOffset]: Point, [value, offset]: Point) {
  const css = getEasing(easing);
  if (css === 'linear') {
    return css;
  }
  const ease = getJsEasing(css)!;
  const points = Array.from({ length: EASING_SAMPLES + 1 }, (_, i) => {
    const t = i / EASING_SAMPLES;
    const progress = roundNumber(1 - fromValue - (value - fromValue) * ease(t), 4);
    const time = roundNumber((fromOffset + t * (offset - fromOffset)) * 100, 2) / 100;
    return `${roundNumber((1 - progress - fromValue) / (value - fromValue), 6)} ${roundNumber(
      ((time - fromOffset) / (offset - fromOffset)) * 100,
      4,
    )}%`;
  });
  return `linear(${points.join(', ')})`;
}

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
  const {
    angle = DEFAULTS.angle,
    perspective = DEFAULTS.perspective,
    iterationDelay = DEFAULTS.iterationDelay,
  } = namedEffect;

  const easing = options.easing || 'cubicInOut';
  const duration = options.duration || 1;
  const [name] = getNames(options);

  const { rotation, origin } = DIRECTION_MAP[pivot];
  const { x, y } = origin;
  const ease = getEasingFamily(easing);

  const totalDuration = duration + iterationDelay;
  const timingFactor = duration / (duration + iterationDelay);

  const custom: Record<string, string | number> = {
    '--motion-origin-x': `${x}%`,
    '--motion-origin-y': `${y}%`,
    '--motion-perspective': `${perspective}px`,
    '--motion-rotate-angle': `${angle}deg`,
    '--motion-rotate-x': `${rotation.x}`,
    '--motion-rotate-y': `${rotation.y}`,
  };

  const transformLeft = `rotateZ(var(--motion-rotate, 0deg)) perspective(${toKeyframeValue(
    custom,
    '--motion-perspective',
    asWeb,
  )}) translateX(${toKeyframeValue(
    custom,
    '--motion-origin-x',
    asWeb,
  )}) translateY(${toKeyframeValue(custom, '--motion-origin-y', asWeb)})`;
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

  const points: Point[] = [
    [0, 0],
    ...KEYFRAME_FACTORS.map(
      ({ fold, frameFactor }): Point => [fold, (frameFactor / 1.189) * timingFactor],
    ),
  ];
  const keyframes = points.map(([fold, offset], i) => ({
    offset,
    ...(points[i + 1] && {
      easing: toSegmentEasing(i ? 'sineInOut' : ease.out, points[i], points[i + 1]),
    }),
    transform: getTransform(fold),
  }));

  const transform_0 = getTransform(0);

  const animations = [
    {
      ...options,
      name,
      easing: 'linear',
      duration: totalDuration,
      custom,
      keyframes: [
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
    return suffixNames(['motion-fold'], options.suffix);
  }

  const timingFactor = getTimingFactor(duration, iterationDelay, true) as string;

  return suffixNames([`motion-fold-${timingFactor}`], options.suffix);
}
