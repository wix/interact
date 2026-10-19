import type { ScrubAnimationOptions, ParallaxScroll, AnimationFillMode, DomApi } from '../../types';
import { toKeyframeValue } from '../../utils';

const PARALLAX_FACTOR_AT_DEFAULT_SPEED = 0.5;
const EPSILON = 0.01;

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
  const { speed = schema.speed.default, center: inputCenter = schema.center.default } = namedEffect;
  const easing = 'linear';

  const parallaxFactor =
    (PARALLAX_FACTOR_AT_DEFAULT_SPEED * (1 / Math.max(speed, EPSILON) - 1)) /
    (1 / schema.speed.default - 1);
  const center = Math.min(1 - EPSILON, Math.max(0, inputCenter));

  const start = `${-100 * parallaxFactor * center}vh`;
  const end = `${100 * parallaxFactor * (1 - center)}vh`;

  const [parallaxScroll] = getNames(options);

  const custom = {
    [`--motion-parallax-from${suffix}`]: start,
    [`--motion-parallax-to${suffix}`]: end,
  };

  // use transform: translateY(<value>) and not translate: 0 <value> because of WebKit bug: https://bugs.webkit.org/show_bug.cgi?id=276281
  return [
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
