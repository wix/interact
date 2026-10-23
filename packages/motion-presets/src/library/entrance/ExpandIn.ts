import type { TimeAnimationOptions } from '../../types';
import {
  getCssUnits,
  toKeyframeValue,
  parseLengthOrCalc,
  parseCssAngle,
  scaleLength,
  parseDirection,
  getEntranceFill,
} from '../../utils';
import type { ExpandIn } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  from: { type: 'angle', default: 270 },
  scale: { type: 'number', min: 0, max: 1, default: 0 },
  travel: { type: 'length', default: { value: 120, unit: 'percentage' } },
} as const;

const DIRECTION_KEYWORD_TO_ANGLE: Record<string, number> = {
  top: 90,
  right: 0,
  bottom: 270,
  left: 180,
};

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-expandIn'].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as ExpandIn;
  const { scale = schema.scale.default } = namedEffect;

  const parsedDirection = parseDirection<number | string>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
    true,
  );
  const direction =
    typeof parsedDirection === 'string'
      ? DIRECTION_KEYWORD_TO_ANGLE[parsedDirection]
      : 360 - parsedDirection;

  const distance = parseLengthOrCalc(namedEffect.travel, schema.travel.default);
  const cssAngle = parseCssAngle(namedEffect?.from);

  const [fadeIn, expandIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';

  let x, y;
  if (cssAngle || typeof distance === 'string') {
    const angle = cssAngle || `${360 - direction}deg`;
    x = `calc(cos(${angle}) * ${scaleLength(distance)})`;
    y = `calc(sin(${angle}) * ${scaleLength(distance)})`;
  } else {
    const angleInRad = (direction * Math.PI) / 180;
    const unit = getCssUnits(distance.unit);
    x = `${(Math.cos(angleInRad) * distance.value) | 0}${unit}`;
    y = `${(Math.sin(angleInRad) * distance.value * -1) | 0}${unit}`;
  }

  const custom = {
    [`--motion-translate-x${suffix}`]: `${x}`,
    [`--motion-translate-y${suffix}`]: `${y}`,
    [`--motion-scale${suffix}`]: `${scale}`,
  };

  return [
    {
      ...options,
      easing,
      duration: options.duration! * 0.7,
      name: fadeIn,
      fill: getEntranceFill(options),
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      easing,
      name: expandIn,
      fill: getEntranceFill(options),
      custom,
      keyframes: [
        {
          transform: `translate(${toKeyframeValue(
            custom,
            `--motion-translate-x${suffix}`,
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            `--motion-translate-y${suffix}`,
            asWeb,
          )}) rotate(var(--motion-rotate, 0deg)) scale(${toKeyframeValue(
            custom,
            `--motion-scale${suffix}`,
            asWeb,
          )})`,
        },
        {
          transform: 'translate(0px, 0px) rotate(var(--motion-rotate, 0deg)) scale(1)',
        },
      ],
    },
  ];
}
