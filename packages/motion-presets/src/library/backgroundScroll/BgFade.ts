import type {
  BgFade,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue, suffixNames, suffixCustomProperties } from '../../utils';
import { measureCompHeight, withPartStyles } from './utils';

export function getNames(options: ScrubAnimationOptions) {
  return suffixNames(['motion-bgFade'], options.suffix);
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
  const { range = 'in' } = options.namedEffect as BgFade;
  const isOut = range === 'out';
  const easing = isOut ? 'sineOut' : 'sineIn';

  const custom = {
    '--motion-bg-fade-from': isOut ? 1 : 0,
    '--motion-bg-fade-to': isOut ? 0 : 1,
  };

  const [bgFade] = getNames(options);

  const animations = [
    {
      ...options,
      name: bgFade,
      custom,
      part: 'MEDIA_CLIP',
      easing,
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      startOffsetAdd: isOut ? '100vh' : '0px',
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return isOut
          ? `calc(100vh + ${toKeyframeValue(
              options.measures || {},
              '--motion-comp-height',
              asWeb,
            )})`
          : `calc(50vh + ${toKeyframeValue(
              options.measures || {},
              '--motion-comp-half-height',
              asWeb,
            )})`;
      },
      keyframes: [
        {
          opacity: toKeyframeValue(custom, '--motion-bg-fade-from', asWeb),
        },
        {
          opacity: toKeyframeValue(custom, '--motion-bg-fade-to', asWeb),
        },
      ],
    },
  ];

  return withPartStyles(suffixCustomProperties(animations, options.suffix), options, {}, asWeb);
}
