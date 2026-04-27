import type { TimeAnimationOptions } from '../../types';
import { getCssUnits, toKeyframeValue, parseLength, parseDirection } from '../../utils';
import type { ExpandIn } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULT_DIRECTION = 90;
const DEFAULT_DISTANCE = { value: 120, unit: 'percentage' };
const DIRECTION_KEYWORD_TO_ANGLE: Record<string, number> = {
  top: 90,
  right: 0,
  bottom: 270,
  left: 180,
};

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-expandIn'];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ExpandIn;
  const { initialScale = 0 } = namedEffect;

  const parsedDirection = parseDirection(
    namedEffect?.direction,
    FOUR_DIRECTIONS,
    DEFAULT_DIRECTION,
    true,
  );
  const direction =
    typeof parsedDirection === 'string'
      ? DIRECTION_KEYWORD_TO_ANGLE[parsedDirection]
      : parsedDirection;

  const distance = parseLength(namedEffect.distance, DEFAULT_DISTANCE);

  const [fadeIn, expandIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const angleInRad = (direction * Math.PI) / 180;
  const unit = getCssUnits(distance.unit);

  const x = `${(Math.cos(angleInRad) * distance.value) | 0}${unit}`;
  const y = `${(Math.sin(angleInRad) * distance.value * -1) | 0}${unit}`;

  const custom = {
    '--motion-translate-x': `${x}`,
    '--motion-translate-y': `${y}`,
    '--motion-scale': `${initialScale}`,
  };

  return [
    {
      ...options,
      easing,
      duration: options.duration! * 0.7,
      name: fadeIn,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      easing,
      name: expandIn,
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
          )}) rotate(var(--motion-rotate, 0deg)) scale(${toKeyframeValue(
            custom,
            '--motion-scale',
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
