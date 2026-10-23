import type { AnimationExtraOptions, Breathe, DomApi, TimeAnimationOptions } from '../../types';
import {
  getCssUnits,
  getEasing,
  getEasingFamily,
  getTimingFactor,
  holdAtRest,
  toKeyframeValue,
  parseDirection,
  parseLengthOrCalc,
  getEasingKey,
} from '../../utils';
import { AXIS_DIRECTIONS } from '../../consts';

const DIRECTIONS = [...AXIS_DIRECTIONS, 'center'] as const;

export const schema = {
  direction: { type: 'enum', values: DIRECTIONS, default: 'vertical' },
  iterationDelay: { type: 'number', min: 0, default: 0 },
  perspective: { type: 'number', min: 0, default: 800 },
  travel: { type: 'length', default: { value: 25, unit: 'px' } },
} as const;

const DIRECTION_MAP = {
  vertical: { x: 0, y: 1, z: 0 },
  horizontal: { x: 1, y: 0, z: 0 },
  center: { x: 0, y: 0, z: 1 },
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Breathe;
  const direction = parseDirection<(typeof DIRECTIONS)[number]>(
    namedEffect?.direction,
    DIRECTIONS,
    schema.direction.default,
  );
  const distance = parseLengthOrCalc(namedEffect.travel, schema.travel.default);
  const { perspective = schema.perspective.default } = namedEffect;

  const easing = options.easing || 'sineInOut';
  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const totalDuration = duration + iterationDelay;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const { x, y, z } = DIRECTION_MAP[direction];
  const ease = getEasingFamily(easing);
  const perspectiveTransform = direction === 'center' ? `perspective(${perspective}px)` : '';

  // Create CSS custom properties for the Breathe configuration
  const custom: Record<string, string | number> = {
    [`--motion-breathe-perspective${suffix}`]: perspectiveTransform,
    [`--motion-breathe-distance${suffix}`]:
      typeof distance === 'string'
        ? distance
        : `${distance.value}${getCssUnits(distance.unit || 'px')}`,
    [`--motion-breathe-x${suffix}`]: x,
    [`--motion-breathe-y${suffix}`]: y,
    [`--motion-breathe-z${suffix}`]: z,
  };

  const breatheX = `${toKeyframeValue(custom, `--motion-breathe-x${suffix}`, asWeb)}`;
  const breatheY = `${toKeyframeValue(custom, `--motion-breathe-y${suffix}`, asWeb)}`;
  const breatheZ = `${toKeyframeValue(custom, `--motion-breathe-z${suffix}`, asWeb)}`;
  const breathePerspective = `${toKeyframeValue(
    custom,
    `--motion-breathe-perspective${suffix}`,
    asWeb,
    '',
  )}`;
  const breatheDistance = `${toKeyframeValue(custom, `--motion-breathe-distance${suffix}`, asWeb)}`;

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
            transform: `${breathePerspective} translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))`,
          },
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
          {
            offset: 1,
            transform: `${breathePerspective} translate3d(0, 0, 0) rotateZ(var(--motion-rotate, 0deg))`,
          },
        ],
        timingFactor,
      ),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Breathe)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;
  const easingKey = getEasingKey(options.easing);

  return [`motion-breathe-${timingFactor}`].map((name) => name + easingKey + suffix);
}
