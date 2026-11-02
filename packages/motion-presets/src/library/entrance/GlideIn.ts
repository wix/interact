import type { TimeAnimationOptions, GlideIn } from '../../types';
import type { LengthValue } from '../../utils';
import {
  toKeyframeValue,
  parseCssLength,
  parseAngle,
  getEntranceFill,
  suffixNames,
  suffixCustomProperties,
} from '../../utils';

const DEFAULTS: Required<GlideIn> = {
  type: 'GlideIn',
  from: 180,
  travel: { value: 100, unit: 'percentage' },
};

export const schema = {
  from: { type: 'angle', default: DEFAULTS.from },
  travel: { type: 'length', default: DEFAULTS.travel },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-glideIn', 'motion-fadeIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as GlideIn;

  const from = parseAngle(namedEffect?.from, DEFAULTS.from as number);
  const travel = parseCssLength(namedEffect.travel, DEFAULTS.travel as LengthValue);

  const easing = options.easing || 'quintInOut';

  const translateX = `calc(cos(${from}) * ${travel})`;
  const translateY = `calc(sin(${from}) * ${travel})`;

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
      easing: 'step-start',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
