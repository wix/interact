import type { BgRotate, RangeOffset, ScrubAnimationOptions } from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { withPartStyles } from './utils';

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgRotate'], options.suffix);
}

export function web(options: ScrubAnimationOptions) {
  return style(options, true);
}

export const parts = ['MEDIA_WRAPPER'];

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const easing = 'sineOut';
  const { angle = 22, direction = 'counter-clockwise' } = options.namedEffect as BgRotate;
  const radians = (angle * Math.PI) / 180;

  const custom = {
    '--motion-rot-from': `${direction === 'counter-clockwise' ? angle : -angle}deg`,
  };

  const [bgRotate] = getNames(options);

  const animations = [
    {
      ...options,
      name: bgRotate,
      custom,
      easing,
      part: 'MEDIA_WRAPPER',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffsetAdd: '100vh',
      keyframes: [
        {
          transform: `rotate(${toKeyframeValue(custom, '--motion-rot-from', asWeb)})`,
        },
        {
          transform: 'rotate(0deg)',
        },
      ],
    },
  ];

  return withPartStyles(
    suffixCustomProperties(animations, options.suffix),
    options,
    {
      MEDIA_CLIP: { containerType: 'size' },
      MEDIA_WRAPPER: {
        width: `max(100%, calc(${(100 * Math.cos(radians)).toFixed(3)}cqw + ${(100 * Math.sin(radians)).toFixed(3)}cqh))`,
        height: `max(100%, calc(${(100 * Math.sin(radians)).toFixed(3)}cqw + ${(100 * Math.cos(radians)).toFixed(3)}cqh))`,
        translate: 'calc(50cqw - 50%) calc(50cqh - 50%)',
      },
    },
    asWeb,
  );
}
