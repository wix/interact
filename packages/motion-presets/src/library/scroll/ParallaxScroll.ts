import type { ScrubAnimationOptions, ParallaxScroll, AnimationFillMode, DomApi } from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { getPresetScrollParallax } from '../../parallaxUtils';

const DEFAULTS: Required<ParallaxScroll> = {
  type: 'ParallaxScroll',
  center: 0.5,
  speed: 0.7159,
};

export const schema = {
  center: { type: 'number', min: 0, max: 1, default: DEFAULTS.center },
  speed: { type: 'number', min: 0, default: DEFAULTS.speed },
};

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-parallaxScroll'], options.suffix);
}

export function web(options: ScrubAnimationOptions, _dom?: DomApi) {
  return style(options, true);
}

export function style(options: ScrubAnimationOptions, asWeb = false) {
  const namedEffect = options.namedEffect as ParallaxScroll;
  const { center = DEFAULTS.center, speed = DEFAULTS.speed } = namedEffect;
  const easing = 'linear';

  const [parallaxScroll] = getNames(options);

  // speed is the visual speed relative to the scroll, 1 moves with the page
  const custom: Record<string, string | number> = {};
  const rangeOffsets = getPresetScrollParallax(
    options,
    'continuous',
    speed,
    center,
  )(custom, '--motion', asWeb);

  // use transform: translateY(<value>) and not translate: 0 <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  const animations = [
    {
      ...options,
      name: parallaxScroll,
      fill: 'both' as AnimationFillMode,
      easing,
      ...rangeOffsets,
      custom,
      keyframes: [
        {
          transform: `translateY(${toKeyframeValue(
            custom,
            '--motion-parallax-from',
            asWeb,
          )}) rotate(${toKeyframeValue({}, '--motion-rotate', false, '0')})`,
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
