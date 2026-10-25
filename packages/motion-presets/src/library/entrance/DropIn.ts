import type { TimeAnimationOptions, DropIn } from '../../types';
import { toKeyframeValue, getEntranceFill, suffixNames, suffixCustomProperties } from '../../utils';

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn', 'motion-dropIn'], options.suffix);
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
        },
        {
          scale: '1',
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
