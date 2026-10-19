import type { TimeAnimationOptions, GlideIn } from '../../types';
import {
  getCssUnits,
  toKeyframeValue,
  parseLength,
  parseDirection,
  getEntranceFill,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

export const schema = {
  from: { type: 'angle', default: 180 },
  travel: { type: 'length', default: { value: 100, unit: 'percentage' } },
} as const;

const DIRECTION_KEYWORD_TO_ANGLE: Record<string, number> = {
  top: 270,
  right: 0,
  bottom: 90,
  left: 180,
};
const ALLOW_ANGLES = true;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-glideIn', 'motion-fadeIn'].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as GlideIn;

  const parsedDirection = parseDirection<number | string>(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    schema.from.default,
    ALLOW_ANGLES,
  );
  const direction =
    typeof parsedDirection === 'string'
      ? DIRECTION_KEYWORD_TO_ANGLE[parsedDirection]
      : parsedDirection;

  const distance = parseLength(namedEffect.travel, schema.travel.default);

  const angleInRad = (direction * Math.PI) / 180;
  const unit = getCssUnits(distance.unit);

  const easing = options.easing || 'quintInOut';

  const translateX = `${(Math.cos(angleInRad) * distance.value) | 0}${unit}`;
  const translateY = `${(Math.sin(angleInRad) * distance.value) | 0}${unit}`;

  const custom = {
    '--motion-translate-x': `${translateX}`,
    '--motion-translate-y': `${translateY}`,
  };

  const [glideIn, fadeIn] = getNames(options);

  return [
    {
      ...options,
      name: glideIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          transform: `translate(${toKeyframeValue(
            custom,
            '--motion-translate-x',
            asWeb,
          )}, ${toKeyframeValue(
            custom,
            '--motion-translate-y',
            asWeb,
          )}) rotate(var(--motion-rotate, 0deg))`,
        },
        {
          transform: 'translate(0, 0) rotate(var(--motion-rotate, 0deg))',
        },
      ],
    },
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      custom: {},
      keyframes: [{ opacity: 0, offset: 0, easing: 'step-start' }],
    },
  ];
}
