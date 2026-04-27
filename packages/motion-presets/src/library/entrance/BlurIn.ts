import type { BlurIn, TimeAnimationOptions } from '../../types';
import { toKeyframeValue } from '../../utils';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-blurIn'];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { blur = 6 } = options.namedEffect as BlurIn;
  const [fadeIn, blurIn] = getNames(options);

  const easing = options.easing || 'linear';

  const custom = {
    '--motion-blur': `${blur}px`,
  };

  return [
    {
      ...options,
      name: fadeIn,
      duration: options.duration! * 0.7,
      easing: 'sineIn',
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: blurIn,
      easing,
      composite: 'add' as const, // make sure we don't override existing filters on the component
      custom,
      keyframes: [
        {
          filter: `blur(${toKeyframeValue(custom, '--motion-blur', asWeb)})`,
        },
        {
          filter: 'blur(0px)',
        },
      ],
    },
  ];
}
