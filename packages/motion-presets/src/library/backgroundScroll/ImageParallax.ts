// NOT PRODUCTION READY — background-scroll presets are experimental and excluded from public documentation.
import type {
  DomApi,
  ImageParallax,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { measureCompHeight, measureSiteHeight, withPartStyles } from './utils';

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-imageParallax'], options.suffix);
}

export function prepare(options: ScrubAnimationOptions, dom?: DomApi) {
  const measures = {
    '--motion-comp-height': '0px',
    '--motion-site-height': '0',
  };
  const { isPage = false } = options.namedEffect as ImageParallax;
  if (dom) {
    if (isPage) {
      measureSiteHeight(measures, dom, true);
    } else {
      measureCompHeight(measures, dom, true);
    }
  }
  return measures;
}

export function web(options: ScrubAnimationOptions & AnimationExtraOptions, dom?: DomApi) {
  options.measures = prepare(options, dom);

  return style(options, true);
}

export const parts = ['MEDIA_WRAPPER'];

export function style(options: ScrubAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { speed = 1.5, reverse = false, isPage = false } = options.namedEffect as ImageParallax;

  let start = -100 * (speed - 1);
  if (!isPage) {
    start = start / speed;
  }
  let end = 0;
  if (reverse) {
    [start, end] = [end, start];
  }

  const custom = {
    '--motion-trans-y-from': `${start | 0}%`,
    '--motion-trans-y-to': `${end | 0}%`,
  };

  const [imageParallax] = getNames(options);

  const animations = [
    {
      ...options,
      name: imageParallax,
      custom,
      part: 'MEDIA_WRAPPER',
      startOffset: {
        name: isPage ? 'contain' : 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return isPage
          ? `${toKeyframeValue(options.measures || {}, '--motion-site-height', asWeb)}`
          : `calc(100vh + ${toKeyframeValue(
              options.measures || {},
              '--motion-comp-height',
              asWeb,
            )})`;
      },
      keyframes: [
        {
          transform: `translateY(${toKeyframeValue(custom, '--motion-trans-y-from', asWeb)})`,
        },
        {
          transform: `translateY(${toKeyframeValue(custom, '--motion-trans-y-to', asWeb)})`,
        },
      ],
    },
  ];

  return withPartStyles(
    suffixCustomProperties(animations, options.suffix),
    options,
    {
      MEDIA_WRAPPER: { height: `${100 * speed}%`, position: 'relative' },
      MEDIA: { height: '100%', width: '100%', position: 'absolute' },
    },
    asWeb,
  );
}
