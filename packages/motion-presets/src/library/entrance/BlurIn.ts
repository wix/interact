import type { BlurIn, TimeAnimationOptions } from '../../types';
import { toKeyframeValue, getEntranceFill } from '../../utils';

export const schema = {
  blur: { type: 'number', min: 0, default: 6 },
} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-blurIn'].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const { blur = schema.blur.default } = options.namedEffect as BlurIn;
  const [fadeIn, blurIn] = getNames(options);

  const easing = options.easing || 'linear';

  const custom = {
    [`--motion-blur${suffix}`]: `${blur}px`,
  };

  return [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      duration: options.duration! * 0.7,
      easing: 'sineIn',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: blurIn,
      fill: getEntranceFill(options),
      easing,
      composite: 'add' as const, // make sure we don't override existing filters on the component
      custom,
      keyframes: [
        {
          filter: `blur(${toKeyframeValue(custom, `--motion-blur${suffix}`, asWeb)})`,
        },
        {
          filter: 'blur(0px)',
        },
      ],
    },
  ];
}
