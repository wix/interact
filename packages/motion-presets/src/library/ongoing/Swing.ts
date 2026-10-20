import type {
  Swing,
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
  angle: { type: 'number', min: 0, default: 20 },
  iterationDelay: { type: 'number', min: 0, default: 0 },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: 'top' },
} as const;

const DIRECTION_MAP = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const TRANSLATE_DISTANCE = 50;

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Swing;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.pivot,
    FOUR_DIRECTIONS,
    schema.pivot.default,
  );
  const { angle: swing = schema.angle.default } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const easing = options.easing || 'sineInOut';
  const ease = getEasingFamily(easing);
  const [name] = getNames(options);

  const { x, y } = DIRECTION_MAP[direction];
  const totalDuration = duration + iterationDelay;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;

  // Create CSS custom properties for the swing configuration
  const custom: Record<string, string | number> = {
    [`--motion-swing-deg${suffix}`]: `${swing}deg`,
    [`--motion-trans-x${suffix}`]: `${x * TRANSLATE_DISTANCE}%`,
    [`--motion-trans-y${suffix}`]: `${y * TRANSLATE_DISTANCE}%`,
  };

  const translateBefore = `translate(${toKeyframeValue(
    custom,
    `--motion-trans-x${suffix}`,
    asWeb,
  )}, ${toKeyframeValue(custom, `--motion-trans-y${suffix}`, asWeb)})`;

  const translateAfter = `translate(calc(${toKeyframeValue(
    custom,
    `--motion-trans-x${suffix}`,
    asWeb,
  )} * -1), calc(${toKeyframeValue(custom, `--motion-trans-y${suffix}`, asWeb)} * -1))`;

  const swing_ = toKeyframeValue(custom, `--motion-swing-deg${suffix}`, asWeb);

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
            transform: `rotateZ(var(--motion-rotate, 0deg)) ${translateBefore} rotate(0deg) ${translateAfter}`,
          },
          {
            offset: 0.25,
            easing: getEasing(ease.inOut),
            transform: `rotate(var(--motion-rotate, 0deg)) ${translateBefore} rotate(${swing_}) ${translateAfter}`,
          },
          {
            offset: 0.75,
            easing: getEasing(ease.in),
            transform: `rotate(var(--motion-rotate, 0deg)) ${translateBefore} rotate(calc(${swing_} * -1)) ${translateAfter}`,
          },
          {
            offset: 1,
            transform: `rotateZ(var(--motion-rotate, 0deg)) ${translateBefore} rotate(0deg) ${translateAfter}`,
          },
        ],
        timingFactor,
      ),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Swing)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;
  const easingKey = getEasingKey(options.easing);

  return [`motion-swing-${timingFactor}`].map((name) => name + easingKey + suffix);
}
