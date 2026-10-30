import type { BlurScroll, ScrubAnimationOptions, DomApi } from '../../types';
import {
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<BlurScroll> = {
  type: 'BlurScroll',
  blur: 6,
  range: 'in',
};

export const schema = {
  blur: { type: 'number', min: 0, default: DEFAULTS.blur },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-blurScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { blur = DEFAULTS.blur, range = DEFAULTS.range } = options.namedEffect as BlurScroll;

  const fromValue = range === 'out' ? 0 : blur;
  const toValue = range === 'out' ? blur : 0;
  const easing = range === 'continuous' ? 'linear(0 0%, 1 50%, 1 50%, 0 100%)' : 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const [blurScroll] = getNames(options);

  const custom = {
    '--motion-blur-from': `${fromValue}px`,
    '--motion-blur-to': `${toValue}px`,
  };

  const animations = [
    {
      ...options,
      name: blurScroll,
      fill,
      ...offsets,
      easing,
      composite: 'add' as const,
      custom,
      keyframes: [
        {
          filter: `blur(${toKeyframeValue(custom, '--motion-blur-from', asWeb)})`,
        },
        {
          filter: `blur(${toKeyframeValue(custom, '--motion-blur-to', asWeb)})`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
