import type { TimeAnimationOptions, GlideIn, LengthValue } from '../../types';
import {
  getCssUnits,
  toKeyframeValue,
  parseLength,
  parseDirection,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
  roundNumber,
} from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<GlideIn> = {
  type: 'GlideIn',
  from: 180,
  travel: { value: 100, unit: 'percentage' },
};

export const schema = {
  from: { type: 'angle', default: DEFAULTS.from },
  travel: { type: 'length', default: DEFAULTS.travel },
};

const DIRECTION_KEYWORD_TO_ANGLE: Record<string, number> = {
  top: 270,
  right: 0,
  bottom: 90,
  left: 180,
};
const ALLOW_ANGLES = true;

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-glideIn', 'motion-fadeIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as GlideIn;

  const parsedDirection = parseDirection(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    DEFAULTS.from as number,
    ALLOW_ANGLES,
  );
  const direction =
    typeof parsedDirection === 'string'
      ? DIRECTION_KEYWORD_TO_ANGLE[parsedDirection]
      : parsedDirection;

  const distance = parseLength(namedEffect.travel, DEFAULTS.travel as LengthValue);

  const angleInRad = (direction * Math.PI) / 180;
  const unit = getCssUnits(distance.unit);

  const easing = options.easing || 'quintInOut';

  const translateX = `${roundNumber(Math.cos(angleInRad) * distance.value)}${unit}`;
  const translateY = `${roundNumber(Math.sin(angleInRad) * distance.value)}${unit}`;

  const custom = {
    '--motion-translate-x': `${translateX}`,
    '--motion-translate-y': `${translateY}`,
  };

  const [glideIn, fadeIn] = getNames(options);

  const animations = [
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

  return suffixCustomProperties(animations, options.suffix);
}
