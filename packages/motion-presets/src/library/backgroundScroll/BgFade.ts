import type {
  BgFade,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue } from '../../utils';
import { measureCompHeight } from './utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgFade'];
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

export function style(options: ScrubAnimationOptions & AnimationExtraOptions, asWeb = false) {
  const { range = 'in' } = options.namedEffect as BgFade;
  const isOut = range === 'out';
  const easing = isOut ? 'sineOut' : 'sineIn';

  const custom = {
    '--motion-bg-fade-from': isOut ? 1 : 0,
    '--motion-bg-fade-to': isOut ? 0 : 1,
  };

  const [bgFade] = getNames(options);

  return [
    {
      ...options,
      name: bgFade,
      part: 'BG_LAYER',
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
}
