import type {
  BgCloseUp,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { measureCompHeight } from './utils';
import { toKeyframeValue } from '../../utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgCloseUpOpacity', 'motion-bgCloseUpZoom'];
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
  const easing = 'linear';
  const { scale = 80 } = options.namedEffect as BgCloseUp;

  const custom = { '--motion-trans-z': `${scale}px` };

  const [bgCloseUpOpacity, bgCloseUpZoom] = getNames(options);

  return [
    {
      ...options,
      name: bgCloseUpOpacity,
      easing,
      part: 'BG_LAYER',
      startOffset: {
        name: 'cover',
        offset: { unit: 'percentage', value: 0 },
      } as RangeOffset,
      get startOffsetAdd() {
        return `calc(50vh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-half-height',
          asWeb,
        )})`;
      },
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
      name: bgCloseUpZoom,
      easing,
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
        return `calc(100vh + ${toKeyframeValue(
          options.measures || {},
          '--motion-comp-height',
          asWeb,
        )})`;
      },
      keyframes: [
        {
          transform: 'perspective(100px) translateZ(0px)',
        },
        {
          transform: `perspective(100px) translateZ(${toKeyframeValue(
            custom,
            '--motion-trans-z',
            asWeb,
          )})`,
        },
      ],
    },
  ];
}
