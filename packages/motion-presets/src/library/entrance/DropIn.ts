import type { TimeAnimationOptions, DropIn } from '../../types';
import { toKeyframeValue, getEntranceFill, suffixNames, suffixCustomProperties } from '../../utils';

const DEFAULTS: Required<DropIn> = {
  type: 'DropIn',
  scale: 1.6,
};

export const schema = {
  scale: { type: 'number', min: 1, default: DEFAULTS.scale },
};

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-dropIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { scale = DEFAULTS.scale } = options.namedEffect as DropIn;
  const [fadeIn, dropIn] = getNames(options);

  const easing = options.easing || 'quintInOut';

  const custom = {
    '--motion-scale': `${scale}`,
  };

  const animations = [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'quadOut',
      duration: options.duration! * 0.8,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: dropIn,
      fill: getEntranceFill(options),
      easing,
      custom,
      keyframes: [
        {
          scale: toKeyframeValue(custom, '--motion-scale', asWeb),
          transform: 'rotate(var(--motion-rotate, 0deg))',
        },
        {
          scale: '1',
          transform: 'rotate(var(--motion-rotate, 0deg))',
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
