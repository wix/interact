import type { ScrubAnimationOptions, ParallaxScroll, AnimationFillMode, DomApi } from '../../types';
import { getScrollParallax, toKeyframeValue } from '../../utils';

export const schema = {
  center: { type: 'number', min: 0, max: 1, default: 0.5 },
  speed: { type: 'number', min: 0, default: 0.7159 },
} as const;

export function getNames({ suffix = '' }: ScrubAnimationOptions) {
  return ['motion-parallaxScroll'].map((name) => name + suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const { suffix = '' } = options;
  const namedEffect = options.namedEffect as ParallaxScroll;
  const { speed = schema.speed.default, center = schema.center.default } = namedEffect;
  const easing = 'linear';

  const { from, to, ...scrollRange } = getScrollParallax('continuous', options, speed, center);

  const [parallaxScroll] = getNames(options);

  const custom = {
    [`--motion-parallax-from${suffix}`]: from,
    [`--motion-parallax-to${suffix}`]: to,
  };

  // use transform: translateY(<value>) and not translate: 0 <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  return [
    {
      ...options,
      name: parallaxScroll,
      fill: 'both' as AnimationFillMode,
      easing,
      ...scrollRange,
      custom,
      keyframes: [
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            `--motion-parallax-from${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            `--motion-parallax-to${suffix}`,
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
        },
      ],
    },
  ];
}
