import type {
  BgSkew,
  DomApi,
  RangeOffset,
  AnimationExtraOptions,
  ScrubAnimationOptions,
} from '../../types';
import { toKeyframeValue } from '../../utils';
import { measureCompHeight } from './utils';

export function getNames(_: ScrubAnimationOptions) {
  return ['motion-bgSkew'];
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
  const { angle = 20, direction = 'counter-clockwise' } = options.namedEffect as BgSkew;

  const custom = {
    '--motion-skew': `${direction === 'counter-clockwise' ? angle : -angle}deg`,
  };

  const [bgSkew] = getNames(options);

  return [
    {
      ...options,
      name: bgSkew,
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
          transform: `skewY(${toKeyframeValue(custom, '--motion-skew', asWeb)})`,
        },
        {
          transform: `skewY(calc(-1 * ${toKeyframeValue(custom, '--motion-skew', asWeb)}))`,
        },
      ],
    },
  ];
}
