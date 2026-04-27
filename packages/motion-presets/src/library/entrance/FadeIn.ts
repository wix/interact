import { TimeAnimationOptions } from '../../types';

export function getNames(_: TimeAnimationOptions) {
  return ['motion-fadeIn'];
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
      easing: 'sineInOut',
      keyframes: [{ offset: 0, opacity: 0 }],
    },
  ];
}
