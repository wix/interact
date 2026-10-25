// NOT PRODUCTION READY — background-scroll presets are experimental and excluded from public documentation.
import type { BgRotate, RangeOffset, ScrubAnimationOptions } from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgRotate'], options.suffix);
}

export function web(options: ScrubAnimationOptions) {
  return style(options, true);
}

export const parts = ['BG_MEDIA'];

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const easing = 'sineOut';
  const { angle = 22, direction = 'counter-clockwise' } = options.namedEffect as BgRotate;

  const custom = {
    '--motion-rot-from': `${direction === 'counter-clockwise' ? angle : -angle}deg`,
  };

  const [bgRotate] = getNames(options);

  const animations = [
    {
      ...options,
      name: bgRotate,
      easing,
      part: 'BG_MEDIA',
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

  return suffixCustomProperties(animations, options.suffix);
}
