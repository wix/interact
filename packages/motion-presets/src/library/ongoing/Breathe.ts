import type { AnimationExtraOptions, Breathe, DomApi, TimeAnimationOptions } from '../../types';
import {
  getCssUnits,
  getEasing,
  getEasingFamily,
  getTimingFactor,
  toKeyframeValue,
  parseDirection,
  parseLength,
} from '../../utils';
import { AXIS_DIRECTIONS } from '../../consts';

const DEFAULT_DISTANCE = { value: 25, unit: 'px' };
const DIRECTIONS = [...AXIS_DIRECTIONS, 'center'] as const;
const DEFAULT_DIRECTION: (typeof DIRECTIONS)[number] = 'vertical';

const DIRECTION_MAP = {
  vertical: { x: 0, y: 1, z: 0 },
  horizontal: { x: 1, y: 0, z: 0 },
  center: { x: 0, y: 0, z: 1 },
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
  const direction = parseDirection(namedEffect?.direction, DIRECTIONS, DEFAULT_DIRECTION);
  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);
  const { perspective = 800 } = namedEffect;

  const easing = options.easing || 'sineInOut';
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const totalDuration = duration + iterationDelay;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const { x, y, z } = DIRECTION_MAP[direction];
  const ease = getEasingFamily(easing);
  const perspectiveTransform = direction === 'center' ? `perspective(${perspective}px)` : '';

  // Create CSS custom properties for the Breathe configuration
  const custom: Record<string, string | number> = {
    '--motion-breathe-perspective': perspectiveTransform,
    '--motion-breathe-distance': `${distance.value}${getCssUnits(distance.unit || 'px')}`,
    '--motion-breathe-x': x,
    '--motion-breathe-y': y,
    '--motion-breathe-z': z,
  };

  const breatheX = `${toKeyframeValue(custom, '--motion-breathe-x', asWeb)}`;
  const breatheY = `${toKeyframeValue(custom, '--motion-breathe-y', asWeb)}`;
  const breatheZ = `${toKeyframeValue(custom, '--motion-breathe-z', asWeb)}`;
  const breathePerspective = `${toKeyframeValue(
    custom,
    '--motion-breathe-perspective',
    asWeb,
    '',
  )}`;
  const breatheDistance = `${toKeyframeValue(custom, '--motion-breathe-distance', asWeb)}`;

  const keyframes = iterationDelay
    ? FACTORS_SEQUENCE.map(({ translateFactor, timeFactor }) => {
        const keyframeOffset = timeFactor * timingFactor;
        const distancePart = `${breatheDistance} * ${translateFactor}`;

        return {
          offset: keyframeOffset,
          easing: getEasing(ease.inOut),
          transform: `${breathePerspective} translate3d(calc(${breatheX} * ${distancePart}), calc(${breatheY} * ${distancePart}), calc(${breatheZ} * ${distancePart})) rotateZ(var(--motion-rotate, 0deg))`,
        };
      })
    : [
        {
          offset: 0.25,
          easing: getEasing(ease.inOut),
          transform: `${breathePerspective} translate3d(calc(${breatheX} * ${breatheDistance}), calc(${breatheY} * ${breatheDistance}), calc(${breatheZ} * ${breatheDistance})) rotateZ(var(--motion-rotate, 0deg))`,
        },
        {
          offset: 0.75,
          easing: getEasing(ease.in),
          transform: `${breathePerspective} translate3d(calc(${breatheX} * -1 * ${breatheDistance}), calc(${breatheY} * -1 * ${breatheDistance}), calc(${breatheZ} * -1 * ${breatheDistance})) rotateZ(var(--motion-rotate, 0deg))`,
        },
      ];

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
          transform: `${breathePerspective} translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))`,
        },
        ...keyframes,
        {
          offset: 1,
          transform: `${breathePerspective} translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))`,
        },
      ],
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Breathe)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-breathe-${timingFactor}`];
}
