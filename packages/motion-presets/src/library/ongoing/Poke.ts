import type { Poke, TimeAnimationOptions, DomApi, AnimationExtraOptions } from '../../types';
import type { LengthValue } from '../../utils';
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

const PEAK_TRANSLATE = 25;

const TRANSLATE_KEYFRAMES = [
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
  const direction = parseDirection(namedEffect?.direction, FOUR_DIRECTIONS, DEFAULTS.direction);
  const travel = parseLengthLazy(namedEffect.travel, DEFAULTS.travel as LengthValue);

  const duration = options.duration || 1;
  const iterationDelay = +(namedEffect?.iterationDelay || 0);
  const { x, y } = DIRECTION_MAP[direction];
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const custom: Record<string, string | number> = {
    '--motion-translate-x': x,
    '--motion-translate-y': y,
    '--motion-travel': travel,
  };
  const travel_ = toKeyframeValue(custom, '--motion-travel', asWeb);

  const keyframes = TRANSLATE_KEYFRAMES.map(({ keyframe, translate }) => {
    const translateValue = `calc(${toKeyframeValue(
      custom,
      '--motion-translate-x',
      asWeb,
    )} * ${travel_} * ${translate} / ${PEAK_TRANSLATE}) calc(${toKeyframeValue(
      custom,
      '--motion-translate-y',
      asWeb,
    )} * ${travel_} * ${translate} / ${PEAK_TRANSLATE})`;

    return {
      offset: (keyframe / 100) * timingFactor,
      translate: translateValue,
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
