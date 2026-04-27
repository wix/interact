import type {
  Poke,
  TimeAnimationOptions,
  DomApi,
  AnimationExtraOptions,
  EffectFourDirections,
} from '../../types';
import { getTimingFactor, toKeyframeValue, mapRange, parseDirection } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION: EffectFourDirections = 'right';

const TRANSLATE_KEYFRAMES = [
  { keyframe: 17, translate: 7 },
  { keyframe: 32, translate: 25 },
  { keyframe: 48, translate: 8 },
  { keyframe: 56, translate: 11 },
  { keyframe: 66, translate: 25 },
  { keyframe: 83, translate: 4 },
  { keyframe: 100, translate: 0 },
];

const POKE_FACTOR_SOFT = 1;
const POKE_FACTOR_HARD = 4;

const DIRECTION_MAP = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
};

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Poke;
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULT_DIRECTION);
  const { intensity = 0.5 } = namedEffect;

  const duration = options.duration || 1;
  const iterationDelay = +(namedEffect?.iterationDelay || 0);
  const { x, y } = DIRECTION_MAP[direction];
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const pokeFactor = mapRange(0, 1, POKE_FACTOR_SOFT, POKE_FACTOR_HARD, intensity);

  // Create CSS custom properties for the poke configuration
  const custom: Record<string, string | number> = {
    '--motion-translate-x': x * pokeFactor,
    '--motion-translate-y': y * pokeFactor,
  };

  const keyframes = TRANSLATE_KEYFRAMES.map(({ keyframe, translate }) => {
    const translateValue = `calc(${toKeyframeValue(
      custom,
      '--motion-translate-x',
      asWeb,
    )} * ${translate}px) calc(${toKeyframeValue(
      custom,
      '--motion-translate-y',
      asWeb,
    )} * ${translate}px)`;

    return {
      offset: (keyframe / 100) * timingFactor,
      translate: translateValue,
    };
  });

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes,
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Poke)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true) as string;

  return [`motion-poke-${timingFactor}`];
}
