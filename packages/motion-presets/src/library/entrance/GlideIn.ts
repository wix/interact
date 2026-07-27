import type { TimeAnimationOptions, GlideIn } from '../../types';
import { getCssUnits, toKeyframeValue, parseLength, parseDirection, getEntranceFill } from '../../utils';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION = 180;
const DEFAULT_DISTANCE = { value: 100, unit: 'percentage' };
const DIRECTION_KEYWORD_TO_ANGLE: Record<string, number> = {
  top: 90,
  right: 0,
  bottom: 270,
  left: 180,
};
const ALLOW_ANGLES = true;

export function getNames(_: TimeAnimationOptions) {
  return ['motion-glideIn', 'motion-fadeIn'];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as GlideIn;

  const parsedDirection = parseDirection(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    DEFAULT_DIRECTION,
    ALLOW_ANGLES,
  );
  const direction =
    typeof parsedDirection === 'string'
      ? DIRECTION_KEYWORD_TO_ANGLE[parsedDirection]
      : parsedDirection;

  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);

  const angleInRad = (direction * Math.PI) / 180;
  const unit = getCssUnits(distance.unit);

  const easing = options.easing || 'quintInOut';

  const translateX = `${(Math.cos(angleInRad) * distance.value) | 0}${unit}`;
  const translateY = `${(Math.sin(angleInRad) * distance.value * -1) | 0}${unit}`;

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
