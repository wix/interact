import type {
  BgFadeBack,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { measureCompHeight, withPartStyles } from './utils';

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgFadeBackOpacity', 'motion-bgFadeBackScale'], options.suffix);
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  const measures = {
    '--motion-comp-height': '0px',
    '--motion-comp-half-height': '0px',
  };
  if (dom) {
    measureCompHeight(measures, dom, true);
  }
  return measures;
}

export function web(options: ScrubAnimationOptions & AnimationExtraOptions, dom?: DomApi) {
  options.measures = prepare(options, dom);

  return style(options, true);
}

export const parts = ['MEDIA_CLIP'];

export function style(options: ScrubAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const easing = 'sineOut';
  const { scale = 0.7 } = options.namedEffect as BgFadeBack;

  const custom = { '--motion-scale': scale };

  const [bgFadeBackOpacity, bgFadeBackScale] = getNames(options);

  const animations = [
    {
      ...options,
      name: bgFadeBackOpacity,
      easing: 'linear',
      part: 'MEDIA_CLIP',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      startOffsetAdd: '100vh',
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `calc(100vh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-height',
          asWeb,
        )})`;
      },
      keyframes: [
        {
          opacity: 1,
        },
        {
          opacity: 0,
        },
      ],
    },
    {
      ...options,
      name: bgFadeBackScale,
      custom,
      easing,
      part: 'MEDIA_CLIP',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      startOffsetAdd: '100vh',
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `calc(100vh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-half-height',
          asWeb,
        )})`;
      },
      keyframes: [
        {
          scale: 1,
        },
        {
          scale: toKeyframeValue(custom, '--motion-scale', asWeb),
        },
      ],
    },
  ];

  return withPartStyles(suffixCustomProperties(animations, options.suffix), options, {}, asWeb);
}
