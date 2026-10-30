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
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<Swing> = {
  type: 'Swing',
  angle: 20,
  iterationDelay: 0,
  pivot: 'top',
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  pivot: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.pivot },
};

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
  const pivot = parseDirection(
    namedEffect?.pivot,
    FOUR_DIRECTIONS,
    DEFAULTS.pivot,
  ) as EffectFourDirections;
  const { angle = DEFAULTS.angle, iterationDelay = DEFAULTS.iterationDelay } = namedEffect;

  const duration = options.duration || 1;
  const easing = options.easing || 'sineInOut';
  const ease = getEasingFamily(easing);
  const [name] = getNames(options);

  const { x, y } = DIRECTION_MAP[pivot];
  const totalDuration = duration + iterationDelay;
  const timingFactor = duration / (duration + iterationDelay);

  const custom: Record<string, string | number> = {
    '--motion-swing-deg': `${angle}deg`,
    '--motion-trans-x': `${x * TRANSLATE_DISTANCE}%`,
    '--motion-trans-y': `${y * TRANSLATE_DISTANCE}%`,
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

  const keyframes = FACTORS_SEQUENCE.map(({ factor, timeFactor }) => ({
    offset: (timeFactor / 1.175) * timingFactor,
    easing: getEasing(ease.inOut),
    transform: `rotate(var(--motion-rotate, 0deg)) ${translateBefore} rotate(calc(${toKeyframeValue(
      custom,
      '--motion-swing-deg',
      asWeb,
    )} * ${factor})) ${translateAfter}`,
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

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Swing)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);

  return suffixNames([`motion-swing-${timingFactor}`], options.suffix);
}
