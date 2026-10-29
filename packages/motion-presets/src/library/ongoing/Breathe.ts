import type { AnimationExtraOptions, Breathe, DomApi, TimeAnimationOptions } from '../../types';
import {
  getEasing,
  getEasingFamily,
  getTimingFactor,
  toKeyframeValue,
  parseDirection,
  parseLengthLazy,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { AXIS_DIRECTIONS } from '../../consts';

const DIRECTIONS = [...AXIS_DIRECTIONS, 'center'] as const;

const DEFAULTS: Required<Breathe> = {
  type: 'Breathe',
  direction: 'vertical',
  iterationDelay: 0,
  perspective: 800,
  travel: { value: 25, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  perspective: { type: 'number', min: 0, default: DEFAULTS.perspective },
  travel: { type: 'length', default: DEFAULTS.travel },
};

const DIRECTION_MAP = {
  vertical: { x: 0, y: 1 },
  horizontal: { x: 1, y: 0 },
  center: { x: 0, y: 0 },
};

const FACTORS_SEQUENCE = [
  { translateFactor: 1, timeFactor: 0.1 },
  { translateFactor: -1, timeFactor: 0.302 },
  { translateFactor: 1, timeFactor: 0.504 },
  { translateFactor: -0.7, timeFactor: 0.705 },
  { translateFactor: 0.6, timeFactor: 0.839 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Breathe;
  const direction = parseDirection(namedEffect?.direction, DIRECTIONS, DEFAULTS.direction);
  const {
    perspective = DEFAULTS.perspective,
    travel = DEFAULTS.travel,
    iterationDelay = DEFAULTS.iterationDelay,
  } = namedEffect;

  const easing = options.easing || 'sineInOut';
  const duration = options.duration || 1;
  const totalDuration = duration + iterationDelay;
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const { x, y } = DIRECTION_MAP[direction];
  const ease = getEasingFamily(easing);
  const perspectiveTransform = direction === 'center' ? `perspective(${perspective}px)` : '';

  const custom: Record<string, string | number> = {
    '--motion-breathe-perspective': perspectiveTransform,
    '--motion-breathe-distance': parseLengthLazy(travel, { value: 0, unit: 'px' }),
    '--motion-breathe-x': x,
    '--motion-breathe-y': y,
  };

  const breatheX = `${toKeyframeValue(custom, '--motion-breathe-x', asWeb)}`;
  const breatheY = `${toKeyframeValue(custom, '--motion-breathe-y', asWeb)}`;
  const breathePerspective = `${toKeyframeValue(
    custom,
    '--motion-breathe-perspective',
    asWeb,
    '',
  )}`;
  const breatheDistance = `${toKeyframeValue(custom, '--motion-breathe-distance', asWeb)}`;

  const translate = (factor: number) => {
    const distancePart = `${breatheDistance} * ${factor}`;
    return direction === 'center'
      ? `translate3d(0, 0, calc(${distancePart}))`
      : `translate(calc(${breatheX} * ${distancePart}), calc(${breatheY} * ${distancePart}))`;
  };

  const keyframes = FACTORS_SEQUENCE.map(({ translateFactor, timeFactor }) => ({
    offset: timeFactor * timingFactor,
    easing: getEasing(ease.inOut),
    transform: `${breathePerspective} ${translate(translateFactor)} rotateZ(var(--motion-rotate, 0deg))`,
  }));

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
          transform: `${breathePerspective} ${translate(0)} rotateZ(var(--motion-rotate, 0deg))`,
        },
        ...keyframes,
        {
          offset: timingFactor,
          transform: `${breathePerspective} ${translate(0)} rotateZ(var(--motion-rotate, 0deg))`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Breathe)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-breathe-${timingFactor}`], options.suffix);
}
