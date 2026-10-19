import type {
  Poke,
  TimeAnimationOptions,
  DomApi,
  AnimationExtraOptions,
  EffectFourDirections,
} from '../../types';
import {
  getCssUnits,
  getTimingFactor,
  toKeyframeValue,
  parseDirection,
  parseLength,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  direction: { type: 'enum', values: FOUR_DIRECTIONS, default: 'right' },
  iterationDelay: { type: 'number', min: 0, default: 0 },
  travel: { type: 'length', default: { value: 62.5, unit: 'px' } },
} as const;

const TRANSLATE_KEYFRAMES = [
  { keyframe: 17, translate: 7 },
  { keyframe: 32, translate: 25 },
  { keyframe: 48, translate: 8 },
  { keyframe: 56, translate: 11 },
  { keyframe: 66, translate: 25 },
  { keyframe: 83, translate: 4 },
  { keyframe: 100, translate: 0 },
];

const PEAK_TRANSLATE = 25;

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
  const direction = parseDirection<EffectFourDirections>(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    schema.direction.default,
  );
  const travel = parseLength(namedEffect.travel, schema.travel.default);
  const unit = getCssUnits(travel.unit);

  const duration = options.duration || 1;
  const iterationDelay = +(namedEffect?.iterationDelay || schema.iterationDelay.default);
  const { x, y } = DIRECTION_MAP[direction];
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const pokeFactor = travel.value / PEAK_TRANSLATE;

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
    )} * ${translate}${unit}) calc(${toKeyframeValue(
      custom,
      '--motion-translate-y',
      asWeb,
    )} * ${translate}${unit})`;

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
  const iterationDelay =
    (options.namedEffect as Poke)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true) as string;
  const { suffix = '' } = options;

  return [`motion-poke-${timingFactor}`].map((name) => name + suffix);
}
