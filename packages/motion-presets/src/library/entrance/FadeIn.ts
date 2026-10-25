import { TimeAnimationOptions } from '../../types';

import { getEntranceFill, suffixNames, suffixCustomProperties } from '../../utils';

export function getNames(options: TimeAnimationOptions) {
  return suffixNames(['motion-fadeIn'], options.suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const [fadeIn] = getNames(options);

  const animations = [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'sineInOut',
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
