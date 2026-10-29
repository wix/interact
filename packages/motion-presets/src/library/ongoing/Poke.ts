import type {
  Poke,
  TimeAnimationOptions,
  DomApi,
  AnimationExtraOptions,
  EffectFourDirections,
} from '../../types';
import {
  getTimingFactor,
  toKeyframeValue,
  parseDirection,
  parseLengthLazy,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<Poke> = {
  type: 'Poke',
  direction: 'right',
  iterationDelay: 0,
  travel: { value: 62.5, unit: 'px' },
};

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: DEFAULTS.direction },
  iterationDelay: { type: 'number', min: 0, default: DEFAULTS.iterationDelay },
  travel: { type: 'length', default: DEFAULTS.travel },
};

const TRANSLATE_KEYFRAMES = [
  { keyframe: 0, translate: 0 },
  { keyframe: 17, translate: 7 },
  { keyframe: 32, translate: 25 },
  { keyframe: 48, translate: 8 },
  { keyframe: 56, translate: 11 },
  { keyframe: 66, translate: 25 },
  { keyframe: 83, translate: 4 },
  { keyframe: 100, translate: 0 },
];

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
  const direction = parseDirection(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    DEFAULTS.direction,
  ) as EffectFourDirections;
  const { travel = DEFAULTS.travel, iterationDelay = DEFAULTS.iterationDelay } = namedEffect;

  const duration = options.duration || 1;
  const { x, y } = DIRECTION_MAP[direction];
  const timingFactor = duration / (duration + iterationDelay);
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-poke-travel': parseLengthLazy(travel, { value: 0, unit: 'px' }),
    '--motion-translate-x': x,
    '--motion-translate-y': y,
  };
  const pokeTravel = toKeyframeValue(custom, '--motion-poke-travel', asWeb);

  const keyframes = TRANSLATE_KEYFRAMES.map(({ keyframe, translate }) => {
    const distance = `${pokeTravel} * ${translate / 25}`;
    const translateValue = `calc(${toKeyframeValue(
      custom,
      '--motion-translate-x',
      asWeb,
    )} * ${distance}), calc(${toKeyframeValue(custom, '--motion-translate-y', asWeb)} * ${distance})`;

    return {
      offset: (keyframe / 100) * timingFactor,
      transform: `translate(${translateValue}) rotate(var(--motion-rotate, 0deg))`,
    };
  });

  const animations = [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes,
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Poke)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true) as string;

  return suffixNames([`motion-poke-${timingFactor}`], options.suffix);
}
