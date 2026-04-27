import type { FadeScroll, ScrubAnimationOptions, AnimationFillMode, DomApi } from '../../types';
import { toKeyframeValue } from '../../utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-fadeScroll'];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { opacity = 0, range = 'in' } = options.namedEffect as FadeScroll;
  const isOut = range === 'out';
  const fromValue = isOut ? toKeyframeValue({}, '--comp-opacity', false, '1') : opacity;
  const toValue = isOut ? opacity : toKeyframeValue({}, '--comp-opacity', false, '1');
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const [fadeScroll] = getNames(options);

  const custom = {
    '--motion-fade-from': fromValue,
    '--motion-fade-to': toValue,
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
          opacity: toKeyframeValue(custom, '--motion-fade-from', asWeb),
        },
        {
          opacity: toKeyframeValue(custom, '--motion-fade-to', asWeb),
        },
      ],
    },
  ];
}
