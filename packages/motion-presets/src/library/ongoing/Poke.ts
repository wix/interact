import type {
  Poke,
  TimeAnimationOptions,
  DomApi,
  AnimationExtraOptions,
  EffectFourDirections,
} from '../../types';
import {
  scaleLength,
  roundNumber,
  getTimingFactor,
  holdAtRest,
  toKeyframeValue,
  parseDirection,
  parseLengthOrCalc,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: 'right' },
  iterationDelay: { type: 'number', min: 0, default: 0 },
  travel: { type: 'length', default: { value: 62.5, unit: 'px' } },
} as const;

const TRANSLATE_KEYFRAMES = [
  { keyframe: 17, translate: 0.28 },
  { keyframe: 32, translate: 1 },
  { keyframe: 48, translate: 0.32 },
  { keyframe: 56, translate: 0.44 },
  { keyframe: 66, translate: 1 },
  { keyframe: 83, translate: 0.16 },
  { keyframe: 100, translate: 0 },
];

const DIRECTION_MAP = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
};

const roundUnit = (value: number) => roundNumber(value, 6);

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as Poke;
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    schema.direction.default,
  );
  const travel = parseLengthOrCalc(namedEffect.travel, schema.travel.default);

  const duration = options.duration || 1;
  const iterationDelay = +(namedEffect?.iterationDelay || schema.iterationDelay.default);
  const { x, y } = DIRECTION_MAP[direction];
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  // Create CSS custom properties for the poke configuration
  const custom: Record<string, string | number> = {
    [`--motion-translate-x${suffix}`]: x,
    [`--motion-translate-y${suffix}`]: y,
  };

  const keyframes = TRANSLATE_KEYFRAMES.map(({ keyframe, translate }) => {
    const travelKey = `--motion-poke-travel${suffix}-${keyframe}`;
    if (translate) {
      custom[travelKey] = scaleLength(travel, translate, roundUnit);
    }
    const travel_ = toKeyframeValue(custom, travelKey, asWeb);

    return {
      offset: keyframe / 100,
      translate: translate
        ? `calc(${toKeyframeValue(
            custom,
            `--motion-translate-x${suffix}`,
            asWeb,
          )} * ${travel_}) calc(${toKeyframeValue(
            custom,
            `--motion-translate-y${suffix}`,
            asWeb,
          )} * ${travel_})`
        : '0px 0px',
    };
  });

  return [
    {
      ...options,
      name,
      easing: 'linear',
      duration: duration + iterationDelay,
      custom,
      keyframes: holdAtRest(keyframes, timingFactor),
    },
  ];
}

export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay =
    (options.namedEffect as Poke)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true) as string;
  const { suffix = '' } = options;

  return [`motion-poke-${timingFactor}`].map((name) => name + suffix);
}
