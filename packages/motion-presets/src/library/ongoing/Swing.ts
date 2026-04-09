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
  toKeyframeValue,
  parseDirection,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'top';

const DIRECTION_MAP = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
};

const TRANSLATE_DISTANCE = 50;

const FACTORS_SEQUENCE = [
  { factor: 1, timeFactor: 0.0934 },
  { factor: -1, timeFactor: 0.28 },
  { factor: 0.6, timeFactor: 0.466 },
  { factor: -0.3, timeFactor: 0.653 },
  { factor: 0.2, timeFactor: 0.839 },
  { factor: -0.05, timeFactor: 1.026 },
  { factor: 0, timeFactor: 1.175 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Swing;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { swing = 20 } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || 0;
  const easing = options.easing || 'sineInOut';
  const ease = getEasingFamily(easing);
  const [name] = getNames(options);

  const { x, y } = DIRECTION_MAP[direction];
  const totalDuration = duration + iterationDelay;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;

  // Create CSS custom properties for the swing configuration
  const custom: Record<string, string | number> = {
    '--motion-swing-deg': `${swing}deg`,
    '--motion-trans-x': `${x * TRANSLATE_DISTANCE}%`,
    '--motion-trans-y': `${y * TRANSLATE_DISTANCE}%`,
    '--motion-ease-in': getEasing(ease.in),
    '--motion-ease-inout': getEasing(ease.inOut),
    '--motion-ease-out': getEasing(ease.out),
  };

  const translateBefore = `translate(${toKeyframeValue(
    custom,
    '--motion-trans-x',
    asWeb,
  )}, ${toKeyframeValue(custom, '--motion-trans-y', asWeb)})`;

  const translateAfter = `translate(calc(${toKeyframeValue(
    custom,
    '--motion-trans-x',
    asWeb,
  )} * -1), calc(${toKeyframeValue(custom, '--motion-trans-y', asWeb)} * -1))`;

  const keyframes = iterationDelay
    ? FACTORS_SEQUENCE.map(({ factor, timeFactor }) => {
        const keyframeOffset = timeFactor * timingFactor;

        return {
          offset: keyframeOffset,
          easing: toKeyframeValue(custom, '--motion-ease-inout', asWeb),
          transform: `rotate(var(--motion-rotate, 0deg)) ${translateBefore} rotate(calc(${toKeyframeValue(
            custom,
            '--motion-swing-deg',
            asWeb,
          )} * ${factor})) ${translateAfter}`,
        };
      })
    : [
        {
          offset: 0.25,
          easing: toKeyframeValue(custom, '--motion-ease-inout', asWeb),
          transform: `rotate(var(--motion-rotate, 0deg)) ${translateBefore} rotate(${toKeyframeValue(
            custom,
            '--motion-swing-deg',
            asWeb,
          )}) ${translateAfter}`,
        },
        {
          offset: 0.75,
          easing: toKeyframeValue(custom, '--motion-ease-in', asWeb),
          transform: `rotate(var(--motion-rotate, 0deg)) ${translateBefore} rotate(calc(${toKeyframeValue(
            custom,
            '--motion-swing-deg',
            asWeb,
          )} * -1)) ${translateAfter}`,
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
          easing: toKeyframeValue(custom, '--motion-ease-out', asWeb),
          transform: `rotateZ(var(--motion-rotate, 0deg)) ${translateBefore} rotate(0deg) ${translateAfter}`,
        },
        ...keyframes,
        {
          offset: 1,
          transform: `rotateZ(var(--motion-rotate, 0deg)) ${translateBefore} rotate(0deg) ${translateAfter}`,
        },
      ],
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Swing)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return [`motion-swing-${timingFactor}`];
}
