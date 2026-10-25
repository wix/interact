import type { ScrubAnimationOptions, ParallaxScroll, AnimationFillMode, DomApi } from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';

const DEFAULT_PARALLAX_FACTOR = 0.5;

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-parallaxScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ParallaxScroll;
  const { parallaxFactor = DEFAULT_PARALLAX_FACTOR } = namedEffect;
  const easing = 'linear';

  const start = `${-50 * parallaxFactor}vh`;
  const end = `${50 * parallaxFactor}vh`;

  const [parallaxScroll] = getNames(options);

  const custom = {
    '--motion-parallax-to': end,
  };

  // use transform: translateY(<value>) and not translate: 0 <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  const animations = [
    {
      ...options,
      name: parallaxScroll,
      fill: 'both' as AnimationFillMode,
      easing,
      startOffsetAdd: start,
      endOffsetAdd: end,
      custom,
      keyframes: [
        {
          transform: `translateY(calc(-1 * ${toKeyframeValue(
            custom,
            '--motion-parallax-to',
            asWeb,
          )})) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            '--motion-parallax-to',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];

  return suffixCustomProperties(animations, options.suffix);
}
