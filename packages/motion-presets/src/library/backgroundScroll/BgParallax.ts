import type {
  BgParallax,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
  DomApi,
} from '../../types';
import { toKeyframeValue } from '../../utils';
import { measureCompHeight } from './utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgParallax'];
}

export function prepare(_: ScrubAnimationOptions, dom?: DomApi) {
  const measures = { '--motion-comp-height': '0px' };
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
  const { speed = 0.2 } = options.namedEffect as BgParallax;
  const custom = {
    '--motion-parallax-speed': speed,
  };

  const [bgParallax] = getNames(options);

  return [
    {
      ...options,
      name: bgParallax,
      part: 'BG_MEDIA',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      endOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get endOffsetAdd() {
        return `calc(100svh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-height',
          asWeb,
        )})`;
      },
      keyframes: [
        {
          transform: `translateY(calc(${toKeyframeValue(
            custom,
            '--motion-parallax-speed',
            asWeb,
          )} * 100svh))`,
        },
        {
          transform: `translateY(calc((200lvh - 100%) * ${toKeyframeValue(
            custom,
            '--motion-parallax-speed',
            asWeb,
          )}))`,
        },
      ],
    },
  ];
}
