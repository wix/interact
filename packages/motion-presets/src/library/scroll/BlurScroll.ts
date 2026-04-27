import type { AnimationFillMode, BlurScroll, ScrubAnimationOptions, DomApi } from '../../types';
import { toKeyframeValue } from '../../utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-blurScroll'];
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { blur = 6, range = 'in' } = options.namedEffect as BlurScroll;

  const fromValue = range === 'out' ? 0 : blur;
  const toValue = range === 'out' ? blur : 0;
  const easing = 'linear';
  const fill = (
    range === 'out' ? 'forwards' : range === 'in' ? 'backwards' : options.fill
  ) as AnimationFillMode;

  const [blurScroll] = getNames(options);

  const custom = {
    '--motion-blur-from': `${fromValue}px`,
    '--motion-blur-to': `${toValue}px`,
  };

  return [
    {
      ...options,
      name: blurScroll,
      fill,
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
}
