import type { TimeAnimationOptions, DropIn } from '../../types';
import { toKeyframeValue } from '../../utils';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn', 'motion-dropIn'];
}

export function web(options: TimeAnimationOptions) {
  return style(options, true);
}

export function style(options: TimeAnimationOptions, asWeb = false) {
  const { initialScale = 1.6 } = options.namedEffect as DropIn;
  const [fadeIn, dropIn] = getNames(options);

  const easing = options.easing || 'quintInOut';

  const custom = {
    '--motion-scale': `${initialScale}`,
  };

  return [
    {
      ...options,
      name: fadeIn,
      easing: 'quadOut',
      duration: options.duration! * 0.8,
      custom: {},
      keyframes: [{ offset: 0, opacity: 0 }],
    },
    {
      ...options,
      name: dropIn,
      easing,
      custom,
      keyframes: [
        {
          scale: toKeyframeValue(custom, '--motion-scale', asWeb),
        },
        {
          scale: '1',
        },
      ],
    },
  ];
}
