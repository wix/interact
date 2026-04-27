import type { BgRotate, RangeOffset, ScrubAnimationOptions } from '../../types';
import { toKeyframeValue } from '../../utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgRotate'];
}

export function web(options: ScrubAnimationOptions) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const easing = 'sineOut';
  const { angle = 22, direction = 'counter-clockwise' } = options.namedEffect as BgRotate;

  const custom = {
    '--motion-rot-from': `${direction === 'counter-clockwise' ? angle : -angle}deg`,
  };

  const [bgRotate] = getNames(options);

  return [
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
}
