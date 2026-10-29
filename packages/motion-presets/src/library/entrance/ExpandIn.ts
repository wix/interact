import type { LengthValue, TimeAnimationOptions } from '../../types';
import {
  toKeyframeValue,
  parseLength,
  parseDirection,
  getCssUnitValue,
  roundNumber,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import type { ExpandIn } from '../../types';
import { FOUR_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<ExpandIn> = {
  type: 'ExpandIn',
  from: 270,
  scale: 0,
  travel: { value: 120, unit: 'percentage' },
};

export const schema = {
  from: { type: 'angle', default: DEFAULTS.from },
  scale: { type: 'number', min: 0, max: 1, default: DEFAULTS.scale },
  travel: { type: 'length', default: DEFAULTS.travel },
};

const DIRECTION_KEYWORD_TO_ANGLE: Record<string, number> = {
  top: 270,
  right: 0,
  bottom: 90,
  left: 180,
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-expandIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ExpandIn;
  const { scale = DEFAULTS.scale } = namedEffect;

  const parsedFrom = parseDirection(
    namedEffect?.from,
    FOUR_DIRECTIONS,
    DEFAULTS.from as number,
    true,
  );
  const from = typeof parsedFrom === 'string' ? DIRECTION_KEYWORD_TO_ANGLE[parsedFrom] : parsedFrom;

  const travel = parseLength(namedEffect.travel, DEFAULTS.travel as LengthValue);

  const [fadeIn, expandIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';
  const angleInRad = (from * Math.PI) / 180;

  const x = getCssUnitValue({ ...travel, value: roundNumber(Math.cos(angleInRad) * travel.value) });
  const y = getCssUnitValue({ ...travel, value: roundNumber(Math.sin(angleInRad) * travel.value) });

  const custom = {
    '--motion-translate-x': `${x}`,
    '--motion-translate-y': `${y}`,
    '--motion-scale': `${scale}`,
  };

  const animations = [
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

  return suffixCustomProperties(animations, options.suffix);
}
