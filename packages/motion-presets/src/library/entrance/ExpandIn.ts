import type { TimeAnimationOptions } from '../../types';
import type { LengthValue } from '../../utils';
import {
  toKeyframeValue,
  parseCssLength,
  parseAngle,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';
import type { ExpandIn } from '../../types';

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

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-expandIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ExpandIn;
  const { scale = DEFAULTS.scale } = namedEffect;

  const from = parseAngle(namedEffect?.from, DEFAULTS.from as number);

  const travel = parseCssLength(namedEffect.travel, DEFAULTS.travel as LengthValue);

  const [fadeIn, expandIn] = getNames(options);

  const easing = options.easing || 'cubicInOut';

  const x = `calc(cos(${from}) * ${travel})`;
  const y = `calc(sin(${from}) * ${travel})`;

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
