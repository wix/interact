import type { FadeScroll, ScrubAnimationOptions, DomApi } from '../../types';
import {
  toKeyframeValue,
  suffixNames,
  suffixCustomProperties,
  getScrollFill,
  completeScrollOffsets,
} from '../../utils';
import { SCROLL_RANGES } from '../../consts';

const DEFAULTS: Required<FadeScroll> = {
  type: 'FadeScroll',
  opacity: 0,
  range: 'in',
};

export const schema = {
  opacity: { type: 'number', min: 0, max: 1, default: DEFAULTS.opacity },
  range: { type: 'enum', values: SCROLL_RANGES, default: DEFAULTS.range },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-fadeScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { opacity = DEFAULTS.opacity, range = DEFAULTS.range } = options.namedEffect as FadeScroll;
  const isOut = range === 'out';
  const fromValue = isOut ? toKeyframeValue({}, '--comp-opacity', false, '1') : opacity;
  const toValue = isOut ? opacity : toKeyframeValue({}, '--comp-opacity', false, '1');
  const easing = range === 'continuous' ? 'linear(0 0%, 1 50%, 1 50%, 0 100%)' : 'linear';
  const fill = getScrollFill(options, range);
  const offsets = completeScrollOffsets(options as ScrubAnimationOptions, range);

  const [fadeScroll] = getNames(options);

  const custom = {
    '--motion-fade-from': fromValue,
    '--motion-fade-to': toValue,
  };

  const animations = [
    {
      ...options,
      name: fadeScroll,
      fill,
      ...offsets,
      easing,
      custom,
      keyframes: [
        {
          opacity: toKeyframeValue(custom, '--motion-fade-from', asWeb),
        },
        {
          opacity: toKeyframeValue(custom, '--motion-fade-to', asWeb),
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
