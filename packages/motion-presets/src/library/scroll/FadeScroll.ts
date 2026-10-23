import type { FadeScroll, ScrubAnimationOptions, AnimationFillMode, DomApi } from '../../types';
import { toKeyframeValue } from '../../utils';
import { SCROLL_RANGES } from '../../consts';

export const schema = {
  opacity: { type: 'number', min: 0, max: 1, default: 0 },
  range: { type: 'enum', values: SCROLL_RANGES, default: 'in' },
} as const;

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-fadeScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const { opacity = schema.opacity.default, range = schema.range.default } =
    options.namedEffect as FadeScroll;
  const isOut = range === 'out';
  const fromValue = isOut ? toKeyframeValue({}, '--comp-opacity', false, '1') : opacity;
  const toValue = isOut ? opacity : toKeyframeValue({}, '--comp-opacity', false, '1');
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const [fadeScroll] = getNames(options);

  const custom = {
    [`--motion-fade-from${suffix}`]: fromValue,
    [`--motion-fade-to${suffix}`]: toValue,
  };

  return [
    {
      ...options,
      name: fadeScroll,
      fill,
      easing,
      custom,
      keyframes: [
        {
          opacity: toKeyframeValue(custom, `--motion-fade-from${suffix}`, asWeb),
        },
        {
          opacity: toKeyframeValue(custom, `--motion-fade-to${suffix}`, asWeb),
        },
      ],
    },
  ];
}
