import type { TimeAnimationOptions, Bounce, AnimationExtraOptions, DomApi } from '../../types';
import { getEasing, getTimingFactor, toKeyframeValue, parseLength, getCssUnits } from '../../utils';

const PEAK_TRANSLATE = 49;

export const schema = {
  iterationDelay: { type: 'number', min: 0, default: 0 },
  travel: { type: 'length', default: { value: 49, unit: 'px' } },
} as const;

const TRANSLATE_Y_KEYFRAMES = [
  { keyframe: 0, translateY: 0 },
  { keyframe: 8.8, translateY: -55 },
  { keyframe: 17.6, translateY: -87 },
  { keyframe: 26.5, translateY: -98 },
  { keyframe: 35.3, translateY: -87 },
  { keyframe: 44.1, translateY: -55 },
  { keyframe: 53.1, translateY: 0 },
  { keyframe: 66.2, translateY: -23 },
  { keyframe: 81, translateY: 0 },
  { keyframe: 86.8, translateY: -5 },
  { keyframe: 94.1, translateY: 0 },
  { keyframe: 97.1, translateY: -2 },
  { keyframe: 100, translateY: 0 },
];

export function web(options: TimeAnimationOptions & AnimationExtraOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const namedEffect = options.namedEffect as Bounce;
  const travel = parseLength(namedEffect.travel, schema.travel.default);
  const unit = getCssUnits(travel.unit);

  const duration = options.duration || 1;
  const iterationDelay = namedEffect?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(duration, iterationDelay) as number;
  const [name] = getNames(options);

  const bounceFactor = travel.value / PEAK_TRANSLATE;

  const easing = getEasing('sineOut');

  const custom = {
    '--motion-bounce-factor': bounceFactor,
  };

  const keyframes = TRANSLATE_Y_KEYFRAMES.map(({ keyframe, translateY }) => ({
    offset: (keyframe / 100) * timingFactor,
    translate: `0px calc(${translateY / 2}${unit} * ${toKeyframeValue(
      custom,
      '--motion-bounce-factor',
      asWeb,
    )})`,
    easing,
  }));

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
    (options.namedEffect as Bounce)?.iterationDelay || schema.iterationDelay.default;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  const { suffix = '' } = options;

  return [`motion-bounce-${timingFactor}`].map((name) => name + suffix);
}
