import { TimeAnimationOptions } from '../../types';

import { getEntranceFill } from '../../utils';

export const schema = {} as const;

export function getNames({ suffix = '' }: TimeAnimationOptions) {
  return ['motion-fadeIn'].map((name) => name + suffix);
}

export function web(options: TimeAnimationOptions) {
  return style(options);
}

export function style(options: TimeAnimationOptions) {
  const [fadeIn] = getNames(options);

  return [
    {
      ...options,
      name: fadeIn,
      fill: getEntranceFill(options),
      easing: 'sineInOut',
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];
}
