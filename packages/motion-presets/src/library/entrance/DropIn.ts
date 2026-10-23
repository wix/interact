import type { TimeAnimationOptions, DropIn } from '../../types';
import { toKeyframeValue, getEntranceFill } from '../../utils';

export const schema = {
  scale: { type: 'number', min: 1, default: 1.6 },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-dropIn'].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const { scale = schema.scale.default } = options.namedEffect as DropIn;
  const [fadeIn, dropIn] = getNames(options);

  const easing = options.easing || 'quintInOut';

  const custom = {
    [`--motion-scale${suffix}`]: `${scale}`,
  };

  return [
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
          scale: toKeyframeValue(custom, `--motion-scale${suffix}`, asWeb),
        },
        {
          scale: '1',
        },
      ],
    },
  ];
}
