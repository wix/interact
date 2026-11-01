// NOT PRODUCTION READY — background-scroll presets are experimental and excluded from public documentation.
import type { BgRotate, RangeOffset, ScrubAnimationOptions } from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { SPIN_DIRECTIONS } from '../../consts';

const DEFAULTS: Required<BgRotate> = {
  type: 'BgRotate',
  angle: 22,
  direction: 'counter-clockwise',
};

export const schema = {
  angle: { type: 'number', min: 0, default: DEFAULTS.angle },
  direction: { type: 'enum', values: SPIN_DIRECTIONS, default: DEFAULTS.direction },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgRotate'], options.suffix);
}

export function web(options: ScrubAnimationOptions) {
  return style(options, true);
}

export const parts = ['MEDIA_WRAPPER'];

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const easing = 'sineOut';
  const { angle = DEFAULTS.angle, direction = DEFAULTS.direction } =
    options.namedEffect as BgRotate;

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

  return suffixCustomProperties(animations, options.suffix);
}
